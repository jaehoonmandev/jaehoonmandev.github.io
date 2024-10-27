---
#layout: single
title:	"Spring Boot + Docker + JPA + Docker Compose + Jenkins -Part.2-"
date:	2024-10-01 12:00:00
categories:
  - Settings
tags:
  - Spring Boot
  - Docker
  - JPA
  - Docker Compose
  - Jenkins
  - PostgreSQL
  - Thymeleaf
  - Gradle
comment: true
#published: false 
---

[Spring Boot + Docker + JPA + Docker Compose + Jenkins -Part.1-](/settings/SpringBoot-Docker-Docker-Compose-Jenkins-Part_1/) 포스트에 이어서 이번엔 JPA 연동과 Docker Compose를 통해 웹 애플리케이션과 연동되는 이미지들을 함께 컨테이너로 관리하는 방법에 대해 알아보겠다.


# JPA

JPA를 이용하여 Spring Boot와 Docker로 생성한 PostgreSQL의 Container를 연동해보겠다.

먼저 JPA(Java Persistence API)는 간단하게 java에서 데이터베이스와 객체 지향 프로그래밍의 객체(클래스)를 관계형 데이터베이스의 테이블과 매핑하여 ORM(Object-Relational Mapping)을 구현하는 데 사용하는 표준 인터페이스다.

## Instance Connect

Docker Container가 실행중인지 확인하고 Container 밖에서도 접근이 가능한지 확인하자.

먼저 `docker ps`로 실행중인 인스턴스가 어떻게 라우팅 되고 있는지 확인한다.

``` shell
jaehoonman@jaehoonman-2 ~ % docker ps

CONTAINER ID   IMAGE         COMMAND                   CREATED      STATUS              PORTS                    NAMES

710a29941a80   postgres:14   "docker-entrypoint.s…"   2 days ago   Up About a minute   0.0.0.0:5432->5432/tcp   jaehoonman_postgres

```

필자는 별다른 설정 없이 5432 포트로 맵핑 했기에 `0.0.0.0:5432->5432/tcp(localhost:5432)` 로 라우팅 중이다.

확실히 연동이 되는지 확인하기 위해서 psql, DBeaver 등과 같은 DB 클라이언트 툴을 통해 연결을 확인하는 방법을 사용해도된다.

필자는 IntelliJ의 기능을 이용하여 연동을 해봤다.

![db connect test]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/2/db_connect_test.png)


Test Connection 성공으로 정상적으로 외부에서 PostgreSQL 컨테이너에 접속되는 것을 확인했다.

## Dependencies

Spring Boot 웹 애플리케이션에서 동적으로 Interaction 할 수 있도록 JPA를 추가할 것이다.

`build.gradle`을 열어 `dependencies`에 JPA와 postgresql 그리고 편의를 위한 lombok을 의존성에 추가하자.

``` yaml
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

implementation 'org.projectlombok:lombok'  
annotationProcessor 'org.projectlombok:lombok'
    
runtimeOnly 'org.postgresql:postgresql' 
```

``` yaml
dependencies {  
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'  
    implementation 'org.springframework.boot:spring-boot-starter-web'  
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.projectlombok:lombok'  
    annotationProcessor 'org.projectlombok:lombok'
  
    developmentOnly 'org.springframework.boot:spring-boot-devtools'  
  
    testImplementation 'org.springframework.boot:spring-boot-starter-test'  
  
    runtimeOnly 'org.postgresql:postgresql'  
  
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'  
}
```

## properties

`src/main/resources/application.properties` 를 활용하여 datasource, jpa를 설정해보자.

참고로 `application.properties`를 `application.yml`로 변경하였다.

``` yaml
spring:
	# 애플리케이션 설정
	application:  
		name: [프로젝트명]  
	
	# 데이터베이스 연동 정보
	datasource:  
		url: jdbc:postgresql://localhost:5432/[생성한 DB]  
		username: [생성한 계정명]  
		password: [설정한 패스워드]  
		driver-class-name: org.postgresql.Driver  
	
	# JPA 설정  
	jpa:  
		hibernate:  
			ddl-auto: update # 엔티티의 스키마를 동기화한다.  
		properties:  
			hibernate:  
			  show_sql: true # Interaction 시 실행되는 커맨드를 콘솔에 표시해준다.  
			  format_sql: true # 콘솔에 예쁘게 표시한다.  
			  use_sql_comments: true # 콘소에 추가 정보
```

