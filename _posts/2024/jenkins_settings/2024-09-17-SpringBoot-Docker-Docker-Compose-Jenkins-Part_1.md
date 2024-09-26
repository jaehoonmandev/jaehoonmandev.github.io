---
#layout: single
title:	"Spring Boot + Docker + JPA + Docker Compose + Jenkins -Part.1-"
date:	2024-09-17 12:00:00
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

레거시한 회사 프로젝트 고도화를 위해 새로운 구조로 서비스를 운영할 계획이다.

# AS-IT / TO-BE

|               | AS-IT                | TO-BE                                      |
| ------------- | -------------------- | ------------------------------------------ |
| Java          | 1.8                  | 17                                         |
| Spring        | framework 5.2.x      | 3.x.x                                      |
| View          | JSP                  | Thymeleaf                                  |
| Properties    | XML                  | `@Config`, YAML                            |
| VCS           | SVN                  | Git, Git Lab                               |
| Deployment    | WAR                  | Docker / Docker Compose, Jenkins - bootJar |
| DB            | PostgreSQL - MyBatis | PostgreSQL - JPA, Redis                    |
| Message Queue | -                    | RabbitMQ                                   |
| Cache         | Spring Cache         | Redis                                      |
| Web Server    | Tomcat               | nginx                                      |

고도화를 하려는 이유는 대략적으로 아래와 같다.

- Lambda, var, Multiline Strings 등의 기능을 활용하기 위한 Java 버전업.
- 버전업 Java와 호환 및 Testcontainers, Security, Cloud 등 Spring framework에서 쉽게 사용할 수 없는 기능 활용을 위한 Spring Boot.
- 효율적인 배포를 위한 Docker / Docker Compose, Jenkins 활용. 
- 요청 분산 처리, 프록시 활용등을 위한 nginx.
- 캐시를 활용한 조회 시간 단축을 위한 Redis.
- 비동기 메시지 처리를 위한 RabbitMQ.
- 차후 MSA, 무중단 배포 환경 구축을 위한 Build up.

고도화를 위한 환경을 구축하는데 확실한 이유처럼 보이지 않을 수 있지만, 양질의 서비스를 운영하는데 가장 필요하다고 생각하는 것은 배포에 대한 두려움이 없어야한다고 생각한다.

해당 구조들을 모두 구축하지 않고, 일부만 구축해도 현재보다는 도움 될 것이라고 생각한다.

이런 환경을 구축하기 위해서 간단한 학습용 프로젝트를 통해 학습하고 익혀보겠다.

(Redis와 nginx, RabbitMQ는 다른 포스트에서 따로 다루도록하겠다.)

# Skill Spec
- Java 17
- Spring Boot 3.x
- Thymeleaf
- JPA
- Gradle
- YAML
- Docker / Docker Compose
- Jenkins

# Spring Boot

## 프로젝트 생성

위에서 기술한 Java 17, Spring 3.x, Gradle 을 기반으로 프로젝트를 생성하자.

![new project]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/1/new_project-1.png)


Next를 진행한 뒤 기초가 되는 Dependency를 설정해주자.

![new project]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/1/new_project-2.png)  
- Spring Web
- Thymeleaf

를 기초로 두었다.

JPA, Dockert Compose Support 등 다른 Depnedency는 간단한 세팅 후 나중에 진행해도 된다.

설정이 완료되었다면 Create로 프로젝트를 생성해주자.

이후 build.gradle의 설정을 통해 Java, Spring Boot, Dependency 등이 잘 설정되었는지 확인하자

``` yaml
plugins {  
    id 'java'  
    id 'org.springframework.boot' version '3.3.3'  
    id 'io.spring.dependency-management' version '1.1.6'  
}  
  
group = 'org.jaehoonman'  
version = '0.0.1-SNAPSHOT'  
  
java {  
    toolchain {  
        languageVersion = JavaLanguageVersion.of(17)  
    }  
}  
  
repositories {  
    mavenCentral()  
}  
  
dependencies {  
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'  
    implementation 'org.springframework.boot:spring-boot-starter-web'  
    developmentOnly 'org.springframework.boot:spring-boot-devtools'  
    testImplementation 'org.springframework.boot:spring-boot-starter-test'  
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'  
}  
  
tasks.named('test') {  
    useJUnitPlatform()  
}
```

