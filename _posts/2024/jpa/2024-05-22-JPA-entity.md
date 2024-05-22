---
#layout: single
title:	"[JPA] Entity 작성"
date:	2024-05-22 12:00:00
categories:
  - JPA
tags:
  - Java
  - Spring Boot
  - Hibernate
  - Entity
comment: true
#published: false 
---
JPA에서 Entity라 함은 테이블에 맵핑되는 비지니스 도메인 객체이다.

Entity를 통해 DB와 상호 작용을하게 되며 내부에 선언된 인스턴스들은 각 테이블의 Row에 대응되는 개념이다.

이전 포스트부터 따라왔다면 익숙한 Users Entity를 다시 보자.
``` java
@Entity  
@Data  
public class Users {  
  
    @Id  
    @GeneratedValue(strategy =  GenerationType.IDENTITY)  
    private long userId;  
  
    private String userName;  
  
}
```

간단한 예시지만  이해를 위해 하나씩 뜯어보자.
- `@Entity` : JPA가 관리하는 Entity라는 것을 알려준다.
- `@Data` : lombok 의 기능이며 getter/setter/consturctor 등 객체 핸들링에 필요한 설정을 자동으로 해준다.(필수 X)
- `class` : Entity 자체는 POJO로 작성하기 때문에  class로 선언된다.
- `@Id` :  Entity는 DB의 테이블인만큼 기본적으로 기본키를 가져야하기에 필수라 할 수 있다.(RDB 기준)
- `@GeneratedValue(strategy =  GenerationType.IDENTITY) ` : ID 값을 자동으로 생성해준다.

이처럼 기본적으로 위와 같은 구조를 가지게 되는데 순서대로 짚어보면서 자세히 알아보자.

## Entity Class 정의

고객센터에 고객과, 고객이 작성하는 문의 사항이 있다 가정했을 때
![Entity]({{ site.baseurl }}/assets/images/posts/2024/jpa/entity-example.png)
와 같은 ERD 구조를 가질 수 있을 것이다.

관계 설정은 일단 넘어가고 Member Entity를 먼저 작성해보자.

### 1. 클래스를 정의한다.
``` java
public class Member{
}
```

### 2. @Entity를 정의한다.
``` java
@Entity
public class Member{
}
```
Entity의 이름은 기본적으로 class의 이름을 기반으로 자동 설정되지만 `@Entity(name="student")`와 같이 Entity 이름을 정할 수 있다.

### 3. `@Id`를 포함한 필드를 정의한다.

JPA의 Entity는 ID를 필수로 가지고 있어야한다.

ID에 해당하는 필드에 `@Id`를 부여하고 추가로 기본키 값을 자동으로 생성해주는 `@GeneratedValue` 를 정의하자.

`@GeneratedValue`는 strategy 옵션으로 다양한 자동 생성값을 제공한다.

이에 대해 설명하자면
### Auto
- JPA 구현체가 DB에 적합한 기본 키 생성방식을 IDENTITY, SEQUENCE, TABLE 중에서 자동으로 선택.
- 가장 유연한 방식.
``` java
@Id
@GeneratedValue(strategy = GenerationType.AUTO)
private Long id;
```
Hibernate의 버전별로 전략이 달라질 수 있으니 너무 신용하지는 말자.
기존에는 IDENTITY의 전략을 가져갔지만, Hibernate 5에서부터는 TABLE 전략을 사용한다고한다.

### IDENTITY
- DB에게 키 생성 권한을 위임한다.
- AUTO_INCREMENT 등과 같은 기능을 사용한다.
- 주로 MySQL, PostgreSQL에서 사용.
- 먼저 DB가 기본 키 값을 자동으로 생성하고 이를 JPA가 가져와서 엔티티에 설정.
``` java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```
JPA보통 Persistance context에서 객체를 관리하여 commit이되는 시점에 쿼리문을 실행하여 쓰기 지연 저장소에 쌓인 쿼리문을 한 번에 DB로 전송하여 실행한다.

하지만 IDENTITY는 EntityManager.persist() 를 호출하여 객체를 Persistance화 하는 시점에 이전에 INSERT SQL를 실행하여 DB 식별자를 조회하고, 반환 받은 ID를 1차 캐시 엔티티에 등록하여 관리한다.

이런 과정을 거쳐야하는 이유는 키 생성을 DB에 위임하기에 JPA는 쿼리를 수행하는 시점에 DB에서 생성한 기본키를 모르고 있기 때문이다.

