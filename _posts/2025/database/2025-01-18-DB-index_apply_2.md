---
#layout: single
title:	"[Database] Database Index - 적용 part 2."
date:	2025-01-18 12:00:00
categories:
- Database
tags:
- Index
- Composite Index
- Full-Text Index
---


[[Database] Database Index - 적용 part 1.](/database/DB-index_apply_1/)에 이어서 이번 포스트는 Composite Index와 Full-Text Index를 적용해보자.

추가적으로 인덱스를
## Composite Index

두 개 이상의 컬럼을 조합하여 생성하는 인덱스다.

WHERE절이나 ORDER BY절로 필터링을 수행할 때 AND를 이용하여 2개 이상의 컬럼에 인덱싱을 한다는 것을 의미한다.

복잡한 조건이 포함된 쿼리에서 효율적인 검색을 지원한다.

### The Leftmost Prefix Rule
인덱스 생성 시 순서에 따라 최적화 되는 쿼리가 달라질 수 있으니 적용하는 컬럼의 순서가 중요하다.

이 규칙은 "다중 컬럼 인덱스 적용 시 인덱스의 가장 왼쪽 필드부터 순차적으로 사용" 해야한다는 룰인데, Composite Index의 동작 방식과 효율성을 이해하는데 도움이 될 것 같아서 작성했다.

먼저 위에서 설명하였듯이, 컴포지트 인덱스는 두 개 이상의 컬럼을 조합하여 만드는 인덱스다.

밑에서 작성할 게시글 DDL을 기반으로 설명하자면.
적용할 컬럼이 `[작성자, 작성일, 카테고리]`이며, 이를 순서대로 적용한다 했을 때
- 작성자만 검색 : 인덱스 사용 **가능**
- 작성자, 작성일 검색 : 인덱스 사용 **가능**
- 작성일 카테고리 검색 : 인덱스 사용 **불가**

의 룰을 지켜야하는 것을 의미한다.

이 룰을 어길 시에는 Full-scan이 이루어진다.

#### 동작 방식
인덱스는 적용한 컬럼을 기준으로 정렬된 데이터 혹은 위치를 가지게 된다고 했다.

Composite Index 또한 `작성자`를 기준으로 인덱스를 적용한다면 작성자를 기준으로 정렬된 데이터의 인덱스 테이블(Clustered) 혹은 위치 값을 포인터를 저장(Non-Clustered)하고 이를 블록을 그룹화한다.

이 때 가장 왼쪽에 있는 컬럼을 **Leading Column** 이라 한다.

여기서 또 `작성일`을 기준으로 정렬하게 되면 `작성자`를 기준으로 정렬된 인덱스 테이블에서 추가로 `작성일`을 기준으로 정렬하게 된다.

`카테고리` 는 마지막으로 정렬될 것이다.

이렇게 `작성자`를 기준으로 정렬된 그룹에서 인덱스의 기본적으로 **사전 순서**로 정렬을 수행하게 된다.

사전 순서(Lexicographical Order)는 간단하게 알파벳 순으로 이해하면 될 듯하다.

아무튼, 룰을 어길 시에는 `작성자`를 기준으로 정렬된 인덱스 테이블은 블록으로 그룹화가 된다.

이때, `작성자`를 제외하고 조회하게 되면 해당 인덱스 테이블은 `작성자`와 일치하는 값을 기반으로 `작성일, 카테고리`를 찾아야하는데 일치하는 `작성자` 가 없으니 결국 Full-Scan을 돌려서 인덱스를 활용하지 못하게 된다.

The Leftmost Prefix Rule와 Lexicographical Order를 깊게 이해하지 못하더라도 **Composite Index에서는 왼쪽에서 오른쪽의 방향으로 인덱스 적용 순서가 중요하다** 라는 것만 알고가면 될 것 같다.

그러니 가장 많이 검색 되는 컬럼을 가장 왼쪽에 위치시키고 우선순위별로 나열하면 된다.

