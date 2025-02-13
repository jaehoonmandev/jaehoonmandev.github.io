---
#layout: single
title:	"[Side Project]방명록 프로젝트 개발여정 - 프로젝트 끝, 이제 회고"
date:	2024-04-05 12:00:00
categories:
  - Side Project
tags:
  - 프로젝트
  - 방명록
comment: true
#published: false 
---

사이드 프로젝트를 끝냈다.

기획부터 시작해서 설계, 개발, 환경 설정, 개발, 배포... 뭐 모들 개발 사이클을 거쳤다 해도 꽤 시간을 많이 소모했다.

끝냈으면 진작에 끝날 것을 익숙하지 않은 기술을 익히느라 앓는 소리를 낸 탓도 있겠지만 무엇보다 게으름과 완벽주의자를 호소하는 성격이 아니었을까 싶다.

대충하진 않더라도 적당히 하고 넘어갔으면 됐을 텐데 미련했다.

뭐 정돈되지 않은 독백은 여기까지 하고 회고를 해보자


## 프로젝트 개요

진행한 프로젝트의 내용을 간략하게 소개하겠다.

- 내용 : 사용자 방문 시 방명록 조회, 등록, 수정, 삭제, 정렬, 검색할 수 있는 웹 애플리케이션.
- 수행 목적 : 웹 개발 역량 향상.  
- 인원 : 본인 1명.
- 기술 스택
  - Frontend : Next.js, TypeScript
  - Backend : Java, Spring Boot
  - Database : JPA, MongoDB
  - DevOps : Vercel, AWS, Git, GitHub Actions, Docker, Docker Compose
- 문서
![구조]({{ site.baseurl }}/assets/images/posts/2024/side-project/guest-book/documents.png)

