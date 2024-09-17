---
#layout: single
title:	"[JPA] Query를 정의하는 방법"
date:	2024-05-21 12:00:00
categories:
  - JPA
tags:
  - Java
  - Spring Boot
  - Hibernate
  - Query Method
comment: true
#published: false 
---
먼저   
[https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)   
를 기반으로 작성하였기에 볼륨이 꽤 크다.


JPA는 크게 2가지의 조회 방법을 제공한다.

- 메서드 이름으로 직접 쿼리를 파생.
- 수동으로 쿼리 작성.

JPA 기본적으로 메서드명에서 쿼리를 파생하지만 Method Parser 가 지원하지 않는 키워드가 있다거나, 메서드명이 너무 길어져서 못생겨지는 경우도 있을 수 있다.

이때는 직접 쿼리를 작성할 수도 있게 지원한다.

그럼 이제 쿼리를 생성하는 방법들에 대해 알아보자.

## Query Method

Query Method는 메서드명을 기반으로 쿼리를 생성하는 개념을 의미한다.

Repository와 객체의 기준이 되는 Entity를 정의하는 것만으로 DB의 CRUD 작업이나 복잡한 쿼리를 쉽게 생성할 수 있게 도와준다.

먼저 아래와 같이 Entity가 정의 되었다고 가정하자
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

Query Method는 JPA의 규칙에 맞게 메서드명을 작성하면 JPA가 자동으로 이를 분석하여 JPQL(Java Persistence Query Language)의 쿼리문으로 변환 시켜 실행한다.

JPQL은 SQL을 추상화 했기에 특정 DB에 의존하지 않는 장점을 가지고 있다.

하지만 JPQL도 결국 연동한 DB에 맞게 SQL로 변환이된다.

일단 밑에서 작성하는 코드를 보자.
``` java
@Repository  
public interface UserRepository extends JpaRepository<User, Long> {  
    List<Users> findByUserNameContains(String userName);
}
```

``` java
List<Users> findFirstByUserNameLike(String userName);  
```
이 부분을 요소별로 해석해보자면
- `List<Users>` : 사용자가 정의한 User 객체를 여러개 담기 위해 List Collection 사용
- `find` : 찾는다
- `By` : ~를 이용하여
- `UserName` : userName을 이용하여
- `Contains` : ~를 포함했을 때
- `(String userName)` : Parameter로 주어진 userName
  와 같고 해석한 요소들은
  "Parameter로 주어진 userName을 포함한 값을 가진 User의 값을 찾아서 List 자료 구조에 담는다."

쿼리문이라면
``` sql
SELECT * FROM users WHERE userName LIKE '%?%'
```
이정도 될 것이다.

실제로 수행되는 쿼리문은
``` sql
select
        u1_0.user_id,
        u1_0.user_name 
    from
        users u1_0 
    where
        u1_0.user_name like ? escape '\'
```
와 같을 것이다.

참고로 table의 alias 를 붙여 사용하는 이유는 명확성과 가독성을 향상 시키고, 특정 상황에서 쿼리 성능을 향상 시킬 수도 있는 등 여러가지 이유로 표준과 같이 사용되고 있다.

이처럼 정해진 키워드와 규칙 조합하여 문자로만 원하는 데이터베이스 동작을 수행하도록 변환해준다.

그렇다면 작성하는 방법을 알아보자.


### Query Method - 작성법
Spring Data JPA의 `JpaRepository<T, ID>`의 인터페이스를 extends 한다면 기본적으로
- save
- find, findAll
- exists
- delete
- count
- update

등의 기능이 정의되어있다.

Query Method는

"동작" + "옵션" + "조건 + 기준" + "정렬 + 기준"

의 형식으로 작성된다.

"동작"은 필수로 포함되고 상황에 따라 옵션과 조건 등을 설정하면된다.

지원하는 키워드는 아래와 같다.

