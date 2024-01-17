---
#layout: single
title:	"Docker Compose로 Spring Boot + MongoDB 구성(part.1)"
date:	2024-01-09 12:00:00
categories:
  - Spring Boot
  - MongoDB
  - Docker Compose
tags:
  - REST API
  - Container
comment: true
published: true 
---
Docker Compose로 Spring Boot + MongoDB를 연동하여 REST API 백엔드를 구성해보자.

시작하기전 Docker가 설치 되지 않았다면 
[Docker Compose - 설치 및 사용]({% link _posts/2023/Docker/2023-12-22-docker-compose-install-try.md%})
를 참고하자.

(Mac, IntelliJ를 기준으로 작성되었으니 참고하길 바란다)

<br>
# Spring Boot Project 생성

먼저 Spring Boot 프로젝트를 생성하자.  
![생성]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/create-boot-project.png)
![의존성]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/boot-dependendies.png)

MongoDB, Model 작성 시 편리를 위한 Lombok을 Dependencies로 추가하였다.

<br>
# Hello World 애플리케이션

먼저 Docker로 실행하는 방법을 알아보기 위해 'Hello world'가 출력되는 애플리케이션을 만들어보자.

MongoDB의 기능은 당장 필요하지 않으니 비활성화 시키자.
``` yaml
dependencies {  
    implementation 'org.springframework.boot:spring-boot-starter'  
    implementation 'org.springframework.boot:spring-boot-starter-web'  
      
    //implementation 'org.mongodb:mongodb-driver-sync:4.10.2'  
    //implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'  
  
    compileOnly 'org.projectlombok:lombok'  
    annotationProcessor 'org.projectlombok:lombok'  
    testImplementation 'org.springframework.boot:spring-boot-starter-test'  
  
}
```
![Hello World]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/hello-world.png)


``` java
package com.jaehoonman.guestbookspringboot.controller;  
  
import org.springframework.web.bind.annotation.RequestMapping;  
import org.springframework.web.bind.annotation.RequestMethod;  
import org.springframework.web.bind.annotation.ResponseBody;  
import org.springframework.web.bind.annotation.RestController;  
  
@RestController  
public class TestController {  
  
    @RequestMapping(method = RequestMethod.GET, value = "/")  
    @ResponseBody  
    public String testResponse() {  
        return "Hello World";  
    }  
}
```

서비스를 실행하여 [http://localhost:8080](http://localhost:8080) 에서 'Hello World' 가 출력되는지 확인.

![Hello World Rendering]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/hello-world-render.png)

<br>
# JAR 파일 생성

Docker image 빌드의 기반이 될 Spring Boot 애플리케이션 JAR을 생성해야한다.

IntelliJ + gradle 기준 IntelliJ의 Gradle 윈도우 view - build - build 를 수행하면,
Root 디렉터리/build/libs에 jar 파일이 생성된다.

![JAR]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/created-jar.png)

<br>
# Dockerfile 생성

이제 이 애플리케이션의 Dockerfile을 생성하자.

프로젝트 Root 디렉터리에 Dockerfile 파일을 생성한 뒤 소스를 작성하자.

![Dockerfile]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/dockerfile-code.png)

```dockerfile
# 현재 애플리케이션이 구동되는 기반 이미지 버전 pullFROM openjdk:17  
FROM openjdk:17

# 작성자, 관리자 등의 정보를 나타낼 수 있다.  
LABEL maintainer='wido1593@gmail.com'  
  
# JAR 파일 경로 변수로 지정.  
ARG JAR_FILE=build/libs/guest-book-spring-boot-0.0.1-SNAPSHOT.jar  
  
# JAR 파일을 app.jar 라는 이름으로 사용하기 위해 복사.  
COPY ${JAR_FILE} app.jar  
  
# JAR를 실행하기 위한 java -jar app.jar 명령어를 ENTRYPOINT로 설정  
ENTRYPOINT ["java","-jar", "app.jar"]
```