## Home

Spring boot web을 통해 인스턴스를 실행 시켰을 시`'/'` 의 경로로 접근했을 시 `Welcome!` 이라는 텍스트가 노출되는 웹 페이지가 뜨도록 소스를 작성해보자.

### Controller

`src/main/java/[프로젝트Dir]`의 경로아래 `controller` 라는 디렉토리를 생성하고 `home.java` 클래스를 만들어주자.

![make controller]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/1/controller.png)

이후 클래스에 `@Controller`를 통해 Controller Baen에 등록하고, `@GetMapping("/")` 을 통해 Request 시 Response할 메서드를 작성하자.

``` java
@Controller  
public class home {  
      
    @GetMapping("/")  
    public String home(){  
        return "home";  
    }  
}
```

Thymeleaf의 경우에는 return type을 String으로 지정하여 렌더링하고 싶은 HTML 파일 이름을 반환하면 된다.

위와 같은 경우에는 `home.html` 을 렌더링할 것이다 라는 의미다.

### View, Thymeleaf

Thymeleaf는 JSP 등과 같은 템플릿 엔진으로써 Spring 군에서 View를 구성하는데 자주 사용하는 플랫폼이다.

Mapping 되는 경로는 `src/main/resources/templates`와 같다.

그렇다면 해당 경로에 `home.html` 을 생성하고 작성해보자.

``` html 
<!DOCTYPE html>  
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="http://www.thymeleaf.org">  
<head>  
    <meta charset="UTF-8">  
    <title>Title</title>  
</head>  
<body>  
    <h1> Welcome! </h1>  
</body>  
</html>
```

이후 Spring Boot를 실행시키고 `http://localhost:8080` 에 접근하면

![welcome]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/1/welcome.png)

와 같은 페이지를 볼 수 있을 것이다.

## JAR

`Welcome!` 만 보여줄 생각은 없다.

위에서 간단하게 작성한 Spring Boot Web Application 을 Docker Container화를 시킬 것이다.

그러기 위해서는 Gradel을 통해 JAR 파일을 생성해야한다.

Gradle을 실행 시키기 위해서는 당연히 설치가 되어있어야한다.

IntelliJ를 쓴다면 `Gradle Tool Window - Tasas - build - build` 를 통해 간단히 생성할 수 있다.

이번에는 설치 됐다는 가정하에 커멘드를 통해 JAR 파일을 만들어보자.

### JAR 파일 생성.

터미널을 통해 프로젝트의 Root 디렉토리로 접근한 뒤 커멘드를 입력하자

``` shell
./gradlew clean build
```

![gradle-build]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/1/gradle-build.png)

위의 커멘드는
- 이전에 빌드된 파일을 모두 삭제(clean)하고
- 애플리케이션을 빌드하여 JAR 파일을 생성(build)

하는 과정을 수행하는 커멘드다.

그렇다면 생성된 JAR는 어디 있을까?

out 되는 위치를 따로 지정하지 않았다면 `build/libs/`의 경로에 JAR가 생성되었을 것이다.

![jar-file]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/1/jar-file.png)

기본적으로 `[프로젝트명]-[version].jar` 형태로 생성이되며, 이를 변경하고 싶으면 `build.gradle`의
``` gradle
version = '0.0.1-SNAPSHOT'
```
를 변경하여 version을,

``` gradle
bootJar {  
    archiveFileName = "jaehoonman-${version}.jar"
}
```
를 설정하여 생성되는 JAR 파일의 이름을 변경할 수 있다.

참고로 `-plain.jar` 혹은 `-original.jar`의 파일이 함께 생성되는 경우가 있는데 이는 의존성을 포함하지 않고 단순히 애플리케이션 코드가 포함되는 jar 파일이다.

