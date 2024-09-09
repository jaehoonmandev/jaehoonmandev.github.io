---
#layout: single
title:	"[CS] Thread, Process, Multi-, Scheduling"
date:	2024-09-9 12:00:00
categories:
  - CS
tags:
  - Thread
  - Process
  - Multiprocessing
  - Multiprogramming
  - Scheduling
comment: true
#published: false 
---

개발을 진행하다보면 처리 속도, 데이터의 일관성, 순차 처리, 대규모 분산 처리 등 싱글 스레드와 멀티 스레드, 동기화와 비동기화와 같은 개념 도입이 필요할 때가 있다.

각각의 내용을 알아보고 특성의 맞는 시스템을 구축/설계 하기 위한 정보를 알아보자.

동기화, 비동기화의 개념을 알기전에 Thread의 개념을 알고 가는게 좋을 것이라 생각하여 먼저 설명하겠다.

# Thread

OS의 일부인 Scheduler에 의해 독립적으로 관리되는 프로그램의 최소 실행단위이다.

스레드는 실행 중인 프로그램의 인스턴스 즉, Process를 구성하는 단위이며, 프로세서는 메모리에 로드되어 실행된다.

다시 설명하자면 프로그램을 실행하게 되면 실행된 프로그램을 프로세스, 그리고 프로세스 안에는 1개 혹은 그 이상의 스레드들은 프로세스가 잘 수행되도록 협력하며 실행된다.

## Thread의 종류

![User/Kernel Level Threads]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/user-kernel-threads.png)

스레드를 지원하는 주체에 따라 크게 2가지로 구분된다.

### Kernel Threads

heavyweight 라고도 불리우는 커널 스레드는 하드웨어와 프로그램 간의 인터페이스 역할을 수행하는 운영체제 커널에서 관리되는 스케줄링 단위이다.

#### 특징

##### 자원 공유
각 프로세스에는 최소 하나의 커널 스레드가 존재한다.

여러 커널 스레드가 동일한 프로세스 내에 존재할 경우, 이들은 동일한 메모리와 파일 리소스를 공유할 수 있다.

##### 선점 스케줄링
커널 스레드는 선점 스케줄러에 의해 관리된다.

CPU가 다른 스레드로 전환될 때 시스템 콜이나 인터럽트를 통해 문맥 전환이 이루어진다.

##### 블로킹 처리
커널 스레드는 블로킹이 발생하더라도 다른 스레드가 계속 실행될 수 있다.

커널이 각 CPU 코어에 스레드를 할당하여 효율적으로 멀티코어 프로세서를 구현할 수 있다.

##### 경량 스케줄링 단위
커널 스레드는 스택, 프로그램 카운터를 포함한 레지스터 복사본, 스레드-로컬 저장소만을 소유하며, 자원을 적게 사용해 생성 및 소멸이 상대적으로 저렴하다.

##### 문맥 전환 효율성
커널 스레드는 문맥 전환 시 가상 메모리 변경 없이 레지스터와 스택 포인터만 저장 및 복원하므로 캐시 친화적이다.

##### 오버헤드
커널 스레드는 유저 스레드보다 문맥 전환과 같은 Swap 시간이 길고, 생성 및 소멸 시 약간 더 높은 오버헤드를 가진다.

#### 종류
- **Windows Kernel Threads:** Window OS 커널 수준의 스레드를 관리한다. / `ETHREAD`와 같은 구조로 표현된다.
- **Linux Kernel Threads**: Linux OS의 커널 수준의 스레드를 관리한다. / `task_struct`와 같은 구조로 표현된다.
- **Solaris Threads:** Solaris 멀티 스레딩 모델의 일부로 커널 수준의 스레드를 관리한다. / Solaris 스레드 라이브러리는 개발자가 스레드를 관리할 수 있는 인터페이스를 제공한다.

#### 활용
커널 스레드는 시스템 자원 관리와 멀티코어 프로세싱에서 중요한 역할을 하며, 실시간 작업과 하드웨어 제어를 효율적으로 처리할 수 있다.