### 테이블 생성

이전 포스트와 다르게 Full-Text Index 에도 활용할 새로운 테이블을 생성해보자
``` sql
CREATE TABLE 게시글
(
    id SERIAL PRIMARY KEY,
    제목 VARCHAR(200) NOT NULL,
    내용 TEXT NOT NULL,
    작성자 VARCHAR(100) NOT NULL,
    작성일 TIMESTAMP DEFAULT NOW(),
    조회수 INT DEFAULT 0,
    카테고리 VARCHAR(50) NOT NULL 
);
```

### 샘플 데이터 및 조회

이제 샘플 데이터를 넣어보자
``` sql
DO $$
  BEGIN
    FOR i IN 1..50000 LOOP
        INSERT INTO 게시글 (제목, 내용, 작성자, 카테고리, 조회수, 작성일)
        VALUES (
             CASE
               WHEN i % 5 = 0 THEN 'PostgreSQL 튜닝 사례 ' || i
               WHEN i % 5 = 1 THEN '개발자 회의 주요 발표 ' || i
               WHEN i % 5 = 2 THEN '연말 IT 트렌드 분석 ' || i
               WHEN i % 5 = 3 THEN '노트북 리뷰와 추천 ' || i
               ELSE '이벤트 소식과 공지사항 ' || i
               END,
             '이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 ' ||
             CASE
               WHEN i % 3 = 0 THEN 'PostgreSQL 튜닝'
               WHEN i % 3 = 1 THEN '개발 장비 리뷰'
               ELSE 'IT 트렌드 분석'
               END || '과 같은 내용이 포함됩니다. 게시글 번호: ' || i,
             '작성자' || (i % 10),
             CASE
               WHEN i % 5 = 0 THEN '뉴스'
               WHEN i % 5 = 1 THEN '공지사항'
               WHEN i % 5 = 2 THEN '기술'
               WHEN i % 5 = 3 THEN '리뷰'
               ELSE '기타'
               END,
             (i * 3) % 1000,
             _NOW_() - (i || ' minutes')::INTERVAL
           );
      END LOOP;
  END $$;
```

| id    | 제목                     | 내용                                                                         | 작성자  | 작성일                        | 조회수 | 카테고리 |
| :---- | :--------------------- | :------------------------------------------------------------------------- | :--- | :------------------------- | :-- | :--- |
| 1     | 개발자 회의 주요 발표 1         | 이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 개발 장비 리뷰과 같은 내용이 포함됩니다. 게시글 번호: 1          | 작성자1 | 2024-12-26 22:35:51.588693 | 3   | 공지사항 |
| 2     | 연말 IT 트렌드 분석 2         | 이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 IT 트렌드 분석과 같은 내용이 포함됩니다. 게시글 번호: 2         | 작성자2 | 2024-12-26 22:34:51.588693 | 6   | 기술   |
| 3     | 노트북 리뷰와 추천 3           | 이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 PostgreSQL 튜닝과 같은 내용이 포함됩니다. 게시글 번호: 3     | 작성자3 | 2024-12-26 22:33:51.588693 | 9   | 리뷰   |
| 4     | 이벤트 소식과 공지사항 4         | 이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 개발 장비 리뷰과 같은 내용이 포함됩니다. 게시글 번호: 4          | 작성자4 | 2024-12-26 22:32:51.588693 | 12  | 기타   |
| 5     | PostgreSQL 튜닝 사례 5     | 이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 IT 트렌드 분석과 같은 내용이 포함됩니다. 게시글 번호: 5         | 작성자5 | 2024-12-26 22:31:51.588693 | 15  | 뉴스   |
| ...   | ...                    | ..                                                                         | ...  | ...                        | ... | ...  |
| 49996 | 개발자 회의 주요 발표 49996     | 이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 개발 장비 리뷰과 같은 내용이 포함됩니다. 게시글 번호: 49996      | 작성자6 | 2024-11-22 05:20:51.588693 | 988 | 공지사항 |
| 49997 | 연말 IT 트렌드 분석 49997     | 이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 IT 트렌드 분석과 같은 내용이 포함됩니다. 게시글 번호: 49997     | 작성자7 | 2024-11-22 05:19:51.588693 | 991 | 기술   |
| 49998 | 노트북 리뷰와 추천 49998       | 이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 PostgreSQL 튜닝과 같은 내용이 포함됩니다. 게시글 번호: 49998 | 작성자8 | 2024-11-22 05:18:51.588693 | 994 | 리뷰   |
| 49999 | 이벤트 소식과 공지사항 49999     | 이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 개발 장비 리뷰과 같은 내용이 포함됩니다. 게시글 번호: 49999      | 작성자9 | 2024-11-22 05:17:51.588693 | 997 | 기타   |
| 50000 | PostgreSQL 튜닝 사례 50000 | 이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 IT 트렌드 분석과 같은 내용이 포함됩니다. 게시글 번호: 50000     | 작성자0 | 2024-11-22 05:16:51.588693 | 0   | 뉴스   |