즉, Spring Boot에 의해 생성된 jar로 단독적으로 실행될 수 없는 jar 파일이다

우리는 해당 jar를 사용하지 않고 단독적으로 실행가능한 bootJar(Fat JAR)를 활용할 것이다.

`-plain.jar`의 생성을 막고싶다면 `build.gradle`에
``` gradle
tasks.named('jar') {
    enabled = false
}
```

를 추가하는 방법도 있다.

### 실행

Spring Boot + Gardle을 통해 생성된 JAR는 단독으로 실행 가능하다고 설명했다.

확인해보자.

``` shell
java -jar build/libs/[파일 이름].jar
```

![jar-boot]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/1/jar-boot.png)

위의 커멘드를 실행하면 IDE에서 실행하는 것과 같이 단독적으로 실행되는 것을 확인할 수 있다.

bootJar가 단독으로 실행 가능 한 것은 Spring Boot가 Tomcat과 같은 웹 서버를 내장하고 있으며, Auto-Configuration, class 파일 포함 등과 같은 특징 때문이다.

이전과 같이 브라우저를 통해 인스턴스에 접근하면 똑같이 동작할 것이다.

# Docker

단독으로 실행 가능한 웹 애플리케이션을 생성하였으니 이제 Docker를 활용하여 Image화 시켜서 배포가 가능한 형태로 만들고 Container로 실행시켜 보자.

Docker가 설치되어 있지 않다면 역시 설치를 마친 뒤 진행하길 바란다.

## Dockerfile

### 작성

`Root` 경로에 `Dockerfile` 이라는 파일을 생성하자.

주의할 점은 파일 이름은 `dockerFile`, `dockerfile`과 같이 다른 이름으로 생성하면 안된다.

``` Dockerfile
# 1. 베이스 이미지 설정  
FROM openjdk:17-jdk-slim  
  
# (Option) 파일 작성자 정보를 기입한다.  
LABEL authors="jaehoonman"  
  
# 2. JAR 파일을 애플리케이션으로 복사  
ARG JAR_FILE=build/libs/jaehoonman-0.0.1-SNAPSHOT.jar  
COPY ${JAR_FILE} app.jar  
  
# 3. 컨테이너 내에서 애플리케이션 실행  
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

- **FROM** : 베이스가 되는 이미지를 설정한다.
- **ARG, COPY** : 실행할 bootJar의 경로를 인자로 설정하고 해당 인자를 컨테이너 내부로 복사한다.
- **ENTRYPOINT** : 컨테이너 시작 시 제공할 옵션을 작성한다.

이외에도
- **ADD**: COPY와 유사하나, 추가로 압축 파일 해제 및 URL로부터 파일을 가져올 수 있다.(`ADD file.zip /app/`)
- **CMD**: 컨테이너 시작 시 기본으로 실행될 명령을 설정하며, ENTRYPOINT와 함께 사용되면 인자를 전달하는 용도로 사용한다.(`CMD ["--spring.profiles.active=prod"]`)
- **ENV**: 컨테이너 내부에서 사용할 환경 변수를 설정한다.(`ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk`)
- **EXPOSE**: 컨테이너 외부에 노출할 포트를 설정한다.(`EXPOSE 8080`)
- **VOLUME**: 호스트와 컨테이너 간에 공유할 디렉토리를 설정해 데이터 영속성을 보장한다.(`VOLUME /data`)
- **WORKDIR**:이후의 명령들이 실행될 작업 디렉토리를 설정한다.(`WORKDIR /app`)
- **USER**: 명령을 실행할 유저를 설정한다.(`USER appuser`)
- **RUN**: 이미지를 빌드할 때 실행할 명령을 설정한다.(`RUN apt-get update && apt-get install -y curl`)
- **SHELL**: RUN 명령을 실행할 때 사용할 셸을 설정한다.(`SHELL ["/bin/bash", "-c"]`)

의 예약어들이 있다.

`Dockerfile`을 빌드하는 시점에 JAR 파일이 있어야하니

``` bash
./gradlew clean bootJar
```

를 통해 bootJar를 생성하자.

여기서 build와 bootJar의 커맨드 차이에 대해 간단하게 말하자면

- `./gradlew build` : 컴파일, 빌드, 테스트, JAR / bootJar 생성 등의 애플리케이션의 전체 빌드 프로세스를 실행.
- `./gradlew bootJar` : 실행 가능한 JAR 파일만 생성.

와 같다.

### build

이제 작성 된 `Dockerfile`을 통해 이미지를 생성해보자.

먼저 Dockerfile 이 있는 경로까지 이동 후 터미널에 아래의 명령어를 입력하자.

``` shell
docker build -t [원하는 이미지 이름]:[태그명] .
```

`-t`의 옵션은 tag 개념으로 `이미지명:` 뒤에 나오는 태크명으로 명명된다.

보통은 버전을 나타낼 때 사용하며 생략 시에는 자동으로 `latest` 태그명이 붙는다.

참고로 `.` 은 현재 터미널로 접속한 경로에서 `Dockerfile`을 찾는다는 의미로 다른 경로에 있다면 해당 경로를 입력하면 된다.

명령어를 실행했다면

![docker-build]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/1/docker-build.png)

와 같이 docker image에 방금 빌드한 이미지가 나타나게된다.
### run

생성된 이미지를 기반으로 컨테이너를 실행해보자.

``` shell
docker run -p 8080:8080 [이미지명]:[태그명]
```

다양한 옵션들이 있지만 간단하게 `-p`를 통해 포트만 매핑하여 실행하자.

앞에 있는 `8080`은 호스트의 포트 번호 즉, 접속하기 위한 포트 번호이며, 뒤에있는 `8080`은 컨테이너에 매핑되는 포트 번호이다.

만약 호스트 포트 번호를  `9090`으로 주었다면 클라이언트는 `9090`을 통해 컨테이너에 접속하며, 도커에서 주고 받는 동작은 `8080`을 통해 이루어질 것이다.

컨테이너가 실행되면 Spring Boot 인스턴스가 실행되며 이전과 같이 브라우저를 통해 접근할 수 있게된다.

![docker-run]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/1/docker-run.png)

### stop, remove

실행 종료는 현재 인스턴스가 실행되고 있는 터미널에서 `control + c` 혹은 다른 터미널에서

``` shell
docker ps

