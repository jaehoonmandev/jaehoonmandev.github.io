---
#layout: single
title:	"[Side Project] 방명록 프로젝트 개발여정 - 설계"
date:	2023-12-08 12:00:00
categories:
  - Side Project
tags:
  - 프로젝트
  - 방명록
comment: true
#published: false 
---
이전 포스트에서 기획서, 와이어프레임 + 레이아웃 구성을 작성했었다.

이번에는 기획 단계를 마무리하기 위한 기능 명세서, 유스케이스, ERD를 작성해보겠다.

# 기능 명세서
![guest_book_functions.png]({{ site.baseurl }}/assets/images/posts/2023/side-project/guest-book/guest_book_functions.png)

기능은 간단하게
- 컨텐츠 노출
- 컨텐츠 작성
- 컨텐츠 수정과 삭제를 위한 인증

의 3단계로 분류할 수 있을 것 같다.

# 유스케이스
![guest_book_functions.png]({{ site.baseurl }}/assets/images/posts/2023/side-project/guest-book/방명록유스케이스.png)

액터는 방문자와 시스템으로 구분하였다.  
방문자는 방명록 조회와 관리를 할 수 있다.  
검색과 정렬로 방명록 조회를 상세히 다룰 수 있다.  
추상적인 검색과 정렬은 작성자 기준 검색, 날짜/제목/작성자로 정렬하는 것으로 구체적인 일반화 관계를 가지고 있다.  

방명록 관리는 등록/삭제/수정으로 구체적인 동작을 정의하고,
삭제/수정은 작성자만 가능할 수 있도록 시스템의 인증과정을 필요로한다.


# 데이터 모델 구조.

[Entity]
![Untitled]({{ site.baseurl }}/assets/images/posts/2023/Database/NoSQL_Data_Modeling/entity.png)

[Query Result Design]
![Untitled]({{ site.baseurl }}/assets/images/posts/2023/Database/NoSQL_Data_Modeling/query_result.png)

![Untitled]({{ site.baseurl }}/assets/images/posts/2023/Database/NoSQL_Data_Modeling/query_result_combine.png)

모듈 따위로 뺄 수 있을 정도로 단순한 프로젝트다보니 별거 없다.  
오죽하면 너무 단순해 일부러 테이블을 분리하는 구조로 설계했다.

가뜩이나 NoSQL로 설계해보는 것은 처음이라 이게 맞는지도 모르겠다...

자세한 사항은 [NoSQL 기반 데이터 모델]({% link _posts/2023/Database/2023-12-14-NoSQL-Data-Modeling.md%}) 을 참고 해주길 바란다.

<br>

제대로 다루지 않은 기술들로 설계부터 시작하자니 공부할 것도 많다...  
설계는 이정도로 해두고 다음은 환경 설정을 다루지 않을까 싶다.