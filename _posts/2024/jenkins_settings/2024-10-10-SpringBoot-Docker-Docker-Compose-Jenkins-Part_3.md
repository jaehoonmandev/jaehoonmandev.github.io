---
#layout: single
title:	"Spring Boot + Docker + JPA + Docker Compose + Jenkins -Part.3-"
date:	2024-10-10 12:00:00
categories:
  - Settings
tags:
  - Spring Boot
  - Docker
  - JPA
  - Docker Compose
  - Jenkins
  - ngrok
comment: true
#published: false 
---

[Spring Boot + Docker + JPA + Docker Compose + Jenkins -Part.2-](/settings/SpringBoot-Docker-Docker-Compose-Jenkins-Part_2/) 포스트에 이어서 이번엔 GihHub와 Jenkins의 Webhook 연동 방법에 대해 알아보겠다.

![structure]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/structure.png)

지금까지 위와 같은 구조를 구성 해보았다.

Docker Container로 구성한 Spring Boot와 PostgreSQL을 Docker Compose로 네트워크 및 통합 컨테이너 구성하여 상호 작용할 수 있도록 구성하였다.

이제 Jenkins를 활용하여 CI/CD 파이프라인을 구축해 볼 것이다.

![cicd_flow]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/cicd_flow.png)

*https://testrigor.com/blog/what-is-cicd/*

CI/CD에 관해 간단히 설명할 것이다.

먼저 해당 개념을 구축하고 사용하는 이유는 **개발에서 배포까지의 단계에서 모든 과정을 자동화하며 안정적이고 신속한 배포 환경을 구축**하기 위해 사용한다. 정도로 설명할 수 있을 것 같다.

서비스를 운영하는 입장에서 유저가 관심을 가질만한, 필요할만할 기능을 신속하게 제공하면서 만족도를 높이는 것이 중요할 것이다.

CI/CD는 각각 협업, 배포에 대한 효율성을 높힐 수 있기에 위와 같은 유저 만족성을 높이기 위한 수단으로 쓰일 수 있을 것이다.

## Continuous Integration, CI - 지속적인 통합

![ci]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/ci.png)

*https://testrigor.com/blog/what-is-cicd/*

Git, Github, GitLab 등과 같은 버전 관리 시스템에 개발한 내용들을 짧은 주기를 가지며 통합하는 것을 의미한다.

협업에 있어서 팀원들과 내용을 공유할 수 있음은 물론, 효율적인 구조 개선, 문제 파악으로 내구성 높은 서비스 개발 등을 목표로한다.

### 핵심
- 병합 : 변경 사항들을 다른 코드들과 자주 병합하여 충돌의 피로를 줄인다.
- 자동 테스트 : 코드 병합 시 자동으로 테스트를 실행하여 버그를 미리 발견한다.
- 코드 품질 유지 : 테스트를 통해 코드의 안정성과 품질을 유지한다.

## Continuous Delivery/Deployment, CD - 지속적인 제공/배포

CI를 통해 안정성과 품질이 보장된 상태의 코드를 자동으로 배포 가능한 상태로 만드는 과정을 의미한다.

즉, 코드를 항상 운영 환경에 배포할 수 있는 상태로 유지 하는 것을 의미한다.

여기서 D에 해당 되는 개념은 2가지로 해석될 수 있는데,
- Delivery, 제공 : 자동으로 테스트, 빌드를 완료한 후에 수동으로 운영 환경에 배포.
- Deployment, 배포 : 변경 사항이 CI를 통해 통합되면 자동으로 운영 환경에 배포하는 과정.

와 같으며 Deployment가 더 완전한 자동화 단계라 볼 수 있다.

필요에 따라서는 모니터링 등과 같은 과정도 포함될 수 있다.

## CI/CD의 전체 흐름