또한, 시스템 호출과 디바이스 드라이버 운영을 통해 안정적인 시스템 성능을 보장한다.

CPU, 메모리, 네트워크 리소스 등 자원 관리, 멀티코어 프로세싱에서의 병렬처리, 실시간 응답 처리 등에 활용할 수 있다.

### User Threads

유저 스레드는 OS와 분리된 유저 공간 라이브러리에서 구현되며, 커널이 인식하지 않는 스레드를 의미한다.

흔히 lightweight, green threads라고도 불린다.

#### 특징

##### 커널과 독립적
유저 스레드는 유저 공간에서 관리되고 스케줄링되며, 커널과의 상호작용 없이 실행된다.

##### 빠른 스레드 관리
유저 스레드는 동일한 프로세스 내의 문맥 전환이 커널의 개입 없이 로컬에서 이루어지기 때문에 문맥 전환이 매우 효율적이다.

이로인해 스레드의 생성, 소멸, 동기화 등은 물론 문맥 전환도 커널 스레드에 비해 동작이 빠르다.

##### M:N 모델
일부 구현에서는 유저 스레드를 여러 커널 스레드에 매핑하여 멀티프로세서 환경에서의 이점을 활용한다.

##### 블로킹 문제
유저 스레드는 시스템 호출이 블로킹될 경우, 해당 스레드뿐만 아니라 전체 프로세스가 블로킹되어 다른 유저 스레드의 실행을 방해할 수 있다.

이 문제를 해결하기 위해, 비동기 I/O나 논블로킹 I/O를 사용하거나, 특정 라이브러리에서는 비동기 호출 중 다른 유저 스레드를 실행하는 방식을 사용한다.

#### 종류
- **Java Threads** : `java.lang.Thread` 클래스는 OS와 분리되어 독립적으로 스레드를 관리할 수 있다.
- **POSIX Threads (Pthreads)** : UNIX 계열에서 스레드를 동작하는 표준 집합으로 C, C++ 등의 언어로 사용할 수 있다.
- **Windows Thread API** : Windows OS에서 스레드를 생성하고 관리하기 위한 API다.

#### 활용
유저 스레드는 주로 경량 작업이나 빠른 문맥 전환이 필요한 애플리케이션에서 사용된다.

예를 들어, 고성능 서버 애플리케이션이나 실시간 시스템에서 유저 스레드는 응답 시간을 최소화하고, 커널 스레드의 오버헤드를 줄이기 위해 활용될 수 있다.


## Multithreading

![Multithreading]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/multithreading.png)
*https://medium.com/@amitvsolutions/java-concurrency-part1-05b1e4c280eb*

프로세스가 실행될 때 내부에서 둘 이상의 스레드를 동시에 실행될 수 있으며, 이를 Multi Thread라고 표현한다.

### 자원 공유
동시에 실행되는 스레드간에서 메모리와 같은 자원을 공유할 수 있고, 다른 프로세스에서는 해당 리소스에는 접근할 수 없다.

해당 특징은 프로세스의 스레드들이 주어진 시간동안에 실행하려는 코드 및 동적으로 할당된 변수(Dynamic Allocated)들 혹은 non-thread-local global variables를 통하여 구현된다.
### Synchronization, 동기화
여러 스레드가 동시에 메모리나 자원에 접근할 때, 데이터 충돌이나 일관성 문제가 발생할 수 있다.

이를 해결하기 위해 synchronized 블록이나 락(Lock) 메커니즘을 사용하여 동기화를 구현한다.

### Context Switching, 문맥 전환
멀티스레드 환경에서 CPU는 스레드 간의 문맥 전환을 통해 스케줄링을 수행한다.

문맥 전환은 스레드의 상태를 저장하고 복원하는 과정으로, 멀티스레딩의 성능에 영향을 줄 수 있다.

### Parallelism && Concurrency,병렬성과 동시성
멀티스레딩은 동시성(concurrency)을 제공하여 작업이 동시에 수행되는 것이 아니어도 여러 작업이 동시에 실행되는 것처럼 보이게 한다.

