---
#layout: single
title:	"[Next.js] Vercel을 통한 간단한 배포."
date:	2023-12-27 12:00:00
categories:
  - React
tags:
  - Vercel
  - Next.js
comment: true
#published: false 
---

Next.js를 손쉽게 클라우딩 컴퓨팅 서비스로 웹으로 호스팅하는 방법 중 하나인 Vercel을 사용해보도록 하겠다.

Vercel은 Next.js Next.js 프레임워크를 개발한 회사로도 유명한데, 서버리스의 구조로 정적 사이트를 손쉽게 구성,
웹 호스팅 배포까지 해주는 간단한 서비스를 제공해준다.

Next.js와 Git과 뛰어난 호환성을 가지고 있기에 Git Repository에 Push한 Next.js 소스를
Vercel과 연동만 해준다면 Push 마다 자동으로 이를 인식하여 간편하게 배포를 해준다.
 
이제 배포를 해보자.

프론트의 Next.js를 먼저 로컬에 구성할 것인데 필자는 IntelliJ를 기준으로 설명하겠다.
(설정 이전에 Next.js, React.js는 Node.js가 필요하니 설치 할 수 있도록 하자.)

### 1. 프로젝트 생성.  
IntelliJ - New Project - React - Project type : Next.js(필요 시 Create TypeScript project 체크)  
![프로젝트 생성]({{ site.baseurl }}/assets/images/posts/2023/React/Next-js/Vercel/create-next-js.png)  
create-next-app은 기본 생성 커멘드인 `npx create-next-app` 으로 프로젝트를 생성한다.  

### 2. 초기 생성 설정.
![프로젝트 생성 설정.]({{ site.baseurl }}/assets/images/posts/2023/React/Next-js/Vercel/config-next-js.png)  
사용자의 필요에 따라 설정을 마치면 되고, 설정을 마치면 기본적으로 필요한 Dependencies을 자동으로 설치한다.

### 3. Next.js 애플리케이션 테스트 실행
`npm run dev`로 애플리케이션을 실행한 뒤, [http://localhost:3000/](http://localhost:3000/) 로 접근하여 실행중인 애플리케이션을 확인해보자.
![실행]({{ site.baseurl }}/assets/images/posts/2023/React/Next-js/Vercel/run-next-js.png)

### 4.  Git Repository 생성, Push.

### 5. [https://vercel.com/](https://vercel.com/) 로그인 or 계정 생성.

### 6. "Import Project"    
로그인하게 되면
![Import Project]({{ site.baseurl }}/assets/images/posts/2023/React/Next-js/Vercel/vercel-import.png)
와 같은 화면을 보게되는데 현재 하려는건 Git Repository에 Push 된 버전을 배포하기 위함이니 Import Project를 선택한다.  

이후 나오는 화면에서 배포하고 싶은 프로젝트 Repository를 선택하면 된다.
![Import Project]({{ site.baseurl }}/assets/images/posts/2023/React/Next-js/Vercel/vercel-import-2.png)

### 7. 배포 프로젝트 설정.
![Project setting]({{ site.baseurl }}/assets/images/posts/2023/React/Next-js/Vercel/vercel-config.png)
프로젝트의
- 이름, 프레임워크, 루트 경로
- 실행 명령어, 컴파일된 소스 저장경로, 의존성 설치를 위한 명령어
- 프로젝트 환경변수

를 설정할 수 있다.

### 8. "Deploy"
설정을 완료하고 "Deploy" 버튼을 클릭하게되면 자동으로 배포 과정을 거치고 성공적으로 배포가 완료되면 아래와 같이 결과가 나온다.
![Vercel Result]({{ site.baseurl }}/assets/images/posts/2023/React/Next-js/Vercel/vercel-result.png)

### 9. "Continue to Dashboard"
![Vercel Dashboard]({{ site.baseurl }}/assets/images/posts/2023/React/Next-js/Vercel/vercel-dashboard.png)

배포된 프로젝트의 Domain 정보, 실행 상태, 빌드 로그 등을 확인할 수 있다. 

이제 개발하고 싶은 내용을 변경하고 Git Repository에 Push 하는 것 만으로 변경 사항을 배포할 수 있게됐다.