Full-scan 시에는

``` sql
EXPLAIN ANALYZE  
SELECT * from 게시글;
```

| QUERY PLAN |
| :--- |
| Seq Scan on "게시글"  (cost=0.00..3334.00 rows=1 width=230) (actual time=11.178..24.124 rows=50000 loops=1) |
| Planning Time: 1.012 ms |
| Execution Time: 25.798 ms |

의 성능이 나온다.

### 인덱스 생성

인덱스를 적용해 볼 컬럼은 `카테고리, 작성자, 작성일`이다.

먼저 Composite Index를 적용하지 않고 조회를 해보자.

``` sql
EXPLAIN ANALYZE  
SELECT * from 게시글 WHERE 카테고리='뉴스' AND 작성자='작성자1' AND 작성일 >= '2024-11-01';
```

| QUERY PLAN |
| :--- |
| Seq Scan on "게시글"  (cost=0.00..4209.00 rows=1007 width=230) (actual time=13.353..13.353 rows=0 loops=1) |
|   Filter: (("작성일" >= '2024-11-01 00:00:00'::timestamp without time zone) AND (("카테고리")::text = '뉴스'::text) AND (("작성자")::text = '작성자1'::text)) |
|   Rows Removed by Filter: 50000 |
| Planning Time: 0.095 ms |
| Execution Time: 13.372 ms |

당연하게 **순차 조회(Seq Scan)** 을 한 뒤, 조건절 필터링으로 전체 row에서 필요하지 않은 부분은 삭제한다.

AND 를 사용하지 않고 각각 조회해도 Execution Time 8~13ms 의 범위를 가진다.

이제 인덱스를 적용해 보자.

``` sql
CREATE INDEX idx_게시글_카테고리_작성자_작성일 ON 게시글 (카테고리, 작성자, 작성일 DESC);
```

`작성일 DESC`은 최신 데이터를 가져오는 데 유리하다.

이후 다시
``` sql
EXPLAIN ANALYZE  
SELECT * from 게시글 WHERE 카테고리='뉴스' AND 작성자='작성자1' AND 작성일 >= '2024-11-01';
```
를 수행하면

| QUERY PLAN                                                                                                                                                        |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bitmap Heap Scan on "게시글"  (cost=41.25..2214.10 rows=1007 width=230) (actual time=0.346..0.346 rows=0 loops=1)                                                |
| Recheck Cond: ((("카테고리")::text = '뉴스'::text) AND (("작성자")::text = '작성자1'::text) AND ("작성일" >= '2024-11-01 00:00:00'::timestamp without time zone)) |
| ->  Bitmap Index Scan on "idx_게시글_카테고리_작성자_작성일"  (cost=0.00..41.00 rows=1007 width=0) (actual time=0.338..0.338 rows=0 loops=1)                        |
| Index Cond: ((("카테고리")::text = '뉴스'::text) AND (("작성자")::text = '작성자1'::text) AND ("작성일" >= '2024-11-01 00:00:00'::timestamp without time zone))   |
| Planning Time: 0.734 ms                                                                                                                                           |
| Execution Time: 0.360 ms                                                                                                                                          |

