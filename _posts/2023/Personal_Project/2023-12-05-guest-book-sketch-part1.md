---
#layout: single
title:	"[Personal Project] 방명록 토이프로젝트 개발여정. (part.1)"
date:	2023-12-05 12:00:00
categories:
  - 개인프로젝트
tags:
  - 프로젝트
  - 토이프로젝트
  - 방명록
comment: true
#published: true 
---
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

- Nginx Web Server
  - 정적 리소스를 제공함으로써 WAS의 부하를 줄여줄 수 있고, 엑세스 제한, SSL/TLS 암호화 등 보안 강화 등
  여러 이점을 가져오기 위해 Nginx 웹 서버를 통해 포워딩할 예정이다.   

- Docker Container / Docker Compose 활용
  - 레거시한 Monolithic 개발  환경에서 벗어날 필요성을 느끼며 MSA, 공통된 개발 환경 구성 등을 경험해보고 싶었다.
  또한 간단하고 안정적이게 통합 개발 환경을 구축할 수 있는 Docker Compose를 사용할 예정이다.

# 와이어프레임
![방명록 와이어프레임]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest_book_wireframe.png)

# 레이아웃 구성
- 메인 페이지
  - 방명록 카드 노출, 생성, 수정, 삭제, 검색의 기능을 트리거.  
  
  ![방명록 메인페이지 레이아웃]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest_book_layout_mainpage.png)

- 방명록 카드

  ![Untitled]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest_book_layout_cards.png)

- 방명록 카드 추가/수정 Modal
  - 노출시킬 방명록 컨텐츠를 등록/수정할 수 있는 UI.
  - 방명록 카드 추가 UI
    - 제목, 내용, 작성자, 인증 코드, 카드 색상 설정을 할 수 있다.
  - 빙명록 카드 내용 변경 Modal
    - 등록한 컨텐츠 내용을 수정 할 수 있다.
    - 작성자와 인증 코드는 변경이 불가능하다.  

  ![Untitled]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest_book_layout_modal.png)

- 등록/삭제/수정 시 confirm 확인창과 수정/삭제 시 인증코드 입력창
  ![Untitled]({{ site.baseurl }}/assets/images/posts/2023/Personal_Project/guest_book_layout_confirms.png)