멀티코어 시스템에서는 실제 병렬성(parallelism)이 구현되어, 여러 스레드가 물리적으로 동시에 실행될 수 있다.

### Overhead
멀티스레딩은 효율적인 자원 활용을 가능하게 하지만, 스레드 간의 동기화, 문맥 전환, 락 경합 등으로 인한 오버헤드가 발생할 수 있다.


여러 작업들이 서로 혼선되어 발생할 수 있는 병목 현상이라던가, 자원 유실, 성능 저하 등 멀티 스레드에서는 스레드 관리와 최적화가 중요하다.

# Process
![Process]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/process.png)

*https://en.wikipedia.org/wiki/Thread_(computing)*

위의 그림은 두 개의 Thread가 하나의 Process에서 실행되는 것을 표현한 것이다.

프로세스는 하나 이상의 스레드를 실행시키는 컴퓨터 프로그램의 인스턴스를 의미한다.

Processor는 Process를 실행시키는 주체로 프로세서가 동작을 수행시키기 위한 코드로 이루어진 프로그램을 실행하면, 프로세스는 이 코드를 메모리에 로드하여 실행시키는 작업 단위로 해석할 수 있다.

## 구성 요소

### Code Section
실행할 프로그램의 코드가 저장된 영역이다.

일반적으로 읽기 전용으로, 프로세스가 실행할 명령어들이 포함된다.

### Data Section
전역 변수와 정적 변수가 저장되는 영역이다.

프로그램 실행 동안 유지되며, 초기화된 데이터와 초기화되지 않은 데이터로 나뉜다.

### Heap
동적으로 할당된 메모리 영역이다.

프로그램 실행 중에 메모리를 할당하거나 해제할 수 있는 공간으로, 메모리 누수나 오버플로우 문제를 주의해야한다.

### Stack
함수 호출과 관련된 지역 변수, 매개변수, 리턴 주소 등이 저장되는 메모리 영역이다.

함수가 호출되면 스택 프레임이 생성되고, 함수가 종료되면 해당 프레임이 제거된다.

### Process Control Block(PCB), 프로세스 제어 블록
운영체제가 프로세스를 관리하기 위해 사용하는 데이터 구조이다.

PCB에는 프로세스 상태, 프로그램 카운터, CPU 레지스터, 메모리 관리 정보, 입출력 상태 정보, 프로세스 식별자(PID) 등이 포함된다.

## 상태
![Process Status]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/process_status.png)

*https://en.wikipedia.org/wiki/Process_(computing)*

### 생성(Created)

프로세스가 생성되고 초기화되는 단계.

하드디스크나 SSD 등과 같은 저장 장치에 있는 동작을 메인 메모리에 적재하는 단계이며, 운영체제는 각 프로세스에 CPU, 메모리, 파일 디스크립터 등과 같은 자원을 할당한다.

### 대기(Waiting)

프로세스가 이벤트를 기다리는 상태.

프로세스는 대기를하며 스케줄러가 Context Switch하기를 기다린다.

CPU가 아닌 다른 자원을 기다리므로 대기 큐(Waiting Queue)에 들어간다.

### 준비(Ready)

실행을 기다리는 상태.

프로세스는 CPU를 할당받기 위해 준비 큐(Ready Queue)에 들어간다.

### 실행(Running)

프로세스가 CPU를 할당받아 명령어가 실제로 실행 중인 상태.

스케줄러가 Context Swith를 수행하고 프로세스를 CPU에 할당하면 실행 상태로 변경이된다.

### 차단(Blocked)

현재 실행중인 프로세스의 자원을 사용하기 위해 대기하는 상태.

실행 중인 프로세스의 동작이 끝나고 자원을 반환했을 때 준비 상태로 넘어가 실행을 기다린다.

### 종료(Terminated)

프로세스가 실행을 마치고 모든 자원을 반환한 상태.

종료된 프로세스는 더 이상 실행되지 않으며, PCB는 운영체제에 의해 제거된다.

