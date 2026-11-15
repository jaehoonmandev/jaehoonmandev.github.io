---
#layout: single
title:	"[Architecture] 인메모리 세션은 어디서 깨지는가 - Part 1. 인메모리 세션으로 채팅 중계 서버 만들기"
date:	2026-11-15 12:00:00
categories:
- Architecture
tags:
- Architecture
- Scale-out
- High-Availability
- Session
- JVM
- ConcurrentHashMap
- Synchronized
- Spring-Boot
- PoC
- Concurrency
---
서비스를 제공할 때 가장 중요한 요소는 안정적으로 서비스를 제공하는 것이라고 생각한다.

High Availability, 고가용성은 안정적인 서비스를 제공하기 위한 개념이다.

서비스 중단 시간을 최소화하거나, 서비스를 여러 개 실행하여 서버 하나가 다운되어도 다른 서버가 이를 대신하여 작업을 진행할 수 있도록 이중화하는 작업 등이 여기에 해당한다.

이번 시리즈 "인메모리 세션은 어디서 깨지는가"에서는 실무에서 운영 중인 채팅 중계 서버가 왜 이중화를 하지 못하는지, 그리고 어떻게 하면 스케일아웃이 가능한 구조로 바꿀 수 있는지를 직접 코드로 구현하며 확인해 보려 한다.

- **Part 1** : 운영 중인 중계 서버의 JVM 인메모리 세션 구조를 PoC로 재현한다.
- **Part 2** : 재현한 서버를 2대로 띄워 로드밸런싱했을 때 무엇이, 어떻게 깨지는지 확인한다.
- **Part 3** : 세션 저장소를 Redis로 옮겨 문제를 해결하고, 그 과정에서 생기는 트레이드오프를 정리한다.

# 문제

	이중화가 불가능한 구조로 고가용성을 적용하지 못하고 있다.

현재 근무지에서 실시간 채팅 상담 서비스를 담당하고 있다.

"실시간 채팅 상담" 도메인에는 "채팅 중계 API 서비스"가 포함되어 있다.
카카오, 라인, 왓츠앱 등의 채팅 플랫폼과 상담 업무를 진행하는 웹 CRMS 솔루션 사이에서 이벤트 교환, 세션 관리 등을 담당한다.

하지만 현재 중계 API는 구조상 스케일아웃이 불가능하다.

![구조 간략도]({{ site.baseurl }}/assets/images/posts/2025/architecture/inmemory-session-scaleout/part1/system-overview.png)

# 원인

일종의 채팅방 개념인 세션이 JVM 인메모리에 저장되고 있다.

세션이 서버 인스턴스에 종속되어 있기 때문에, 서버가 여러 대라면 각 서버가 서로 다른 세션 정보를 가지게 된다.

이벤트가 들어왔을 때 로드밸런싱을 통해 1번 서버, 2번 서버로 트래픽이 분산된다면, 동일한 채널의 동일한 고객이라 할지라도 각 서버가 보유한 세션 정보가 달라진다.

### JVM 인메모리를 사용한 이유

왜 데이터베이스가 아닌 JVM 인메모리에 세션을 두었을까?

세션은 이벤트가 들어올 때마다 조회되고 갱신된다.

고객이 메시지를 보낼 때마다, 상담사가 응답할 때마다 "이 고객의 세션이 지금 어떤 상태인가"를 확인해야 한다.

이 조회와 갱신을 매번 데이터베이스에서 처리하면 이벤트 하나당 최소 한 번 이상의 DB 네트워크 왕복(I/O)이 발생하고, 이벤트가 몰리는 시간대에는 그만큼 DB 부하도 함께 늘어난다.

하루 평균 약 9.3만 건, 많은 날은 16.3만 건의 이벤트가 오가는 상황에서 이 지연은 고객과 상담사가 체감하는 응답 속도와 직결된다.

반면 JVM 메모리의 Map에서 세션을 꺼내는 것은 네트워크를 거치지 않으므로 훨씬 빠르다.
서버가 한 대인 환경에서는 합리적인 선택이었던 것으로 판단된다.

### 세션 정보의 영속화

그렇다고 세션 정보를 메모리에만 두는 것은 아니다.