- 링크
  - [Frontend GitHub Repository](https://github.com/jaehoonmandev/guest-book-nextjs)
  - [Backend GitHub Repository](https://github.com/jaehoonmandev/guest-book-spring-boot)
  - ~~[사이드 프로젝트 링크](https://guestbook.jaehoonman.site/)((비활성화)~~
  - [사이드 프로젝트 관련 포스트](/posts-category/#side-project)


## 회고
일단 회고라는 건 돌 회, 돌아볼 고 "回顧".  
즉, 지나온 과정을 돌아서 다시 생각해 보자는 의미다.

행동을 다시 돌아보는 이유는 아무래도 잘못된 점을 찾고 이를 고치는 데에 큰 의의가 있지 않을까 싶다.

자세한 내용은 나중에 다루기로 하고 프로젝트 동안에 있던 일, 태도, 행동 등을 다시 돌아보면서 더 나은 사람이 되어보자.


## KPT(Keep, Problem, Try)

회고 방법론인데 간단하게  
- Keep : 내가 무엇을 잘 했으며 계속해서 가져갈 장점
- Problem : 개선할 점
- Try : 개선하기 위해 어떤 것을 행할 것인지.  

로 정리하여 회고하는 방법이다.
### Keep
#### 1. 새로운 기술을 적용해 보려 한다.

> 모던 프로그래밍 기법을 적극적으로 활용하여 효율성을 올릴 수 있다.

이론만 알고 있었던 기술들을 실제로 활용 해보는 데ㄴ 사이드 프로젝트만한 것이 없다고 느끼게 되었고, 실제로 해당 기술들로 개발을 하면서 역량이 꽤 향상된 것 같았다.

가장 먼저 든 생각은 확실히 모던 프로그래밍 기법이 효율적이라는 것을 느꼈으며, 이전에 해왔던 주먹구구식 개발에서 조금씩 벗어 나고 있다는 것이 체감된다.

--- 

#### 2. 꾸준히 프로그래밍 관련 정보 취득, 메모하려 노력한다.
> 전문 지식 향상.

밖에서는 메모를 하진 않지만 레딧, 커리어리, 유튜브에서 프로그래밍 관련 지식을 뉴스 읽는 것처럼 얻고 있고,
작업하면서는 옵시디언과 같은 메모 애플리케이션에 기록한다.

나중에 어렴풋이 기억날 때 한 번씩 찾아보면 도움 되는 내용들이 많았다.

---

#### 3. 보안을 최소한이라도 신경 쓴다.
> 애플리케이션의 안정성을 높인다.

DB의 연결 정보, 사용자 입력 데이터를 암호화, HTTPS 프로토콜 사용, 포트 포워딩 제약 등.

애플리케이션 자체의 안정성이라던가 사용자의 민감 데이터를 좀 더 안전하게 다룰 수 있게 되었다.

---

#### 4. 주석을 작성한다.
> 유지 보수에 편의를 제공한다.

혼자 작업해도 가끔 헷갈리는 부분도 주석을 달아두면 기억 해내는데, 분석 해내는데 도움이 되었다.

다음부터는 /** */ 와 같은 문서화 주석을 적극적으로 활용하여 내가 보아도, 남들이 보아도 이해하기 쉽도록 작성해야겠다.

---

#### 5. 최적화 / 리팩토링을 고려한다.
> 효율적이고 성능 좋은 애플리케이션을 개발할 수 있다.

개인적으로 프로그래밍을 잘한다는 기준이지 않을까 싶다.
좋은 프로그램이라 하면 유지보수성이 좋고 가독성이 좋고, 안정성이 좋아야 한다.

이 프로젝트는 Front에 좀 더 치중하여 React의 useCallback, useEffect 등을 적극적으로 사용하여 렌더링 효율을 높이는데 신경을 썼다.

디자인 패턴 및 알고리즘 등 또한 활용하여 항상 주어진 리소스를 효율적으로 사용하기 위해 노력하자.

---

#### 6. 적극적인 디버깅.
> 개발 시간 단축 및 애플리케이션 안정성, 신뢰성 향상.

디버깅 능력이 부족했을 때, 오류를 찾는다고 로그를 찍고 다시 실행하는 등, 비효율적으로 오류를 찾았었다.

시간이 오래 걸렸을뿐더러 피로감이 높았지만,
디버그 능력을 향상 시키고나서부터 소스를 분석하는 능력도 올랐을뿐더러 이전보다 훨씬 쉽게 오류를 찾아내고 수정하며 애플리케이션의 안정성을 올릴 수 있었다.

---

#### 7. 영어 레퍼런스 참고.
> 문서 해독 능력 향상 및 개발 지식 습득.

레퍼런스 없이 개발하라는 건 사막에서 바늘 찾으라는 뜻이지 않을까?

못할 거야 없지만 상당히 고단할 것이다.

대한민국은 작다.

그만큼 레퍼런스가 적을 수 밖에 없다.

양이 많다고 질이 좋다는 뜻은 아니지만 질이 좋을 확률이 높아지며 한국에서 잘 사용하지 않는 기술을 터득할 수도 있지 않을까?

이왕이면 일부러 영어로 된 레퍼런스들을 번역하면서 레퍼런스 습득 능력을 기르고 있다.

수영장이 아닌 바다에서 수영하자.

---

#### 8. AI 활용.
> 개발 시간 단축과 피로도 감소.

LLM AI인 Gemini 를 활용해 봤을 때 완전 의존 하기에는 아직 무리지만 나름 똑똑한 비서를 둔 느낌이다.

프로젝트의 정보를 미리 알려주고 막히는 부분이 있을 때, 검색이 귀찮을 때.

정답에 근사한 힌트를 제공해 준다.

정확한 답변을 내놓고 감탄한 경우는 아직 없지만 좌회전해서 빨간 간판 찾으세요~ 수준의 의견을 제공해 주는 든든한 툴이다.

피로도가 줄고, 유용한 정보를 제공받으면서 개발한다면 좀 더 양질의 프로그램을 만들 수 있을 것이다.

여담으로 급격한 디지털 트랜스포메이션을 겪으며 Devin과 같은 AI 에이전트를 경계하면서도 AI에 대체될 개발자가 아니라 AI랑 같이 일하는 개발자가 되는 것도 나쁘지 않을 것 같다.

<br/>

### Problem
#### 1. 테스트 코드를 작성하지 않는다.
> 협업 시 검증되지 않은 코드를 공유할 수 있으며, 테스트에 드는 비용이 커진다.

기능 구현 시 경험과 감만으로 코드를 구현하고 디버그를 이용해서 오류를 찾으면서 개발한다.

테스트 코드를 작성하지 않는다면

- 검증되지 않은 코드 사용 가능성 증가
- 모듈화가 보장되지 않음.
- 테스트 비용 상승.
- 유지보수성 하락. 

등... 혼자 개발할 때는 큰 문제까지는 아닐지 몰라도 협업 시에는 환영 받는 역할은 아닐 것이다.

---

#### 2. 보안 관련 설정을 최소한만 한다.
> 보안 취약점은 인프라 안정성과 신뢰성을 떨어트린다.

공든 탑이 무너지랴.  
공든 탑도 무너지더랴...

기업에서 만든 철옹성 같을 곳도 무너지는 사례는 종종 보인다.

Log4j 사태, 롤드컵 DDoS 테러, 테슬라 카메라 해킹 등등...

기업 측에서도 트래픽을 제한한다던가, 방화벽을 설정한다던가, 인증/인가 설정을 하는 등 보안을 철저히 유지하려는데 기본 설정만 해둔 애플리케이션은 얼마나 취약하겠는가!

보안에는 부족함이 없다.

항상 경계해야 한다.

안정성이 떨어진다면 신뢰성이 떨어지고 결국 서비스를 사용하는 고객은 피해를 보고 기업 이미지는 좋지 않은 방향으로 흘러갈 것이다.

---

#### 3. 프로젝트 구조를 자주 바꾼다.
> 구조가 자주 바뀌면 개발 피로도가 높아지며 참조하고 있는 소스 간에 오류를 일으킬 수 있다.

위에서 말했던 [5. 최적화 / 리펙토링을 고려한다.] 의 요소는 자칫하면 프로젝트의 구조를 계속해서 바꾸는 요소가 될 수 있다.

디렉터리 구조에서부터 모듈 간의 결합성 등을 계속 생각하다 보니 구조를 자주 바꾸게 되었다.

기획과 설계 능력은 경험에서 오는 것이던가.

초기에 예상했던 구조들은 효율적이지 못한 구조였고 심지어는 구조에 관해서 자세히 문서를 작성하지도 않았었다...!

---

#### 4. 문서를 꼼꼼히 작성하지 않는다.
> 구조를 파악하기 힘들며, 설계대로 진행되지 않아 방향성을 잃기 쉽다.

문서를 작성하는 구조의 이해, 서비스 방향성 가이드, 중간 체크포인트 등.

프로젝트 전반에 걸쳐 중요한 역할을 수행한다.

이런 가이드라인이 없다면 럭비공처럼 이곳저곳 예상 못 하게 튀다가 언젠가부터 계획이라는 단어는 중요하지 않게 되면서, 방향성을 잃게 될 것이다.

---

#### 5. 해결되지 않는 문제에 과하게 몰두한다.
> 개발을 진행하는데 의욕을 떨어트릴 수 있으며 시간 낭비를 한다.

문제를 해결하기 위해 갖은 노력을 하다 보면 목표한 지점에 도달할 수도 있고 그 과정에서 역량도 길러지긴 한다.

하지만 과하게 풀리지 않는 문제를 가지고 휴식도 없이 맹목적으로 파고들다 보면 시야가 좁아진다.

뭐가 중요한지 먼저 생각하고 필요할 땐 최선책이 아닌 차선책을 고를 줄 알아야 한다.

이번 프로젝트에서는 보안성 증대를 위해 HashCorp 사의 Vault를 도입해 보려 했지만,

Docker Compose를 활용하여 AWS에 애플리케이션 배포 시 Vault의 컨테이너를 인식하지 못하는 문제 때문에 거의 일주일을 날렸다.

---

#### 6. Backend에 큰 노력을 쏟지 않았다.
> 다양한 비즈니스 로직에 대응하기 어려워진다.

이번 프로젝트의 목표가 사용해 보지 않은, 익숙하지 않은 기술들을 익히기 위해 수행했던 프로젝트라지만,

기능면에서는 큰 특징을 가지지 않아서 Backend 기능 구현에는 큰 비중을 두지 않았다.

실무에서 쓰일 다양한 상황에 맞는 비즈니스 로직을 구현하는데 어려움이 생길 것이다.

<br/>

### Try
#### 1. 협업을 한다.
여러 가지 단점을 고칠 수 있는 가장 기대되는 방법의 하나라 생각한다.

일단 팀이라는 건 일종의 약속을 하고 함께 같은 목표를 이뤄 나가는 집단이라 할 수 있겠다.

여기서 개인이 가지고 있어야 할 가장 큰 덕목은 책임감이다.

타인을 실망하게 하지 말아야 하며, 목표를 이뤄가는데 방해가 되지 않아야 한다.

이번 프로젝트로 느낀 단점과 어떤 이유로 개선되는지 살짝 적어 보자면

1. 시간 조절을 못한다.
- 프로젝트 기간을 정하여 작업 계획을 수립 할 수 있게 된다.
- 분업과 협업으로 시간 단축이 가능해진다.

2. 구조를 자주 변경한다
- 프로젝트의 정확한 구조 파악을 위해서 문서를 작성한다.
- 각자의 역할을 확실히 부여받고, 내용을 검토받으면서 잘못된 부분은 수정할 수 있다.

등 복합적으로 문제를 해결할 수 있을 것 같다.

Hola!와 같은 플랫폼에서 동료를 찾아봐야겠다.

---

#### 2. 단위 테스트, 통합 테스트를 진행한다.
이전처럼 감으로 개발을 진행하고 테스트를 진행하는 방식이 아닌,
테스트를 먼저하고 개발을 진행하는 Test-driven Development(TDD) 즉, 테스트 주도 개발 방법론이 있다.

테스트 케이스로 목표를 정하고, 목표에 맞는 결과를 도출해 내기 위해 코드를 작성한 뒤 이를 적용하는 과정을 반복하는 것이다.

목표에 맞는 코드를 작성하면서 설계한 구조에서 변경되지 않을 수 있으며,
모듈별로 테스트와 개발을 진행하면서 의존성은 낮추고, 결합성을 높이며 유지보수성 보장할 수 있다.

이전에 TDD 방법으로 개발을 안 해본 건 아니지만 솔직히 귀찮아서 안일하게 생각했었는데 중간에 그만뒀는데 뒤돌아보면 안 하고 겪는 문제들이 더 피곤했던 거 같다.

앞으로는 내가 가지고 있는 빈번한 구조 변경 및 부족한 모듈화, 낮은 유지보수성을 개선할 수 있도록 주도적인 테스트를 진행해야겠다.

---

#### 3. 꼼꼼한 문서 작성과 계획을 수립한다.
물렁물렁한 땅에 건물을 지으면 붕괴될 위험도 큰 것처럼, 기반을 잘 잡아야 무너지는 것도 없고 안정적인 상태를 유지할 수 있다.

어떤 기능을 가질 것인지, 어떤 화면 구성을 가져갈 것인지, 사용자의 동작에 따라 어떻게 Flow 할 것인지 등,
설계 문서는 개발을 진행하기 전 전체적인 디자인을 수립해 주고 개발을 진행할 때 올바른 방향으로 가고 있는지 알려주는 역할을 한다.

현대 사회에 와서 내비게이션 없이 목적지를 찾아가는 건 여간 어려운 일이 아니다.

내가 어디로 가야 할지, 어떤 걸 해야 할지를 정확하게 알아야지 탈 없이 목적지에 잘 도착할 수 있는 것이다.

개발도 똑같은 것이다.

어떤 것을 할지 어떻게 할지를 정해두고 개발한다면 지금 뭘 작업하는지, 잘못된 게 없는지, 얼만큼 진행되었는지 등을 파악할 수 있다.

모든 문서를 작성하진 않더라도 시스템 구성도, 시스템 흐름도, 인터페이스 정의서, 기능 명세서, 다이어그램 등 과같이 필수로 작성해야 하는 문서들은 작성하자.


## 마치며
결과를 보면 대단한 작업이 아니라고 생각할 수 있다.

사실 별거 없긴 한데 필자가 웹 개발자 역량 강화를 위해 주도적으로 수행한 첫 프로젝트이다.

이전까지는 사이드 프로젝트의 중요성을 몰랐는데 해보니 프로그래밍 의욕을 올리는 데 아주 큰 역할을 해줬다.

자칫하면 매너리즘에 빠질 수 있었던 나를 다시 잡아준 중요한 활동이었다.

계속해서 웹 개발자의 역량을 강화하는데 정진해야겠다.


