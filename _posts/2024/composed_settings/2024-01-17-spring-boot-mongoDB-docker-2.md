---
#layout: single
title:	"Docker Compose로 Spring Boot + MongoDB 구성(part.2)"
date:	2024-01-17 12:00:00
categories:
  - Settings
tags:
  - Spring Boot
  - MongoDB
  - Docker Compose
  - REST API
  - Container
comment: true
#published: false
---
IDE의 데이터베이스 연동 기능을 이용하여 제대로 구동중인지 다시 한 번 확인 가능하다.

IntelliJ에서 확인하면 아래와 같은 모습이다.

![Connected DB]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/connected-db-intellij.png)

User와, Password에는 MongoDB 컨테이너를 docker exec 하여 createUser() 했던 내용으로 인증 과정을 거치면 된다.

이를 application.properties 혹은 application.yml로 적용하면 된다.
(필자는 `use guest_book`로 새로운 데이터 베이스를 구축했다.)

properties라면
```
spring.data.mongodb.host=localhost  
spring.data.mongodb.port=27017  
spring.data.mongodb.database=guest_book
```

yml이라면
```yaml
spring: 
	data: 
		mongodb: 
			host: localhost
			port: 27017
			database: guest_book
```
와 같다.

애플리케이션과 DB 연동 정보를 입력했으니 연동해보자.

일단 위에서 비활성화 시켜둔 MongoDB의 의존성을 다시 활성화 시켜주자.
```yaml
dependencies {  
    implementation 'org.springframework.boot:spring-boot-starter'  
    implementation 'org.springframework.boot:spring-boot-starter-web'  
      
    implementation 'org.mongodb:mongodb-driver-sync:4.10.2'  
    implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'  
  
    compileOnly 'org.projectlombok:lombok'  
    annotationProcessor 'org.projectlombok:lombok'  
    testImplementation 'org.springframework.boot:spring-boot-starter-test'  
  
}
```

이제 소스를 작성해보자.

크게
- 데이터 형식을 잡는 Model
- DB 동작을 수행하는 Repository
- 동작을 실행하는 Service
- 사용자의 동작을 받는 Controller
를 작성할 것이며, 프로젝트 구조는
- 
![structure]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/structure-of-file.png)

와 같다.

## Model

데이터 핸들링을 위한 Model 객체를 생성한다.

```java
package com.jaehoonman.guestbookspringboot.model;  
  
import lombok.Data;  
import org.springframework.data.annotation.Id;  
import org.springframework.data.mongodb.core.mapping.Document;  
  
import java.util.Date;  
  
@Data //Getter, Setter lombok 자동 설정.  
@Document(collection = "guest_book") // Mapping collection 지정.  
public class GuestBook {  
  
    @Id  
    private String id;  
  
    private String title;  
    private String writer;  
    private String contents;  
  
    private Date createdTime = new Date();  
}
```

(날짜는 제대로 안나오긴하지만 일단 테스트니...)

## Repository
DB와 상호 작용하며 동작을 수행하는 Repository는 간단하게 MongoRepository 인터페이스를 extends 하는 것으로 기본 동작들을 제공 받을 수 있다.

```java
package com.jaehoonman.guestbookspringboot.repository;  
  
import com.jaehoonman.guestbookspringboot.model.GuestBook;  
import org.springframework.data.mongodb.repository.MongoRepository;  
import org.springframework.stereotype.Repository;  
  
@Repository  
public interface GuestBookRepository extends MongoRepository<GuestBook, Long> {
	GuestBook findById(String id);  
	void deleteById(String id);
}
```
버전 차이인지는 잘 모르겟지만 findById와 같이 Id값을 통해 데이터를 찾는 기능이 동작하지 않아 커스텀 메서드를 만들었다.

## Service
사용자의 요청을 Controller에서 전달 받아 수행하고 싶은 동작을 지정하는 Service 레이어를 작성하자.