## 프로세스의 특징

### 독립된 메모리 공간

프로세스 간의 간섭을 방지하고 시스템의 안정성을 보장하기 위해 각 프로세스는 독립된 메모리 공간을 가지고 있으며, 다른 프로세스의 메모리 공간에 접근할 수 없다.

### 자원 소유
프로세스는 CPU 시간, 메모리, 파일 디스크립터, 입출력 장치 등 다양한 자원을 소유한다.

운영체제는 이 자원들을 효율적으로 관리하고 프로세스 간의 충돌을 방지한다.

### Context Switching, 문맥 전환
멀티태스킹 환경에서 CPU는 여러 프로세스를 빠르게 전환하며 실행한다.

이때 현재 프로세스의 상태를 저장하고, 다음 프로세스의 상태를 복원하는 작업을 문맥 전환이라고 한다.

문맥 전환은 오버헤드를 유발하지만, 멀티태스킹을 가능하게 하는 핵심 메커니즘이다.

# Multitasking, 멀티태스킹

여러 프로세스를 동시에 실행하는 것을 의미한다.

CPU와 같은 운영체제의 자원을 여러 프로세스가 효율적으로 공유하며, 여러 프로세스가 동시에 실행되는 것처럼 보이도록(시분할) 프로세스들은 짧은 간격을 가지고 Context Switching을 수행한다.

# Thread VS Process

필요 이상의 정보를 많이 나열한 것 같은데 간단하게
- **프로세스** : 실행 중인 프로그램의 인스턴스.
- **스레드** : 프로세스 내에서 실행되는 작업 단위.

의 포괄적인 의미를 파악해두자.

| **구분**       | **프로세스**                                               | **스레드**                           |
| ------------ | ------------------------------------------------------ | --------------------------------- |
| **독립성**      | 독립적으로 실행됨, 서로 다른 주소 공간을 가짐.                            | 프로세스의 하위 집합, 주소 공간과 자원을 공유.       |
| **상태 정보**    | 더 많은 상태 정보를 가지고 있음.                                    | 프로세스의 상태 정보 및 자원을 공유함.            |
| 할당           | 자신을 실행할 프로세서, 메모리 공간, 데이터 등.                           | 프로세스 안에서의 주소, 데이터 등.              |
| **주소 공간**    | 각각의 프로세스는 별도의 주소 공간을 가짐.                               | 동일한 주소 공간을 공유함.                   |
| **통신**       | 시스템 제공 IPC(Inter-process Communicaion) 메커니즘을 통해 상호 작용. | 공유된 데이터, 코드, 파일을 통해 간단하게 통신 가능.   |
| **문맥 전환 속도** | 느림. (주소 공간 전환 비용이 큼)                                   | 같은 프로세스 내에서 빠르게 문맥 전환 가능.         |
| **자원 소비**    | 큼.                                                     | 적음.                               |
| **충돌 영향**    | 프로세스 간 독립성으로 인해 한 프로세스의 충돌이 다른 프로세스에 영향 없음.            | 하나의 스레드 충돌이 전체 프로세스에 영향을 미칠 수 있음. |

# Multi

위에서 멀티 스레드, 멀티 태스킹에 대해 살짝 알아보았지만 Multi 가 붙는 Multi Processing, Multi Programming 의 개념 또한 있기에 간단하게 어떤 특징을 가지고 있는지 알아보자.

## Multi-Processing

여러 CPU나 코어를 사용해 다수의 프로세서가 동시에 여러 프로세스를 실행하는 방식이다.

![Multi-Processing]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/multi-processing.png)
*https://doorbw.tistory.com/26*

- 각각의 프로세서는 하나의 Task만 처리하지 않고 다른 프로세서의 도움도 받는다.
- 여러 개의 프로세스가 동일한 데이터를 사용한다면 해당 데이터를 공유하며 비용을 줄일 수 있다.
- 하나의 Task에 여러개의 프로세서가 작업 중이라면 작업 중인 하나의 프로세서가 하나의 프로세서가 고장나도 동작은 계속 수행될 수 있다.
- 병렬 처리가 가능해 성능을 크게 향상시킬 수 있다.

