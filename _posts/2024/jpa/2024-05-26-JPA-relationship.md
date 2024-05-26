---
#layout: single
title:	"[JPA] 관계 설정"
date:	2024-05-26 12:00:00
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
고객 센터에 고객이 상담 게시물을 작성하는 상황이라 했을 때, 고객은 여러개의 상담 게시물을 작성할 수 있게된다.

흔히 1:N이라고 표현하는 관계다.

![Entity]({{ site.baseurl }}/assets/images/posts/2024/jpa/entity-example.png)

ERD를 구성했을 때는 이와 같을 것이다.

Member의 PK와 Posts의 memter_id가 연관되는 관계로 보통 JOIN on Primary Key = Foreign Key 와 같이 표현하는 부분이다.

하지만 JPA에서는 직접적으로 쿼리를 작성하지 않고 Query Method 방식으로 표현할 방법이 필요하게된다.

### 방향
DB는 FK만으로도 2개의 테이블 JOIN이 가능하기에 따로 방향성이라는게 없지만 JPA는 객체를 기준으로 다른 객체를 참조하기에 방향성이 성립된다.

단방향은 한 엔티티에서는 다른 엔티티를 참조하지만 참조 받는 엔티티는 참조를 하지 않는 관계를 얘기한다.

양방향 관계는 엔티티가 서로 참조를 하고 있는 관계를 의미한다.

### 연간 관계의 주인
단뱡향 맵핑 씨에는 참조를 하나만 사용하기에 참조를 위한 필드를 기준으로 외래키를 관리하면되지만,
양방향 관계에서는 서로를 참조하지만 참조되는 외래키는 한 쪽만 가지고 있을 것이다.

즉, Member->Posts, Posts->Member인 관계를 의미한다.

이런 관계에서 둘 중 한 엔티티가 외래키를 등록, 수정, 삭제하는 책임을 가져야한다.

외래키를 관리 하는 엔티티가 주인(Owner)이고, 주인이 아닌(non-owner) 엔티티는 조회만 가능하게된다.

주인을 설정해야하는 이유는 Member에서 Posts를 수정할 때 FK를 수정해야할지, Posts에서 Member를 수정할 때 FK를 수정해야할지 JPA 입장에서는 모르기 때문이다.

주인을 설정하는 기준은
- 외래키가 있는 곳이 주인.
- 주인은 `@JoinColumn`으로 외래키 컬럼을 맵핑.
- 주인은 `mappedBy`를 사용하지 않음
- 주인이 아니라면 `mappedBy`를 통해 주인을 인식.

주인이라는 표현 때문에 오해할 수 있지만 연관 관계에서의 주인은 DB 테이블 연관 관계에서의 부모 요소가 아니다.

### JPA에서 관계 설정.

관계 설정에는 `@OneToOne` ,`@OneToMany`, `@ManyToOne`, `@ManyToMany` 가 사용된다.

일단 ERD로 제시한대로 엔티티 클래스를 작성하고, 이를 토대로 예시를 들어보겠다.

``` java
@Entity  
@Data  
@Table(name="MEMBER", schema="고객")  
public class Member {  
  
    public enum Gender{  
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
    private Date regDate;  
  
    private Long memberId;  
  
}
```

DB라면 Key 값만 있어도 되지만 JPA는 객체 기준이기에 서로 연관을 맺기 위해서 참조하려는 객체 정보를 가지고 있어야한다.

``` java
@Entity  
@Data  
@Table(name="MEMBER", schema="고객")  
public class Member {  
  
    public enum Gender{  
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
```

를 기준으로 Posts 엔티티 접근이 필요하다면 필드에 `private Posts post;`가 필요할 것이고,

``` java
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
    private Date regDate;  
  
    private Long memberId;  
  
}
```

를 기준으로 Member에 대한 접근이 필요하면 필드에 `private Member memberId;`가 필요할 것이다.

` private Long memberId;`는 대체되어야할 대상이다.



이제 관계 설정의 설명을 보자.

#### `@OneToOne`
한 엔테티가 다른 엔티티와 1:1 관계를 맺을 떄 사용한다.

``` java

@Entity
@Data
@Table(name="MEMBER", schema="고객")
public class Member {

    public enum Gender{
        Male,
        FEMALE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(name = "MEMBER_NAME", length = 20, nullable = false)
    private String name;

    @Transient
    private Integer age;

    @Temporal(TemporalType.DATE)
    private Date birthDate;

    @Column(length = 10)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @OneToOne(mappedBy = "member")
    private Posts post;
}

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
    private Date regDate;

    @OneToOne
    @JoinColumn(name = "member_id")
    private Member member;
}
```

주인 관계에서 설명했듯이 외래키를 가진 엔티티의 필드가 주인이된다.

위의 예제는 양방향 1:1일 때 예시이고 단방향일 때는 둘 중 한 엔티티에서 참조하는 필드를 제거해야한다.

#### `@OneToMany` / `@ManyToOne`

1:N, N:1 관계를 정의할 때 사용한다.

두 개의 Annotaion은 서로 단어 위치만 다른데 이는 양방향 관계일 때 서로 교차하여 표시할 때 사용된다.

고객은 여러개의 상담 문의 게시물을 남길 수 있다 했는데,
이는 고객이 1, 게시물이 N이 되는 관계가 성립된다.

``` java
@Entity
@Data
@Table(name="MEMBER", schema="고객")
public class Member {

    public enum Gender{
        Male,
        FEMALE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(name = "MEMBER_NAME", length = 20, nullable = false)
    private String name;

    @Transient
    private Integer age;

    @Temporal(TemporalType.DATE)
    private Date birthDate;

    @Column(length = 10)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @OneToMany(mappedBy = "member")
    private List<Posts> posts;
}

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
    private Date regDate;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;
}

```

이 역시 `mappedBy`, `@JoinColumn`의 owner 관계를 설정해주자.
#### 
#### `@ManyToMany`
관계 설정 시 두 객체 사이에 자동 생성된 중간 테이블로 사용자가 의도한대로 쿼리가 동작되지 않을 수 있고, 쿼리의 복잡성을 높이기에 실무에서는 사용하지 않는 것을 권장한다.

``` java
@Entity
@Data
@Table(name="MEMBER", schema="고객")
public class Member {

    public enum Gender{
        Male,
        FEMALE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(name = "MEMBER_NAME", length = 20, nullable = false)
    private String name;

    @Transient
    private Integer age;

    @Temporal(TemporalType.DATE)
    private Date birthDate;

    @Column(length = 10)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @ManyToMany 
    @JoinTable( name = "POST_GROUP", 
    joinColumns = @JoinColumn(name = "member_id"), 
    inverseJoinColumns = @JoinColumn(name = "post_id"))
    private List<Posts> posts;
}

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
    private Date regDate;

	@ManyToMany(mappedBy = "posts") 
	private List<Member> members;
}

```
`joinColumns`와 `inverseJoinColumns` 를 통해 중간 테이블의 외래키를 설정해준다.


다음엔 JPA N+1 문제와 페이징을 위한 방법을 알아보자.

<br/>


Ref.

[https://jeong-pro.tistory.com/231](https://jeong-pro.tistory.com/231)

[https://velog.io/@leeeeeyeon/JPA-%EC%97%B0%EA%B4%80-%EA%B4%80%EA%B3%84-%EC%A0%95%EB%A6%AC](https://velog.io/@leeeeeyeon/JPA-%EC%97%B0%EA%B4%80-%EA%B4%80%EA%B3%84-%EC%A0%95%EB%A6%AC)