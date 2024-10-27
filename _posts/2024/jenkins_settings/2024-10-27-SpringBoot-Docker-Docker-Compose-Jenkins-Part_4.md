---
#layout: single
title:	"Spring Boot + Docker + JPA + Docker Compose + Jenkins -Part.4-"
date:	2024-10-27 12:00:00
categories:
  - Settings
tags:
  - Spring Boot
  - Docker
  - JPA
  - Docker Compose
  - Jenkins
  - gradle
comment: true
#published: false 
---

[Spring Boot + Docker + JPA + Docker Compose + Jenkins -Part.3-](/settings/SpringBoot-Docker-Docker-Compose-Jenkins-Part_3/) 포스트에 이어서 이번엔 Push 한 
Spring Boot 를 젠킨스를 통해 Docker Build 하는 방법에 대해 알아보겠다.

![structure_before]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/4/structure_before.png)

현재까지 위와 같은 구조가 완성 되었다.

유저는 프로젝트 소스를 GitHub Repository 에 PUSH하게 되고, GitHub는 PUSH 이벤트를 WEBHOOK 설정을 토대로 로컬 Jenkins Docker Container 로 전달하게된다.

이번 포스트에서는 Push 했던 소스를 젠킨스에서 PULL 하여 빌드 및 필요 시 테스트하여 Spring Boot 애플리케이션 컨테이너를 최신 버전으로 교체하여 실행하는 과정을 진행하겠다.

유저가 코드를 반영하고, 해당 코드를 인식하고 추가 작업을 진행하는 CI, 빌드 및 테스트,  배포, 실행 까지 진행하는 CD의 CI/CD 를 구현하게되는 것이다.

# Jenkins Build

## Execute shell
Freestyle 로 생성한 Item은 간단한 프로젝트 배포에 적합하다.

Freestyle은 보통 Push webhook 이벤트를 받았을 때 명령어를 실행하는 `Execute shell`을 스텝에 추가하여 사용한다.

먼저 우리가 진행하고 싶은 과정을 설명하자면
- GitHub 코드 PUSH.
- Webhook 을 통해 젠킨스에서 이벤트 receive.
- 젠킨스에서 수정이 이루어진 최신 코드를 PULL.
- Gradle 빌드 수행.
- Docker 이미지 빌드.
- 컨테이너 중지 및 제거.
- 새로 빌드된 Docker Compose 컨테이너 실행.

와 같다.

해당 과정을 입력하기 전에 Docker CLI가 젠킨스 컨테이너 내부에서 실행되는지 부터 확인해봐야한다.

### Jenkins에서 Docker 명령어 실행하기.

젠킨스에서 Execute shell에 Docker의 명령어를 입력하면 `docker: not found`와 같은 에러와 함께 빌드에 실패하는 경우가 있다.

이는 젠킨스가 도커 명령어를 사용하기 위해서는 젠킨스 컨테이너 내부에 Docker CLI 설치를 하는 `Docker-in-Docker(DID)` 방식을 사용할 것이다.

먼저 실행중인 컨테이너 내부로 접근하자.
``` sh
docker exec -it -u root [젠킨스 컨테이너 이름] /bin/bash
```

이후 `# docker` 를 실행하게되면 `bash: docker: command not found`의 에러가 뜰 경우가 있다.

이는

1. docker.sock를 마운트해도 젠킨스 컨테이너 내부에서 docker 명령어를 인식하지 못함.
2. 젠킨스 컨테이너 내에 Docker CLI가 설치되어 있지 않음.

정도의 상황이 원인이 될 수 있다.

1번째 상황의 경우에는 docker run 시에 `-v /var/run/docker.sock:/var/run/docker.sock` 의 옵션을 주었기에 아닐 것이라 예상하며,

2번째 경우를 의심해 볼 수 있다.

``` sh
dpkg -l | grep docker
```

의 명령어를 통해 현재 Docker 관련 패키지가 설치 되어 있는지 확인하자.

![check_dockerCLI]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/4/check_dockerCLI.png)

필자는 설치를 마쳤기에 패키지 목록과 `docker` 명령어가 실행되는 것을 확인할 수 있으며, 만약 위와 같이 노출되지 않는다면

