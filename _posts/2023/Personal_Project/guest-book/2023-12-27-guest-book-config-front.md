---
#layout: single
title:	"[Personal Project] 방명록 토이프로젝트 개발여정 - 개발 환경"
date:	2023-12-27 12:00:00
categories:
  - 개인프로젝트
tags:
  - 프로젝트
  - 토이프로젝트
  - 방명록
comment: true
#published: false 
---
방명록 프로젝트는 대략적으로 아래의 구조를 가지고 있다.

# 기능 명세서
![구조]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest-book/structure.png)

Front와 back을 서로 다른 클라우드 플랫폼을 통해 제공할 예정이다.

Front 배포를 위해 Vercel을 택했는데, 서버리스 플랫폼이기에 Next.js는 Docker를 지원하지 않는다.

그리하여 로컬에서 개발환경을 구성하여 Git Repository로 Push하여 Vercel과 연동하는 방법으로 배포할 것이다.

Back 배포는 AWS의 클라우드를 이용할 예정인데 Nginx로 웹 서버를 두고 컨테이너화한 Spring Boot 웹서버 및 웹 애플리케이션을, DB로는 Mongo DB를 구축할 것이다.

개발을 위해서 먼저 Front 환경을 로컬에 구성하고 클라우드에 배포해보겠다.

프론트의 Next.js를 먼저 구성할 것인데 필자는 IntelliJ를 기준으로 설명하겠다.

(설정 이전에 Next.js, React.js는 Node.js가 필요하니 설치 할 수 있도록 하자.)

### 1. 프로젝트 생성.  
IntelliJ - New Project - React - Project type : Next.js(필요 시 Create TypeScript project 체크)  
![프로젝트 생성]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest-book/create-next-js.png)  
create-next-app은 기본 생성 커멘드인 `npx create-next-app` 으로 프로젝트를 생성한다.  

### 2. 초기 생성 설정.
![프로젝트 생성 설정.]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest-book/config-next-js.png)  
사용자의 필요에 따라 설정을 마치면 되고, 설정을 마치면 기본적으로 필요한 Dependencies을 자동으로 설치한다.

### 3. Next.js 애플리케이션 테스트 실행
`npm run dev`로 애플리케이션을 실행한 뒤, [http://localhost:3000/](http://localhost:3000/) 로 접근하여 실행중인 애플리케이션을 확인해보자.
![실행]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest-book/run-next-js.png)

### 4.  Git Repository 생성, Push.

### 5. [https://vercel.com/](https://vercel.com/) 로그인 or 계정 생성.

### 6. "Import Project"    
로그인하게 되면
![Import Project]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest-book/vercel-import.png)
와 같은 화면을 보게되는데 현재 하려는건 Git Repository에 Push 된 버전을 배포하기 위함이니 Import Project를 선택한다.  

이후 나오는 화면에서 배포하고 싶은 프로젝트 Repository를 선택하면 된다.
![Import Project]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest-book/vercel-import-2.png)

### 7. 배포 프로젝트 설정.
![Project setting]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest-book/vercel-config.png)
프로젝트의
- 이름, 프레임워크, 루트 경로
- 실행 명령어, 컴파일된 소스 저장경로, 의존성 설치를 위한 명령어
- 프로젝트 환경변수

를 설정할 수 있다.

### 8. "Deploy"
설정을 완료하고 "Deploy" 버튼을 클릭하게되면 자동으로 배포 과정을 거치고 성공적으로 배포가 완료되면 아래와 같이 결과가 나온다.
![Vercel Result]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest-book/vercel-result.png)

### 9. "Continue to Dashboard"
![Vercel Dashboard]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest-book/vercel-dashboard.png)

배포된 프로젝트의 Domain 정보, 실행 상태, 빌드 로그 등을 확인할 수 있다. 

<br> 

이제 로컬에서 개발을 진행하고, Vercel과 연동된 프로젝트 Git Repository에 Push 할 때마다 Vercel은 자동으로 배포 과정을 수행해준다.

프론트는 간단히 위와 같이 진행하고, 다음은 백엔드 구성 및 연동 테스트를 진행해보겠다.