docker stop [컨테이너 ID or 이름]
```

의 커멘드를 통해 종료할 수 있다.

컨테이너가 필요 없다면,

``` 
docker rm [컨테이너 ID or 이름]
```

이미지가 필요 없다면

``` shell
docker rmi [이미지명]:[태그명]
```

을 통해 삭제가 가능하다.

## DB

Spring Boot의 웹 애플리케이션을 생성하고, Docker로 활용하는 것까지 알아봤다.

하지만 웹 애플리케이션을 단독으로 서비스를 운영하기에는 힘들 것이다.

보통 세트로 딸려 오는 건 아무래도 DB일 것이다.

이번 예시에서는 PostgreSQL을 활용해 볼 것이다.

초기에 설정해줄 것이 있기에 docker image로 직접 pull할 것이다.

### pull

``` shell
docker pull postgres:14
```

해당 커맨드로 PostgreSQL 를 pull해올 수 있다.

14버전을 특정하였지만 가장 최신 버전을 pull 하고 싶다면 14대신 latest를 기입하면된다.

### run

``` shell
docker run -p 5432:5432 --name [생성할 컨테이너명] \
-e POSTGRES_USER=[DB 계정] \
-e POSTGRES_PASSWORD=[DB 비밀번호] \
-e TZ=Asia/Seoul \
-v my_pgdata:/var/lib/postgresql/data
-d postgres:14 \
```

- **`--name`** : 생성할 컨테이너명.
- `-d` : 실행할 이미지.
- `port` : 포트 설정.
- `-e` :  실행될 컨테이너의 환경 변수.
  - 접속 계정.
  - 타임존.
- `-v` : 볼륨 설정.
  - 영속성.
  - 로컬 디바이스의 `my_pgdata`에 PostgreSQL에 저장된 데이터를 보존한다는 의미

이외에도

- `--mount`: 구체적인 마운트 설정.
- `--network`: 네트워크 모드 설정
- `--link`: 컨테이너 간 링크 연결 (비권장)
- `--env-file`: 파일을 통한 환경 변수 설정
- `-d`: 백그라운드 실행 (디태치드 모드)
- `-i`: 터미널 입력 유지
- `-t`: 가상 터미널 제공
- `--rm`: 종료 시 자동 삭제
- `-m`: 메모리 제한
- `--cpus`: CPU 제한
- `--restart`: 컨테이너 재시작 정책 설정

등의 옵션들이 있다.

참고로 `-v` 옵션은 경로 설정에 따라
- **Volume** : Docker가 관리하면서 Container에 쌓인 데이터를 로컬에 저장한다.
- **Bind/Mount** : 로컬 데이터를 컨테이너에 직접 마운트한다.

로 구분된다.

또한 옵션의 순서도 중요시 되는 것 같다.
- port - name - environment - volume - detach

의 순서로 run 하니 정상 동작한다.

자 이제 해당 커멘드로 실행을 해보자.

![docker-run-db]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/1/docker-run-db.png)

### exec

`docker ps`의 커멘드 확인 후, 정상적으로 실행이 되었다면 이제 컨테이너 내부로 진입해보자.

```
docker exec -it [컨테이너 ID or 이름] psql -U postgres
```

- `-it` : 터미널 모드로 접속한다.
- `psql -U postgres` : run의 옵션으로 설정한 Super User로 postgreSQL의 명령어 툴인 psql을 이용한다.

#### DB 생성

이후 데이터 베이스를 만들어보자.

```
create database [생성할 DB명];
```

커멘드 입력 후 `\l`을 통해 정상적으로 데이터베이스가 생성되었는지 확인하자.

```
     **Name      |  Owner   | Encoding |  Collate   |   Ctype    |   Access privileges**   