| 키워드                    | 샘플                                                            | JPQL 실행문                                                           |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `Distinct`             | `findDistinctByLastnameAndFirstname`                          | `select distinct …​ where x.lastname = ?1 and x.firstname = ?2`    |
| `And`                  | `findByLastnameAndFirstname`                                  | `… where x.lastname = ?1 and x.firstname = ?2`                     |
| `Or`                   | `findByLastnameOrFirstname`                                   | `… where x.lastname = ?1 or x.firstname = ?2`                      |
| `Is`, `Equals`         | `findByFirstname`,`findByFirstnameIs`,`findByFirstnameEquals` | `… where x.firstname = ?1`                                         |
| `Between`              | `findByStartDateBetween`                                      | `… where x.startDate between ?1 and ?2`                            |
| `LessThan`             | `findByAgeLessThan`                                           | `… where x.age < ?1`                                               |
| `LessThanEqual`        | `findByAgeLessThanEqual`                                      | `… where x.age <= ?1`                                              |
| `GreaterThan`          | `findByAgeGreaterThan`                                        | `… where x.age > ?1`                                               |
| `GreaterThanEqual`     | `findByAgeGreaterThanEqual`                                   | `… where x.age >= ?1`                                              |
| `After`                | `findByStartDateAfter`                                        | `… where x.startDate > ?1`                                         |
| `Before`               | `findByStartDateBefore`                                       | `… where x.startDate < ?1`                                         |
| `IsNull`, `Null`       | `findByAge(Is)Null`                                           | `… where x.age is null`                                            |
| `IsNotNull`, `NotNull` | `findByAge(Is)NotNull`                                        | `… where x.age not null`                                           |
| `Like`                 | `findByFirstnameLike`                                         | `… where x.firstname like ?1`                                      |
| `NotLike`              | `findByFirstnameNotLike`                                      | `… where x.firstname not like ?1`                                  |
| `StartingWith`         | `findByFirstnameStartingWith`                                 | `… where x.firstname like ?1` (parameter bound with appended `%`)  |
| `EndingWith`           | `findByFirstnameEndingWith`                                   | `… where x.firstname like ?1` (parameter bound with prepended `%`) |
| `Containing`           | `findByFirstnameContaining`                                   | `… where x.firstname like ?1` (parameter bound wrapped in `%`)     |
| `OrderBy`              | `findByAgeOrderByLastnameDesc`                                | `… where x.age = ?1 order by x.lastname desc`                      |
| `Not`                  | `findByLastnameNot`                                           | `… where x.lastname <> ?1`                                         |
| `In`                   | `findByAgeIn(Collection<Age> ages)`                           | `… where x.age in ?1`                                              |
| `NotIn`                | `findByAgeNotIn(Collection<Age> ages)`                        | `… where x.age not in ?1`                                          |
| `True`                 | `findByActiveTrue()`                                          | `… where x.active = true`                                          |
| `False`                | `findByActiveFalse()`                                         | `… where x.active = false`                                         |
| `IgnoreCase`           | `findByFirstnameIgnoreCase`                                   | `… where UPPER(x.firstname) = UPPER(?1)`                           |

https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html

에 있는 것을 그대로 가져왔다.

쿼리문을 작성해본 사람이라면 키워드만 보고 어느정도 감이 잡힐 것이다.

눈 여겨 볼 부분은
`Is`, `Equals` 와 같이 `=` 에 대응 되는 키워드라던가,
`LessThan`, `LessThanEqual`, `GreaterThan`, `GreaterThanEqual`, `After`, `Before` 에 대응되는 `<, <=, >, >=` 등과 같이 기호로 된 부분과 매핑되는 키워드,
`StartingWith`, `EndingWith`, `Containing`, `IgnoreCase` 와 같은 규칙이 있는 키워드지 않을까 싶다.


## @Named Query
name과 이에 맵핑되는 쿼리를 작성하고 name에 해당하는 Named Query를 호출하면 작성한 Query가 실행된다.

