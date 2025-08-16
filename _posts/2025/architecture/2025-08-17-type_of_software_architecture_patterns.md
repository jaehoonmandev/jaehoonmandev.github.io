---
#layout: single
title:	"[Architecture] 소프트웨어 아키텍처 패턴"
date:	2025-08-17 12:00:00
categories:
- Architecture
tags:
- Architecture 
- Pattern
- Layered
- Client-Server
- Event-Driven
- Broker
- MSA
---
이번 포스트에서는 소프트웨어 아키텍처 및 패턴들에 대해서 간단히 알아보겠다.

## 소프트웨어 아키텍처란?

	시스템을 구성하는 요소와 이들간의 상호작용 관계, 설계 지침 등을 정의한 일종의 청사진(Blueprint)

![Software Architecture Patterns]({{ site.baseurl }}/assets/images/posts/2025/architecture/patterns/software-architecture-patterns.png)
  *https://blog.bytebytego.com/p/software-architecture-patterns*

개발의 생산성을 높이기 위해 우리는 종종 Spring, Django, Laravel 등과 같은 프레임워크를 사용한다.

이러한 프레임워크가 애플리케이션의 **뼈대(Framework)** 의 역할을 한다면,
**소프트웨어 아키텍처(Software Architecture)** 는 애플리케이션, 서버, 데이터베이스, 파이프라인 등.
서비스 전반의 구조를 **서비스 목적에 맞게 어떻게 구성할지를 정의하는 설계 제안서**와 같다.

## 소프트웨어 아키텍처의 중요성

“처음이 가장 중요하다”고 하듯, **서비스 운영의 첫걸음은 기획과 요구사항에 맞는 시스템 구조 설계**에서 시작된다.

단순히 ‘처음이라서 중요한 것’이 아니라, 아키텍처를 통해 다음과 같은 구조적 이점을 기져올 수 있다.

### Modularity, 모듈화
시스템을 기능별로 나눠 **독립적인 모듈**로 구성함으로써, 각 모듈을 개별적으로 개발, 테스트, 유지보수할 수 있어 **생산성과 유연성**이 향상된다.

### Encapsulation, 캡슐화
모듈 내부의 구현 세부사항은 숨기고, 외부에는 **필요한 인터페이스만 제공**하여 시스템 복잡도를 줄이고 **변경에 대한 영향 범위**를 최소화할 수 있다.

### Security
아키텍처 설계 단계에서부터 **인증, 인가, 접근 제어** 등의 보안 요소를 반영하여 시스템을 **외부 공격이나 내부 위협으로부터 보호**할 수 있다.

### Documentation
아키텍처는 시스템 구성에 대한 **명확한 문서**를 제공하므로 개발자 간의 원활한 커뮤니케이션, 협업, 온보딩에 큰 도움이 된다.

### Performance
트래픽, 처리량, 리소스 사용량 등을 고려한 구조 설계를 통해 시스템이 실제 운영 환경에서 **요구되는 성능을 안정적으로 달성**할 수 있도록 돕는다.

## 소프트웨어 아키텍처 패턴과 디자인 패턴의 차이점

**소프트웨어 아키텍처 패턴**과 **디자인 패턴**은 모두 소프트웨어 개발 과정에서 자주 사용되는 개념이다.

두 용어 모두 “패턴”이라는 공통된 단어를 포함하고 있으며, 개발 과정에서 함께 언급되는 경우가 많기 때문에 혼동하기 쉽다.

이번에는 이 두 개념의 차이를 정리해보겠다.

|        | **소프트웨어 아키텍처 패턴**                                                             | **디자인 패턴**                                                                   |
| ------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **정의** | 시스템의 주요 컴포넌트와 이들 간의 관계, 배치, <br>데이터 흐름 등을 **고수준(High-Level Structure)**에서 정의. | 컴포넌트나 클래스 내부에서 반복적으로 발생하는 문제를 <br>해결하기 위한 **저수준(Low-Level Solution)** 설계 방법. |
| **범위** | 시스템 전체.                                                                       | 개별 듈, 컴포넌트, 클래스                                                              |
| **목적** | 시스템의 전반적인 구조와 구성 전략을 수립.                                                      | 반복되는 설계 문제에 대한 재사용 가능한 해법 제공.                                                |
| **초점** | 시스템의 안정성, 유연한 구조, 확장성.                                                        | 객체 간의 관계, 책임 분리, 코드 재사용                                                      |
| **문서** | 아키텍처 다이어그램, 추상화된 설계 문서                                                        | UML 다이어그램, 상세 설계 문서                                                          |
| **예시** | Layered Architecture, Microservices, <br>Client-Server.                       | Singleton, Factory, Strategy,<br>Observer.                                   |
  
## 적절한 아키텍처 선정하기

소프트웨어 아키텍처 패턴의 종류를 알아보기 전, 적절한 아키텍처를 선정하기 위한 고려 사항들을 설명하겠다.

### 1. 확장성, Scalability
- 시스템이 서비스 규모 확장에 따라 증가하는 부하를 얼마나 **유연하게 감당할 수 있어야 하는가?**
- 사용자 수 증가, 데이터 처리량 증가.

### 2. 성능, Performance
- 지연 시간, 처리 속도, 응답 시간 등 **특정 성능 요구사항이 존재하는가?**
- 실시간 처리, Low latency