먼저 수행할 동작의 인터페이스를 지정한다.

```java
package com.jaehoonman.guestbookspringboot.service;  
  
import com.jaehoonman.guestbookspringboot.model.GuestBook;  
import org.springframework.stereotype.Service;  
  
import java.util.List;  
  
@Service  
public interface GuestBookService {  
  
    GuestBook createGuestBook(GuestBook guestBook);  
  
    List<GuestBook> getAllGuestBooks();  
    GuestBook getGuestBookById(String id);  
  
    void deleteGuestBookById(String id);  
  
}
```

이후 해당 서비스를 implements하여 Repository와 연동, 수행할 동작을 지정해주자.
```java
package com.jaehoonman.guestbookspringboot.service.impl;  
  
import com.jaehoonman.guestbookspringboot.model.GuestBook;  
import com.jaehoonman.guestbookspringboot.repository.GuestBookRepository;  
import com.jaehoonman.guestbookspringboot.service.GuestBookService;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.stereotype.Service;  
  
import java.util.List;  
  
@Service  
public class GuestBookImpl implements GuestBookService {  
  
    private final GuestBookRepository guestBookRepository;  
  
    @Autowired  
    public GuestBookImpl(GuestBookRepository guestBookRepository){  
        this.guestBookRepository = guestBookRepository;  
    }  
  
    @Override  
    public GuestBook createGuestBook(GuestBook guestBook) {  
        return this.guestBookRepository.save(guestBook);  
    }  
  
    @Override  
    public List<GuestBook> getAllGuestBooks() {  
        return this.guestBookRepository.findAll();  
    }  
  
    @Override  
    public GuestBook getGuestBookById(String id){  
        return this.guestBookRepository.findById(id);  
    }  
  
    @Override  
    public void deleteGuestBookById(String id) {  
        this.guestBookRepository.deleteById(id);  
    }  
  
}
```
## Controller

HTTP Method에 맞는 처리를 수행하도록 Controller를 작성하자.
```java
package com.jaehoonman.guestbookspringboot.controller;  
  
import com.jaehoonman.guestbookspringboot.model.GuestBook;  
import com.jaehoonman.guestbookspringboot.service.GuestBookService;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.web.bind.annotation.*;  
  
import java.util.List;  
  
@RestController  
@RequestMapping("/guestbook")//호스트 맵핑
public class GuestBookController {  
  
    //서비스 주입  
    private final GuestBookService guestBookService;  
  
    @Autowired  
    public GuestBookController(GuestBookService guestBookService){  
        this.guestBookService = guestBookService;  
    }  
  
    //GET HTTP 메서드로 모든 데이터 읽어오기.  
    @GetMapping  
    public List<GuestBook> getAllGuestBook(){  
        return guestBookService.getAllGuestBooks();  
    }  
  
    //GET HTTP 메서드로 id에 해당하는 데이터 읽어오기.  
    @GetMapping("/{id}")  
    public GuestBook getGuestBookByTitle(@PathVariable String id){  
        return guestBookService.getGuestBookById(id);  
    }  
  
    //POST HTTP 메서드로 새로운 데이터 insert.    @PostMapping  
    public GuestBook createGuestBook(@RequestBody GuestBook guestBook){  
        return guestBookService.createGuestBook(guestBook);  
    }  
  
    //DELETE HTTP 메서드로 id에 해당하는 데이터 삭제하기.  
    @DeleteMapping("/{id}")
    public void deleteGuestBookById(@PathVariable String id){  
        guestBookService.deleteGuestBookById(id);  
    }  
  
  
}
```

이제 서비스를 실행시키고 동작을 확인하자.
Postman과 같은 툴을 사용해도 되지만 필자는 터미널에서 `curl` 커맨드를 사용해보겠다.

## 동작 확인

### 데이터 삽입
```shell
curl -d '{"title":"안녕", "writer":"재훈맨", "contents":"하세요"}' -H "Content-Type: application/json" -X POST http://localhost:8080/[ENDPOINT]
```
(id는 자동 생성되기에 따로 지정하지 않는다.)