Dockerfile 레퍼런스는 볼륨이 크니 상세한 내용은 [Dockerfile Reference](https://docs.docker.com/engine/reference/builder)를
참고하길 바란다.

파일 작성이 완료 되었다면 이를 기반으로 Image를 build 해야한다.

IntelliJ의 Docker 플러그인으로 간단히 GUI로 해결 할 수 있긴하지만, DockerCLI로 수행해보자

Dockerfile이 있는 프로젝트 Root 경로로 cd하여
```
$ docker build -t [태그명]:[버전] .
```
의 명령어를 입력하자.

지정한 태그의 이름으로 이미지가 생성될 것이며, 끝에 '.' 로 해당 위치에 있는 Dockerfile을 찾자.

![Dockerfile Build]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/dockerfile-build.png)

정상적으로 수행된다면 우리가 작성했던 순서대로 JDK 를 pull, JAR의 경로를 찾아 이를 복사하여 app.jar로 COPE 하는 등의 과정을 거쳐 이미지를 만들 것이다.

`docker images` 로 생성된 이미지를 확인할 수 있다.

이제 이미지를 실행해보자.
```
$ docker run -p 8080:8080 [태그명]:[버전]
```

`-p`의 옵션으로 [호스트에서 요청할 포트] : [컨테이너 포트] 로 포트 맵핑을 수행한다.

`docker ps` 로 실행중인 프로세스를 확인할 수 있다.

이제 로컬에서 Spring Boot 서비스를 실행하고 확인 했던 것 처럼 [http://localhost:8080](http://localhost:8080) 에서 'Hello World' 가 출력되는지 확인한다.

Spring Boot 컨테이너 이미지 생성이 완료되었다.

<br>
# Docker를 통한 MongoDB 설치 및 동작 확인

로컬에 MongoDB를 설치하지 않고 Docker Hub에 있는 MongoDB 이미지를 pull 해옴으로써 간단하게 MongoDB를 사용할 수 있다.

(docker hub에 접근하기 위해 docker login을 수행해야 한다.)
```
$ docker pull mongo
```
를 통하여 mongo 이미지를 pull, `docker images`로 이미지가 정상적으로 왔는지 확인한다.

![Pull MongoDB]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/docker-pull-mongo.png)

설치된 mongo 컨테이너 이미지를
```
$ docker run --name mongo -p 27017:27017 -d mongo
```
의 명령어를 통해 pull한 mongo 이미지를 mongo 라는 이름(--name) 으로 27017 포트 맵핑(-p) 하여 새로운 컨테이너로 생성, 백그라운드(-d)에서 실행한다.

이후 실행중인 컨테이너에서 명령어를 실행하기 위한 exec 를 수행.
```
docker exec -it mongo /bin/bash
```
-i, -t 의 옵션으로 입/출력 허용과 bash와 같은 터미널 사용을 허용한다.

(이 부분은 MongoDB Compass 툴을 통해 GUI로도 확인 가능한 것 같다.)

이후 /# 라인에서 `mongo` 혹은 `mongosh` 를 입력하여 쉘 입력을 활성화 시킨다.(버전마다 상이)

![Execute bash]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/mongo-exec.png)

이후 `use admin` 으로 admin DB로 이동하여 계정하나를 생성해보자.

``` mongodb-json
db.createUser( 
	{ 
	user: "[user 이름]", pwd: "[password]",
	roles: [ 
		{ "role" : "root", "db" : "admin" }, 
		] 
	} 
)
```

생성된 계정은 `db.getUsers()` 명령어로 확인 가능하다.

컨테이너는
``` shell
# mongo 컨테이너 실행
$ docker start mongo

# mongo 컨테이너 정지
$ docker stop mongo

# mongo 컨테이너 재시작
$ docker restart mongo
```
로 동작을 조작할 수 있다.

<br>
다음 포스트에서는 Spring Boot 애플리케이션과 MongoDB를 연동하고 이를 Docker Compose로 구성해보자.


<br>

Ref.  
[https://umanking.github.io/2021/07/11/spring-boot-docker-starter/](https://umanking.github.io/2021/07/11/spring-boot-docker-starter/)  
[https://devfunny.tistory.com/920](https://devfunny.tistory.com/920)