`datasource` 로 연동할 DB의 정보를 기입하고, `jpa` 에 필요한 옵션들을 기입한다.

hibernate는 JPA를 구현한 구현체이며, `ddl-auto`는 등록된 Entity를 기반으로 DDL(Data Definition Language)을 자동으로 작성해주는 기능이다.

`ddl-auto`의 옵션으로는

| 옵션              | 설명                                             | 사용 시기                              |
| --------------- | ---------------------------------------------- | ---------------------------------- |
| **none**        | DDL 명령을 실행하지 않음.                               | **운영 환경**에서 스키마를 수동으로 관리할 때.       |
| **validate**    | 스키마와 엔티티 구조를 검증, 스키마를 수정하지 않음.                 | **운영 환경**에서 스키마가 엔티티와 일치하는지 확인할 때. |
| **update**      | 기존 스키마를 수정하여 엔티티 클래스와 일치시키지만, 기존 데이터 손실 없이 변경. | **개발** 중 데이터베이스 스키마를 자동으로 업데이트할 때. |
| **create**      | 기존 스키마를 삭제하고 새로 생성.                            | **개발** 중 데이터 초기화가 필요할 때.           |
| **create-drop** | 애플리케이션 실행 시 스키마 생성, 종료 시 스키마 삭제.               | **테스트** 중 임시로 데이터베이스 스키마를 생성할 때.   |

가 있다.

현재는 개발 과정이기에 `update`로 설정하여 엔티티 클래스와 DB의 스키마를 자동으로 동기화 시킨다.

사용 시기에 나와있듯이 운영 환경에서는 `none`과 `validate` 옵션만 사용하자.

다른 옵션들은 내부 데이터 손실의 위험성이 있으니 실무에서는 절대로 설정하지말자.

위와 같이 Properties로 설정하는 것 외에도 `@Configuration`를 활용하여 class로 설정을 구현할 수도 있다.


## Entity

JPA는 ORM(Object Relational Mapping)의 개념을 차용하여 데이터베이스의 테이블을 Java 객체로 매핑하여 인식하는데 Entity를 사용한다.

이에 따른 Entity class를 만들자.

`src/main/java/[프로젝트]/` 경로에 `entity` 디렉터리와 `Users` 클래스를 만들자.
(예시 DB 테이블을 Users로 만들어서 앞으로의 예제에 조금 어색한 부분이 있을 수도 있다.. 하하하)

``` java
@Entity  
@Data  
@AllArgsConstructor  
@NoArgsConstructor(access = AccessLevel.PROTECTED)  
public class Users {  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.IDENTITY)  
    private Long id;  
  
    private String name;  
  
    private String email;  

	@CreationTimestamp  
	@Temporal(TemporalType.TIMESTAMP)
    private Date created_at;  

	@Builder  
	public Users(String name, String email){  
	    this.name = name;  
	    this.email = email;  
	}
  
}
```

만약 lombok의 기능을 사용하지 않는다면
``` java
@Entity
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;

    // 기본 생성자
    public User() {}

    // 생성자
    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    // Getter, Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // toString, equals, hashCode 등 추가 코드...
}
```

등 사용자가 직접 메서드를 만들어야한다.(Boilerplate Code)

다시 돌아와서 클래스 단위에
- `@Entity` : Spring Boot의 Bean이 Entity라는 것을 인식할 수 있도록 명시.
- `@Data` : lombok의 자동 구성 기능 사용.
- `@AllArgsConstructor` : 모든 필드를 받는 **생성자**를 자동으로 생성.
- `@NoArgsConstructor(access = AccessLevel.PROTECTED)` : JPA는 기본 생성자가 필수이며, 이 파라미터가 없는 기본 생성자를 자동으로 생성.

를 선언하여 옵션을 주었고,

`Date` 필드에는
``` java 
@CreationTimestamp  
@Temporal(TemporalType.TIMESTAMP)
```
를 선언하여 `POST` 로 새로운 데이터를 create / insert 시 생성 된 시간을 자동으로 `TIMESTAMP`로 들어가게 설정해주었다.

`@AllArgsConstructor`와 `@NoArgsConstructor` 를 조금 더 설명하자면