테이블 조회 성능을 올리기 위한 기본적인 Bitmap이 적용되고, 조건문을 다시 점검하고, Index Scan을 수행하는 것을 확인할 수 있다.

성능이 꽤 개선되었다.

#### Partial Index

`카테고리, 작성자, 작성일`의 컬럼이 있을 때 카테고리가 '뉴스'인 데이터를 많이 조회한다면 이에 특화된 인덱스를 적용할 수도 있다.

``` sql
CREATE INDEX idx_게시글_뉴스 ON 게시글 (작성자, 작성일 DESC) WHERE 카테고리 = '뉴스';
```

#### Leftmost Prefix Rule 위반

위에서 주의하라 했던 내용을 실제로 확인해보자.

우리는 `카테고리 -> 작성자 -> 작성일` 의 순서대로 Composite Index를 설정했다.

##### 사용 가능한 경우

Index Scan을 수행한다.

###### **WHERE 카테고리 = '뉴스'**

| QUERY PLAN                                                                                                                                      |
| :---------------------------------------------------------------------------------------------------------------------------------------------- |
| Bitmap Heap Scan on "게시글"  (cost=325.58..3784.04 rows=9957 width=230) (actual time=1.035..3.921 rows=10000 loops=1)                         |
| Recheck Cond: (("카테고리")::text = '뉴스'::text)                                                                                                 |
| Heap Blocks: exact=1668                                                                                                                         |
| ->  Bitmap Index Scan on "idx_게시글_카테고리_작성자_작성일"  (cost=0.00..323.09 rows=9957 width=0) (actual time=0.847..0.848 rows=10000 loops=1) |
| Index Cond: (("카테고리")::text = '뉴스'::text)                                                                                                   |
| Planning Time: 0.124 ms                                                                                                                         |
| Execution Time: 4.264 ms                                                                                                                        |

###### **WHERE 카테고리 = '뉴스' AND 작성자 = '홍길동'**

| QUERY PLAN |
| :--- |
| Bitmap Heap Scan on "게시글"  (cost=38.74..2209.06 rows=1007 width=230) (actual time=0.043..0.044 rows=0 loops=1) |
|   Recheck Cond: ((("카테고리")::text = '뉴스'::text) AND (("작성자")::text = '작성자1'::text)) |
|   ->  Bitmap Index Scan on "idx_게시글_카테고리_작성자_작성일"  (cost=0.00..38.48 rows=1007 width=0) (actual time=0.041..0.041 rows=0 loops=1) |
|         Index Cond: ((("카테고리")::text = '뉴스'::text) AND (("작성자")::text = '작성자1'::text)) |
| Planning Time: 0.085 ms |
| Execution Time: 0.062 ms |

###### **WHERE 카테고리 = '뉴스' AND 작성자 = '홍길동' AND 작성일 >= '2024-01-01'**

| QUERY PLAN |
| :--- |
| Bitmap Heap Scan on "게시글"  (cost=41.25..2214.10 rows=1007 width=230) (actual time=0.126..0.127 rows=0 loops=1) |
|   Recheck Cond: ((("카테고리")::text = '뉴스'::text) AND (("작성자")::text = '작성자1'::text) AND ("작성일" >= '2024-11-01 00:00:00'::timestamp without time zone)) |
|   ->  Bitmap Index Scan on "idx_게시글_카테고리_작성자_작성일"  (cost=0.00..41.00 rows=1007 width=0) (actual time=0.116..0.116 rows=0 loops=1) |
|         Index Cond: ((("카테고리")::text = '뉴스'::text) AND (("작성자")::text = '작성자1'::text) AND ("작성일" >= '2024-11-01 00:00:00'::timestamp without time zone)) |
| Planning Time: 0.624 ms |
| Execution Time: 0.179 ms |