``` sh 
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

의 명령어를 통해 패키지를 다운 받자.

설치가 완료되었다면  터미널에 `docker --version`을 입력해보고 위에 올려둔 이미지 처럼 버전이 제대로 출력 되는지 확인하자.

정상 출력이 완료 되었다면 젠킨스 아이템 빌드 시에도 docker 명령어가 제대로 수행되는지 한 번 더 확인해보자.

`아이템 - 구성 - Build Steps - Add build step - Execute shell` 을 추가하고,

``` sh
docker --version
```

를 입력한 뒤 저장하자.

![execute_shell]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/4/execute_shell.png)

이후 `지금 빌드` 를 수행하여  빌드가 제대로 이루어지는지 확인해보자.

![console_output]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/4/console_output.png)

`Console Output` 을 통해 결과를 확인하자.

추가적으로 docker.sock의 파일 권한과 유저의 접근 권한을 추가하자.
``` sh
sudo chmod 666 /var/run/docker.sock

sudo chown root:docker /var/run/docker.sock
```

정상적으로 작동한다면 이제 원하는 과정의 shell을 입력해보자.

### Build Steps

젠킨스 내부에서 수행되는 동작을 의미한다.

빌드 과정에서 실행할 명령어 또는 스크립트를 정의하는 단계이며, 일반적으로 코드를 컴파일하거나 테스트를 실행하고, 아티팩트를 생성하는 과정에서 사용된다.

수행할 수 있는 작업은

- **소스 코드 빌드**: Gradle, Maven, Ant 등을 사용해 코드를 컴파일하고 패키징한다.
- **테스트 실행**: 유닛 테스트나 통합 테스트를 수행하여 코드의 품질을 확인한다.
- **Docker 이미지 생성**: Docker를 사용하여 애플리케이션 이미지를 빌드한다.
- **스크립트 실행**: Execute Shell을 통해 명령어를 실행하여 필요한 작업을 수행할 수 있다.

와 같다.

이제 쉘을 작업해보자.

위에서 Docker CLI를 DID로 설치했다면 Execute Shell에 내용을 입력하고, Execute Shell을 추가하지 않았다면 추가를 하자.

``` sh
# 1. 최신 소스 코드 Pull
git pull origin main

# 2. 기존 Docker Compose 컨테이너 종료 및 강제 제거
docker compose down

# 3. 기존 Spring Boot 이미지 삭제
docker rmi $(docker images -q [Spring Boot 이미지 이름]) || true

# 4. Gradle JAR 파일 빌드 (test 제외)
./gradlew clean build -x test

# 5. Image 생성.
docker build -t [Spring Boot 이미지 이름] .

# 6. Docker Compose를 사용하여 최신 소스를 반영한 컨테이너 생성 및 실행
docker compose up -d --build
```

해당 내용을 작성 후 Save를 하면된다.

과정에 대한 설명은 주석으로 대체하겠다.

### 빌드 후 조치(Post-build Actions)

Build Steps 가 성공 혹은 실패한 후 즉, 빌드 과정을 마친 후 실행되는 과정을 정의한다.

빌드 결과를 확인하거나 배포, 알림 등의 빌드가 끝난 후 추가적인 작업을 정의하는데 사용한다.

- **테스트 리포트 생성**: 테스트 결과를 기반으로 리포트를 생성하거나, 테스트 커버리지 보고서를 출력한다.
- **알림 전송**: 이메일, Slack, SMS 등으로 빌드 결과(성공/실패)를 팀원에게 알린다.
- **배포 작업**: 빌드된 아티팩트를 서버에 배포하거나, Docker 컨테이너를 배포하는 작업을 수행한다.
- **아티팩트 보관**: 빌드된 파일(JAR, WAR, ZIP 등)을 보관하거나, 다른 서버에 업로드한다
- **클린업 작업**: 이전에 생성된 아티팩트를 삭제하여 디스크 공간을 확보한다.

등의 작업을 할 수 있다.

기본적으로 제공되는 젠킨스의 빌드 후 조치 옵션은

![post_build_actions]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/4/post_build_actions.png)

와 같으며, 현재는 따로 작성하지 않겠다.


## Jenkinsfile

젠킨스 아이템의 타입이 Pipeline 일 때는 `Dockerfile`, `docker-compose.yml` 과 같이 프로젝트 내에 포함된 `Jenkinsfile`로 실행될 동작을 지정할 수 있다.

현재는 따로 진행하진 않을 것이나 위의 동작을 Jenkinsfile로 구성한다면

``` groovy
pipeline {
    agent any
    environment {
        // 필요한 환경 변수를 정의할 수 있습니다.
    }
    stages {
        stage('Pull Latest Code') {
            steps {
                // 최신 소스 코드 Pull
                sh 'git pull origin main'
            }
        }
        stage('Stop and Remove Existing Containers') {
            steps {
                // 기존 Docker Compose 컨테이너 종료 및 제거
                sh 'docker compose down'
            }
        }
        stage('Remove Old Image') {
            steps {
                // 기존 이미지 삭제
                sh 'docker rmi $(docker images -q [Spring Boot 이미지 이름]) || true'
            }
        }
        stage('Build JAR File') {
            steps {
                // Gradle을 사용해 JAR 파일 빌드
                sh './gradlew clean build -x test'
            }
        }
        stage('Build Docker Image') {
            steps {
                // Docker 이미지 생성
                sh 'docker build -t [Spring Boot 이미지 이름] .'
            }
        }
        stage('Run Docker Compose') {
            steps {
                // Docker Compose로 컨테이너 실행
                sh 'docker compose up -d --build'
            }
        }
    }
}
```

와 같이 구성할 수 있을 것 같다.
## PUSH

이제 Repository에 올려둔 Spring Boot  소스를 변경할 것이다.

### Controller

home.java

``` java
@Controller  
public class home {  
  