## Multi-Programming

여러 프로그램이 동시에 메모리에 올라와 있고, CPU가 이들을 빠르게 전환하면서 실행하는 방식이다.

![Multi-Programming]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/multi-programming.png)
*https://www.geeksforgeeks.org/multiprogramming-in-operating-system/*

- 하나의 프로세스가 작업을 처리하고 있을 때 이를 계속해서 기다리지 않고 Switching하며 전체 작업을 수행한다.
- 프로그램 간의 교대 실행으로 자원 활용을 최적화한다.

## Multi-Tasking

하나의 CPU에서 여러 작업을 빠르게 전환하면서 동시에 수행하는 것처럼 보이게 하는 기법이다.

![Multi-Tasking]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/multi-tasking.png)
*https://www.geeksforgeeks.org/multitasking-operating-system/*

- 스케줄링에 의해 정해진 시간동안만 각각의 Task를 수행한다.
- 현대 운영체제에서 흔히 사용된다.

## Multi-Threading

![Multi-Threading]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/multithreading.png)
*https://medium.com/@amitvsolutions/java-concurrency-part1-05b1e4c280eb*

하나의 프로세스 내에서 여러 스레드를 동시에 실행하는 방식이다.

- 스레드 간 자원을 공유하며 병렬 처리를 수행한다.
- 각 스레드는 독립적으로 실행되지만 메모리와 파일을 공유하기에 응답성과 효율성이 높아진다.

## Multiprocessing vs Multithreading

![Multiprocessing vs Multithreading]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/multiprocessing_multithreading.png)
*https://medium.com/@amitvsolutions/java-concurrency-part1-05b1e4c280eb*

- **멀티프로세싱**은 여러 CPU 또는 코어를 사용하여 **여러 프로세스**를 동시에 실행하는 방식이다.
- 각 프로세스는 독립적인 메모리와 자원을 가지고 실행된다.

- **멀티스레딩**은 하나의 프로세스 내에서 **여러 스레드**를 병렬로 실행하는 방식이다.
- 같은 메모리와 자원을 공유합니다.

즉, 멀티프로세싱은 여러 프로세스가 병렬로 실행되며, 멀티스레딩은 하나의 프로세스 내에서 여러 작업이 동시에 수행된다.

## Multiprogramming vs Multitasking

![Multiprogramming vs Multitasking]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/multiprogramming_multitasking.png)
*https://medium.com/@amitvsolutions/java-concurrency-part1-05b1e4c280eb*

- **멀티프로그래밍**은 여러 프로그램이 메모리에 적재되어 있지만, CPU는 한 번에 하나의 프로그램만 실행하며 작업을 교체하면서 실행하는 방식이다.
- 핵심은 CPU가 **효율적**으로 여러 프로그램을 순차적으로 실행하는 것이다.

- **멀티태스킹**은 여러 프로그램이 동시에 실행되는 것처럼 보이게 하려고 CPU가 빠르게 전환하는 방식이다.
- 주로 사용자 상호작용이 중요한 환경에서 응답성을 높이는 데 사용된다.

즉, 멀티프로그래밍은 CPU **유휴 시간**을 줄이는 데 초점을 맞추고, 멀티태스킹은 사용자가 여러 작업을 동시에 수행하는 것처럼 느끼도록 **응답성**을 높이는 데 초점을 둔다.

# Scheduling

위에서 잠깐 설명한 스레드, 프로세스는 결국 스케줄링 의하여 관리된다고 설명하였다.

이를 위해서 스케줄링 개념도 알아야한다고 판단했기에 해당 내용을 추가하였다.

먼저 스케줄링은 작업을 수행하기 위한 자원을 할당하는 일종의 프로세스를 의미한다.

여기서 동작이라함은 스레드, 프로세스, 데이터 흐름과 같은 Task들을 의미하며, 자원은 프로세서, 네트워크 링크 등을 의미하게된다.