### 3. 가용성, Availability
- 시스템 일부에 장애가 발생하더라도 **서비스가 지속적으로 운영될 수 있어야 하는가?**
- 무중단 서비스, 자동 장애 복구, 이중화

### 4. 보안, Security
- 시스템이 충족해야 하는 **보안 요건은 무엇이며**, 어떤 **위협 요소에 대비해야 하는가?**
- 인증, 인가, 데이터 암호화, Cracking

### 5. 예산, Budget
- 시스템을 개발하고 운영하는 데 필요한 **예산은 어느 정도인가?**
- 클라우드 비용, 라이선스, 인력 규모

### 6. 기술 스택, Technology Stack
- 아키텍처 구현에 사용될 **언어, 프레임워크, 인프라 구성은 무엇이며**, 이를 **얼마나 잘 다룰 수 있는가?**
- Spring Boot, Node.js, AWS, Docker

## 소프트웨어 아키텍처 패턴의 종류

### 1. Layered Architecture Pattern

	역할에 따라 레이어를 독립적으로 구분.

![layered Architecture Pattern]({{ site.baseurl }}/assets/images/posts/2025/architecture/patterns/layered-architecture.png)
  *https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html*

레이어드 아키텍처 패턴은 **역할에 따라 시스템을 수직적으로 구분된 여러 레이어로 나누는** 구조이다.

일반적으로 많이 활용하는 패턴 중 하나로, `n-tire patterns`이라고도 불린다.

이 아키텍처에서 각 레이어는 **책임(Role)** 을 가지고 있으며, **하위 레이어와만 상호작용하는 순차적 위임(동기적 계층 호출)**을 수행한다.

상위 레이어는 하위 레이어의 구체적인 구현을 알 필요 없이 **인터페이스를 통해 기능을 호출**하게 된다.

#### 레이어 구성

| **Presentation Layer**      | 사용자 인터페이스(UI)를 담당하며, 유저의 입력을 받고 화면을 구성. |
| --------------------------- | --------------------------------------- |
| **Business(Service) Layer** | 유저의 요청에 따라 실제 비즈니스 로직을 실행.              |
| **Persistence Layer**       | 비즈니스 로직과 데이터베이스 사이에서 데이터를 교환하는 중간 계층 역할 |
| **Database Layer**          | 실제 데이터가 저장되는 데이터베이스에 접근하고 데이터를 관리       |

레이어는 **Persistence Layer의 로직이 Business Layer에 통합**되어 **3계층 구조**로 축소되기도 하며, 5개로 구성되는 경우도 있다.

#### 데이터 흐름 예시

| Component                                |                 Action                 |                Action                 |
| ----------------------------------------- | :------------------------------------: | :-----------------------------------: |
| **Presentation <br>Layer**                | "장바구니 담기" 버튼 클릭으로 addToCart Request 발생 |         "장바구니에 추가되었습니다. 화면 표시         |
|                                           |                   ↓                    |                   ↑                   |
| **Business <br>Layer**                    |      CartService.addToCart 로직 수행.      | "장바구니에 추가 되었습니다." 메시지 및 Status Return |
|                                           |                   ↓                    |                   ↑                   |
| **Persistence<br>(Application)<br>Layer** |        cart table INSERT SQL 실행        |             성공 결과 Return             |
|                                           |                   ↓                    |                   ↑                   |
| **Database<br>Layer**                     |             cart table 저장.             |           DB Transaction 성공           |

- 각 레이어는 **상위 레이어의 요청이 완료되었거나 더 이상 책임지지 않는 상태**임을 전제로 하위 레이어로 요청을 넘김.
- 상위 레이어는 하위 레이어의 내부 동작을 관여하거나 침범하지 않음. (**관심사 분리**)
- 요청은 단계적으로 **위임**되는 형태로 전달.

#### 장점
- **확장성(Scalability)**
  - 성능 요구 사항에 따라 각 레이어를 독립적으로 수평 확장할 수 있다.
- **유연성(Flexibility)**
  - 각 레이어는 서로 다른 기술 스택이나 규격으로 구성할 수 있으며, 다른 레이어에 영향을 주지 않는다.
  - 레이어 간의 의존성이 낮고 결합도가 낮기 때문에, 변경이 용이하다.
- **유지보수성(Maintainability)**
  - 한 레이어의 변경이 항상 다른 레이어에 영향을 주는 것은 아니므로, 모듈 단위로 유지보수가 용이하다.
  - 분리된 구조는 가독성을 높이고,Mock, Stub 등을 이용한 단위 테스트와 레이어별 테스트 환경 구성이 용이하다.

#### 단점
- **복잡성(Complexity)**
  - 레이어 수가 많아질수록 구조가 복잡해지고, 관리 포인트가 늘어난다.(Over-Engineering)
- **안정성(Stability)**
  - 인터페이스(스펙) 변경으로 인해 흐름 전체에 위험을 초래할 수 있다.
- **비효율성(Inefficiencies)**
  - 동시에  필요할 때 레이어 간의 이동이 많아질 수 있다.
- **성능 저하(Performance Overhead)**
  - 각 레이어가 인터페이스를 거쳐 통신하므로, 처리 속도가 저하될 수 있다.
- **인터페이스 민감도 (Interface Sensitivity)**
  - 하나의 레이어에서 인터페이스(스펙)가 변경될 경우, 이를 호출하거나 의존하는 다른 레이어영향을 줄 수 있다.