**---------------+----------+----------+------------+------------+-----------------------**

 **jaehoonman_db | postgres | UTF8     | en_US.utf8 | en_US.utf8 |** 

 **postgres      | postgres | UTF8     | en_US.utf8 | en_US.utf8 |** 

 **template0     | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +**

               **|          |          |            |            | postgres=CTc/postgres**

 **template1     | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +**

               **|          |          |            |            | postgres=CTc/postgres**

**(4 rows)**
```

#### 계정 생성 및 권한 설정
이후 `q`로 빠져나온 뒤 계정 생성과 권한 설정을 해보자.

계정을 생성할 때는
- `USER` : 로그인 권한이 부여된 계정 생성.
- `ROLE` : `USER` + `GROUP`.

의 두 가지 생성 방법이 있는데, 보통은 세세하고 유연한 계정 설정을 위해서 `ROLE`을 활용한다.

기본 커멘드는
```
CREATE ROLE [계정명] WITH [권한 및 옵션] PASSWORD '[비밀번호]';
```
와 같고, 권한 및 옵션은

- **LOGIN**: 데이터베이스에 로그인할 수 있는 권한.
- **SUPERUSER**: 모든 권한을 가진 슈퍼유저 권한.
- **CREATEDB**: 새로운 데이터베이스를 생성할 수 있는 권한.
- **CREATEROLE**: 새로운 역할을 생성할 수 있는 권한.
- **INHERIT**: 권한을 상속받아 사용할 수 있는 권한.
- **REPLICATION**: 데이터베이스 복제를 수행할 수 있는 권한.
- **BYPASSRLS**: Row Level Security를 무시할 수 있는 권한.
- **CONNECTION LIMIT**: 허용되는 최대 연결 수 설정.
- **VALID UNTIL**: 비밀번호 만료일 설정.

와 같고 생성 시 주었던 혹은 주지 못했던 권한은

```
ALTER ROLE [계정명] WITH [권한];
```

으로 변경 가능하다.

참고로 여러개의 권한 및 옵션을 적용할 때는 ' '의 공백으로 delimiter를 제공하면된다.

그럼 계정을 생성하고 필요 시 수정을 진행하자.

```
CREATE ROLE [계정명] WITH [권한 및 옵션] PASSWORD '[비밀번호]';