### 목적

![프로세스 과정]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/process_flow.png)

*https://velog.io/@jeongopo/%EC%9A%B4%EC%98%81%EC%B2%B4%EC%A0%9C-%EC%8A%A4%EC%BC%80%EC%A4%84%EB%A7%81-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98*

- **처리량(Throughput):** 단위 시간당 처리할 수 있는 작업의 수를 최대화.
- **대기 시간(Wait Time):** 프로세스가 대기하는 시간을 최소화.
- **응답 시간(Response Time):** 사용자 상호작용이 중요한 작업에서는 응답 시간을 최소화.
- **공정성(Fairness):** 모든 프로세스와 스레드가 공정하게 CPU 시간을 받을 수 있도록.
- **효율성(Efficiency):** CPU의 사용률을 극대화하여 시스템 성능을 최적화.

등이 있다.

하지만 목적을 모두 달성하는데에 있어 처리량을 극대화할지, 처리 속도를 극대화 할지와 같이 동시에 달성할 수 없는 목적이 있을 수 있다.

이에 따라 진행하려는 프로젝트에 걸맞는 스케줄링 설계가 필요할 수 있다.

### Scheduling Algorithm

CPU 자원을 프로세스나 스레드에 할당하는 방식으로 크게 선점형 스케줄링(Preemptive Scheduling), 비선점형 스케줄링(Non-Preemptive Scheduling)이 있다.

#### 선점형 스케줄링(Preemptive Scheduling)

실행 중인 프로세스를 강제로 중단시키고, 다른 프로세스에 CPU를 할당할 수 있는 스케줄링 기법이다.

특징으로는

- **우선순위 반영:** 우선순위가 높은 프로세스가 준비 상태에 있으면, 현재 실행 중인 프로세스를 중단하고 우선순위가 높은 프로세스에 CPU를 할당한다.
- **응답 시간 단축:** 응답 시간이 중요한 실시간 시스템에서 선점형 스케줄링이 유리하다.
- **복잡성 증가:** 선점이 일어나면 문맥 전환(Context Switch)이 발생하며, 이는 시스템 오버헤드를 증가시킬 수 있다.

가 있다.

유연하고 반응성이 좋아 실시간 시스템 혹은 우선순위가 중요한 시스템에서 주로 사용되지만, Context Switch가 발생하면서 시스템의 오버헤드를 증가시킬 수 있다.

##### Round Robin

![Round Robin]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/round-robin.png)

*https://www.techtarget.com/whatis/definition/round-robin*

고정적으로 배분할 CPU 시간(Time Quantum)만을 할당하여 해당 시간 동안만 작업을 수행한다.

프로세스가 긴 시간을 가지고 있더라도 설정한 시간 이상 실행할 수 없으며 중단하여 바로 다른 프로세스로 자원을 넘긴다.

반응 속도가 빨라지는 장점이 있지만 Time Quantum이 커지면 FCFS와 같아지고, 작아지면 Context Switch로 인해 오버헤드가 증가하니 적절한 Time Quantum을 설정해줘야한다.

##### Shortest Remaining Time First(SRTF)
![SRTF]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/SRTF.png)

*https://en.wikipedia.org/wiki/Shortest_remaining_time*

남은 수행 시간이 짧은 프로세스를 우선으로 수행하는 스케줄링 기법이다.

비선점의 Shortest Job First (SJF)와 같은 개념이지만 선점에서는 다른 프로세스의 자원을 뺐어 올 수 있기 때문에 프로세스 실행 중 현재 실행 중인 프로세스보다 남은 수행 시간이 짧은 프로세스가 들어온다면 해당 프로세스에게 자원을 넘겨주는 방식으로 실행된다.

실행시간이 긴 프로세스는 영원히 CPU를 할당 받지 못하는 Starvation이 발생할 수 있으며, 계속해서 다른 스케줄링을 실행하므로 정확한 Burst time을 측정할 수 없다.

#### 비선점형 스케줄링(Non-Preemptive Scheduling)