- **비효율성 (Inefficiencies)**
  - 경우에 따라, 같은 요청 내에서 불필요하게 여러 레이어를 오가야 하는 상황이 발생할 수 있다.
  - 단순 처리 로직임에도 전체 레이어를 거쳐야 한다면 리소스 낭비로 이어질 수 있다.

#### 패턴 활용

레이어드 아키텍처는 대부분의 시스템에서 볼 수 있는 **보편적인 구조**다.

- **언제 사용하는가**
  - 복잡한 비즈니스 로직을 체계적으로 관리할 때.
  - 개발 팀을 역할(프레젠테이션, 비즈니스, 데이터)별로 나누어 협업을 효율화할 때.
- **활용 가능 분야**
  - SAP, Oracle ERP와 같은 엔터프라이즈 애플리케이션.
  - 온라인 뱅킹 시스템의 백엔드 시스템.

### 2. Client-Server Architecture Pattern

	사용자 - 서버 간 책임 분리

![Client Server Architecture]({{ site.baseurl }}/assets/images/posts/2025/architecture/patterns/client-server-architecture.png)
  *https://en.wikipedia.org/wiki/Client%E2%80%93server_model*

클라이언트-서버 아키텍처 패턴은 **클라이언트(Client)**와 **서버(Server)** 두 요소로 구성되며, 이 둘이 **책임을 명확하게 분리하여 중앙 집중 처리를 수행하는 구조**이다.

- **Client**: 사용자로부터 요청(Request)을 생성하고 서버에 전달.
- **Server**: 자원(데이터, 파일 등)을 관리하고, 요청을 처리하여 응답(Response)을 반환.

클라이언트는 다수 존재할 수 있으며, 요청은 네트워크(예: 인터넷)를 통해 서버와 상호작용한다.

서버는 이러한 요청을 처리하고, 결과를 클라이언트에게 응답한다.

#### Client-Server Architecture를 이해하고 얻을 수 있는점
- 웹 개발자, 소프트웨어 엔지니어 등은 **사용자 인터페이스와 백엔드 시스템 간의 데이터 흐름**을 이해할 수 있다.
- 다수의 클라이언트 요청을 처리하는 서버의 **자원 관리 방식**을 이해할 수 있다.
- 일상적으로 사용하는 **소셜 미디어, 온라인 쇼핑몰** 등의 시스템 동작 방식을 분석하는 데 유용하다.

#### Client-Server Architecture의 종류

- **Two-Tier Architecture** : 클라이언트와 서버가 직접 통신하는 단순한 구조.
- **Three-Tier Architecture** : 분리된 클라이언트와 서버를 웹 서버, API 게이트웨이 등과 같은 Middleware layer(Application layer)를 두어 데이터 흐름을 중계하는 구조.
- **N-Tier Architecture** :  Middleware뿐 아니라 **보안, 로깅, 캐시 등의 Intermediary layer 등을 추가하여** 데이터 흐름에 있어 보안성과 유지관리성을 높인 구조.

#### 데이터 흐름 예시

**Three-Tire Client-Server Model**를 예시로 들겠다.

| Component      |                         Action                          |      Action      |
| -------------- | :-----------------------------------------------------: | :--------------: |
| **Clients**    |      Server에 모자 상품 검색 요청(GET /products?="beanie")       |   모자 상품 결과 출력.   |
|                |                            ↓                            |        ↑         |
| **Middleware** |        https://jaehoonmall.co.kr 에 Request 라우팅.         |  JSON 결과 Return  |
|                |                            ↓                            |        ↑         |
| **Server**     | "/products" GET Request Mapping으로 searchProducts 로직 수행. | DB 조회 결과 list 생성 |

Middleware는 클라이언트와 서버 간의 중계 역할을 하며, 인터넷, 웹 서버, 로드 밸런서 등이 해당된다.


#### 장점
- **중앙 집중된 제어(Centralized Control)**
  - 서버에서 **자원을 일괄 관리하여, 여러 유저의 요청을 동시에 처리**할 수 있다.
- **확장성(Scalability)**
  - **서버나 클라이언트 인스턴스를  전체 서비스에 영향을 주지 않으며 독립적으로 확장**할 수 있다.
- **데이터 보안성(Data Security)**
  - 민감한 정보는 서버에만 존재하도록 설계 가능하며, **보안 레이어를 추가해 보호**할 수 있다.

#### 단점
- **단일 장애 지점 (Single Point of Failure)**
  - 서버에 문제가 생기면 모든 클라이언트가 기능을 사용할 수 없게 된다.
- **네트워크 의존성(Network Dependency)**
  - 서버와의 상호작용은 네트워크를 기반으로 하므로, 지연(latency)이나 연결 장애가 성능에 영향을 줄 수 있다.
- **자원 관리 비용(Resource Management Cost)**
  - 사용자 수 증가에 따른 서버 자원의 적절한 할당, 로드 밸런싱 등의 **운영 부담이 커질 수 있다.**

#### 패턴 활용

**사용자 기기와 중앙 서버 간의 상호작용**이 필요한 인터넷 서비스에서 널리 사용한다.

- **언제 사용하는가**
  - 클라이언트가 서버에 특정 리소스나 서비스를 요청하고, 서버가 이를 처리하여 응답을 보내는 구조가 필요할 때.
  - 데이터를 중앙에서 관리하고, 다수의 클라이언트가 이를 공유해야 할 때.
