---
#layout: single
title:	"[Personal Project] 방명록 토이프로젝트 개발여정. (part.2)"
date:	2023-12-08 12:00:00
categories:
  - blog
tags:
  - Personal Project
comment: true
published: false 
---
이전 포스트에서 기획서, 와이어프레임 + 페이지 구성을 작성했었다.

이번에는 기획 단계를 마무리하기 위한 기능 명세서, 유스케이스, 플로우 차트, ERD를 작성해보겠다.

# 기능 명세서

# 유스케이스



풀스택 웹 애플리케이션을 연습하기 위해 간단한 토이 프로젝트들을 구상하고있다.

첫 번째 토이 프로젝트는 방명록을 남길 수 있는 간단한 웹 애플리케이션을 만들 예정이다.

높은 퍼포먼스를 낼 수 있는 개발자로 성장하는데 프로그래밍 역량뿐만 아닌 기획에서부터 유지보수까지,
소프트웨어 개발의 모든 단계를 스스로 경험하여 역량 강화를 해보고 싶었다.

많이 부족하겠지만 피드백과 경험으로 점진적으로 T자형 개발 인재로 성장해보겠다.


# 프로젝트 기획서
![방명록 기획서]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest_book_planning.png)

풀스택 구조를 설명하자면
- Java / Spring Boot 를 기반으로한 Backend API.
  - Spring Framework 를 이용하여 애플리케이션을 구성한 경험은 있었지만 Spring Boot의 security, Actuator, batch 등의 기술을 상세하게 다뤄보진 못하여
    이번 기회에 심화 단계로 파고들 예정이다.
  
- Next.js(React.js), TypeScript 를 기반으로한 Frontend SPA.
  - Front를 구성했던 경험은 Vanilla JS, jQuery 밖에 없었기에 
  React.js, Next.js, TypeScript를 이용해 SPA 을 구성해보고 싶었다.

- MongoDB NoSQL
  - RDBMS 만을 사용해왔지만 수평적 확장에 용이한 NoSQL을 경험해보고 싶어 MongoDB로 DB를 구축할 계획이다.
  
- AWS와 Vercel을 이용한 백엔드/프론트엔드 클라우드 구성
  - AWS의 기능을 제대로 활용해보지 못한 것 같아 학습겸 AWS 클라우드를 활용할 예정이며, 
  Next.js의 개발사이기도한 Vercel의 Git Repository 연동 배포 사이트를 활용할 예정이다.

- Docker Container 활용
  - 레거시한 Monolithic 개발 환경에서 벗어날 필요성을 느끼며 MSA, 공통된 개발 환경 구성 등을 경험해보고 싶었다.

# 와이어프레임
![방명록 와이어프레임]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest_book_wireframe.png)

# 페이지 구성
간단한 토이 프로젝트이기에 페이지 구성은 메인 페이지 한 곳에서 모든 액션을 취할 예정이다.

- 메인 페이지 : 방명록 카드 노출, 생성, 수정, 삭제, 검색의 기능을 수행.