1. 소스를 수정한다.
2. 버전 관리 시스템에 Push한다.
3. CI 단계에서 자동으로 빌드, 테스트를 실행하여 코드 통합에 있어 문제점을 미리 파악한다.
4. CI 단계에서 소스에 문제가 없다고 판단되면 CD 단계에서 배포가 가능한 상태로 유지하거나(Delivery), 운영 환경에 배포한다.(Deployment)

이 때, Git을 기반으로한 플랫폼은 각자의 Branch 전략에 따라 master, main 브랜치에 push 를 하거나 Merge를 할 때만 CD의 파이프라인 트리거를 실행 시키는 방법이 있다.

## CI/CD Tools

![cicd_tools]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/cicd_tools.png)

*https://testrigor.com/blog/what-is-cicd/*

각 과정을 쉽게 구현할 수 있도록 여러 툴들이 함께 사용될 수 있다.

우리 같은 경우에는 최종적으로 Plan의 과정에서부터 시작하여
- Code : GitHub
- ~~Test : 생략~~
- Build : Gradle
- Release : Jenkins
- Deploy : Docker, Docker Compose
- ~~Operate : 생략~~
- ~~Monitor : 생략~~

을 구축해 볼 것이다.

## GitHub

코드를 관리할 버전 관리 플랫폼으로 GitHub를 활용할 것이다.

Git을 기반으로 한 플랫폼인 만큼 Git이 디바이스에 설치 되어 있어야한다. [Git의 기본 개념 및 활용](/git/git-basic/)

GitHub의 Repository를 만들고, commit, push 하자.

해당 과정은 편의상 생략하겠다.

# Jenkins

![jenkins_logo]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/jenkins_logo.png)

*https://commons.wikimedia.org/wiki/File:Jenkins_logo.svg*

돌아와서 Jenkins 는 무엇일까.

위에서 소개했던 CI/CD의 개념을 지원하는 툴이다.

소스의 변경 사항을 push 할 때마다 이를 webhook 이벤트로 받고 해당 소스를 빌드, 테스트, 배포의 과정을 수행 해준다.a

이 또한 필요성에 대한 의문성을 가질 수도 있다.

CI/CD의, Jenkins의 도움을 받지 않고 직접 배포와 버전 관리를 수행하는 이전 배포 방식은 직접
- 소스 통합과 프로젝트의 오류 검증.
- JAR와 WAR 등 배포 가능한 형태로 추출.
- 서버를 클라우드 인스턴스 등에 올려 놨다면 해당 위치에 배포 파일 업로드(FTP)
- 배포 시 로그 확인.
- 서버 재시작.

등의 과정을 거쳐야한다.

뭐 저 과정을 매 번할 수도 있겠지만 그 뭐시기냐 "재테크를 올바르게 '자동화'한다면, 모든 일이 술술 풀린답니다." 라는 데이비드 바크씨의 말을 빌려올 수 있겠다.(큰 관계 없음)

암튼 자동화하는 과정을 귀찮고 왜 하냐 싶겠지만 해두면 확실한 이점은 생기기 마련이다.

이제 활용해 보자.

참고로 이번 포스트에서는 로컬에서만 환경을 구축할 것이기 때문에 AWS, Heroku, GCP와 같은 클라우드를 활용하여 webhook 을 구성하진 않을 것이다.

## Jenkins by docker


현재 포스트는 java 17을 기반으로 작성하고  있으니 해당 버전을 지원하는 jenkins:jdk17 버전으로 pull 해오자.

(lts 버전은 안정성을 위해 java 11을 사용한다는 얘기가 있다..)

``` sh
docker image pull jenkins/jenkins:jdk17
```

의 커맨드로 Jenkins 이미지를 pull 하자.

### run / pull

기존에는 pull 먼저, run을 나중에 수행 했다면 이번에는 run과 동시에 pull 하는 방법을 사용하겠다.

Docker는 run 시에 기반이 되는 이미지가 없다면 이를 Docker Hub에서 검색하여 해당 되는 이미지를 자동으로 pull 해온다.

현재 포스트는 java 17을 기반으로 작성하고  있으니 해당 버전을 지원하는 jenkins:jdk17 버전으로 pull 해오자.