######  **WHERE 카테고리='뉴스' AND 작성일 >= '2024-11-01'**

원칙적으로는 안 되지만 PostgreSQL은 중간에 작성자가 없어도 '부분적으로' 동작하는 듯하다.

| QUERY PLAN |
| :--- |
| Bitmap Heap Scan on "게시글"  (cost=350.47..3833.81 rows=9956 width=230) (actual time=0.870..4.145 rows=10000 loops=1) |
|   Recheck Cond: ((("카테고리")::text = '뉴스'::text) AND ("작성일" >= '2024-11-01 00:00:00'::timestamp without time zone)) |
|   Heap Blocks: exact=1668 |
|   ->  Bitmap Index Scan on "idx_게시글_카테고리_작성자_작성일"  (cost=0.00..347.99 rows=9956 width=0) (actual time=0.702..0.702 rows=10000 loops=1) |
|         Index Cond: ((("카테고리")::text = '뉴스'::text) AND ("작성일" >= '2024-11-01 00:00:00'::timestamp without time zone)) |
| Planning Time: 0.306 ms |
| Execution Time: 4.513 ms |

이 또한 Index Scan을 수행한다.

##### 사용 불가능한 경우

Index Scan을 수행하지 못한다.

###### **WHERE 작성자 = '홍길동'**

| QUERY PLAN                                                                                                     |
| :------------------------------------------------------------------------------------------------------------- |
| Seq Scan on "게시글"  (cost=0.00..3959.00 rows=5055 width=230) (actual time=16.504..24.569 rows=5000 loops=1) |
| Filter: (("작성자")::text = '작성자1'::text)                                                                     |
| Rows Removed by Filter: 45000                                                                                  |
| Planning Time: 0.343 ms                                                                                        |
| Execution Time: 24.855 ms                                                                                      |

###### **WHERE 작성일 >= '2024-01-01'**

| QUERY PLAN |
| :--- |
| Seq Scan on "게시글"  (cost=0.00..3959.00 rows=49995 width=230) (actual time=3.152..19.407 rows=50000 loops=1) |
|   Filter: ("작성일" >= '2024-11-01 00:00:00'::timestamp without time zone) |
| Planning Time: 0.264 ms |
| Execution Time: 21.208 ms |

###### **WHERE  작성자 = '작성자1'  AND 작성일 >= '2024-11-01'**

| QUERY PLAN |
| :--- |
| Seq Scan on "게시글"  (cost=0.00..4084.00 rows=5054 width=230) (actual time=11.768..24.694 rows=5000 loops=1) |
|   Filter: (("작성일" >= '2024-11-01 00:00:00'::timestamp without time zone) AND (("작성자")::text = '작성자1'::text)) |
|   Rows Removed by Filter: 45000 |
| Planning Time: 0.073 ms |
| Execution Time: 24.977 ms |

<br/> 

# Full-Text Index

대량의 텍스트 데이터를 검색할 때, 특정 단어나 구문을 빠르게 찾을 수 있게 설계된 인덱스다.

`WHERE TextColumn LIKE '%searchstring%'` 와 같이 검색하는 방식은 전체 텍스트에서 정규식을 활용하여 검색하기에 느리지만 Full-Text Index를 적용하게되면 단어 단위로 검색을 하기에 텍스트 기반 필터링에 유리하다.

하지만 Full-Text Index를 적용했다고 `WHERE TextColumn LIKE '%searchstring%'` 의 성능이 좋아지는 것은 아니다.