### SEQUENCE
- DB의 시퀀스를 사용하여 기본키 생성.
- 주로 Oracle, PostgreSQL에서 사용.
- `@SequenceGenerator`를 함께 사용하여 시퀀스 생성기를 정의.
``` java
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq")
@SequenceGenerator(name = "product_seq", sequenceName = "product_sequence", allocationSize = 1)
private Long id;
```
이 또한 IDENTITY와 같이 DB에서 기본키를 생성하기 때문에 EntityManager.persist()가 호출 되기 전에 `hibernate: call next value for [table]_PK_SEQ` 등과 같은 명령어를 실행하여 기본키를 가져온다.

하지만 계속해서 기본키를 조회하는 동작을 수행하면 성능 저하 이슈가 생길 수 있기에 allocationSize를 적절히 조절하여 성능을 신경써주자.

참고로 allocationSize는 한 시퀀스를 호출할 때 size만큼의 시퀀스를 할당한다는 의미이며 기본 값으로는 50이 할당되어있다.
### TABLE
- 키 값을 별도의 키 생성 테이블에서 관리할 때 사용.
- DB에 종속되지 않는 독립적인 방식으로 어떤 DB에서도 동일하게 작동한다.
- `@TableGenerator`를 함께 사용하여 키 생성 테이블을 정의.
``` java
@Id
@GeneratedValue(strategy = GenerationType.TABLE, generator = "product_table")
@TableGenerator(name = "product_table", table = "key_gen", pkColumnName = "gen_name", valueColumnName = "gen_value", pkColumnValue = "product_id", allocationSize = 1)
private Long id;
```
하지만 최적화 되어있지 않은 테이블을 사용하기에 성능을 보장할 수 없다.

이제 ERD로 작성하였던 Member의 필드들을 작성해보자.

``` java
@Entity  
@Data  
public class Member {  
  
    enum Gender{  
        Male,  
        FEMALE  
    }  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.SEQUENCE)  
    private Long id;  
    private String name;  
    private Integer age;  
    private Date birthDate;  
    private Gender gender;  
    
}
```

이정도만 작성해도 이용할 수 있지만 더욱 상세한 설정을 제공하니 계속 알아보자.

### 4. `@Table`

실직적으로 Mapping 되는 Table 명을 지정할 수 있다.

기본적으로는 Entity class와 같은 이름의 테이블을 자동으로 지정하는데, Entity의 클래스와 테이블명이 다를 수 있는 상황을 위해 직접 지정한다.

``` java
@Entity  
@Data
@Table(name="MEMBER", schema="고객")
public class Member {  
  
    enum Gender{  
        Male,  
        FEMALE  
    }  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.SEQUENCE)  
    private Long id;  
    private String name;  
    private Integer age;  
    private Date birthDate;  
    private Gender gender;  
    
}
```

`@Table(name="MEMBER", schema="고객")` 부분을 클래스 단위로 설정하면된다.

name 옵션은 Mapping할 Table의 이름을 정의하고, schema는 도메인과 같은 그룹으로 나눴을 때 이를 구분하기 위해 사용한다.

### 5. `@Column`

테이블에 있는 컬럼을 직접적으로 표현할 수 있다

``` java
@Entity  
@Data  
@Table(name="MEMBER", schema="고객")  
public class Member {  
  
    enum Gender{  
        Male,  
        FEMALE  
    }  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.SEQUENCE)  
    private Long id;  
  
    @Column(name = "MEMBER_NAME", length = 20, nullable = false, unique = false)  
    private String name;  
  
	private Integer age;  
    private Date birthDate;  
    private Gender gender;  
}
```

`@Column(name = "MEMBER_NAME", length = 20, nullable = false, unique = false)`로 직접 Table Column에 Mapping할 수 있으며 length, nullable, unique, updateable, insertable 등을 설정할 수 있다.

설정하지 않을 시 Entity class 에 설정된 필드의 이름과 같은 column을 맵핑하게된다.

참고로 DB에서 member_name 으로 snake case 설정되었다면 JPA에서는 memberName으로 camel case를 사용하여 표현해야한다.

### 6. `@Transient`

필드를 영속화 하고 싶지 않을 때 사용하는 옵션이다.

설정된 필드는 Table의 column에 Mapping 되지 않으며 DB의 상호작용에서 이 필드를 무시하게된다.

즉, DB에 저장하고 싶지 않은 경우에 사용하며, 테이블에 정의되지 않은 필드라도 사용 가능하게 해준다.

우리가 정의한 필드 중 `age`필드는 `birth_date`를 기반으로 계산하여 값을 넣는다고 가정 했을 때