- **활용 가능 분야**
  - Google과 같이 웹 패이지를 통해 검색, 이동 등의 요청에 응답을 보내는 웹 애플리케이션.
  - Gmail, Outlook과 같은 메일링 시스템.
  - Dropbox, Google Drive와 같은 파일 공유 서비스.

### 3. Event-Driven Architecture Pattern

	느슨한 비동기 이벤트 처리

![Event-Driven Architecture]({{ site.baseurl }}/assets/images/posts/2025/architecture/patterns/event-driven.png)
  *https://medium.com/@seetharamugn/the-complete-guide-to-event-driven-architecture-b25226594227*

Event-Driven Architecture Pattern 일명 EDA는 **이벤트 발행 - 전달 - 처리(fire-and-forget) 과정으로 응답을 기다리지 않아도 되는 비동기적 처리 패턴**이다.

여기서 **이벤트는 결제 요청, 멤버쉽 탈퇴, 재고 업데이트 등 시스템이나 유저에 의해 발생되는 동작**이 해당한다.

각 처리를 수행하는 Consumer가 있으며, **분리된 구조 덕분에 애플리케이션의 결함도를 낮추고 유연한 시스템 아키텍처로 운용할 수 있다.**

#### 구성 요소

| **Event Producer**        | 유저의 버튼 클릭, 스케줄링 등으로 일어날 수 있는 **이벤트 발행(Publish)** 컴포넌트       |
| ------------------------- | ----------------------------------------------------------- |
| **Event Channel(Broker)** | **Publish된 이벤트를 전송하고, 관리**하는 일종의 Middleware 컴포넌트            |
| **Event Consumer**        | Topic 이벤트를 구독(Subscribe)하여, **이벤트를 수신했을 때 비즈니스 로직 실행** 컴포넌트 |

#### 이벤트 기반의 비동기 처리

EDA에서 이벤트는 **비동기적으로 처리**되며, **Producer는 이벤트를 발행만 할 뿐, 이후에 어떤 처리가 일어나는지는 관여하지 않는다.**

즉, Producer에서 결제 완료 이벤트를 발행, 결제 완료 이벤트를 구독하는 포인트 적립, 재고 변경, 이메일 발송 이벤트 등을 각자 수행한다.

Producer는 Consumer가 **이벤트를 언제, 어떻게 처리하는지를 알지 못하고, 알 필요도 없으니 response도 의무가 아니**게된다.

덕분에
- **느슨한 결합**: Producer와 Consumer는 서로 몰라도 되고, 독립적으로 개발·배포가 가능.
- **성능 최적화**: 요청-응답 구조가 아니기 때문에 처리량이 많아도 병목이 덜 생긴다.
- **지연 허용**: 실시간 응답이 필요 없는 작업(예: 메일 발송, 로그 저장 등)은 나중에 처리할 수 있다.

#### EDA의 기본 개념

- **Publish/Subscribe(Pub/Sub)**
  - Producer에서 Publish(발행)된 이벤트는 해당 이벤트의 topic 혹은 이벤트 타입을 Subscribe(구독)한 Consumer만 받을 수 있다.
  - 이 때, Pub, Sub에 해당하는 컴포넌트는 서로 직접적인 연관을 가지지 않아도 된다.
- **Message broker**
  - publish-subscribe messaging pattern에서 미들웨어로 구성하여 이벤트를 관리하고, 중계하는 역할을 수행한다.
  - Topic 단위로 이벤트를 처리한다.
- **Topic**
  - 컴포넌트가 가지는 관심사라고도 표현하며, 이벤트 종류에 따라 분류되는 논리적 Channel이다.
  - 이벤트는 어떤 토픽으로 전달되어야하는지 등의 정보를 가지고 있다.
  - Sub는 필요한 토픽만 구독하며, Pub는 한 토픽에 한 번의 이벤트를 전송, 브로커는 이를 여러 Sub에게 전송한다.
- **Message Queue**
  - 이벤트를 순차적으로 저장하고, 전달하며 순서와 지연 처리에 활용된다.
  - Deferred Execution, Eventual Consistency와 함께 설명될 수 있다.
- **Event Mesh**
  - 이벤트가 다양한 경로로 전달될 수 있게 여러 개의 브로커와 시스템을 연결해놓는다.
  - 분산형 메시지 구조, MSA 통신 등에 사용된다.
  - MSA를 확장할 수 있는 기반이다.

#### 데이터 흐름 예시

| Component             |               Action               |
| --------------------- | :--------------------------------: |
| **Producer**          | 결제 성공으로 OrderPaidEvent 발행(Publish) |
|                       |                 ↓                  |
| **Message Broker**    |      order.paid Topic에 메시지 전달      |
|                       |                 ↓                  |
| **Consumer - 포인트 적립** |          결제금액을 통해 포인트 적립           |
| **Consumer - 재고 서비스** |          주문된 상품 재고 감소 처리           |
| **Consumer - 이메일 서비스** |         결제 완료 영수증 발송 메일 전송         |

#### 장점
- **확장성(Scalability)**
  - 문자 메시지 전송 등과 같은 새로운 이벤트 처리를 위한 Consumer를 쉽게 추가할 수 있다.
  - 수평 확장에 용이.
- **이벤트 처리(Event Processing)**
  - 비동기 처리로 응답을 기다리지 않아도 되기에 시스템 전체 응답성이 향상된다
  - 다양한 작업을 병렬로 처리 가능하다.
  - 실시간 스트림 처리, 로그 처리에 적합하다.