세션 이력과 대화 내용은 큐에 쌓였다가 백그라운드 스레드가 일정 시간 단위의 파일로 기록하고, 별도의 프로세스가 이 파일을 읽어 데이터베이스에 적재한다.

서버가 재시작되면 데이터베이스에서 진행 중인 세션 목록을 다시 읽어 메모리에 복구한다.

서버 재시작 시 아직 파일에서 데이터베이스로 넘어가지 않은 변경 사항이 있다면 Destroy 단계에서 영속화를 진행한다.

### 서버에 묶여 있는 상태들

현재 구조에서 서버 인스턴스 하나에 묶여 있는 "로컬 상태"는 세 가지다.

1. **세션 저장소** : 세션은 JVM 내부의 `ConcurrentHashMap`에 `senderKey:userKey`를 키로 저장된다.
   다른 서버는 이 Map을 볼 수 없다.
2. **세션 만료 타이머** : 일정 시간 메시지가 없는 세션을 정리하는 백그라운드 스레드가 서버마다 따로 돈다.
   각 서버는 자기 메모리에 있는 세션만 정리한다.
3. **동시성 제어** : 세션을 조회 / 생성하는 메서드는 `static synchronized`로 서버 전체에서 한 번에 하나씩만 실행되고, 메시지를 처리하는 메서드는 `synchronized`로 같은 세션의 메시지가 동시에 처리되지 않도록 막는다.
   이 잠금은 같은 JVM 안의 스레드끼리만 유효하다.

세 가지 모두 "서버가 한 대"라는 전제가 있을 때만 올바르게 동작한다.

`ConcurrentHashMap`과 `synchronized`는 스레드 간 안전성을 보장할 뿐, 서버 간 안전성까지 보장하지는 않는다.

thread-safe와 scale-out-safe는 전혀 다른 문제다.

### 이벤트 흐름과 구조의 한계

![세션 조회와 생성 흐름과 현재 구조의 한계]({{ site.baseurl }}/assets/images/posts/2025/architecture/inmemory-session-scaleout/part1/event-flow-limitation.png)
*세션 조회와 생성 흐름과 현재 구조의 한계*

1. 고객이 메시지를 입력하는 등 이벤트가 발생한다.
2. 메시지가 입력된 플랫폼에서 Webhook 이벤트를 전달한다.
3. 로드밸런서를 거쳐 중계 서버로 이벤트가 들어온다.
4. 중계 서버는 이벤트를 받자마자 플랫폼에 수신 응답(200)을 먼저 보내고, 이후 처리는 비동기로 이어간다.
5. 이벤트의 userKey(유저 ID), senderKey(채널 ID)로 기존 채팅 세션이 있는지 확인한다.
	1. 있을 시 : 해당 세션을 사용한다.
	2. 없을 시 : 세션을 생성해 메모리에 저장한다.
6. 세션의 상태(근무 시간 여부, 메뉴 선택, 상담사 연결 등)에 따라 메시지를 처리하고, 웹 애플리케이션에 이벤트를 전달한 뒤 세션 상태를 갱신한다.

이 흐름에서 문제가 되는 곳은 5번, 세션 조회다.

세션을 조회하는 곳이 "지금 이벤트를 받은 서버의 메모리"이기 때문에, 서버가 두 대 이상이 되어 로드밸런서가 같은 고객의 이벤트를 서로 다른 서버로 보내면 다음과 같은 일이 생긴다.

- 첫 번째 메시지가 1번 서버로 가면, 1번 서버에 세션이 생성된다.
- 두 번째 메시지가 2번 서버로 가면, 2번 서버에는 세션이 없으므로 새 세션을 또 생성한다.

같은 고객인데 세션이 두 개가 되고, 상담 진행 상태(메뉴 선택, 상담사 연결 중 등)도 서버마다 다르게 기록된다.

# PoC - 현재 구조 재현

현재 구조가 스케일아웃 환경에서 정말 깨지는지, 깨진다면 정확히 어디서 깨지는지 확인하려면 먼저 같은 구조를 재현해야 한다.

운영 코드를 그대로 가져올 수는 없으므로, 운영 중인 중계 서버의 핵심인 JVM 인메모리 세션 저장, 세션 만료 스레드, `synchronized` 기반 동시성 제어 구조만 떼어 간단한 프로젝트로 옮겼다.

