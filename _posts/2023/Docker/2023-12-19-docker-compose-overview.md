---
title:	"[Docker] Docker Compose - 개요, 주요 기능, 사용 사례 "
date:	2023-12-19 12:00:00
categories:
  - Docker
tags:
  - Docker
  - Docker Compose
comment: true
#published: true 
---


컨테이너 환경의 장점으로 뽑을 수 있는 일괄적인 개발 환경 구축과 쉬운 배포가 있다.

구성하고 싶은 환경을 Docker Hub 따위에서 이미지로 불러와 환경 설절 및 실행을 시키면 환경 구축이 되는 것인데, 이미지 하나 하나를 따로 컨테이너화 시켜서 실행 시키는 것은 여간 번거로운 일이 아닐 수 없다.

여기서 Docker Compose는 이런 번거로움을 해소시키기 위해 등장하였다.

# Docker Compose?  
> 다수의 도커 컨테이너(Multi-Container)를 정의하고 간단하게 실행하기 위한 툴

애플리케이션의 서비스들을 YAML 파일 형식으로 작성하고, 이를 한 줄의 커맨드로 간단하게 Multi-Container를 생성하고 실행할 수 있다.

Compose 환경은 개발, 스테이징, 테스팅, 프로덕션과 같은 모든 CI 워크플로우에서 작동한다.
또한 아래와 같은 애플리케이션의 모든 생명 주기를 관리할 수 있다.
- 시작, 정지, 재빌드
- 실행중인 서비스의 상태 모니터링
- 실행중인 서비스의 출력 로그 스트림
- 서비스에 일회성 커맨드 실행.  

정리하자면 구동시키고 싶은 서비스들을 Compose의 문법으로 작성한 YAML 파일을 한 번의 실행
으로 환경을 구성할 수 있다.

Docker Compose를 사용하기 위해서는 기본적으로 3단계의 프로세스를 거쳐야한다.

1. 어디서나 재활용할 수 있게 애플리케이션의 환경을 `Dockerfile` 로 정의한다.
2. 분리된 환경에서 함께 실행될 수 있게 애플리케이션의 서비스들을 `compose.yaml` 로 정의한다.
3. `docker compose up` 명령어로 Docker compose 를 실행시킨다.

compose.yaml은 기본적으로 아래와 같다.
```
services:
  web:
    build: .
    ports:
      - "8000:5000"
    volumes:
      - .:/code
      - logvolume01:/var/log
    depends_on:
      - redis
  redis:
    image: redis
volumes:
  logvolume01: {}
```

파일의 구조는 `설치 및 사용` 파트에서 자세히 알아보도록 하자.

<br>

# Docker Compose의 주요 기능과 사용 사례

## 주요 기능

### 1. 하나의 호스트에서 분리된 여러개의 환경을 가질 수 있다.
다른 환경과 분리하기 위해서 Compose는 프로젝트 이름을 사용한다.

프로젝트 이름은 아래와 같이 사용이 가능하다.
- 하나의 개발 호스트에서 단일 환경의 복사본을 생성할 때.
- CI 서버에서 빌드가 이루어질 때 프로젝트간의 간섭이 이루어지지 않도록 프로젝트 이름을 유니크한 빌드 넘버로 활용할 때.
- 공유 호스트 혹은 개발 호스트에서 같은 이름을 가진 서비스들이 충돌하지 않게 방지할 때.

프로젝트 디렉터리를 기반으로 기본 프로젝트 네임을 구성한다.  

프로젝트 디렉터리는 Compose 파일이 있는 위치를 기반으로하며, `--projext-directory` 의 커맨드 옵션으로 직접 지정할 수 도 있다.

프로젝트 네임을 커스텀 하고 싶다면 생성 시 `-p` 커맨드 옵션을 사용하거나, `COMPOSE_PROJECT_NAME` 환경 변수를 사용하면된다.

### 2. 컨테이너가 생성될 때 볼륨 데이터를 보존한다.
`docker compose up`의 명령어가 실행 되는 시점에, 이전에 실행하였던 컨테이너가 있다면 이 컨테이너를 새 컨테이너로 볼륨을 복사한다.

위와 같은 프로세스는 사용자가 볼륨에 생성한 데이터를 잃지 않도록 보장해준다.

Windows 환경에서 `docker compose` 를 사용한다면, 환경 변수를 상세하게 설정 할 수 있다.

### 3. 컨테이너 내용이 변경되었을 때만 재생성한다.
Compose는 컨테이너 생성 시 캐시를 사용한다.

변경된 부분 없이 서비스를 재시작하면 기존에 존재하는 컨테이너들을 재사용하게된다.

컨테이너 재사용한다는 것은, 환경 변경을 빠르게 구성할 수 있도록 해준다.

### 4. 변수 지원  및 개발 환경간 구성 이동.
Compose 파일 내부에서 변수 사용을 지s원한다.

다른 환경 혹은 다른 유저들을 구성하는데 변수를 사용할 수 있다.

`extends` 필드 사용하거나 혹은 여러개의 Compose 파일을 만들어서 Compose 파일을 확장할 수 있다.  
[상세: Working with multiple Compose files](https://docs.docker.com/compose/multiple-compose-files/)

<br>

## 일반적인 사용 사례

### 개발 환경.
소프트웨어를 개발은 격리된 환경에서 애플리케이션을 실행하고, 그것들과 상호 작용하는 기술이 중요하다.  
Compose 명령어를 사용하게되면 환경을 생성하고 상호 작용을 할 수 있다.

Compose 파일은 애플리케이션에 필요한 서비스 종속성(DB, 큐, 캐시, 웹 서비스, API 등..)을 문서화하고 설정하는 방법을 제공한다.  
단일 Compose 명령어로 하나 이상의 컨테이너에서 각각의 종속성에 필요한 컨테이너를 생성하고 시작할 수 있다.

즉, 개발을 시작하는데 필요한 환경을 Compose 파일과, 몇 개의 명령어 만으로 구성할수 있게해준다.

### 테스트 자동화 환경.
지속적인 개발과 지속적인 통합(CI/CD)에서 중요한 부분은 자동화된 테스트 슈트다.  
자동화된 end-to-end 테스팅은 실행 테스트가 수행되는 환경에 필요하다.  
Compose는 Compose 파일에 환경 설정을 정의하면 명령어 몇 번으로 테스트 슈트에 필요한 격리된 테스팅 환경을 쉽게 생성하고 소멸 시킬 수 있다.  
```
$ docker compose up -d
$ ./run_tests
$ docker compose down
```

### 단일 호스트 개발.
Compose는 기존에는 개발과, 테스트 워크플로우에 집중을 했지만, 출시 때마다 프로덕션 지향적인 기능을 거듭 발전시키고 있다.

<br>

Ref.  
[https://docs.docker.com/compose/](https://docs.docker.com/compose/)