`@AllArgsConstructor`는 기본 생성자를 아래와 같이 자동 생성해주며 초기화가 가능해진다.
``` java
@AllArgsConstructor
public class Users {
    private Long id;
    private String name;
    private String email;
}

----

public Users(Long id, String name, String email) {
    this.id = id;
    this.name = name;
    this.email = email;
}

---

Users user = new Users(1L, "Jaehoonman", "jaehoonman@example.com");
```

`@NoArgsConstructor` 는 기본 생성자를 생성한다.

``` java 
@AllArgsConstructor
public class Users {
    private Long id;
    private String name;
    private String email;
}

----

public Users() { }
```

`access = AccessLevel.PROTECTED` 의 옵션을 줌으로써 상속받는 클래스나 같은 패키지 내에서만 생성자를 호출하여 외부에서 불필요하게 호출되어 무결성을 해치는 것을 방지해준다.

`@Builder`는 Entity 객체를 빌더 패턴으로 생성할 때 간편하게 사용할 수 있다.
``` java
Users user = Users.builder()
                .name("Jaehoonman")
                .email("jaehoonman@example.com")
                .build();
```


## Repository

데이터베이스와 상호작용 하기 위한 레이어다.

데이터베이스와의 상호 작용이라함은 CRUD(Create, Read, Update, Delete) 일 것이고, Repository는 저장소를 뜻한다.

Repository는 객체와 DB 사이에 존재하는 중간 계층으로 데이터베이스 작업을 캡슐화 하여 애플리케이션 코드와 데이터 Access 로직을 분리하는 역할을 한다.

Spring Boot JPA는 위에서 작성한 Entity를 기반으로 `JpaRepository` 인터페이스를 extends 한다면 비지니스 로직에서 (~~간단한~~)SQL을 작성할 필요 없이 기본적으로 제공하는 메서드롤 통해 간단히 처리할 수 있다.

`entity`에서 했던 것과 같이 `src/main/java/[프로젝트]` 경로에 `repositoy` 디렉토리 생성 후 `UsersRepository.java`를 생성하자.

``` java
@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {  

}
```

끝이다.

확장한 `JpaRepository` 인터페이스는 Argument로 Entity와 ID로 활용될 타입만 기입한다면 기본적으로 CRUD를 수행할 수 있는
- **findAll()**: 모든 데이터를 조회
- **findById(Long id)**: 특정 데이터를 ID로 조회
- **save(User user)**: 데이터를 저장 또는 수정
- **deleteById(Long id)**: ID로 데이터를 삭제

와 같은 메서드를 제공한다.

그렇다면 `JpaRepository`는 interface일 뿐이고 실제로 구현되지 않을텐데 어떻게 메서드를 제공하는 것일까?

이는 Spring boot 애플리케이션이 실행 될 때 `JpaRepository`를 상속 받는 인터페이스를 확인하고 Proxy 객체를 생성한다.

해당 과정에서 Hibernate 등과 같은 JPA의 구현체를 통해 쿼리를 생성하고 실행하는 부분을 자동으로 구현해준다.

더 세세한 사항은 다루지 않도록하겠다.

기본적으로 제공하는 메서드 이외에도 사용자는 JPA는 메서드명으로 쿼리문을 자동으로 작성하는 Query Method 방식을 활용하여 메서드를 생성 혹은 사용할 수 있다.

예시로 쿼리의 `WHERE`과 같이 해당되는 데이터를 찾는 메서드를 하나 만들어보겠다.

``` java
@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {  
    List<Users> findByName(String name);  
}
```

`findByName(String name)`은 메서드명만 봐도 무엇을 수행할지 감이 오지 않는가?

이름으로 `Users` 테이블에서 해당되는 튜플을 읽어오는데 `name`의 경우에는 값이 유일하지 않기 때문에 여러개가 나올 수 있다는 가정하에 return type을 `List<T>`로 잡았다.

이외에도 복잡한 쿼리문을 직접 작성할 수 있는 `@Query`도 있지만 다루진 않겠다.


## Service

비지니스 로직을 처리하는 레이어다.

Controller에서 클라이언트의 요청을 받아서 DB의 데이터를 읽어온다 했을 때 Controller와 Repository를 잇는 일종의 다리 역할이다.