한 번 자원을 할당 받은 프로세스는 작업을 마칠 때 까지 계속해서 자원을 사용하는 스케줄링 기법이다.

특징으로는

- **단순성:** 문맥 전환이 없기 때문에 시스템 오버헤드가 적다.
- **예측 가능성:** 프로세스가 CPU를 점유한 동안은 다른 프로세스가 그 프로세스를 방해할 수 없으므로, 동작을 예측할 수 있다.
- **응답 시간 증가:** 우선순위가 높은 프로세스가 있어도 현재 실행 중인 프로세스가 끝날 때까지 대기해야 하기 때문에 응답 시간이 길어질 수 있다.

가 있다.

Context Switch가 발생하지 않기 때문에 오버헤드가 적고, 동작이 안정적일 수 있지만 비교적 짧은 시간을 가진 프로세스가 아직 처리되지 못한 긴 시간을 가진 프로세스를 기다리면서 비효율적으로 운영될 수 있다.


#### First Come First Served, FCFS
![FCFS]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/FCFS.png)

*https://velog.io/@jeongopo/%EC%9A%B4%EC%98%81%EC%B2%B4%EC%A0%9C-%EC%8A%A4%EC%BC%80%EC%A4%84%EB%A7%81-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98*

이름 그대로 먼저 들어온 작업을 먼저 처리하는 하는 스케줄러 알고리즘이다.

위에 예시에서 볼 수 있듯이 P1이 0의 시간선에서 10의 BURST TIME을 가지고 들어왔고, P1이 실행되고 있는 와중인 3의 시간선에서 P2가 들어왔지만 P1의 작업이 끝나지 않았기에 P2의 프로세스는 실행되지 못한다.

그렇게 P1이 실행되고 있는 0~10의 시간선 사이에 모든 프로세스가 도착했는데도 불구하고 모두 P1이 동작을 끝내기 전까지는 실행되지 못하고 기다리게 된다.(Convoy Effect)

프로세스 응답 시간의 예측이 용이하기에 일괄 처리 방식(Batch Processiong)에 자주 활용된다.

#### Shortest Job First(SJF), Shortest job next (SJN)
![SJF]({{ site.baseurl }}/assets/images/posts/2024/CS/thread_sync_async/1/SJF.png)

*https://en.wikipedia.org/wiki/Shortest_job_next*

선점형에서 보았던 Shortest Remaining Time First(SRTF) 의 비선점 알고리즘이다.

SRTF와는 선점, 비선점 차이인만큼 SJF는 수행 시간이 기존의 프로세스보다 짧아도 바로 자원 배분이 되지 않으며, 실행 큐에 저장해 놓고 현재 실행 중인 프로세스가 끝나면 큐에 저장된 프로세스가 실행된다.

이 SRTF와 비슷한 개념이기에 Starvation이 발생될 수 있다.

<br/>

Ref.

[https://en.wikipedia.org/wiki/Thread_(computing)](https://en.wikipedia.org/wiki/Thread_(computing))

[https://ko.wikipedia.org/wiki/%EC%8A%A4%EB%A0%88%EB%93%9C_(%EC%BB%B4%ED%93%A8%ED%8C%85)](https://ko.wikipedia.org/wiki/%EC%8A%A4%EB%A0%88%EB%93%9C_(%EC%BB%B4%ED%93%A8%ED%8C%85))

[https://www.educba.com/user-level-threads-and-kernel-level-threads/](https://www.educba.com/user-level-threads-and-kernel-level-threads/)

[https://doorbw.tistory.com/26](https://doorbw.tistory.com/26)
[https://velog.io/@jeongopo/%EC%9A%B4%EC%98%81%EC%B2%B4%EC%A0%9C-%EC%8A%A4%EC%BC%80%EC%A4%84%EB%A7%81-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98](https://velog.io/@jeongopo/%EC%9A%B4%EC%98%81%EC%B2%B4%EC%A0%9C-%EC%8A%A4%EC%BC%80%EC%A4%84%EB%A7%81-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98)