(lts 버전은 안정성을 위해 java 11을 사용한다는 얘기가 있다..)

``` sh
docker run \
  --name [생성될 컨테이너명] \
  -p 18080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:jdk17
```

- `-p` : 포트 설정.
- `-v` : 볼륨.

포트의 경우에는 기존에 Spring Boot를 `8080:8080`로 설정 해놨기에 호스트 머신 내에서 충돌이 나지 않게 `18080:8080`으로 설정했다.

추가로 `50000:50000`의 포트 설정도 확인할 수 있는데, 이는 Jenkins의 Master와 Agent(Slave) 간의 통신을 위한 포트이다.

자세한 내용은 이번 포스트에서는 다루지 않겠다.

일단은 빌드 작업을 병렬로 실행하거나 특정 작업을 분산 처리할 때 사용하는 포트라는 것을 알아만 두자.

Jenkins 환경 설정을 계속 진행해 보자.

### Initialization

run을 통해 인스턴스를 실행하면 [http://localhost:18080](http://localhost:18080)를 브라우저를 통해 접근할 수 있게된다.


![jenkins_init]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/jenkins_init.png)

초기 접속일 경우 어드민의 권한을 얻기 위한 초기 비밀번호를 요구한다.

해당 값을 얻는 방법은 크게 두 가지가 있다.

#### 로그에서 구하기

`docker run` 시 백그라운드로 실행하지 않고 터미널에서 로그를 볼 수 있게 실행하면 로그 내용 중에 해당 값이 노출 된다.

![init_log]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/init_log.png)

저 값을 바로 넣어주면된다.

#### 파일에서 구하기

로그와 브라우저 페이지에서도 볼 수 있듯이
`/var/jenkins_home/secrets/initialAdminPassword`
의 volume 으로 설정한 경로에 파일이 있다는 것을 알려준다.

하지만 Docker는 Docker 내부 가상 환경(Linux Vm) 에서 실행되기에 디바이스 디렉터리를 따라가도 해당 파일이 없을 것이다.

이를 위해서는 docker 컨테이너 내부로 접근해야 한다.\

``` sh
docker exec -it <container_name> /bin/bash

cat /var/jenkins_home/secrets/initialAdminPassword
```

![init_file]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/init_file.png)

### 플러그인 설치
초기화 비밀번호를 입력한 후에

![init_plugin]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/init_plugin.png)

와 같은 플러그인 설치 페이지가 노출될 것이다.

따로 세세한 작업을 하진 않을 것이니 "Install suggested plugins", 권장 사항으로 설치하자.

![plugin_install]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/plugin_install.png)

### 계정 생성

![create_user]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/create_user.png)

플러그인 설치가 완료되면 계정을 생성하고 진행하면 URL 관련 페이지가 뜨고 그대로 진행하자.

![jenkins_main]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/jenkins_main.png)


### 추가 플러그인

GitHub 연동을 위한 "GitHub Integration Plugin" 을 설치해야 한다.

메인화면 왼쪽에 있는 메뉴 중 "Jenkins 관리" - "Plugins" - "Available plugins" 로 접근하자.

이후 "GitHub Integration Plugin"을 검색, 체크하여 install 해주자.

![plugins]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/plugins.png)

### Item

Jenkins에서 관리하는 일종의 프로젝트, 작업을 의미하는 Item을 생성해주자.

![new_item]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/new_item.png)

아이템 타입은 Freestyle project로 생성할 것이다.

#### Item type
여기서 간단히 타입에 대해 설명하자면

- **Freestyle Project**
  - 가장 기본적인 프로젝트 유형
  - 다양한 빌드를 활용하여 빌드 및 테스트 가능
  - Git,  SVN 등 VCS와 연동하여 간단한 빌드 작업 처리
- **Pipeline**
  - 코드 기반의 파이프라인을 정의할 수 있음.
  - Jenkinsfile을 사용하여 빌드, 테스트 배포 등의 모든 단계를 코드로 정의할 수 있음.
  - 복잡한 워크플로우를 관리하는데 적합.