``` java
@Entity  
@Data  
@Table(name="MEMBER", schema="고객")  
public class Member {  
  
    enum Gender{  
        Male,  
        FEMALE  
    }  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.SEQUENCE)  
    private Long id;  
  
    @Column(name = "MEMBER_NAME", length = 20, nullable = false, unique = false,)  
    private String name;  
      
    @Transient  
    private Integer age;  
    private Date birthDate;  
    private Gender gender;  
}
```

와 같이 정의할 수 있겠다.

### 7. `@Temporal`

시간 데이터 타입을 정의할 때 사용한다.

``` java
@Entity  
@Data  
@Table(name="MEMBER", schema="고객")  
public class Member {  
  
    enum Gender{  
        Male,  
        FEMALE  
    }  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.SEQUENCE)  
    private Long id;  
  
    @Column(name = "MEMBER_NAME", length = 20, nullable = false, unique = false,)  
    private String name;  
  
    @Transient  
    private Integer age;  
      
    @Temporal(TemporalType.DATE)  
    private Date birthDate;  
      
    private Gender gender;  
}
```

TemporalType에는 DATE, TIME, TIMESTAMP의 타입을 지원한다.

Java 8 이상부터는 java.time 패키지의 LocalDate, LocalTime, LocalDateTime의 클래스를 사용하여 날짜와 시간을 처리하는 것이 권장된다.

`@Temporal` Annotaion이 없어도 JPA가 자동으로 적절한 DB 타입과 Mapping 시켜준다.

### 8. `@Enumerated`

Java의 enum type을 영속화하고 싶을 때 설정할 수 있는 옵션이다.

아까부터 계속 따라다니는
``` java
enum Gender{  
    Male,  
    FEMALE  
}
```
를 필드에 Mapping 할 것이다.

``` java
@Entity  
@Data  
@Table(name="MEMBER", schema="고객")  
public class Member {  
  
    enum Gender{  
        Male,  
        FEMALE  
    }  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.SEQUENCE)  
    private Long id;  
  
    @Column(name = "MEMBER_NAME", length = 20, nullable = false, unique = false,)  
    private String name;  
  
    @Transient  
    private Integer age;  
  
    @Temporal(TemporalType.DATE)  
    private Date birthDate;  
  
    @Enumerated(EnumType.STRING)  
    private Gender gender;  
}
```

`@Enumerated(EnumType.STRING)`로 설정해줬는데 EnumType에는 ORDINAL, STRING이 있다.

ORDINAL이 기본값이며 이때는 저장되는 데이터가 enum의 순서 값이 저장된다.

MALE == 0, FEMALE == 1

즉, FEMALE로 값을 주었다면 1이 DB에 저장된다.

반면 STRING은 MALE, FEMALE의 String 값이 그대로 들어간다.

ORDINAL은 순서가 변경됐을 때 문제가 생길 수 있지만 저장 공간을 절약할 수 있고, String은 데이터 변경 시에 일관성을 유지할 수 있게된다.

이제 ERD에서 정의한대로 Entity를 다시 작성해보자.

``` java
@Entity  
@Data  
@Table(name="MEMBER", schema="고객")  
public class Member {  
  
    enum Gender{  
        Male,  
        FEMALE  
    }  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.SEQUENCE)  
    private Long id;  
  
    @Column(name = "MEMBER_NAME", length = 20, nullable = false, unique = false,)  
    private String name;  
  
    @Transient  
    private Integer age;  
  
    @Temporal(TemporalType.DATE)  
    private Date birthDate;  
  
    @Column(length = 10)  
    @Enumerated(EnumType.STRING)  
    private Gender gender;  
}

------------------------------------

@Entity  
@Data  
@Table(name = "POSTS", schema="문의 사항")  
public class Posts {  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.SEQUENCE)  
    private Long id;  
  
    @Column(length = 40)  
    private String title;  
  
    @Column(length = 200)  
    private String content;  
  
    @Temporal(TemporalType.DATE)  
    private Date reg_date;  
  
    private Long memberId;  
  
}
```

여기까지 Entity를 작성하는 방법에 대해 알아보았다.

하지만 ERD에서 정의된 관계 형성이 되지 않았다.

이를 위해서 다음은 연관 관계를 설정하는 방법에 대해 알아보겠다.


<br/>


Ref.

[https://velog.io/@gudnr1451/GeneratedValue-%EC%A0%95%EB%A6%AC](https://velog.io/@gudnr1451/GeneratedValue-%EC%A0%95%EB%A6%AC)

[https://devcamus.tistory.com/16](https://devcamus.tistory.com/16)

[https://www.baeldung.com/jpa-entities](https://www.baeldung.com/jpa-entities)