Controller, Service, Repository의 레이어를 나누는 아키텍쳐를 사용하는 이유는 간단하게
- 역할 분리 : 각각의 책임을 명확히하고 유지보수성과 확장성을 높인다.
- 비지니스 로직 캡슐화 : 민감한 정보를 다룬다거나, 복잡한 로직을 다루는 등 캡슐화를 통해 은폐, 재사용성 증대 등의 장점을 가지게 된다.
- 테스트 용이성 : 분리된 레이어에서 테스트하고 싶은 영역을 단독으로 수행할 수 있게된다.

정도가 있다.

Service 레이어를 위주로 간단하게 설명하면서 제대로된 내용이 아닐 순 있다.

이는 나중에 더 자세히 다루기로하고 일단은 Service는 비지니스 로직을 처리한다 정도만 알고 있자.

자 이번에도 디렉터리와 클래스를 만들자.

``` java
@Service  
public class UsersService {  
  
    private UsersRepository usersRepository;  
  
    @Autowired  
    public void setUsersRepository(UsersRepository usersRepository){  
        this.usersRepository = usersRepository;  
    }  
  
    // 모든 사용자 조회  
	public List<Users> findAllUsers() {  
	    return usersRepository.findAll();  
	}  
	  
	// 아이디로 사용자 조회  
	public Optional<Users> findUserById(Long id){  
	    return usersRepository.findById(id);  
	}  
	  
	// 이름으로 사용자 조회  
	public List<Users> findUserByName(String name) {  
	    return usersRepository.findByName(name);  
	}
  
    // 사용자 생성  
    public Users createUser(Users user) {  
        return usersRepository.save(user);  
    }  
  
    // 사용자 업데이트  
    public Users updateUser(Long id, Users userDetails) {  
        Users user = usersRepository.findById(id)  
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없음: " + id));  
  
        user.setName(userDetails.getName());  
        user.setEmail(userDetails.getEmail());  
  
        return usersRepository.save(user);  
    }  
  
    // 사용자 삭제  
    public void deleteUser(Long id) {  
        usersRepository.findById(id)  
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없음: " + id));  
        usersRepository.deleteById(id);  
    }  
  
}
```

`UsersRepository`에서 생성된 메서드와 위에서 추가한 `findByName(String name)`을 사용했다.

추가로 설명할만한 것은 ID로 조회 시 `Optional`을 return type으로 줬다는 것인데, `Optional`은 `null` 값을 안전하게 처리하기 위해 사용하며, `List`와 비교했을 때는 단일 값에 보통 `Optional`을 사용한다.

좀 더 안전하게 처리하기 위해서는
``` java
Optional<Users> user = usersService.findUserById(1L);
if (user.isPresent()) {
    System.out.println("유저 조회 완료: " + user.get().getName());
} else {
    System.out.println("유저를 찾을 수 없음");
}

---

usersService.findUserById(1L).ifPresent(user -> {
    System.out.println("유저 조회 완료: " + user.getName());
});

---

Users user = usersService.findUserById(1L).orElse(new Users("default", "default@example.com"));

---

Users user = usersService.findUserById(1L).orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없음"));

```
와 같은 방법도 사용가능하다.

또한 메서드 참조자를 사용하여 특정 값을 구하는 방법과 조건에 맞는 값만 유지하는 방법도 있다.

``` java
Optional<String> userEmail = usersService.findUserById(1L).map(Users::getEmail);
---
Optional<Users> user = usersService.findUserById(1L)
                                 .filter(u -> u.getName().startsWith("J"));
```

## Controller

유저의 요청에 맞는 동작을 수행하고, 반환하기 위한 레이어다.


