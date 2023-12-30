---
#layout: single
title:	"방명록 토이프로젝트 개발여정 - 개발 환경"
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

# 방명록 프로젝트 구조
![구조]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest-book/structure.png)

Front와 back을 서로 다른 클라우드 플랫폼을 통해 제공할 예정이다.

Front 배포를 위해 Vercel을 택했는데, 서버리스 플랫폼이기에 Next.js는 Docker를 지원하지 않는다.

그리하여 로컬에서 개발환경을 구성하여 Git Repository로 Push하여 Vercel과 연동하는 방법으로 배포할 것이다.

Back 배포는 AWS의 클라우드를 이용할 예정인데 Nginx로 웹 서버를 두고 컨테이너화한 Spring Boot 웹서버 및 웹 애플리케이션을, DB로는 Mongo DB를 구축할 것이다.

개발을 위해서 먼저 Front 환경 구성했는데, 이는  
[Vercel을 통해 간단한 웹 호스팅 배포.]({% link _posts/2023/React/Next-js/2023-12-27-next-js-vercel-deploy.md%})  
를 통해 확인할 수 있다.