ALTER ROLE [계정명] WITH CREATEDB SUPERUSER;
```

이후 `\du` 를 통해 계정에 적절한 권한이 부여됐는지 확인하자.

```
                                   **List of roles**

 **Role name  |                         Attributes                         | Member of** 

**------------+------------------------------------------------------------+-----------**

 **jaehoonman | Superuser, Create DB                                       | {}**

 **postgres   | Superuser, Create role, Create DB, Replication, Bypass RLS | {}**
```

권한이 부여된 계정을 생성한 DB에 접근 가능하도록 `GRANT` 를 수행하자.

```
GRANT ALL PRIVILEGES ON DATABASE [DB명] TO [유저명];
```

`ALL` 의 경우에는 `SELECT, INSERT, UPDATE, DELETE` 를 모두 포함하는 권한을 의미하며, 필요 시에는 부여하고 싶은 권한만 부여할 수 있다.

특정 스키마에만 접근 권한을 주는

``` 
GRANT USAGE ON SCHEMA [스키마명] TO [유저명];
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA [스키마명] TO [유저명];
```

도 있지만 이는 자세히 다루지 않고 DB 접근 권한만 적용하겠다.

DB 접근 권한을 부여한 뒤 다시 `\l`을 수행해보면


```
                                    **List of databases**

     **Name      |  Owner   | Encoding |  Collate   |   Ctype    |    Access privileges**    

**---------------+----------+----------+------------+------------+-------------------------**

 **jaehoonman_db | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =Tc/postgres           +**

               **|          |          |            |            | postgres=CTc/postgres  +**

               **|          |          |            |            | jaehoonman=CTc/postgres**

 **postgres      | postgres | UTF8     | en_US.utf8 | en_US.utf8 |** 

 **template0     | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres            +**

               **|          |          |            |            | postgres=CTc/postgres**

 **template1     | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres            +**

               **|          |          |            |            | postgres=CTc/postgres**

**(4 rows)**
```

에서 `jaehoonman=CTc/postgres**` 가 추가 된 것을 확인할 수 있다.

이제 생성과 설정이 완료된 계정으로 다시 로그인해보자.

``` shell
postgres=# \q

$ docker exec -it [컨테이너명] psql -U [생성한 유저명] -d [생성한 DB명]
```

이후 psql의 커멘드 수행자가 생성한 DB명으로 변경 되었는지 확인한다.

#### 테이블.

위의 과정을 무난히 따라 왔다면 생성한 계정으로 생성한 DB의 테이블을 만들 수 있을 것이다.

``` sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

를 통해 테이블을 생성하고,

``` sql
INSERT INTO users (name, email) VALUES ('Jaehoonman', 'jaehoonman@example.com');
INSERT INTO users (name, email) VALUES ('JonDoe', 'jondoe@example.com');
```

를 통해 데이터를 INSERT하고,

``` sql
SELECT * FROM users;
```

를 통해 데이터를 조회하자.

``` shell
jaehoonman_db=# SELECT * FROM users;

 id |    name    |         email          |         created_at         

----+------------+------------------------+----------------------------

  1 | Jaehoonman | jaehoonman@example.com | 2024-09-17 20:18:43.055677

  2 | JonDoe     | jondoe@example.com     | 2024-09-17 20:18:43.062288
```

`\d [테이블명]`으로 CREATE한 스키마를 확인할 수도 있다.


`docker run` 시 주었던 `-v`로 Volume 을 설정했기에 컨테이너를 껐다 켜도 데이터가 유지될 것이다.

이번 파트는 여기까지 설정해보고 다음 파트에서는
- Spring Boot + JPA + PostgreSQL
- Docker Compose.

를 다룰 것이다.

<br/>

Ref.

[https://diary-developer.tistory.com/20](https://diary-developer.tistory.com/20)