    private UsersService usersService;  
  
    @Autowired  
    public void setUsersService(UsersService usersService){  
        this.usersService = usersService;  
    }  
  
    @GetMapping("/")  
    public String home(Model model){  
  
        List<Users> users = usersService.findAllUsers();  
  
        model.addAttribute("users", users);  
  
        return "home";  
    }  
}
```

DB에서 내용을 조회하여 해당 내용을 Thymeleaf에 넘겨주기 위해 Model에 DB 조회 값을 담아준다.

### View
home.html
``` html
<!DOCTYPE html>  
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="http://www.thymeleaf.org">  
<head>  
    <meta charset="UTF-8">  
    <title>Title</title>  
</head>  
<body>  
<h1> Welcome! </h1>  
<h1>Users List</h1>  
<ul>  
    <li th:each="user : ${users}">  
        <span th:text="${user.name}">User Name</span> -  
        <span th:text="${user.email}">User Email</span>  
    </li></ul>  
</body>  
</html>
```

Controller를 통해 전달 받은 값을 렌더링한다.

### Push and result

이제 해당 코드를 Repository로 Push 하자.

Push를 정상적으로 마쳤다면 GitHub에서는 Webhook Delivery를 진행할 것이다.

![webhook_deliveries]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/4/webhook_deliveries.png)

그리고 Jenkins에서는 해당 이벤트를 전달 받고

![console_output_2]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/4/console_output_2.png)

와 같이 Build Steps에 지정한 Execute shell의 명령어를 수행할 것이다.

내용을 단계별로 보자면

- git 초기화.
- Revision Checking out.
- git pull origin main
- docker compose down
- docker images -q
- docker rmi
- ./gradlew clean build -x test
- BUILD SUCCESSFUL
- docker build -t
- docker compose up -d --build
- Finished: SUCCESS

가 수행될 것이다.

정상적으로 수행된다면

![docker_containers]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/4/docker_containers.png)

와 같이 Docker Compose가 반영되고, 실행되고 있을 것이며, [http://localhost:8080](http://localhost:8080) 에 접근하면

![deployed_result]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/4/deployed_result.png)

와 같이 변경한 내용이 반영되는 것을 확인했을 것이다.

지금까지 진행한 결과는

![structure_last]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/4/structure_last.png)

와 같은 구조를 가지게 될 것이다.

지금까지의 시리즈는 Docker, Jenkins, Github의 DevOps 구조를 가진 엄청 간단한 구조의 CI/CD를 구성해봤다.

앞으로도 더 큰 서비스를 운영할 것이라면 테스트, SSL 설정, k8s 등 추가적인 설정은 필요할 것이다.

<br/>

Ref.

[https://tytydev.tistory.com/48](https://tytydev.tistory.com/48)

[https://github.com/occidere/TIL/issues/116](https://github.com/occidere/TIL/issues/116)