`LIKE '%searchstring%`와 같은 부분 문자열 검색은 단어의 내부나 끝에서 부터 검색을 할 때 발생한다.

PostgreSQL 에서 gres를 찾을 때를 생각하면 되겠다.

Full-Text Index는 단어 기준으로 인덱스를 생성하고, 부분 문자열 검색을 지원하기 위해서는 내부의 모든 가능한 조합을 인덱싱 해야하기에 인덱스의 크기를 크게 증가시키는 비효율적인 과정을 거쳐야한다.

즉, Full-Text Index는 문자 내 단어 검색 및 관련성 계산에 최적화 되었고,
부분 문자열 검색은 단순히 텍스트 내에 특정 문자열이 포함되었는지 확인하는 작업이다.

이런 한계점은 GIN 인덱스, N-gram 기반 인덱싱, Elasticsearch 엔진 활용 등의 방식으로 극복할 수도 있다.

## 동작 방식

텍스트를 아래와 같은 과정을 통해 전처리한다.

텍스트를 **단어 단위(토큰) 으로 나누어 저장**한다.(Tokenization)

예를 들어 

“SpaceX executes ‘chopsticks’ booster catch but Starship spacecraft explosion temporarily diverts flights” 

라는 텍스트가 있다면

"SpaceX", "executes", "‘chopsticks’", "booster", "catch", "but", "Starship", "spacecraft", "explosion", "temporarily", "diverts", "flights" 

으로 나뉘어진다.

또한 The, is, and 등과 같은 **Stop Words(불용어)는 인덱스 생성 과정에서 제외**하여 인덱스의 크기를 줄이고 검색 성능을 최적화 한다.

예시에선 “but” 이 빠지면서

"SpaceX", "executes", "‘chopsticks’", "booster", "catch", "Starship", "spacecraft", "explosion", "temporarily", "diverts", "flights" 

가 남을 것이다.

이후 대문자로 표현된 단어가 있다면 이를 **소문자**로 변환한다.

"spacex", "executes", "‘chopsticks’", "booster", "catch", "starship", "spacecraft", "explosion", "temporarily", "diverts", "flights"

소문자로 변환된 단어는 **동사는 기본형 변환(Lemmatization), 복수형은 어미 제거(Stemming)** 등의 기본 형태로 변환한다.

- "executes" → "execute"
- "flights" → "flight"
- "diverts" → "divert"

"spacex", "execute", "‘chopsticks’", "booster", "catch", "starship", "spacecraft", "explosion", "temporarily", "divert", "flight"

이렇게 전처리된 단어들은 비로소 Full-text index에 저장된다.

인덱스에 저장될 때는 단어가 몇 번째에 위치하는지, 어떤 row에 있는지 등에 대한 위치 기록도 한다.(Inverted Index)

이제 사용자가 "Spacex" 혹은 "Catch STARSHIP" 와 같은 형태로 검색하게 되면 이또한 전처리를 거쳐

"spacex", "catch", "starship" 으로 구분되어 이를 가지고 있는 텍스트의 위치를 index를 통해 파악하여 해당 전문을 검색한다.

추가적으로 관련성 점수(Relevance Score)를 통한 관련성이 높은 텍스트를 찾는 등의 작업을 수행할 수 있다.

## Lexicographical Order 와의 차이

Composite Index 처럼 사전 순서를 기준으로 저장하는 인덱스와는 다르게 Full-Text Index는 역색인(Inverted Index)를 적용하여 토큰화된 단어와 그 위치를 기록하여 이를 토대로 빠르게 검색하여 반환할 수 있다.

## 조회

인덱스를 적용하기 전 보통 사용하는 부분 문자열 검색을 해보겠다.

``` sql
EXPLAIN ANALYZE
SELECT * FROM 게시글
WHERE 제목 LIKE '%튜닝%';
```