운영 서버는 Java 1.7 기반의 JAX-RS(Jersey) 프로젝트지만, PoC는 이후 Redis 전환까지 고려해 Spring Boot로 구현했다.

Part 1에서는 구조를 재현하는 데까지만 다루고, 이 구조의 한계는 Part 2에서 서버를 두 대로 늘려 직접 확인한다.
q
## PoC 프로젝트 리포지토리

[https://github.com/jaehoonmandev/chat-gw-scaleout-poc/tree/part1](https://github.com/jaehoonmandev/chat-gw-scaleout-poc/tree/part1)

해당 리포지토리에 현재 채팅 중계 API의 JVM 인메모리 세션 저장 방식을 차용한 PoC 프로젝트를 올려두었다.

### 스펙

- Server : Java 17, Spring Boot 4.1.1, Gradle
- Dependencies
	1. Spring Web : 웹훅 수신, REST 컨트롤러, 내장 Tomcat, JSON 변환(Jackson)
	2. Validation : 데이터 검증. 잘못된 요청은 세션까지 오지 않도록.
	3. Actuator : 인스턴스 식별, 헬스 체크용

## 소스 구조

![PoC 소스 구조]({{ site.baseurl }}/assets/images/posts/2025/architecture/inmemory-session-scaleout/part1/poc-source-structure.png)

### 채팅 세션 - `src/main/java/.../session`

일종의 채팅방 개념이며, 이를 관리하는 레이어다.

참고로 현재 실무에서 다루는 채팅 구조를 기반으로 한 PoC이기 때문에 일반적인 채팅과 구조가 다를 수 있다.

세션의 상태에 `MENU`, `CONNECTING`과 같은 상태가 있는 이유는 유저(고객)가 상대(상담사)와 바로 실시간 채팅을 진행하는 것이 아니라, 유저가 원할 때 상대에게 연결을 요청하고 상대가 연결을 수락하면 그때부터 실시간 채팅을 진행하기 때문이다.

다만 이번 PoC의 목적은 세션 저장 구조를 재현하는 것이므로 상태 전이(`CREATED`에서 `MENU`를 거쳐 `CONNECTING`으로 이어지는 흐름)는 구현하지 않았다. 모든 세션은 `CREATED` 상태로 생성되어 그대로 유지된다.

#### 세션에 포함된 정보

- Sender Key : 여러 개의 채널에서 특정 채널을 구분하는 값
- User Key : 채널 내부에서 특정 유저를 구분하는 값
- State : 세션의 상태(생성, 종료 등)
- Start Time : 세션 최초 생성 시간
- Last Message At : 마지막 메시지 송/수신 시간

#### 세션 생명주기

1. 메시지 입력과 같은 이벤트가 들어온다.
2. `{Sender Key}:{User Key}`를 키로 세션을 조회한다.
3. 세션이 있다면 해당 세션을, 없다면 새로 생성한 세션을 반환한다.
4. 메시지를 처리한다.
5. 마지막 메시지 이후 5분(`chatgw.session.idle-timeout`) 동안 이벤트가 없으면 만료 대상이 되고, 10분 주기로 도는 정리 작업에서 제거된다. 따라서 세션은 마지막 메시지 이후 최대 약 15분까지 남아 있을 수 있다. (종료 엔드포인트는 따로 구현하지 않았다.)

#### 세션 저장소 인터페이스 : `ChatSessionStore`

```java
public interface ChatSessionStore {
    ChatSession getOrCreate(ChatSessionKey key);    // 세션 정보가 있다면 get 없다면 create
    Optional<ChatSession> find(ChatSessionKey key); // 특정 세션 조회
    Collection<ChatSession> findAll();              // 전체 세션 조회
    void remove(ChatSessionKey key);                // 세션 삭제(timeout 삭제 등)
}
```

세션 저장소를 바로 구현 클래스로 만들지 않고 인터페이스를 둔 이유는 Part 3 때문이다.

지금은 JVM 메모리에 저장하는 `InMemorySessionStore`를 사용하지만, Part 3에서는 같은 인터페이스를 구현하는 Redis 저장소로 교체할 예정이다. 세션을 사용하는 쪽 코드는 그대로 두고 저장 위치만 바꾸기 위한 설계다.

#### 인메모리 세션 저장소 : `InMemorySessionStore`

```java
@Component
public class InMemorySessionStore implements ChatSessionStore {

    // JVM 메모리에서 세션 관리
    private final ConcurrentHashMap<String, ChatSession> sessions = new ConcurrentHashMap<>();

    @Override
    public ChatSession getOrCreate(ChatSessionKey key) {
        return sessions.computeIfAbsent(key.asChatSessionKey(), k -> new ChatSession(key));
    }

    @Override
    public Optional<ChatSession> find(ChatSessionKey key) {
        return Optional.ofNullable(sessions.get(key.asChatSessionKey()));
    }
    // findAll(), remove() 생략
}
```

운영 중인 중계 서버와 마찬가지로 세션은 `ConcurrentHashMap`에 `senderKey:userKey`를 키로 저장된다.

여기서 눈여겨볼 부분은 `getOrCreate()`다. "세션이 있으면 가져오고, 없으면 만든다"를 `get()` 후 `put()`으로 나눠 구현하면 다음과 같은 문제가 생긴다.

1. 같은 고객의 메시지 두 개가 거의 동시에 들어온다.
2. 두 스레드가 모두 `get()`으로 조회해 "세션 없음"을 확인한다.
3. 두 스레드가 각각 새 세션을 만들어 `put()`한다. 먼저 저장된 세션은 덮어써져 사라진다.

운영 코드에서 이 문제는 세션 조회/생성 메서드 전체를 `static synchronized`로 감싸서 막는다.
안전하지만 서로 다른 고객의 세션 조회까지 모두 한 줄로 세워 처리하게 된다.

PoC에서는 `computeIfAbsent()`를 사용했다. 같은 키에 대해 "조회하고, 없으면 생성해서 저장"을 원자적으로 처리하므로 같은 경쟁 조건을 막으면서도, 서로 다른 키끼리는 서로를 기다리지 않는다.

하지만 어느 쪽이든 이 안전함은 같은 Map을 공유하는 스레드들 사이에서만 유효하다.
서버가 두 대가 되면 Map도 두 개가 되고, 1번 서버의 `computeIfAbsent()`는 2번 서버의 Map을 알지 못한다.
Part 2에서 깨지는 곳이 바로 이 지점이다.

#### 세션 단위 잠금 : `ChatSession`

```java
public class ChatSession {
    // ...

    // 메시지 처리; 세션 단위로 잠근다. 같은 JVM 안에서만 유효한 잠금.
    public synchronized void processMessage(UserMessageRequest request) {
        log.debug("Received UserMessageRequest : {}", request.getMessage());
        this.lastMessageAt = LocalDateTime.now();
    }

    // 리퍼 스레드가 읽으므로 같은 잠금으로 가시성 보장
    public synchronized LocalDateTime getLastMessageAt() { return lastMessageAt; }
}
```

운영 코드의 메시지 처리 메서드와 동일하게 `synchronized`를 걸었다. 같은 고객의 메시지가 동시에 두 개 들어와도 한 세션 안에서는 하나씩 순서대로 처리된다.

`getLastMessageAt()`에도 `synchronized`를 건 이유는 이 값을 메시지 처리 스레드가 아닌 만료 정리 스레드가 읽기 때문이다.
같은 잠금을 거쳐야 다른 스레드가 바꾼 최신 값을 읽을 수 있다.

이 잠금 역시 JVM 안에서만 유효하다.
서버가 두 대가 되어 같은 세션 데이터를 공유하게 되면 각 서버의 `synchronized`는 서로를 막지 못한다.
이 문제는 세션을 Redis로 옮기는 Part 3에서 다시 다룬다.

#### 유휴 세션 정리 : `IdleSessionReaper`

```java
@Component
public class IdleSessionReaper {

    private final ChatSessionStore chatSessionStore;
    private final Duration idleTimeout; // 무응답 timeout 시간

    public IdleSessionReaper(
            ChatSessionStore chatSessionStore,
            @Value("${chatgw.session.idle-timeout:PT5M}") Duration idleTimeout
    ) {
        this.chatSessionStore = chatSessionStore;
        this.idleTimeout = idleTimeout;
    }

    // 10분마다 만료 세션 정리
    @Scheduled(fixedDelay = 10, timeUnit = TimeUnit.MINUTES)
    public void reapIdleSessions() {
        LocalDateTime cutOff = LocalDateTime.now().minus(idleTimeout);

        for (ChatSession chatSession : chatSessionStore.findAll()) {
            if (chatSession.getLastMessageAt().isBefore(cutOff)) {
                chatSessionStore.remove(chatSession.getSessionKey());
            }
        }
    }
}
```

운영 서버의 세션 만료 타이머 스레드를 Spring의 `@Scheduled`로 옮긴 것이다.
10분마다 전체 세션을 훑어, 마지막 메시지 이후 5분이 지난 세션을 제거한다.

이 스레드 역시 서버마다 하나씩 따로 돈다.
각 서버는 자기 메모리에 있는 세션만 정리할 뿐, 다른 서버에 남아 있는 같은 고객의 세션은 알지 못한다.

### 이벤트 처리 - `src/main/java/.../webhook`

채팅에서 주고받는 이벤트를 처리한다.

#### `POST /api/message`

A와 중계, 중계와 B 사이의 구간 중 A에서 중계로 들어오는 구간의 메시지를 수신하는 엔드포인트다.

외부 채팅 채널에서 유저가 발생시킨 이벤트(A)를 웹 애플리케이션(B)과 연동하는 구조이기 때문에 중계 서버에 별도의 수신부가 있다.

메서드 내부에서는 세션 조회/생성과 메시지 처리가 수행된다.

#### `GET /api/sessions/{senderKey}/{userKey}`

Sender Key + User Key를 기반으로 해당 세션의 상태를 확인한다.

#### 인스턴스 식별 : `InstanceIdentity`

```java
@Component
public class InstanceIdentity {
    private final String id = UUID.randomUUID().toString();

    public String id() { return id; }
}
```

```java
public record ChatSessionResponse(String instanceId, ChatSessionState state) {}
```

서버가 뜰 때마다 UUID로 자신만의 ID를 만들고, 모든 응답에 이 ID를 함께 담아 보낸다.

서버가 한 대인 지금은 의미가 없어 보이지만, Part 2에서 서버를 두 대로 띄웠을 때 어느 서버가 이 요청을 처리했는지를 응답만 보고 확인하기 위해 미리 넣어 두었다.

#### 요청 / 응답 예시

```bash
curl -X POST http://localhost:8080/api/message \
  -H "Content-Type: application/json" \
  -d '{"senderKey":"channel-1","userKey":"user-1","message":"안녕하세요"}'
```

```json
{"instanceId":"【실제 실행 결과 UUID】","state":"CREATED"}
```

`senderKey`, `userKey`, `message` 중 하나라도 비어 있으면 `@Valid` 검증에서 걸려 세션까지 도달하지 않고 400 응답을 받는다.

# 정리

Part 1에서는 실무에서 운영 중인 채팅 중계 서버의 세션 구조를 Spring Boot로 재현했다.

이 구조에서 기억해 둘 것은 서버 한 대에 묶여 있는 세 가지 로컬 상태다.

| 로컬 상태 | 운영 서버 | PoC 구현 | 서버가 2대가 되면 |
| --- | --- | --- | --- |
| 세션 저장소 | `ConcurrentHashMap` | `ConcurrentHashMap` | 서버마다 서로 다른 세션을 갖는다 |
| 세션 만료 | 타이머 스레드 (`TimerList`) | `IdleSessionReaper` (`@Scheduled`) | 각 서버가 자기 세션만 정리한다 |
| 동시성 제어 | `static synchronized` + `synchronized` | `computeIfAbsent` + `synchronized` | 서버 간에는 아무 효과가 없다 |

세 가지 모두 서버가 한 대일 때는 문제없이 동작한다.

다음 Part 2에서는 이 서버를 두 대로 띄우고 앞에 로드밸런서를 두어, 같은 고객의 메시지가 서로 다른 서버로 전달됐을 때 실제로 무엇이 깨지는지 확인해 보겠다.