설정 방법으로는 XML와 `@NamedQuery`가 있는데 Annotaion으로 작성하는 방법을 소개하겠다.

먼저 Entity 객체에 `@NamedQuery` Annotaion을 클래스 단위로 정의해주자.
``` java
@Entity  
@Data  
@NamedQuery(name = "Users.findByUserName", query = "select u.userId from Users u where u.userName = :userName")
public class Users {  
  
    @Id  
    @GeneratedValue(strategy =  GenerationType.IDENTITY)  
    private long userId;  
  
    private String userName;  
  
}
```

name으로 충돌 방지를 위해 `클래스명.메서드명` 와 같은 형식으로 정의해주고 이와 맵핑되는 query를 작성해주자.

기본으로 생성되는 쿼리문이 아닌 사용자 정의 쿼리라는 것을 구분하기위해 ID값만 가져오기로 한다.

Parameter로 줄때는  `:userName`와 같이 `:`를 활용하자.

호출은 EntityManager를 통해 createNamedQuery 메서드를 활용한다.

``` java
@DataJpaTest  
@Slf4j  
class JpaTest {

	@Autowired  
	UsersRepository usersRepository;
	
	@PersistenceContext  
	private EntityManager entityManager;  
	
	@BeforeEach  
	void insertTestData() {  
	  
	    // 사용자 정의 객체 Users를 인스턴스화, set 하여 save한다.  
	    Users user = new Users();  
	    user.setUserName("jaehoonman");  
	    usersRepository.save(user);  
	  
	    user = new Users();  
	    user.setUserName("jaehoonwoman");  
	    usersRepository.save(user);
    }
	  
	@Test  
	void findByUserNameTest() {  
	  
	    List<Users> query = 
	                entityManager.createNamedQuery("Users.findByUserName", Users.class)  
	                .setParameter("userName", "jaehoon")  
	                .getResultList();  
	  
	    log.info(query.toString());  
	}
}
```

이와 같이 테스트 코드를 작성하면 INSERT 이후
``` 
Hibernate: 
    select
        u1_0.user_id 
    from
        users u1_0 
    where
        u1_0.user_name=?
```
의 동작을 수행하고 `@BeforeEach`에서 첫 번쨰로 넣어준 `[1]`의 결과가 나오게된다.

Named Query를 여러게 넣고 싶다면
``` java
@NamedQueries(  
        @NamedQuery(name = "Users.findByUserName", query = "select u.userId from Users u where u.userName = :userName"),
        @NamedQuery(...),
        @NamedQuery(...)
)
```
와 같이 `@NamedQueries`안에 `@NamedQuery`를 정의하면된다.

쿼리문이 짧다면 충돌 방지와 함께 사용해 볼 만하지만 복잡한 쿼리문은 부적합하다.

## @Query


### 기본 사용
Repository에 정의되는 메서드에 `@Query` annotaion으로 직접 바인드되는 쿼리문을 작성할 수 있다.

`@NamedQuery`와 비슷하지만 `@Query`은 메서드에 직접 바인드된다.

Repository에 터무니 없는 메서드명으로 메서드를 선언하고 그 메서드에 `@Query("[Query]")`를 설정하자.

``` java
@Repository  
public interface UsersRepository extends JpaRepository<Users, Long> {  
    @Query("select u from Users u where u.userName = ?1")  
    Users findByhahaha(String userName);
}
```

이제
``` java
@Test  
void findByhahahaTest() {  
  
    Users u = usersRepository.findByhahaha("jaehoonwoman");  
  
    log.info(u.getUserId() + ", " +u.getUserName());  
}
```

와 같이 테스트 코드를 작성하면

```
Hibernate: 
    select
        u1_0.user_id,
        u1_0.user_name 
    from
        users u1_0 
    where
        u1_0.user_name=?
```
의 쿼리가 실행될 것이다.