``` java
@RestController  
@RequestMapping("/users")  
public class users {  
  
    private UsersService usersService;  
  
    @Autowired  
    public void setUsersService(UsersService usersService){  
        this.usersService = usersService;  
    }  
    // 모든 사용자 조회  
    @GetMapping  
    public ResponseEntity<List<Users>> getAllUsers() {  
        List<Users> users = usersService.findAllUsers();  
        return ResponseEntity.ok(users);  
    }  
  
    // ID로 사용자 조회  
    @GetMapping("/{id}")  
    public ResponseEntity<Users> getUserById(@PathVariable Long id) {  
        Users user = usersService.findUserById(id)  
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없음: " + id));  
        return ResponseEntity.ok(user);  
    }  
  
    // 이름으로 사용자 조회 (RESTful 하진 않지만 넘어가자 하하하)
    @GetMapping("/name/{name}")  
    public ResponseEntity<List<Users>> getUserByName(@PathVariable String name) {  
        List<Users> users = usersService.findUserByName(name);  
        return ResponseEntity.ok(users);  
    }  
  
    // 새로운 사용자 생성  
    @PostMapping  
    public ResponseEntity<Users> createUser(@RequestBody Users user) {  
        Users createdUser = usersService.createUser(user);  
        return ResponseEntity.ok(createdUser);  
    }  
  
    // 사용자 업데이트  
    @PutMapping("/{id}")  
    public ResponseEntity<Users> updateUser(@PathVariable Long id, @RequestBody Users userDetails) {  
        Users updatedUser = usersService.updateUser(id, userDetails);  
        return ResponseEntity.ok(updatedUser);  
    }  
  
    // 사용자 삭제  
    @DeleteMapping("/{id}")  
    public ResponseEntity<Users> deleteUser(@PathVariable Long id) {  
        usersService.deleteUser(id);  
        return ResponseEntity.noContent().build();  
    }  
  
}
```

## Test

Test하는 방법으로는 JUnit을 사용하는 방법도 있지만 볼륨이 너무 커질 것 같으니 웹 인스턴스를 띄워서 HTTP 요청을 보내는 것으로 테스트를 할 것이다.

먼저 Docker PostgreSQL Container와 Spring boot 서비스를 실행시키자.

이후 HTTP 요청을 보내야하는데, 해당 포스트에서는 IntelliJ의 `.http`의 기능을 활용 할 것이다.

물론 Postman을 사용해도 된다.

`.http` 파일을 원하는 위치에 생성하고 명령을 작성하자.

### 조회
``` http 
### 모든 사용자 조회  
GET http://localhost:8080/users  
``` 

``` json
[
  {
    "id": 1,
    "name": "Jaehoonman",
    "email": "jaehoonman@example.com",
    "created_at": "2024-09-17T11:18:43.055+00:00"
  },
  {
    "id": 2,
    "name": "JonDoe",
    "email": "jondoe@example.com",
    "created_at": "2024-09-17T11:18:43.062+00:00"
  }
]
```

동작이 수행될 때마다 `application.yml` 에서 설정했던 `jpa.properties.hibernate.show_sql = true`의 설정으로
``` sql
select 
	u1_0.id,
	u1_0.created_at,
	u1_0.email,
	u1_0.name
from
	user u1_0
```
과 같은 쿼리문이 출력되는 것을 확인할 수 있다.

``` http
### ID로 사용자 조회  
GET http://localhost:8080/users/1  
```

``` json
{
  "id": 1,
  "name": "Jaehoonman",
  "email": "jaehoonman@example.com",
  "created_at": "2024-09-17T11:18:43.055+00:00"
}

```

```http
### 이름으로 사용자 조회  
GET http://localhost:8080/users/name/JonDoe  
```

``` json
[
  {
    "id": 2,
    "name": "JonDoe",
    "email": "jondoe@example.com",
    "created_at": "2024-09-17T11:18:43.062+00:00"
  }
]
```

### 생성
``` http
### 새로운 사용자 생성  
POST http://localhost:8080/users  
Content-Type: application/json  

{  
  "email": "Jaehoonman123@exmaple.com",  
  "name": "Jaehoonman123"
}  
```

``` json 
{
  "id": 4,
  "name": "Jaehoonman123",
  "email": "Jaehoonman123@exmaple.com",
  "created_at": "2024-09-26T13:48:33.692+00:00"
}
```

### 업데이트
``` http
### 사용자 업데이트  
PUT http://localhost:8080/users/4  
Content-Type: application/json
  
{  
  "email": "NotJaehoonman@exmaple.com",  
  "name": "JaehoonmanClone"
}  
```

``` json
{
  "id": 4,
  "name": "JaehoonmanClone",
  "email": "NotJaehoonman@exmaple.com",
  "created_at": "2024-09-26T13:48:33.692+00:00"
}
```
### 삭제
``` http
### 사용자 삭제  
DELETE http://localhost:8080/users/4
```

여기까지 Spring Boot + JPA + PostgreSQL 연동을 해봤다.

이제 Spring Boot와 PostgreSQL를 Docker Container로 통합하여 다루도록 해보겠다.