- **유연성(Flexibility)**
  - Producer와 Consumer의 역할 분리로 서비스 변경에 영향을 주지 않는다.
  - 서비스 간 독립성이 높아 유지보수성이 높다.
  - 새로운 Consumer 추가에도 기존 Consumer를 수정하지 않아도 된다.
  - Consumer에 장애가 발생해도 전체 시스템에 영향을 최소화할 수 있다.

#### 단점
- **복잡성(Complexity)**
  - 이벤트 정의, 토픽 설계, 메시지 포맷 표준화, 브로커 구성 등 초기 설계가 복잡하다.
- **테스트의 어려움(Complex Testing)**
  - 비동기 처리, 브로커를 통한 이벤트 수신 등의 구조로 에러가 발생 했을 때 디버깅이 어렵다.
  - Consumer 단위로 구분되어 있기에 서비스 전체 통합 테스트가 까다롭다.
- **신뢰성(Reliability)**
  - 처리에 실패한 이벤트를 위한 대응이 필요하다.
  - 이벤트 큐가 쌓이거나, Consumer의 처리 속도가 느릴 시 처리가 지연될 수 있다.

#### 패턴 활용

EDA는 **즉각적인 응답이 중요하지 않고, 시스템 상태 변화에 반응**해야 하는 비동기적인 시스템에 적합하다.

- **언제 사용하는가**
  - 실시간으로 발생하는 이벤트에 맞춰 여러 서비스가 독립적으로 동작해야 할 때.
  - 시스템의 부하가 불규칙하거나, 여러 기능이 동시에 수행되어야 할 때.

- **활용 가능 분야**
  - Uber와 같은 차량 호출 서비스는 사용자의 호출 이벤트를 통해 주변 차량에 알림 전송.
  - Amazon의 주문 처리 시스템은 '주문 생성' 이벤트가 '재고 차감', '결제', '배송 시작'과 같은 후속 작업 트리거.

### 4. Broker Architecture Pattern
	요청 중재

![Broker Architecture]({{ site.baseurl }}/assets/images/posts/2025/architecture/patterns/broker.png)
  *https://www.geeksforgeeks.org/system-design/broker-pattern/*

Broker Architecture Pattern은 Broker를 중심으로 클라이언트와 서비스를 연결해주는 중앙 집중형 분산 구조 패턴이다.

클라이언트의 요청을 처리할 서비스는 브로커가 판단하여 배분해준다.

시스템의 구조를 간소화하고, 유연한 분산 서비스를 구현할 수 있게 도와준다.

클라이언트는 서비스의 구체적인 위치나 구현을 알 필요 없이 브로커에만 요청하면 되는 **위치 투명성(Location Transparency)**의 특징을 가진다.

#### 구성 요소

| **Client** | Request 생성 및 Broker에 전달.                  |
| ---------- | ----------------------------------------- |
| **Broker** | 클라이언트로부터 Request 수신 후 적절한 서비스 탐색 및 서버 라우팅 |
| **Server** | 실제 Request를 처리 후 결과를 브로커에게 반환(동기일 때)      |

#### 비교 : Client-Server Architecture Pattern

|                      | **Client-Server**                                | **Broker**                              |
| -------------------- | -------------------------------------------- | ----------------------------------- |
| **요청 구조**            | 클라이언트가 서버에 직접 Request                        | 클라이언트의 Request를 처리할 서버를 Broker가 선정. |
| **클라이언트 - 서버 통신 방식** | 직접 통신(1:1)                                   | Broker를 통한 간접 통신(1:N, N:1)          |
| **라우팅**              | 클라이언트가 서버 위치를 알고 직접 통신한다.                    | 클라이언트의 요청을 처리할 서버를 브로커가 탐색한다.       |
| **요청 - 응답**          | 동기, Reqeust 후 Response를 기대하는 일반적인 HTTP 통신 방식 | 설계에 따라 동기 혹은 비동기로 구축 가능.            |
| **클라이언트와 서버의 결합도**   | 높음.<br>                                      | 느슨한 결합.<br>                         |
| **확장**               | 서버를 중심으로 클라이언트를 확장.                          | 브로커를 중심으로 클라이언트와 서버의 확장.            |

#### 비교 : Event-Driven Architecture Pattern

|                    | **EDA**                                                                                    | **Broker**                                                           |
| ------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **구조**             | Publisher가 이벤트를 발행, Broker에 Topic으로 구분하여 이벤트 적재,<br>단일 혹은 다수 Subscriber가 구독한 Topic 이벤트 처리. | 클라이언트의 Request를 처리할 서버를 Broker가 선정.                                  |
| **브로커의 역할**        | 단순 전달, 이벤트 Queue, Topic 구분                                                                 | 중앙 관리자, 서비스 탐색, 실행 위임                                                |
| **클라이언트와 서버의 결합도** | 매우 느슨한 결합.                                                                                 | 느슨한 결합.                                                              |
| **요청 -  응답**       | 비동기, Event 발행 후 처리 결과를 기대하지 않는다(fire-and-forget)                                           | 설계에 따라 동기 혹은 비동기로 구축 가능.                                             |
| **처리 실패**          | 역할이 분담된 Consumer 중 일부가 동작하지 않아도 시스템 전체에 영향을 주지 않는다.                                        | Broker를 제외한 구조에서 Request에 대한 Response가 제대로 오지 않는다면 전체 흐름 중단의 위험이 있다. |

#### 동기/비동기 설계