메서드마다 구분되기에 복잡한 쿼리에도 나름 적합함으로 실무에서도 자주 사용하는 방법이기도하다.

하지만 Paging처리에는 추가적인 설정이 필요하다.

### QueryRewriter
`EntityManager`로 쿼리를 전송하기 전에 쿼리문을 변경할 수 있는 기능이다.

직접 구현하진 않겠지만 공식 문서의 예시를 올려보겠다.

``` java
public interface MyRepository extends JpaRepository<User, Long> { 

	@Query(value = "select original_user_alias.* from SD_USER original_user_alias", nativeQuery = true, queryRewriter = MyQueryRewriter.class) 
	List<User> findByNativeQuery(String param); 
	
	@Query(value = "select original_user_alias from User original_user_alias", queryRewriter = MyQueryRewriter.class) List<User> findByNonNativeQuery(String param);

}
```
옵션으로 `queryRewriter = MyQueryRewriter.class`를 줬다.

``` java
public class MyQueryRewriter implements QueryRewriter { 

@Override 
public String rewrite(String query, Sort sort){ 
	return query.replaceAll("original_user_alias", "rewritten_user_alias"); 
	} 
}
```

의 코드인데 이를  `@Component`기반의 클래스에 등록하거나 `@Configuration`로 정의된 클래스에 `@Bean` 으로 등록하거나,

``` java
``` java
public interface MyRepository extends JpaRepository<User, Long>, QueryRewriter { 

	@Query(value = "select original_user_alias.* from SD_USER original_user_alias", nativeQuery = true, queryRewriter = MyQueryRewriter.class) 
	List<User> findByNativeQuery(String param); 
	
	@Query(value = "select original_user_alias from User original_user_alias", queryRewriter = MyQueryRewriter.class) List<User> findByNonNativeQuery(String param);

	@Override default String rewrite(String query, Sort sort) { 
		return query.replaceAll("original_user_alias", "rewritten_user_alias"); 
	}

}
```
처럼 Repository에 함께 extends하여 사용할 수 있다.


### Native Queries
`@Query` Annotation의 여러가지 옵션 중에 `nativeQuery`의 옵션이 있다.

기본값은 false로 설정되어있는데 이를 true로 설정한다면 연동된 데이터베이스의 고유 기능을 직접 사용할 수 있다.

공식 문서에는
``` java
public interface UserRepository extends JpaRepository<User, Long> { 

@Query(value = "SELECT * FROM USERS WHERE LASTNAME = ?1", 
	   countQuery = "SELECT count(*) FROM USERS WHERE LASTNAME = ?1",
	   nativeQuery = true) 
	   
	   Page<User> findByLastname(String lastname, Pageable pageable); 

}
```

와 같이 사용하는 방법을 예시로 들었다.

여기서 생소한 `countQuery`가 껴있는데, 이는 카운트 쿼리를 직접 지정하여 페이지 지정에 네이티브 쿼리로 사용할 수 있다한다.

돌아와서 Native Queries를 좀 더 이해기 쉽게 `GROUP_CONCAT`, `DATE_FORMAT`, `LIMIT`, `REGEXP` 등과 와 같은 MySQL의 고유 기능을 활용할 수 있게된다.
``` java
@Query(value = "SELECT DATE_FORMAT(u.created_date, '%Y-%m-%d') FROM users u WHERE u.id = :id", nativeQuery = true)
...
@Query(value = "SELECT * FROM users u WHERE u.user_name REGEXP :pattern", nativeQuery = true)
```


### Sort
`PageRequest`, `Sort`를 직접적으로 제공하여 정렬을 수행할 수 있다.

보통은 `@Query`로 지정한 Repository의 Method의 Parameter로 `Sort`를 제공한다.

``` java
@Repository  
public interface UsersRepository extends JpaRepository<Users, Long> {    
    @Query("SELECT u FROM Users u WHERE u.userName LIKE %:userName%")  
    List<Users> findHahaha(String userName, Sort sort);
}
```
로 Contains를 수행하는 쿼리를 작성한 뒤

``` java