| QUERY PLAN |
| :--- |
| Seq Scan on "게시글"  (cost=0.00..3959.00 rows=9596 width=230) (actual time=1.196..14.296 rows=10000 loops=1) |
|   Filter: (("제목")::text ~~ '%튜닝%'::text) |
|   Rows Removed by Filter: 40000 |
| Planning Time: 0.129 ms |
| Execution Time: 14.686 ms |
## Full-Text Index 생성

### CREATE TABLE

테이블 생성 때 부터 적용하고 싶다면

``` sql
CREATE TABLE 게시글
(
    id SERIAL PRIMARY KEY,
    제목 VARCHAR(200) NOT NULL,
    내용 TEXT NOT NULL,
    작성자 VARCHAR(100) NOT NULL,
    작성일 TIMESTAMP DEFAULT NOW(),
    조회수 INT DEFAULT 0,
    카테고리 VARCHAR(50) NOT NULL,
    검색_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', 제목 || ' ' || 내용)) STORED
);
```

와 같이 `tsvector`를 적용할 수 있다.

**`tsvector`는 텍스트 데이터를 분석하여 단어 및 위치를 저장하는 데이터 타입**이다.

postgreSQL 에서 `GENERATED ALWAYS AS ... STORED`는 Computed(Generated) Column 라고 불리며, 컬럼 값을 기반으로 자동으로 계산된 값을 저장하는 기능을 제공한다.

- **검색_vector** : 생성된 컬럼, 데이터 삽입, 갱신 시 자동으로 계산.
- **GENERATED ALWAYS AS** : 생성된 컬럼으로 직접 값을 삽입하거나 업데이트 할 수 없다.
- **to_tsvector('english', 제목 || ' ' || 내용)**
  - **to_tsvector**: 텍스트 필드를 분석하여 Full-Text Search에 사용되는 tsvector 형태로 변환.
  - **'english'**: 텍스트 분석 언어를 영어로 지정한다. / 한국어로 설정하기 위해서는 tsvector 대신 pgroonga 등과 같은 분석기를 추가로 설치하여 설정해줘야한다.
  - **제목 || ' ' || 내용**: 제목과 내용 컬럼을 결합하여 하나의 텍스트로 처리.
- **STORED** : 계산된 결과를 테이블에 실제 값으로 저장하도록 지원해준다.

### ALTER TABLE / UPDATE

``` sql
-- tsvector 컬럼 추가
ALTER TABLE 게시글 ADD COLUMN 검색_vector tsvector;

-- 기존 컬럼 기반 tsvector 타입 값 설정.
UPDATE 게시글
SET 검색_vector = to_tsvector('english', 제목 || ' ' || 내용);
```

여기까지 진행했다면

| id  | 제목              | 내용                                                                  | 작성자  | 작성일                        | 조회수 | 카테고리 |
| :-- | :-------------- | :------------------------------------------------------------------ | :--- | :------------------------- | :-- | :--- |
| 11  | 개발자 회의 주요 발표 11 | 이 게시글은 다양한 주제를 포함하고 있습니다. 예를 들어 IT 트렌드 분석과 같은 내용이 포함됩니다. 게시글 번호: 11 | 작성자1 | 2024-12-26 22:25:51.588693 | 33  | 공지사항 |

의 row에

| 검색_vector                                                                                                                                                                |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| '11':5,22 '같은':17 '개발자':1 '게시글':20 '게시글은':7 '내용이':18 '다양한':8 '들어':13 '발표':4 '번호':21 '분석과':16 '예를':12 '이':6 '있습니다':11 '주요':3 '주제를':9 '트렌드':15 '포함됩니다':19 '포함하고':10 '회의':2 |

와 같은 컬럼과 레코드가 생긴 것을 확인할 수 있다.

'11':5,22 '같은':17 '개발자':1 를 기반으로 설명하자면