시스템의 요구사항에 따라 **동기(Synchronous)**와 **비동기(Asynchronous)** 통신 방식을 모두 지원한다.

- **동기 방식**
  - 즉각적인 응답이 필요한 경우 사용.
  - 클라이언트는 요청을 보낸 후 응답을 받을 때까지 기다린다.
  - 브로커는 요청을 처리할 서버에 전달하고, 서버의 응답을 받아 다시 클라이언트에게 반환하는 역할 수행.
- **비동기 방식**
  - 실시간 응답이 중요하지 않은 경우 사용.
  - 클라이언트는 요청을 보낸 후 응답을 기다리지 않고 다음 작업을 진행.
  - 브로커는 요청을 메시지 큐에 저장하고, 서버가 이후에 **큐**에서 메시지를 가져가 처리한다.(메시지 큐)

애플리케이션의 특성에 맞게 가장 효율적인 통신 방식을 선택하여 시스템을 설계할 수 있다.

#### 데이터 흐름 예시

|            |                                             **Action**                                              |            **Action**            |
| :--------: | :-------------------------------------------------------------------------------------------------: | :------------------------------: |
| **Client** |                                 결제 버튼 클릭으로 `request_payment()`요청 발생                                 |          "결제 성공" 화면 표시           |
|            |                                                  ↓                                                  |                ↑                 |
| **Broker** | 클라이언트로부터 `request_payment()` 요청 수신.<br>`request_payment()` 분석 - 결제 서비스 식별 - 여러 개의 서버 중 결제 서버로 요청 전달 |  "결제 성공" 응답 수신 - 클라이언트에 결과 전달.   |
|            |                                                  ↓                                                  |                ↑                 |
| **Server** |                               Broker로 부터 결제 요청 수신 - 결제 로직 수행 - DB 저장.                               | 결제 처리 완료 후 "결제 성공" 메시지를 브로커에게 반환 |


#### 장점

- **유연성(Flexibility)**
  - 클라이언트와 서버가 서로의 존재를 모르기 때문에, 새로운 서비스가 추가되거나 기존 서비스가 변경되어도 클라이언트는 영향을 받지 않음.
- **분산(Distribution)**
  - 시스템을 여러 독립적인 컴포넌트로 분산하여 구성할 수 있어 확장성이 높음.
- **유지보수성(Maintainability)**
  - 각 컴포넌트가 느슨하게 결합되어 있기에, 개별 컴포넌트의 수정이나 업데이트가 다른 컴포넌트에 미치는 영향을 최소화.

#### 단점

- **성능 저하(Performance Overhead)**
  - 모든 요청이 브로커를 거쳐야 하므로, 통신 단계가 늘어나 성능 저하.
- **단일 실패 지점(Single Point of Failure)**
  - 브로커가 고장 나면 시스템 전체가 마비될 수 있음.
  - 브로커의 고가용성을 위한 설계가 필수.
- **복잡성(Complexity)**
  - 중앙 집중형 브로커를 관리하고, 분산된 서비스들의 상태를 동기화하는 등 시스템 구조가 복잡해질 수 있음.

#### 패턴 활용

브로커 패턴은 **통신 주체 간의 직접적인 연결을 최소화**하여 시스템을 유연하게 만드는 데 사용할 수 있다.

- **언제 사용하는가**
  - 클라이언트와 서비스 간의 **높은 결합도를 피하고 싶을 때.**
  - 분산된 시스템에서 서비스의 위치가 자주 바뀌거나, 동기적인 통신이 비효율적일 때.
- **활용 가능 분야**
  - Apache Kafka나 RabbitMQ와 같은 메시징 큐 시스템.
  - 생산자(Producer)와 소비자(Consumer) 통신 중개
  - 마이크로서비스 간 비동기 통신

### 5. MSA, Microservice Architecture
	Service 분리

![Microservice Architecture]({{ site.baseurl }}/assets/images/posts/2025/architecture/patterns/msa.png)
  *https://velog.io/@tedigom/MSA-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-1-MSA%EC%9D%98-%EA%B8%B0%EB%B3%B8-%EA%B0%9C%EB%85%90-3sk28yrv0e*

MSA(MicroService Architecture)는 하나의 큰 애플케이션을 Microservice라는 **작고, 독립적이며, 느슨하게 결합된 서비스**들로 분해하는 개발 방식이다.

서비스는 회원 관리, 결제, 상품 관리 등 고유한 비즈니스 프로세스를 가지고 독립적으로 개발, 배포, 운영될 수 있다.

#### 특징
- **독립적인 서비스**
  - 각 서비스는 특정 비즈니스 기능에 집중하며, 독립적인 코드베이스를 가진다.
  - 개발, 배포 등 서비스의 변경이 다른 서비스에 영향을 주지 않고 독립적으로 수행될 수 있다.
- **분산 시스템**
  - 서비스들이 네트워크를 통해 통신하며 프로세스를 처리한다.
  - 서비스간 통신을 위해 API를 구축하고, 클라이언트는 **API 게이트웨이**를 통해 적절한 Microservice에 라우팅(single entry point)된다.
  - Microservice의 IP 주소, 포트 등이 변경 될 때 위치를 추적하거나, 필요한 서비스를 쉽게 찾을 수 있도록 **Service Discovery**를 활용한다.
- **느슨한 결합(Loose Coupling)**
  - 각 서비스는 다른 서비스의 내부 구현을 알 필요 없이, API등을 통해 소통한다.
  - 특정 서비스의 부분 장애는 전체 서비스에 심각한 영향을 주지 않는다.