@BeforeEach  
void insertTestData() {  
  
    // 사용자 정의 객체 Users를 인스턴스화, set 하여 save한다.  
    Users user = new Users();  
    user.setUserName("jaehoonman");  
    usersRepository.save(user);  
  
    user = new Users();  
    user.setUserName("jaehoonwoman");  
    usersRepository.save(user);  
  
    user = new Users();  
    user.setUserName("jaehoonboy");  
    usersRepository.save(user);  
  
    user = new Users();  
    user.setUserName("jaehoongirl");  
    usersRepository.save(user);  
}

...

@Test  
void findHahahaTest() {  
  
    Sort sort = Sort.by(Sort.Direction.ASC, "userName");  
  
    List<Users> usersList = usersRepository.findHahaha("jaehoon", sort);  
  
    for(Users u : usersList){  
        log.info(u.getUserId() + ", " +u.getUserName());  
    }  
}
```
의 테스트 코드를 작성하면

```
Hibernate: 
    select
        u1_0.user_id,
        u1_0.user_name 
    from
        users u1_0 
    where
        u1_0.user_name like ? escape '' 
    order by
        u1_0.user_name
```
와 같이 order by가 포함되어 쿼리문이 작성되는 것을 확인할 수 있다.

결과물 또한
```
3, jaehoonboy
4, jaehoongirl
1, jaehoonman
2, jaehoonwoman
```
과 같이 나오게된다.

만약 기본 ASC로 필드로 정렬하려면`Sort`를 인스턴스로 생성하지 않고  
``` java 
List<Users> usersList = usersRepository.findHahaha("jaehoon", Sort.by("userName"));
```

와 같이 바로 `Sort.by`로 제공 가능하다.



## Named Parameters
기본적으로 Parameter의 위치를 기반으로 인식하는데 이를 Parameter의 이름으로 이를 인식하는 기능이다.

``` java
@Query("select u from Users u where u.userName = :userName1 or u.userName = :userName2")  
List<Users> findHahaha(@Param("userName1") String userName1,  
                       @Param("userName2") String userName2);
```
와 같이 받아오는 `@Param`으로 값을 부여하면 Parameter는 이름을 가지고 `@Query`에 대입이 가능해진다.

## SqEL Expressions

### entityName
Spring Data JPA를 통해 `@Query`를 사용할 때 자동으로 사전에 정의되는 `entityName`과 같은 변수를 `select x from #{#entityName} x`와 같이 사용할 수 있는 표현 방법이다.

`entityName`은 `Repository<T, ID>`를 extends할 때 T에 대응되는 도메인 타입을 기반으로 정의가 된다.

``` java
@Entity 
public class User { 
	@Id 
	@GeneratedValue 
	Long id; 
	String lastname; 
} 

public interface UserRepository extends JpaRepository<User,Long> {
	@Query("select u from #{#entityName} u where u.lastname = ?1") 
	List<User> findByLastname(String lastname); 
}
```

와 같이 `@Entity`로 정의된 도메인 타입을 Repository에 제공하면 `#{#entityName}`로 Table 이름을 대체할 수 있다.

User Entity의 이름이 `@Entity(name = "MyUser")` 등의 방법으로 변경될 때 생길 수 있는 사이드 이펙트를 방지할 수 있다.

### entityName with inheritance

다른 활용 예시로는concrete domain type을 가지고 있는 특수한 repository interface를 generic repository interface와 함께 사용할 때 `#{#entityName}`를 활용할 수 있다.

좀 어려운 용어가 나왔을 수도 있는데 concrete domain type은 DDD(Domain-Driven Design)와 같은 설계 방법에서 특정 비지니스 영역, 애플리케이션 영역을 도메인이라 표현하고, 이 도메인에 포함된 구체적인 비지니스 영역을 concrete domain type이라 한다.