# Docker Compose

연동된 Spring Boot와 PostgreSQL는 사실 각각의 Image, Container로 구성된다.

즉, docker build, run 을 각각 진행 해야한다는 것이다.

당장은 2개만 다루면 되기에 큰 무리가 없어보이지만 서비스가 확장되면서 다뤄야할 Container가 많아진다면 곤란할 것이다.

이때 Docker Compose를 사용해 이를 통합하여 관리할 수 있다.

Docker Compose는 Docker를 설치하면 기본적으로 함께 설치되는 애플리케이션이다. (버전마다 다를 수 있음)

바로 활용해보자.

## `docker-compose.yml`

Docker Compose도 Dockerfile 처럼 yml로 구성된다.

### gradle / docker build
`docker-compose.yml` 파일을 생성하기 전에 지금까지 작성한 소스코드를 `bootJar` 로 build하자.

``` shell
# ./gradlew clean bootJar

# docker build -t [원하는 이미지 이름]:[태그명] .
```

### `docker-compose.yml` 파일 생성
이제 `Dockerfile`과 같은 경로에 `docker-compose.yml`을 생성하자.

![Docker Compose file]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/2/docker-compose-yml.png)

### `docker-compose.yml` 파일 작성
``` yml
version: '3.8'  
services:  
  app:  
    image: [빌드한 이미지명]  
    container_name: [생성될 Spring Boot Application 컨테이너 이름]
    depends_on:  
      - db  
    ports:  
      - "8080:8080"  
    environment:  
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/[이전에 생성했던 DB명]
      SPRING_DATASOURCE_USERNAME: [유저명]
      SPRING_DATASOURCE_PASSWORD: [비밀번호]
    networks:  
      - app-network  
  db:  
    image: postgres:14  
    container_name: [생성될 PostgreSQL 컨테이너 이름]
    environment:  
      POSTGRES_DB: [이전에 생성했던 DB명]  
      POSTGRES_USER: [유저명]  
      POSTGRES_PASSWORD: [비밀번호]
    ports:  
      - "5432:5432"  
    volumes:  
      - my_pgdata:/var/lib/postgresql/data  
    networks:  
      - app-network  
  
volumes:  
  my_pgdata:  
	  external: true
networks:  
  app-network:  
    driver: bridge
```

- `container_name`
  - docker compose를 통해 생성될 서비스 컨테이너의 이름을 설정한다.
  - 다른 컨테이너와 중복되는 이름을 사용할 수 없다.
- `depondes_on`
  - 서비스를 실행하기 전에 먼저 수행되어야하는 서비스명.
  - 즉, db의 서비스가 먼저 실행된 뒤 Spring Boot 서비스가 실행된다.
- `networks:app-network`
  - 동일한 컨테이너에서 서비스끼리 통신을 할 수 있도록 설정해준다.
- `volumes`
  - 데이터 영속성을 위해 PostgreSQL 데이터를 저장할 위치를 설정한다.
  - 이전에 docker run 시 `-v` 옵션을 통해 설정했던 위치에 이전까지 했던 내용이 저장되었기에 해당 경로로 설정해준다.
  - Docker에서 설정한 Volume 설정을 보기 위해서는 `docker volume ls` 로 Volume의 목록을 볼 수 있다.
- `volumes.my_pgdata.external = true`
  - 기존에 있는 volume를 사용하도록 설정.
  - 기본적으로 Root 디렉토리 이름을 기준 자동으로 볼륨을 네임스페이스화하여 생성하지만 이전에 지정한 volume 이름과 다르기에 이를 강제하기 위해 사용했다.

### DB 경로

이 때 주의할 점은 DB의 호스트는 더 이상 Localhost가 아니다.

이전에는 Docker Container로 실행시킨 인스턴스를 Container 외부에서 접근했기 때문에 외부로 open 해둔 host와 port로 접근 했다.

하지만 Docker-compose를 통해 하나의 컨테이너로 관리하면서, 서비스들은 컨테이너 내부에서 서로 통신을 해야하는 환경이 주어진 것이다.

그러므로 호스트는 서비스명인 `db`가 된다.

### `application.yml`

위에서 언급 하였듯이 Spring Boot 서비스 입장에서 DB의 호스트는 더 이상 localhost가 아니다.