- **다양한 기술 스택**:
  - 각 서비스는 목적에 맞는 최적의 프로그래밍 언어나 데이터베이스를 자유롭게 선택할 수 있다.
  - 데이터 분석이 중요한 서비스에는 Python을, 성능이 중요한 서비스는 Java와 같이 구성할 수 있다.
  - 분리된  DB의 일관성을 유지하기 위해 Saga 패턴과 같은 분산 트랜잭션 관리 기법을 활용한다.
- **자동화된 배포**
  - 독립적인 배포가 가능하므로, CI/CD(Continuous Integration/Continuous Deployment) 파이프라인을 구축하기 용이하다.
  - Git 메인 브랜치에 Push한 코드가 자동으로 서버에 배포 반영되는 파이프라인 구성 등으로 개발, 서비스 운영에 피로도가 줄어든다.

#### MSA의 필요성  : Monolithic Architecture와 비교

MSA를 이해하기 위해서 Monolithic Architecture를 살펴보는 것이 좋다.

Monolithic는 **하나로 된 거대한 덩어리**라는 의미로 모든 기능이 하나의 애플리케이션에 통합되어 배포되는 방식을 의미한다.

| 특징        | **Monolithic Architecture** | **Microservices Architecture** |
| --------- | --------------------------- | ------------------------------ |
| **구조**    | 모든 기능이 하나의 단일 애플리케이션에 통합    | 여러 개의 작고 독립적인 서비스로 분리          |
| **개발**    | 단일 팀이 모든 기능을 개발             | 여러 팀이 각 서비스를 독립적으로 개발          |
| **배포**    | 애플리케이션 전체를 재배포              | 각 서비스를 독립적으로 배포 가능             |
| **확장성**   | 애플리케이션 전체를 확장, 비효율적         | 특정 서비스만 독립적으로 확장 가능            |
| **기술 스택** | 전체가 동일한 기술 스택 사용            | 각 서비스에 최적화된 기술 스택 사용 가능        |
| **결합도**   | 높은 결합도(High Coupling)       | 느슨한 결합도(Loose Coupling)        |

모놀리식 아키텍처의 가장 큰 단점은 코드 한 줄의 수정이라도 전체 애플리케이션을 재배포해야 한다는 것이다.

이는 배포의 불편함을 야기하고, 한 모듈의 버그가 전체 서비스에 영향을 미칠 수 있다.

MSA는 이런 문제를 해결하기 위해 결제, 회원 관리, 상품 관리 등 역할별로 서비스를 분리하여 각 서비스의 변경이 다른 서비스에 영향을 주지 않도록 설계한다.

#### 서비스 구분 방법론

MSA의 구성 단위가 Microservice인 만큼 **서비스를 어떤 기준으로 나눌 것**인지가 중요한 요소로 자리 잡는다.

참고로 방법론(Methodology)과 패턴(Pattern)은 서로 다른 개념으로,
- **방법론(Methodology)** : 문제를 해결하기 위한 넓은 범위의 철학, 전략, 전체적인 과정, **방향성**.(DDD, )
- **패턴(Pattern)** : 특정 문제를 해결하기 위한 **검증된 해결책(템플릿)**.(Saga pattern, API Gateway Pattern)
  와 같다.

대표적으로 이 기준을 나누는 방법론 3가지를 간단 설명하겠다.
- **DDD (Domain-Driven Design)**
  - 복잡한 비즈니스 도메인을 분석하고, 이를 **하위 도메인** 단위로 나누어 서비스의 경계를 정의한다.
- **비즈니스 기능 기반 분해**
  - 시스템을 '결제', '주문', '회원'과 같은 비즈니스 기능별로 분리하는 가장 직관적인 방법.
- **트랜잭션 기반 분해**
  - 데이터베이스 트랜잭션이 발생하는 지점을 기준으로 서비스를 나눈다.

#### 장점

- **확장성(Scalability)**: 특정 서비스에 부하가 집중될 경우, 해당 서비스만 독립적으로 확장하여 전체 시스템의 성능을 효율적으로 유지할 수 있다.
- **Faster Delivery**: 각 서비스는 독립적으로 개발 및 배포가 가능하므로, 새로운 기능을 빠르게 시장에 내놓을 수 있다.
- **유연성(Flexibility)**: 각 서비스에 최적의 기술 스택을 적용할 수 있어, 기술 선택의 자유도가 높다.
- **내결함성(Fault Isolation)**: 한 서비스의 장애가 다른 서비스로 전파되지 않고 격리되어, 시스템 전체의 안정성을 높인다.
- **관리 피로도 저감** : 서비스의 갱신과 관리가 독립적으로 수행되기에 관리가 피로도가 적다.

#### 단점
- **복잡성(Complexity)**: 여러 개의 서비스를 관리해야 하므로, 전체 시스템 구조와 운영이 복잡해진다.
- **분산 트랜잭션**: 여러 서비스에 걸쳐 발생하는 트랜잭션을 일관성 있게 관리하기가 어렵다.
- **성능 오버헤드**: 서비스 간 통신은 네트워크를 통해 이루어지므로, 호출 횟수가 많아지면 지연(Latency)이 발생할 수 있다.

#### 패턴 활용

MSA는 **복잡한 대규모 애플리케이션**을 개발하고, **빠른 변화에 민첩하게 대응**해야 할 때 적합하다.