- **Multi-configuration project(Matrix Project)**
  - 다양한 OS, JDK 버전, 브라우저 등을 조합하여 테스트나 빌드를 실행할 수 있음.
- **Folder**
  - 여러 프로젝트를 한 폴더에 그룹화하여 관리할 수 있음.
  - 대규모 프로젝트를 관리할 때 관련 프로젝트끼리 분려하여 유지보수 및 일관성 유지 가능.
  - 폴더 내부에는 Freestyle Project, Pipeline 등 다른 프로젝트 타입을 포함시킬 수 있음.
- **Multibranch Pipeline**
  - Git과 같은 VCS에서 여러 브랜치에 대해 자동으로 파이프라인을 생성할 수 있음.
  - 브랜치마다 별도의 Jenkinsfile을 사용하여 독립적인 빌드 및 테스트를 설정 가능.
- **Organization Folder**
  - 조직에서 사용하는 VCS의 Repository를 감시하고, 각 브랜치별 빌드를 자동으로 설정할 수 있음.

와 같다.

#### Configure

아무쪼록 아이템 이름과 Freestyle project 를 선택하여 아이템을 생성했다면 GitHub Repository 연동되게 설정하자.

![item_config]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/item_config.png)

Configure - General 로 접근하여 "GitHub project"를 체크하여 Project url 을 입력해주자.

이후 아래의 소스 코드 관리에서 "Git"을 선택하고 Repository URL을 기입하자.

![item_config_git]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/item_config_git.png)

Repository에 접근하기 위한 Credentials는 `+ Add`를 통해 본인의 GitHub 계정 정보를 기입하자.

필자는 Kind를 "Username with password"로 설정하여 Username엔 아이디, Password엔 패스워드를 기입하여 Credentials 를 설정하였다.

ID 필드에는 여러개의 Credential를 관리할 때 구분하기 위한 닉네임이다.

Branch는 main만 활용할 것이기에 `*/main`으로 설정했다.

정보를 모두 기입한 뒤에는

빌드 유발(Build Trigger)에서 `"GitHub hook trigger for GITScm polling"`을 체크하여 GitHub의 Webhook을 통하여 푸시 이벤트를 감지할 수 있게 설정하자.

### security

#### Strict Crumb Issuer

GitHub webhook을 통해 이벤트를 보낼 때 젠킨스에서 보안 설정을 따로 해두지 않으면  403 에러가 발생할 수 있다.

이를 사전에 방지 하기 위한 설정을 수행하겠다.

이전에 GitHub Integration Plugin 와 같은 플러그인을 설치 했던 Jenkins 관리 - plugins 로 접근하여 "Strict Crumb Issuer Plugin" 을 설치해주자.

이후 Jenkins 관리 - Security 에 접근하여 CSRF Protection의  Crumb Issuer를 String Crumb Issure로 변경하고, 아래 고급에서 Check the session ID의 체크를 해제해주자.

![strict_crumb]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/strict_crumb.png)

### GitHub Webhook

젠킨스에서 설정을 완료했다면 GitHub Repository에 접근하여 GitHub의 Webhook을 설정해야한다.

Repository에 접근하여 Settings - Webhooks - Add webhook을 클릭하자.


![github_add_webhook]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/github_add_webhook.png)

![github_add_webhook_2]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/github_add_webhook_2.png)

Payload URL에 젠킨스가 실행되고 있는 서버의 경로를 입력해야한다.

클라우드 서버라던가 리버스 프록시를 통해 외부로 라우팅 되는 환경에서 실행하고 있다면 해당 경로를 입력하면 된다.

하지만 현재 포스트는 로컬호스트에서 환경을 구성했기 때문에 필요 시 아래의 과정을 따라오길 바란다.

#### ngrok

로컬호스트에서 실행 중인 애플리케이션을 외부로 안전하게 노출할 수 있게 해주는 플랫폼이다.