예를 들어 은행 도메인이 있다하면 계좌, 거래, 대출, 고객 정보 등이 concrete domain type이 되는 것이다.

이런 환경에서 은행 도메인을 공통 superclass로 두고 상속하는 자식 concrete domain type 즉, Entity가 받아서 활용하게 되는데, 이 때 concrete interface에서 커스텀 쿼리 메서드를 반복하여 정의하지 않기 위해 사용할 수 있게된다.

``` java
@MappedSuperclass
public abstract class AbstractMappedType {
  …
  String attribute;
}

@Entity
public class ConcreteType extends AbstractMappedType { … }

@NoRepositoryBean
public interface MappedTypeRepository<T extends AbstractMappedType>
  extends Repository<T, Long> {

  @Query("select t from #{#entityName} t where t.attribute = ?1")
  List<T> findAllByAttribute(String attribute);
}

public interface ConcreteRepository
  extends MappedTypeRepository<ConcreteType> { … }
```

`MappedTypeRepository<T extends AbstractMappedType>`는 `AbstractMappedType`를 extends하는 domain type들의 공통 부모 interface이다.

`ConcreteRepository`와 같은 Repository는 `MappedTypeRepository`를 `<ConcreteType>`의 제네릭 타입으로 인스턴스화 시키면 `MappedTypeRepository`의 `findAllByAttribute(...)`는  `select t from ConcreteType t where t.attribute = ?1`를 수행하게 된다.

좀 어렵다 하하하

### accessing arguments

메서드의 인자로 들어온 값을 참조하는 방법이다.
``` java
@Query("select u from User u where u.firstname = ?1 and u.firstname=?#{[0]} and u.emailAddress = ?#{principal.emailAddress}")
List<User> findByFirstnameAndCurrentUserWithCustomQuery(String firstname);
```
`@Query`에서의 `u.firstname = ?1 and u.firstname=?#{[0]}`는 서로 같은 값을 참조하게 될 것이다.

표현 차이랄까...

또한 `?#{principal.emailAddress` 는 SqEL을 통해 Spring Security에 정의된 사용자 인증 객체를 가져와 핸들링 할 수도 있다.
### wildcard shortcut

LIKE 검색 조건에서 사용되는 `%`를 바인딩 하는 값에 부여할 수 있다.

``` java 
@Query("select u from User u where u.lastname like %:#{[0]}% and u.lastname like %:lastname%")
List<User> findByLastnameWithSpelExpression(@Param("lastname") String lastname);
```
`like %:#{[0]}%` 이부분.

### sanitizing input values

인자 값으로 들어오는 변수가 특수 문자 등을 포함한 Secure source가 아닐 수 있다.
이 때 이를 처리해주는 `escape()`를 사용하여 안전하게 인자를 처리할 수 있다.
``` java
@Query("select u from User u where u.firstname like %?#{escape([0])}% escape ?#{escapeCharacter()}")
List<User> findContainingEscaped(String namePart);
```
`like %?#{escape([0])}%` 이부분.

하지만 기본적으로 `_`, `%`만 escape하기에 추가적으로 설정하기 위해서는 `@EnableJpaRepositories`의 `escapeCharacter`를 정의 해줘야한다.

## Other Methods

위의 방법 외에도 Spring Data JPA는 `EntityManager`, `JdbcTemplate`, `@StoredProcedure` 등 다양한 방법으로 쿼리문을 생성할 수 있다.


## Modifying Queries

이전 섹션은 주어진 Entity에 어떻게 접근할 것인지를 선언하는 방법을 알아봤다.

이제는 사용자가 직접 Modify 동작을 추가하는 방법을 알아보도록하자.

``` java
@Modifying
@Query("update User u set u.firstname = ?1 where u.lastname = ?2")
int setFixedFirstnameFor(String firstname, String lastname);
```