### 조회
#### 전체 조회
`curl -X GET http://localhost:8080/[ENDPOINT]`

#### id로 조회
`curl -X GET http://localhost:8080/[ENDPOINT]/[id]`

### 삭제
`curl -X DELETE http://localhost:8080/[ENDPOINT]/[id]`

![working-test]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/working-test.png)

동작을 확인하였으니 이제 Docker Compose로 구성해보자.

## Docker Compose 작성 및 컨테이너화
`docker-compose.yml` 파일은 `Dockerfile`과 같은 application Root 위치에 생성한다.

``` yaml
version: "3" # Docker compose의 버전 선택 
services: # 컨테이너의 이름, 이미지, 포트 등을 정의하여 컨테이너 생성 및 관리  
  app:  
    image: guest-book:0.0.1 # 기반이 되는 이미지 지정  
    container_name: spring-boot-guest-book # 생성될 컨테이너 이름 정의  
    ports:  
      - 8080:8080  
    depends_on: # 의존성 주입으로 해당 서비스가 먼저 생성, 실행된다  
      - mongodb  
    environment: # 환경 변수 설정.  
      - SPRING_DATA_MONGODB_URI=mongodb://jaehoonman:1234@mongodb:27017/guest_book  
  mongodb:  
    image: mongo:latest  
    container_name: mongodb-guest-book  
    environment:  
      - MONGO_INITDB_ROOT_USERNAME=jaehoonman  
      - MONGO_INITDB_ROOT_PASSWORD=1234  
    restart: always # 재시작 정책  
    ports:  
      - 27017:27017
```

`app`의 서비스에서 기반이 되는 image는 우리가 이전에 build 했던 [이미지이름]:[버전] 의 이미지를 지정해준다.

`enviorment`는 applicatoin.properties 혹은 application.yml에 지정하였던 localhost 환경은 더 이상 사용하지 못하니 docker compose를 구성하는 환경에 맞춰서 바꿔준다.
추가로 application.properties에 설정했던 host 옵션도 바꿔주자
```
#spring.data.mongodb.host=localhost  
spring.data.mongodb.host=mongo  
spring.data.mongodb.port=27017  
spring.data.mongodb.database=guest_book
```

옵션이 변경 되었으니 이를 적용 시키기 위해 `build clean`, `build` 를 통해 JAR 파일을 다시 빌드해주고, 다시
```
$ docker build -t [태그명]:[버전] .
```
의 커멘드로 docker image를 빌드해주자.

`mongodb` 서비스에서도 `enviorment`에 DB 접속 정보를 기입해준다.

작성이 완료되었다면 터미널을 통해 application Root 위치로 cd 하여 아래의 명령어를 입력하자.
```
docker compose up
```

![Compose-working-test]({{ site.baseurl }}/assets/images/posts/2024/composed_settings/Compose-working-test.png)

`app` 서비스에서 `depends_on` 으로 지정하였던 `mongodb` 서비스가 먼저 구성이 되고, `app`이 구성 되는 것을 확인할 수 있다.

생성되는 컨테이너 이름도 `container_name`에 맞게 구성된다.

이전과 같은 동작 테스트를 통해 정상 여부를 판단할 수 있다.


<br>

Ref.  
[https://velog.io/@max9106/Spring-Boot-MongoDB](https://velog.io/@max9106/Spring-Boot-MongoDB)
[https://sangmaeng.tistory.com/25](https://sangmaeng.tistory.com/25)
[https://umanking.github.io/2023/08/04/spring-boot-mongodb/](https://umanking.github.io/2023/08/04/spring-boot-mongodb/)
[https://yang1s.tistory.com/30](https://yang1s.tistory.com/30)
[https://imasoftwareengineer.tistory.com/51](https://imasoftwareengineer.tistory.com/51)