이를 활용하여 로컬호스트에서 실행 중인 젠킨스를 GitHub Webhook으로 바라볼 수 있게 설정할 것이다.

##### 설치
설치는 mac을 기준으로 포스트 할 것 이기에 자세한 사항이나 타 OS 설치 방법은 [링크](https://ngrok.com/docs/getting-started/) 를 참고해주길 바란다.

brew가 설치 되었다는 가정하에 아래의 커맨드를 입력하여 ngrok를 설치해주자


``` sh
brew install ngrok/ngrok/ngrok
```

##### 실행
설치가 완료 되었다면 젠킨스 컨테이너의 컨테이너 포트를  18080에서 8080의 호스트 포트로 연결했기에

``` sh
ngrok http 18080
```

을 실행 해준다.

하지만 실행 했을 때

``` sh
**ERROR:  authentication failed: Usage of ngrok requires a verified account and authtoken.**

**ERROR:**  

**ERROR:  Sign up for an account: https://dashboard.ngrok.com/signup**
```

와 같은 인증 관련 에러가 뜰 것이다.

원하는대로 [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup) 에 접속하여 가입해주자.

가입을 완료하면 Welcome 페이지와 함께 실행 스텝을 알려줄 것이다.

![ngrok_welcome]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/ngrok_welcome.png)

설치는 완료 되었으니 아래의 add-authtoken을 복사하여 authtoken을 설정해주자.

이후 다시

``` sh 
ngrok http 18080
```
를 실행하면

![ngrok_start]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/ngrok_start.png)

와 같이 ngrok이 실행되고 임시로 발급 받은 Forwading 경로로 접속해보면 Jenkins 페이지에 접속되는 것을 확인할 수 있다.

확인 차 로그인 하면 로그인 및 저장한 item이 있는 것을 정상적으로 확인할 수 있다.

#### Add webhook

다시 돌아와 GitHub의 Add webhook을 설정해주자.

- Payload URL : `https://[ngrok으로 실행중인 URL]/github-webhook/`(`/github-webhook` 뒤에 `/` 필수)
- Content type : application/json
- Which event would... : Just the push event.

로 설정하여 push 하는 이벤트에 대해서만 webhook 이벤트를 송신 하도록 설정하자.

이후 add를 했을 때 정상적으로 설정 되었다면 `ping` 이벤트가 성공적으로 실행 됐을 것이다.

![webhook_result]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/webhook_result.png)

~~403에러 때문에 2번 정도 이벤트가 실패했다. 하하하~~

#### Push

이제 연동한  GitHub Repository의 코드를 변경하여  Push 해보자.

필자는 `/src/main/resource/templates/home.html` 을 변경하여 Push 해보았다.

이후 위에서 보았던 Recent Deliveries 에서도 이벤트가 정상적으로 전송 되었는지 확인 가능하며,
Jenkins Item - GitHib Hook Log에서도 어떤 이벤트가 왔는지 확인 가능하다.

![webhook_log]({{ site.baseurl }}/assets/images/posts/2024/jenkins_settings/3/webhook_log.png)


# 마무리

지금까지 Docker Container로 실행시킨 Jenkins를 GitHub webhook 과 연동하여 Push 이벤트를 Jenkins에서 핸들링 할 수 있는 과정까지 설정을 마쳐봤다.

다음 포스팅에서는 이전까지 해왔던 작업들을 모두 연동하여 Spring Boot 애플리케이션을 GitHub로 Push 했을 시 Gradle으로 이를 빌드하고 Docker Compose 서비스를 실행하는 과정까지 진행해보겠다.

<br/>

Ref.

[https://choco-one.tistory.com/6](https://choco-one.tistory.com/6)

[https://dev-overload.tistory.com/40](https://dev-overload.tistory.com/40)

[https://msj725.tistory.com/82](https://msj725.tistory.com/82)

[https://honeyinfo7.tistory.com/293](https://honeyinfo7.tistory.com/293)