- **언제 사용하는가**
  - 시스템의 규모가 크고, 여러 팀이 각자 맡은 부분을 독립적으로 개발 및 배포해야 할 때.
  - 비즈니스 로직이 복잡하여 하나의 덩어리로 관리하기 어려울 때.
- **활용 가능 분야**
  - Netflix와 같이 사용자 인증, 콘텐츠 추천, 결제 등 다양한 기능을 수많은 마이크로서비스로로 분리하여 운영.
  - Amazon과 같은 이커머스 플랫폼에서 각 기능을 독립적으로 확장하고 관리.

### 이외의 패턴들

설명하고 싶은 패턴들을 간단하게만 소개해도 볼륨이 커지기 때문에 다른 패턴들은 개념만 서술하겠다.

#### Space-Based Architecture Pattern

DB가 아닌 RAM과 같은 메모리 영역을 공유된 메모리 공간(Space-Based)으로 서비스를 구성하는 분산 아키텍처다.

Cloud-Based, Grid-Based 아키텍처 패턴이라고도 한다.

- 대규모 동시 사용자 처리나 트래픽 폭등 상황을 대처하기 위한 패턴.
- 메모리 데이터 사용으로 Latency을 최소화하고, 높은 성능과 동시성을 확보
- 중앙 데이터베이스 병목을 제거하기 위해 메모리 그리드(In-Memory Data Grid)를 사용하여 데이터와 세션 상태를 분산 저장.
- 확장성(Scalability)과 고가용성(High Availability)에 강점.
- 전자상거래, 티켓 예매 등 트래픽 급증형 서비스에서 활용.

#### Master-Slave Architecture Pattern

하나의 마스터(Master) 컴포넌트가 다른 여러 슬레이브(Slave) 컴포넌트를 제어하는 패턴이다.

Primary-Secondary 아키텍처라도고 한다.

- Master 가 작업을 지시하고, Slave 가 실행하는 구조.
- 읽기/쓰기 분리, 데이터 복제, 병렬 처리 등에 자주 사용.
- 고성능 분산 처리 가능.
- DB Replication, Load Balancing, Backup-Recovery 시스템에서 활용.
- DB Replication 구조에서 Master DB는 쓰기 전용, Slave DB는 읽기 전용 역할 수행.
#### Pipe-Filter Architecture Pattern

데이터를 처리하는 과정이 여러 개의 독립적인 단계로 구성될 때 사용되는 패턴이다.

- 순차적으로 일련의 처리를 중요시하는 시스템에서 활용하는 패턴.
- Filter라 불리는 각 프로세스는 데이터를 받아 특정 작업을 수행.
- Pipe를 통해 데이터는 순차적으로 다음 Filter로 전달됨.
- 데이터 추출, 변환, 로드와 같은 ETL(Extract-Transform-Load) 프로세스에서 활용.

#### Microkernel Architecture Pattern

Microkernel은 최소한의 Core 기능만 제공, 확장 기능은 Plug-in module을 이식하여 시스템의 유연성과 확장성을 극대화하는 패턴이다.

- OS, IDE, Browser 등에서 추가적으로 필요한 기능은 플러그인을 통해 이식.

#### Peer-to-Peer Architecture Pattern

네트워크 참여자(Peer, Node)간 클라이언트와 서버의 역할을 수행하는 탈중앙화(Decentralized) 네트워크 모델.

- 네트워크에 연결된 모든 노드는 동등한 역할을 수행하는 분산 패턴.
- 노드간 직접 통신하여 리소스 공유.
- 파일 공유 시스템, 블록체인에서 활용.

<br>

Ref.
- Types of Software Architecture Patterns : [https://www.geeksforgeeks.org/software-engineering/types-of-software-architecture-patterns/](https://www.geeksforgeeks.org/software-engineering/types-of-software-architecture-patterns/)
- Layerd Achitecture : [https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)
-  Client-Server architectural pattern : [https://medium.com/nerd-for-tech/client-server-architecture-explained-with-examples-diagrams-and-real-world-applications-407e9e04e2d1](https://medium.com/nerd-for-tech/client-server-architecture-explained-with-examples-diagrams-and-real-world-applications-407e9e04e2d1)
- Event-Driven Architecture : [https://medium.com/@seetharamugn/the-complete-guide-to-event-driven-architecture-b25226594227](https://medium.com/@seetharamugn/the-complete-guide-to-event-driven-architecture-b25226594227)
- Broker Architecture Pattern : [https://www.geeksforgeeks.org/system-design/broker-pattern/](https://www.geeksforgeeks.org/system-design/broker-pattern/)
- MSA
  - [https://velog.io/@tedigom/MSA-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-1-MSA%EC%9D%98-%EA%B8%B0%EB%B3%B8-%EA%B0%9C%EB%85%90-3sk28yrv0e](https://velog.io/@tedigom/MSA-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-1-MSA%EC%9D%98-%EA%B8%B0%EB%B3%B8-%EA%B0%9C%EB%85%90-3sk28yrv0e)
  - [https://medium.com/@Dopedev/microservice-architecture%EB%9E%80-ca9825087050](https://medium.com/@Dopedev/microservice-architecture%EB%9E%80-ca9825087050)
  - [https://medium.com/capital-one-tech/10-microservices-design-patterns-for-better-architecture-befa810ca44e](https://medium.com/capital-one-tech/10-microservices-design-patterns-for-better-architecture-befa810ca44e)