`@Modifying`을 선언하여 update 등과 같은 Modify 동작을 지정할 수 있다.

이는 또한 `EntityManger`를 통해 modifying 쿼리를 실행 한 뒤에 자동으로 엔티티를 flush 하지 않기 때문에 자동으로 clear하는 동작을 지정하고 싶다면 `@Modifying(clearAutomatically = true)`와 같은 설정을 할 때 사용한다.

`@Modifying`는 `@Query`와 함께 사용될 때 필요하며, Query Method, 커스텀 메서드는 이 Annotaion을 요구하지 않는다.

### Derived Delete Queries

삭제 쿼리를 정의하는데 있어서
``` java
interface UserRepository extends Repository<User, Long> {

  void deleteByRoleId(long roleId);

  @Modifying
  @Query("delete from User u where u.role.id = ?1")
  void deleteInBulkByRoleId(long roleId);
}
```
위의 두 메서드는 같은 동작을 수행하는 것 처럼 보이지만

`deleteByRoleId(long roleId)`

1. `roleId`가 주어진 값과 일치하는 `User` 엔티티를 조회.
2. 조회된 각 `User` 엔티티에 대해 `delete` 메서드를 호출.
   의 과정을 거치기에 각 엔티티에 대해 `@PreRemove`와 같은 라이프사이클 콜백이 호출된다.
   즉, 삭제 작업이 엔티티 단위로 이루어지기 때문에, 각 엔티티에 대한 이벤트가 발생한다.

`deleteInBulkByRoleId(long roleId)`

주어진 `roleId`를 가진 모든 `User` 엔티티를 한 번에 삭제하는 JPQL 쿼리를 실행한다.
한 번에 모든 동작을 수행하기에 성능상으로는 좋을지 몰라도 엔티티의 상태에 따라 추가 처리가 필요한 경우에는 적합하지 않다.

결론적으로 엔티티 삭제 동작 시 추가적인 처리가 필요하다면 `deleteByRoleId(long roleId)`의 방식을, 대량으로 삭제 시 성능이 중요하다면 `deleteInBulkByRoleId(long roleId)`를 사용하는 것이 좋겠다.

## Applying Query Hints

Query Hints라는건 쿼리의 성능이나 동작을 상세하게 조정할 수 있는 설정이다.

예를 들면 쿼리 실행 시 메모리 제한, 캐시 제어, Lock, Read-only 등의 설정을 할 수 있다.

이를 수행하기 위해서는 Repository interface 메서드에 `@QueryHints`를 정의하거나 `EntityManager`를 사용하면 된다.

`@QueryHints`는 여러개의 `@QueryHint`들을 정의하여 사용할 수 있다.
``` java
public interface UserRepository extends JpaRepository<User, Long> {

    @QueryHints(value = {  
        @QueryHint(name = "org.hibernate.readOnly", value = "true"),  
        @QueryHint(name = "org.hibernate.cacheable", value = "true")})
    List<User> findByLastName(String lastName);
}

```
와 같이 사용하면 된다.

`EntityManager`를 사용한다면
``` java
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<User> findCustomByLastName(String lastName) {
        Query query = entityManager.createQuery("SELECT u FROM User u WHERE u.lastName = :lastName");
        query.setParameter("lastName", lastName);
        query.setHint("org.hibernate.readOnly", true);
        return query.getResultList();
    }
}

```
`query.setHint("org.hibernate.readOnly", true);`처럼 hint를 설정할 수 있다.


### Adding Comments to Queries

디버깅 시에 가독성을 높이기 위해 사용될 수 있는 기능으로 로그에 실행되는 쿼리에 comment 를 설정할 수 있다.

먼저  Hibernate의 commnet 기능을 활성화 시켜야한다.

