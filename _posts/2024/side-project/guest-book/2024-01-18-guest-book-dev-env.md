---
#layout: single
title:	"[Side Project]방명록 프로젝트 개발여정 - 개발 환경"
date:	2024-01-18 12:00:00
categories:
  - Side Project
tags:
  - 프로젝트
  - 방명록
comment: true
#published: false 
---
방명록 프로젝트는 대략적으로 아래의 구조를 가지고 있다.

![구조]({{ site.baseurl }}/assets/images/posts/2023/side-project/guest-book/structure.png)

Front와 back을 서로 다른 클라우드 플랫폼을 통해 제공할 예정이다.

Front 배포를 위해 Vercel을 택했는데, 서버리스 플랫폼이기에 Next.js는 Docker를 지원하지 않는다.

그리하여 로컬에서 개발환경을 구성하여 Git Repository로 Push하여 Vercel과 연동하는 방법으로 배포할 것이다.

Back 배포는 AWS의 클라우드를 이용할 예정인데 컨테이너화한 Spring Boot REST API, DB로는 Mongo DB를 연동할 것이다.

개발을 위해서 먼저 Front 환경 구성했는데, 이는  
[Vercel을 통해 간단한 웹 호스팅 배포.]({% link _posts/2023/React/Next-js/2023-12-27-next-js-vercel-deploy.md%})  
를 통해 확인할 수 있다.

백엔드는 Spring Boot + MongoDB를 Docker Compose를 통해 설정하였다.
관련 내용은 
- [Docker Compose로 Spring Boot + MongoDB 구성 part.1]({% link _posts/2024/composed_settings/2024-01-09-spring-boot-mongoDB-docker-1.md%})
- [Docker Compose로 Spring Boot + MongoDB 구성 part.2]({% link _posts/2024/composed_settings/2024-01-17-spring-boot-mongoDB-docker-2.md%})

를 확인해보자.

개발 단게에서는 바로 바로 기술 관련 내용을 공유하기 힘들 수 있으니,  
작업을 하면서 막히는 부분이 있으면 메모 해두었다가 프로젝트가 끝나면 공유해보겠다.

모두 무사히 하길 바란다.

이상.