`application.yml`의 설정에서 DB URL 부분을 변경해주자.
``` yml
spring:
	# 애플리케이션 설정
	application:  
		name: [프로젝트명]  
	
	# 데이터베이스 연동 정보
	datasource:  
		url: jdbc:postgresql://db:5432/[생성한 DB]  
		...
```

## docker-compose up

파일 작성을 완료 했다면 설정 했던대로 컨테이너를 만들어야한다.

커맨드는 `docker-compose.yml`이 있는 경로에서 실행해야한다.

### up
기본 명령어는

``` sh
docker compose up --build
```

와 같다.

참고로 하이픈이 포함된 `docker-compose`는 Docker가 docker compose의 기능을 통합하는 2.x 이전의 초기 버전으로 가급적 `docker compose`로 실행이 되는 최신 버전 사용을 권고한다. 

해당 커맨드를 입력하면 `docker-compose.yml`에서 작성한 내용을 토대로 Docker compose 프로젝트가 생성되고 곧바로 실행될 것이다.

![Docker Compose project]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/2/docker-compose-project.png)

커맨드를 입력한 터미널은 서비스를 실행하는 커멘드가 되기에 다른 작업을 할 수가 없다.

백그라운드에서 실행하고 싶으면

``` sh
docker compose up -d
```
의 명령어를 입력하자.

### ps

실행한 프로젝트가 정상적으로 실행되는지 확인하기 위해서 ps 명령어를 입력할 수 있다.

``` sh
docker compose ps
```

``` sh
jaehoonman@jaehoonman-2 new_structure % docker compose ps
NAME                  IMAGE                COMMAND                  SERVICE   CREATED          STATUS          PORTS
jaehoonman_jenkins    jaehoonman_jenkins   "java -jar /app.jar"     app       19 minutes ago   Up 19 minutes   0.0.0.0:8080->8080/tcp
jaehoonman_postgres   postgres:14          "docker-entrypoint.s…"   db        19 minutes ago   Up 19 minutes   0.0.0.0:5432->5432/tcp
```

이후 실행중인 인스턴스를 이전에 HTTP Test 했던 것 처럼 테스트하면 동일한 데이터를 얻을 수 있을 것이다.

서비스를 정지하고 싶다면 실행중인 터미널에서 `control + c` 혹은 `docker compose stop`의 커맨드를 입력하자.

### down

``` sh
docker compose down
```

실행중인 서비스를 정지하고 해당 서비스와 관련된 컨테이너를 삭제한다.

프로젝트가 이미 생성되어 있고, 이를 `up`, `build`와 같은 커맨드로 다시 프로젝트를 생성하면 중복되는 프로젝트가 있기에 해당 커맨드는 실행되지 않을 것이다.

그러므로 실행중인 인스턴스를 다시 배포하기 위해서는 docker compose 파일이 있는 경로에서 해당 커맨드를 입력하여 정지, 삭제하길 바란다.

관련된 볼륨도 함께 삭제하려면
``` sh
docker compose down -v
```
의 `-v` 옵션을 통해 함께 삭제할 수 있다.

### Project name

각각의 서비스를 컨테이너로 구성하여 Docker Compose를 생성할 때 Docker Compose 이름은 `docker compose.yml` 파일이 위치한 경로의 프로젝트 이름으로 자동 생성된다.

생성되는 프로젝트의 이름을 직접 지정하고 싶다면

``` sh 
docker compose -p [생성될 프로젝트명] up
```

의 커맨드를 사용하면된다.

### ETC
- `docker compose stop` : 정지
- `docker compose restart` : 재시작
- `docker compose build` : 빌드
  - `docker compose build --no-cache` : 캐시를 사용하지 않고 빌드.
- `docker compose logs` : 실행 중인 서비스의 로그 확인.
  - `docker compose logs <service_name>` : 특정 서비스의 로그 확인.
  - `docker compose logs -f` : 실시간 로그 확인.
- `docker compose config` : Docker compose 환경 변수 확인.

Spring Boot + PostgreSQL + JPA + Docker + Docker Compose 까지 진도를 내봤다.

다음에는 Jenkins 를 통해서 CI/CD 파이프라인을 구축하여 배포 환경을 구축해보겠다.

<br/>

Ref.

[https://goddaehee.tistory.com/209](https://goddaehee.tistory.com/209)