``` java
@Bean
public Properties jpaProperties() {

	Properties properties = new Properties();
	properties.setProperty("hibernate.use_sql_comments", "true");
	return properties;
}
```

혹은 `spring.jpa.properties.hibernate.use_sql_comments=true`등의 설정이 필요하다.

보통은 두 가지 방법으로 구현하는데

``` java
@Meta(comment = "하하하 메타 ")

@QueryHints({ @QueryHint(name = "org.hibernate.comment", value = "하하하 힌트") })
```
의 둘 중 하나를 Repository 메서드에 정의하면된다.

``` 
Hibernate: 
    /* 하하하 힌트 */ 
    select
        u1_0.user_id,
        u1_0.user_name 
    from
        users u1_0 
    where
        u1_0.user_name=? 
        or u1_0.user_name=?
```
실행되는 쿼리가 로깅될 때 comment로 등록한 메시지가 함께 출력되어 구분이 쉬워진다.

``` java 
public interface RoleRepository extends JpaRepository<Role, Integer> {

	@Meta(comment = "find roles by name")
	List<Role> findByName(String name);

	@Override
	@Meta(comment = "find roles using QBE")
	<S extends Role> List<S> findAll(Example<S> example);

	@Meta(comment = "count roles for a given name")
	long countByName(String name);

	@Override
	@Meta(comment = "exists based on QBE")
	<S extends Role> boolean exists(Example<S> example);
}
```
와 같은 방법으로 기본적으로 정의된 메서드에 대해서도 comment를 작성할 수 있다.


##  Configuring Fetch- and LoadGraphs

복잡한 관계를 가진 엔티티를 다룰 떄 유용한 기능이다.

보통 필요로하는 엔티티의 특정 속성만을 로드하여 성능을 최적화하는데 사용한다.

- **FetchGraph**: 지정된 속성만 로드하고, 나머지 속성은 무시.
- **LoadGraph**: 지정된 속성은 즉시 로드하며, 나머지는 엔티티의 페치 타입에 따라 결정.

의 특징을 가지고 있다.

`@NamedEntityGraph`를 통해 Entity graph의 이름과 받아올 속성을 정의하고,
Graph의 속성을 사용할 Repository에선 `@EntityGraph`를 통해 value와 type에 FETCH, LOAD를 설정하여 정의해준다.

``` java
@Entity
@NamedEntityGraphs({
    @NamedEntityGraph(
        name = "product.withCategory",
        attributeNodes = @NamedAttributeNode("category")
    ),
    @NamedEntityGraph(
        name = "product.withCategoryAndTags",
        attributeNodes = {
            @NamedAttributeNode("category"),
            @NamedAttributeNode("tags")
        }
    )
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    private Category category;

    @ManyToMany(fetch = FetchType.LAZY)
    private Set<Tag> tags;

    // Getters and setters
}

```

- `product.withCategory`: `category` 속성만 로드.
- `product.withCategoryAndTags`: `category`, `tags` 속성을 로드.

``` java 
public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(value = "product.withCategory", type = EntityGraph.EntityGraphType.FETCH)
    List<Product> findByName(String name);

    @EntityGraph(value = "product.withCategoryAndTags", type = EntityGraph.EntityGraphType.LOAD)
    List<Product> findByCategoryName(String categoryName);
}

```

- `findByName`: `product.withCategory` FetchGraph를 사용하여 `category` 속성만 로드.
- `findByCategoryName`: `product.withCategoryAndTags` LoadGraph를 사용하여 `category`와 `tags` 속성을 로드.


## Scrolling
많은 양의 결과가 있을 때 이를 필요한 만큼만 읽어 핸들링 하기 위한 기능이다.

웹 개발은 Scrolling보다는 Pageable 인터페이스를 활용한 기능을 활용하는게 효율적일 것 같아서 자세히는 안다루겠다... 하하...

<br/>


Ref.  
[https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html#jpa.query.spel-expressions](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html#jpa.query.spel-expressions)