- '11':5,22 :
  - '11'이라는 단어는 `to_tsvector('english', 제목 || ' ' || 내용)` 에서 적용한 순서대로 해당 컬럼 값에 몇 번째 단어에 위치하고 있다는 의미다.
  - 중복 시 `,` 로 구분하여 표현
  - `제목` 컬럼 값의 5번째 단어에 위치
  - `내용` 컬럼 값의 22번째 단어에 위치
- '같은':17 : `내용` 컬럼 값의 17번째 단어에 위치
- '개발자':1 : `내용` 컬럼 값의 17번째 단어에 위치

와 같이 구성된다.

tsvector를 설정한 뒤 Full-Text Search를 최적화 하기 위해 **GIN**을 적용할 수 있다.(postgreSQL 기준)

``` sql 
CREATE INDEX idx_게시글_검색_vector ON 게시글 USING GIN (검색_vector);
```

GIN(Generalized Inverted Index) 인덱스는 tsvector 타입으로 저장된 데이터를 역색인(Inverted Index) 기반으로 동작하며, 특정 단어가 포함된 Document를 빠르게 검색할 수 있게 지원해준다.

즉, `tsvector`로 단어를 나누고, GIN으로 인덱싱한다.

이제 다시 "튜닝"을 검색해보자

``` sql
EXPLAIN ANALYZE
SELECT * FROM 게시글
WHERE 검색_vector @@ to_tsquery('튜닝');
```

| QUERY PLAN                                                                                                                       |
| :------------------------------------------------------------------------------------------------------------------------------- |
| Bitmap Heap Scan on "게시글"  (cost=77.48..8320.53 rows=9908 width=566) (actual time=2.738..7.386 rows=10000 loops=1)               |
| Recheck Cond: ("검색_vector" @@ to_tsquery('튜닝'::text))                                                                            |
| Heap Blocks: exact=3847                                                                                                          |
| ->  Bitmap Index Scan on "idx_게시글_검색_vector"  (cost=0.00..75.00 rows=9908 width=0) (actual time=1.921..1.921 rows=10000 loops=1) |
| Index Cond: ("검색_vector" @@ to_tsquery('튜닝'::text))                                                                              |
| Planning Time: 0.140 ms                                                                                                          |
| Execution Time: 7.793 ms                                                                                                         |

위와 같이 Bitmap Index Scan이 이루어지는 것을 확인할 수 있다.

**복합 검색**을 위해서는

``` sql
SELECT * FROM 게시글
WHERE 검색_vector @@ to_tsquery('튜닝 & 사례');
```

`&`를,

**관련성 기반 정렬** 을 위해서는

``` sql
SELECT 제목, 내용, ts_rank(검색_vector, to_tsquery('튜닝')) AS rank
FROM 게시글
WHERE 검색_vector @@ to_tsquery('튜닝')
ORDER BY rank DESC;
```

`ts_rank`, `ORDER BY`를,

**구문 검색**을 위해서

``` sql
SELECT * FROM 게시글
WHERE 검색_vector @@ phraseto_tsquery('PostgreSQL 튜닝');
```

`phraseto_tsquery`를 활용할 수 있다.


# 마무리

DB 조회 성능을 향상 시키기 위한 Index 기법들을 살펴 보았다.

필자도 간단한 예시를 통해서만 학습하고, 기록한 것이기에 얼마나 오랫동안 기억에 남을지 모르겠지만...

항상 기능 구현뿐만 아니라 성능, 효율성, 유지보수성, 가독성, 편의성 등등을 고려하면서 DB 설계 시에도 구조를 이해하고
어떻게 성능을 발휘할 수 있을까 고민하면서 Index도 적용해보면서 다시 익혀봐야겠다.

Ref.

[https://orangematter.solarwinds.com/2019/02/05/the-left-prefix-index-rule/](https://orangematter.solarwinds.com/2019/02/05/the-left-prefix-index-rule/)
https://stackoverflow.com/questions/3645746/what-is-a-fulltext-index-and-when-should-i-use-it
