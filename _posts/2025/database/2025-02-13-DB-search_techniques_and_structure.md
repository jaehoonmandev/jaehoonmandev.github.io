---
#layout: single
title:	"[Database] 데이터의 기본 탐색 기법과 구조"
date:	2025-02-13 12:00:00
categories:
- Database
tags:
- Page 
- Block
- Heap Table
- Full Table Scan
- Index Scan
---

데이터가 주력이 된 현대에와서 데이터베이스의 역할이 상당히 중요해졌다.

영속성 데이터를 조회하여 업무를 처리하고, 우리의 일상에서도 활용하게 된다.

심지어는 은행에서도 우리의 잔고, 신용도, 개인정보 등을 안전하게 다루기 위해서 데이터베이스를 사용한다.

하루에 수천, 수만, 그 이상의 건을 처리하는 데이터베이스는 사용 기간이 길어지는 만큼 데이터가 쌓이게 될 것이고, 조회 성능에 악영향을 끼치게 될 것이다.

이전에 우리가 보았던 내용 처럼 인덱스와 같은 기법을 적용하여 조회 성능을 올린다면 서비스를 안정적이고 효율적으로 운영할 수 있을 것이다.

그렇다면 데이터베이스는 어떻게 데이터를 읽어오는지 알아보는 시간을 가져보자.

# DBMS의 데이터 구조

먼저 데이터베이스에서 데이터가 어떻게 저장 되는지 알고 가는 게 좋을 것 같다.

데이터베이스에서 데이터는 단순히 우리가 보는 테이블 형태로 저장되지 않는다.

**물리적인 저장 공간인 Disk, SSD, HDD에 저장**되며 성능 최적화를 위해 Memory(Buffer, Pool, Cache)를 활용하기도 한다.

## 저장 구조
- Table(Entity) 생성.
- Column(Attribute) 구성.
- Record(Row, Tuple) 값 삽입.

의 저장 과정을 거치면

![database-store-structure]({{ site.baseurl }}/assets/images/posts/2025/database/search-techniques/1/database-store-structure.png)  
*https://www.linkedin.com/pulse/how-data-organized-disk-database-systems-manish-pokhriyal-2rpwc*

와 같이 여러 개의 요소로 나뉘어져 관리된다.

### 데이터의 구성 요소

저장 되는 데이터를 효율적으로 관리하기 위해 **File -> Page -> Block -> Row(Record) 의 계층적인 저장 단위**를 사용한다.

![database-storage]({{ site.baseurl }}/assets/images/posts/2025/database/search-techniques/1/database-storage.png)  
*https://medium.com/@yasin162001/database-storage-methods-6abe4f8d8508*

#### Database File
- 실제 데이터를 저장하는 파일(`.dbf`, `.mdf`, `.ibd`, `.dat`...)
- **데이터베이스의 가장 상위 저장 단위.**
- 테이블, 인덱스, 트랜잭션 로그 등 다양한 데이터를 포함.
- ex) PostgreSQL -> base/...

#### Page

![page-layout]({{ site.baseurl }}/assets/images/posts/2025/database/search-techniques/1/page-layout.png)  
*https://medium.com/@hnasr/database-pages-a-deep-dive-38cdb2c79eb5*

- DBMS의 **논리적 저장 단위.**
- **여러 개의 Row**를 포함하고 있으며, **데이터를 저장하고, 조회하는 기본 단위.**
- 일반적으로 4~16KB의 크기를 가진다.

조회하는 Page 내부에는
- **Header** : page metadata(size, transaction...)
- **Item Pointers** : Row의 위치 정보
- **Tuple(Row Data)** : 실제 저장된 데이터
- **Free Space** : 새로운 데이터 삽입을 위한 여유 공간

#### Block
- 디스크의 **물리적 최소 저장 단위.**
- OS에서 데이터를 관리하는 단위.
- 일반적으로 512B~8KB의 용량을 가진다.
- 즉, **하나의 Page는 여러 개의 Block**에 걸쳐 저장될 수 있다.

으로 구성되어 있다.
#### Row (Record, Tuple)
- 테이블의 한 행, 실제 데이터가 저장되는 단위.
- Page 내부에 저장되며, 각 Row는 Slot(Offset) 테이블을 통해 관리된다.

## I/O 최적화 개념

DB는 **Page 단위로 읽기(Read I/O)가 수행된다.**

### I/O 비용 최적화 방법 
- `SELECT` 쿼리를 실행하면, **DBMS는 필요한 Row가 속한 Page 전체를 Buffer Pool(DB용으로 사용하는 주 메모리 영역)에 로드.** 
- **한 번의 디스크 접근으로 여러 개의 Row를 조회**할 수 있어 **Read I/O 성능이 향상**
- Heap Table에서 **Full Table Scan이 발생하면 많은 Page를 읽어야 하므로 비효율적**이 될 수 있다. 
- **Clustered Index Table을 사용하면** 인덱스를 활용하여 **필요한 Page만 읽을 수 있어 I/O 비용이 절감된다.**

## 저장 방식

DBMS마다 차이점이 있을 수 있지만 보통은 Heap Table, Clustered Index 방식으로 저장한다.

### Heap Table(Storage)

![heap-table]({{ site.baseurl }}/assets/images/posts/2025/database/search-techniques/1/heap-table.png)  
*https://www.pragimtech.com/blog/sql-optimization/what-is-heap-table/*


#### 특징 
- **데이터를 정렬하지 않고 삽입되는 순서대로 저장**하는 방식.
- 별도의 인덱스가 없다면 **Full Table Scan(전체 데이터 조회)이 발생할 가능성이 높음.**
- **PostgreSQL, MySQL의 기본 테이블 저장 방식**

#### 장점
- 빠른 데이터 삽입이 가능하다.
- 테이블을 설계할 때 Primary Key나 정렬이 필요하지 않음.

#### 단점
- 인덱스가 없으면 Full Table Scan이 발생하여 검색 성능이 떨어진다.
- 삭제된 데이터의 빈 공간(fragmentation)이 많아질 수 있다.

Heap Table을 사용하면 **주로 WHERE 조건이 없는 대량 삽입, 임시 테이블 등의 용도로 적합**하다.

### Clustered Index Table

![clustered-index]({{ site.baseurl }}/assets/images/posts/2025/database/search-techniques/1/clustered-index.png)  
*https://www.pragimtech.com/blog/sql-optimization/what-is-heap-table/*


#### 특징 
- **Primary Key를 기준으로 데이터가 정렬된 상태로 저장**하는 방식.
- 데이터 자체가 B+Tree 구조의 **리프 노드(Leaf Node)에 저장.**
- 인덱스를 검색하면 **데이터를 빠르게 찾을 수 있음.**
- **MySQL InnoDB, SQL Server의 기본 저장 방식**

#### 장점
- **PK 기반 검색 속도가 빠름.** (B+Tree 구조를 이용) 
- **범위 검색(range scan)**에 유리. 
- **ORDER BY, GROUP BY** 최적화 가능.

#### 단점
- **삽입/삭제 시 성능 저하** 가능성 (**정렬 유지** 필요)
- 한 테이블에 **하나의 Clustered Index만 생성** 가능.

Clustered Index를 사용하면 **WHERE 조건이 Primary Key 또는 범위 조회인 경우 성능이 향상**된다.

#### Clustered Index VS Non-Clustered Index

|                      | Clustered Index          | Non-Clustered Index             |
| -------------------- | ------------------------ | ------------------------------- |
| **저장 방식**            | 실제 데이터가 정렬된 형태로 저장됨      | 데이터는 별도로 저장되고 인덱스만 정렬됨          |
| **생성 개수**            | 1개                       | 여러 개                            |
| **데이터 접근 방식**        | 인덱스 탐색 시 바로 데이터 접근 가능.   | 인덱스 탐색 후 추가적인 데이터 조회 필요(Filter) |
| **검색 속도**            | 빠름(정렬 상태)                | 상대적으로 느림(LOOKUP 비용 발생)          |
| **INSERT/UPDATE 성능** | 값 변경 시 데이터 재정렬이 발생할 수 있음 | 인덱스만 갱신하므로 영향 적음                |
| **스토리지 공간**          | 데이터 자체에 포함되어 추가 공간 불필요   | 인덱스 테이블이 별도로 존재하여 추가 공간 필요      |

이외에도 Index-Organized Table, Append-Only Storage 등이 있지만 따로 다루진 않겠다.

# Full Table Scan

![full-table-scan]({{ site.baseurl }}/assets/images/posts/2025/database/search-techniques/1/full-table-scan.png)
*https://www.cybertec-postgresql.com/en/postgresql-indexing-index-scan-vs-bitmap-scan-vs-sequential-scan-basics/*

## Sequential Search, 순차 탐색

먼저 Full Table Scan은 보통 **Linear Search(선형 검색)의 방식을 사용하는 가장 기본적인 조회 방식**이다.

**인덱스를 따로 처리하지 않았을 때** 찾으려는 데이터를 **처음부터 끝까지 하나씩 비교**한다.

데이터가 **정렬 되지 않아도 사용 가능**하지만 이 때문에 **O(n) 의 시간복잡도**를 가진다.

즉, **데이터가 많아질수록 조회 성능이 떨어진다.**

Heat Table에서 발생하는 Full Table Scan을 Heap Scan이라고도 한다.

## Linear Search

Full Table Scan은 일반적으로 Linear Search 즉, **선형 검색 방식으로 조회**를 수행한다.

하지만 여러 스레드가 동시에 검색을 수행하는 **Parallel Scan(병렬 스캔)을 지원하는 DB도 있기에** 항상 Linear Search로 수행 된다고 보긴 어렵다.

책을 예시로 들자면 첫 번째 페이지에서부터 목차를 참고하지 않고 찾고 싶은 페이지까지 찾아 가는 과정에 해당된다.

``` sql
CREATE TABLE 직원  
(  
    id SERIAL PRIMARY KEY,  
    이름 VARCHAR(50),  
    부서 VARCHAR(50),  
    연봉 INT  
);  
  
INSERT INTO 직원 (이름, 부서, 연봉)  
VALUES ('인사팀1', '인사팀', 5000),  
       ('개발팀1', '개발팀', 6000),  
       ('재무팀1', '재무팀', 5500),  
       ('마케팅팀1', '마케팅팀', 5800),  
       ('개발팀2', '개발팀', 6200),  
       ('재무팀2', '재무팀', 5700),  
       ('인사팀2', '인사팀', 5100),  
       ('개발팀3', '개발팀', 5900),  
       ('마케팅팀2', '마케팅팀', 5600),  
       ('재무팀3', '재무팀', 6000);
```

의 데이터를 활용하여

``` sql
SELECT * FROM employees WHERE name = '재무팀3';
```
의 쿼리를 실행한다면

1. 1번째 행("인사팀1") 확인 -> "재무팀3"인가? **X 다음 행으로 이동**
2. 2번째 행(개발팀1) 확인 -> "재무팀3"인가? **X 다음 행으로 이동**
3. 3번째 행(재무팀1) 확인 -> "재무팀3"인가? **X 다음 행으로 이동**
4. 4번째 행(마케팅팀1) 확인 -> "재무팀3"인가? **X 다음 행으로 이동**
5. …
6. 10번째 행(재무팀3) 확인 -> "재무팀3"? **O 검색 완료**

의 과정을 수행한다.

쿼리 계획을 실행하면

``` sql
EXPLAIN ANALYZE 
SELECT * FROM 직원 WHERE 이름 = '재무팀3';
```

| QUERY PLAN                                                                                          |
| :-------------------------------------------------------------------------------------------------- |
| Seq Scan on "직원"  \(cost=0.00..13.75 rows=2 width=244\) \(actual time=0.022..0.022 rows=1 loops=1\) |
| Filter: \(\("이름"\)::text = '재무팀3'::text\)                                                           |
| Rows Removed by Filter: 9                                                                           |
| Planning Time: 0.256 ms                                                                             |
| Execution Time: 0.066 ms                                                                            |

와 같이 **순차적으로 조회(Seq Scan)** 하여 **9개의 행을 제거(Rows Removed)** 하여 "재무팀3"
을 찾았고, **총 실행 시간은 0.066ms가 소모**됐다.

당장은 10개의 Rows만 가지고 있기에 0.066ms가 소모 됐지만 100,000,000 개의 Rows가 있을 때 단순 O(n)의 계산으로 최대 660,000ms(660' == 11'') 가 소모될 것이다.

# Parallel Scan

일부 DB는 데이터를 병렬로 읽어들이는 **Parallel Scan**을 지원한다.

Parallel Scan은 **테이블을 여러 개의 블록(스트라이드)로 나누어 병렬로 조회**하는 방식이다.

하지만 Parallel Scan이 항상 빠른 것은 아니기에 별도 튜닝이 필요할 수 있다.

자세히는 알아보지 않고 이런 게 있다~

# Index Scan

*Index 자료구조의 하나인 B-Tree*  
![index-scan]({{ site.baseurl }}/assets/images/posts/2025/database/search-techniques/1/index-scan.png)  
*https://sqlsunday.com/2013/02/19/indexing-basics/*

**Index를 활용하여 검색 범위를 좁히고, 더 빠르게 데이터를 조회하는 방식**이다.

인덱스 적용은 **선형 검색의 비효율적인 조회 방법을 개선**하기 위해 데이터를 정렬하거나, Mapping Table 등의 효율적으로 데이터를 다룰 수 있는 자료구조로 변환하는 작업이라 할 수 있다.

## Index Scan 의 효율성

Index Scan을 수행하는 자료구조로는 B-Tree / B+Tree, Hash, Bitmap 등이 있는데, 종류에 따라 시간 복잡도는 **O(1) ~ O(log n)** 로 개선된다.

Index Scan이 빠른 이유는 대부분의 RDBMS에서 **B-Tree(B+Tree) 인덱스 구조**를 사용하기 때문이다.

B-Tree 등과 같은 자세한 인덱스 종류에 대해서는 해당 포스트에서 다루진 않겠다..

## Full table scan이 수행될 수 있는 경우와 개선

Optimizer에 의해 Seq Scan이 더 유리하다고 판단 되는 경우에는 Full table scan이 수행될 수 있다.

즉, 인덱스를 적용 했다고 항상 인덱스 스캔을 거치지 않는 경우도 있다는 의미다.

이와 같이 Full table scan이 수행되는 경우에는

### 1. 데이터가 너무 적음

Row 수가 적다면 Seq Scan이 더 빠를 수 있다.

#### > 개선
데이터가 충분히 쌓이고, 성능에 영향이 있을 때 인덱스를 적용해보는 방법이 있다.

### 2. `ANALYZE` 미실행

인덱스 생성을 했음에도 통계 정보를 기반으로 최적화하는 DB는 인덱스 사용이 최적화 방법이 아니라고 판단하는 경우도 있다.

#### > 개선
인덱스를 적용한 뒤 ANALYZE를 실행시켜보는 방법이 있다.
```
ANALYZE 직원;
```

### 3. LIKE '%값%' 와 같이 앞부분이 와일드카드(%)로 시작하는 경우

B-Tree의 인덱스의 경우 문자열 앞부분부터 정렬을 진행한다.

하지만

``` sql
SELECT * FROM 직원 WHERE 이름 LIKE '%재무팀%';
```

Condition에 해당하는 텍스트를 앞에서부터 와일드카드로 지정한다면 정렬 했던 게 무용지물이 된다.

#### > 개선
앞이 아닌 뒤에 와일드 카드를 사용하자

``` sql
SELECT * FROM 직원 WHERE 이름 LIKE '재무팀%';
```

### 4. OR 조건이 인덱스를 사용할 수 없는 경우

`WHERE 이름 = '재무팀%' OR 부서 = '재무팀'` 과 같은 경우에서 이름이나, 부서 한 곳에만 인덱스가 적용 되었다면 인덱스 스캔이 이루어지지 않을 수 있다.

#### > 개선
`OR` 을 사용하는 컬럼들을 복합 인덱스로 지정하자

``` sql
CREATE INDEX idx_직원_이름_부서 ON 직원 (이름, 부서);
```

### 5. CAST, FUNCTION을 사용하는 경우

`SELECT * from 직원 WHERE id::TEXT = 1::TEXT;` 와 같이 casting을 수행하거나,
`SELECT * from 직원 WHERE UPPER(이름) = '재무팀%'; 과 같이 조건에 function을 사용하는 경우 인덱스 스캔이 수행되지 않을 수 있다.

#### > 개선
`UPPER`와 같은 함수를 사용하는 컬럼은 함수를 기반으로 인덱스를 생성하자
``` sql
CREATE INDEX idx_직원_이름_upper ON 직원 (UPPER(이름));
```

### 6. NOT IN, != , IN 연산자를 사용하는 경우

NOT IN, `!=` 연산자를 사용할 때 항상 그런 것은 아니지만,
일반적으로 해당 연산자들은 모든 값을 비교해서 아닌 값들을 판단해야 하기에 모든 데이터를 비교할 우려가 있다.

IN의 경우에도 IN에 포함되는 데이터가 많다면 Optimizer에서 Full scan을 수행할 수도 있다.

#### > 개선
범위 조건 혹은 EXISTS 사용

``` sql
SELECT * FROM 직원 WHERE 이름 IN ('재무팀1', '개발팀1');

SELECT * FROM 직원 WHERE NOT EXISTS (
    SELECT 1 FROM 직원 WHERE 이름 = '재무팀3'
);
```


등이 있으며, Index를 적용 했음에도 Full table scan이 발생할 우려가 있다.

최적화를 위해서는 실행 계획을 참고하는 습관을 들이고 필요 시 인덱스 재설계를 고려하는 것이 좋을 것이다.

참고로 PostgreSQL을 기준으로는 주기적으로 ANALYZE, AutoVacuum 등이 실행되면서 자동으로 인덱스를 적용시키는 경우도 있다.

### Full table scan 방지 요약

| **원인**                      | **설명**                                        | **개선 방법**                                                  |
| --------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| **데이터가 너무 적음**              | Row 수가 적으면 Seq Scan이 더 빠를 수 있음                | 데이터가 많아지면 인덱스를 적용                                          |
| **ANALYZE 미실행**             | 통계 정보 부족으로 최적화가 되지 않음                         | `ANALYZE 직원;` 실행                                           |
| **LIKE ‘%값%’ 사용**           | B-Tree 인덱스는 앞부분부터 정렬하므로 비효율적                  | `'값%'` 패턴 사용                                               |
| **OR 연산자가 인덱스를 사용하지 못함**    | OR 조건 중 하나만 인덱스 적용된 경우                        | 복합 인덱스(`CREATE INDEX idx_직원_이름_부서 ON 직원 (이름, 부서);`)        |
| **CAST, FUNCTION 사용**       | 인덱스가 적용되지 않을 수 있음                             | 함수 기반 인덱스 생성 (`CREATE INDEX idx_upper ON 직원 (UPPER(이름));`) |
| **NOT IN, `!=`, IN 연산자 사용** | 모든 데이터를 비교해야 하므로 Full Table Scan이 발생할 가능성이 있음 | `EXISTS` 또는 범위 조건(`BETWEEN`, `>=`, `<=`) 사용                |

## Index Scan Methods

인덱스가 적용된 자료구조에서 **데이터를 검색하는 방법은 검색 조건, 인덱스 구조, 최적화 방식 등에 따라 여러가지**가 있다.

B-Tree의 구조를 통해 간단하게 스캔의 예시를 들어보겠다.

일단은 B-Tree 라는 것은 Balanced Binary Tree의 한 종류로 트리 구조를 가지지만 **트리의 균형을 유지하도록 설계된 탐색 트리** 라는 정도만 알아두자.

![index-scan]({{ site.baseurl }}/assets/images/posts/2025/database/search-techniques/1/index-scan.png)  
*https://medium.com/@yasin162001/database-storage-methods-6abe4f8d8508*

의 이미지를 한 번 더 참고하자.

### 1. Index Scan

**WHERE 조건에 인덱스**가 적용 되는 경우 **가장 기본적인 인덱스** 검색 방법.

PK, Unique Key, Secondary Index 모두 적용 가능하다.

``` sql
SELECT * FROM 직원 WHERE id = 10;

-- 부서에 Index나 Key를 설정했을 시.
SELECT * FROM 직원 WHERE 부서 = '개발팀';
```

#### 특징
- B-Tree 인덱스의 Root -> Leaf 노드를 따라 내려가면서 해당하는 데이터를 조회.
- **O(log n)**의 검색 성능.
- **반환되는 Row 개수가 많으면 다른 조회 방식이 유리**할 수 있음.

``` 
        [10, 20, 30]   <- Root Node
         /   |    \
       /     |     \
  [5,10]  [15,20] [25,30]  <- Branch Nodes
    |         |       |
 [5, 10]  [15, 20]  [25, 30]  <- Leaf Nodes
```

의 데이터가 있다면,
1. **Root Node 탐색** -> 10은 `[10, 20, 30]` 중 10 <= 10 < 20 이므로 `[5, 10]` Branch Node로 이동.
2. **Branch Node 탐색** ->  10이 포함된 `[5,10]` Leaf Node로 이동.
3. **Leaf Node 탐색** -> 10을 찾고 반환, 탐색 종료
4. 최종적으로 10을 반환.


### 2. Index Range Scan

특정 **범위 조건을 만족하는 데이터를 인덱스를 이용해 검색**하는 방식.

WHERE 조건에서 **BETWEEN, <, >, LIKE '값%' 같은 범위 검색**이 있을 때 사용됨.

``` sql
SELECT * FROM 직원 WHERE id BETWEEN 5 AND 15;
```

#### 특징
- PK, 인덱스 컬럼에서 **범위에 속하는 데이터를 빠르게 조회** 가능.
- **ORDER BY가 포함될 경우 정렬 비용이 절감**될 수 있음.
- 반환되는 데이터 개수가 많으면 **Full Table Scan보다 느릴 수도 있음**.

``` 
        [10, 20, 30]   <- Root Node
         /   |    \
       /     |     \
  [5,10]  [15,20] [25,30]  <- Branch Nodes
    |         |       |
 [5, 10]  [15, 20]  [25, 30]  <- Leaf Nodes
```

1. **Root Node 탐색** -> 5 < 10 이므로 첫 번째 Branch 노드 `[5, 10]`로 이동
2. **Branch Node 탐색** -> 5가 포함된 첫 번째 Leaf Node `[5, 10]`으로 이동
3. **Leaf Node에서 데이터 찾기** -> 5부터 10까지 데이터를 찾음
4. **다음 Leaf Node로 이동** -> 15는 다음 Branch Node인 `[15, 20]`에 포함되므로 이동
5. **새로운 Leaf Node에서 데이터 찾기** -> 15를 찾고 반환 (탐색 종료)
6. 최종적으로 5, 10, 15를 반환.

### 3. Index Unique Scan

반환 값이 1개 이하로 보장될 때 사용된다.

PK, Unique Index 가 있는 경우에 사용된다.

``` sql
SELECT * FROM 직원 WHERE id = 10;
```

#### Index Scan과 다른점

Index Scan과 같은 쿼리문 예시를 들었다.

**Index Scan은 PK, Unique Index가 아닌 다른 인덱스를 검색 조건으로 가질 수 있다.**

즉, 반환 값이 항상 1이 아닐 수도 있다.

하지만 **Index Unique Scan은 항상 반환 값이 1개 이하인 검색 조건에서만 수행**된다.

### 4. Index Full Scan

**인덱스가 적용된 데이터를 처음부터 끝까지 모두 스캔**하는 방식이다.

**ORDER BY** 가 있을 경우, 이미 정렬된 인덱스를 활용하여 빠르게 정렬된 데이터를 조회할 때 사용된다.

**Full Table Scan과 유사**하지만 **정렬 관련 연산 비용이 줄어든다.**

``` sql
-- ORDER BY 가 있는 경우
SELECT id FROM 직원 ORDER BY id;
```

#### 특징
- ORDER BY, WHERE 등이 없어도 테이블을 모두 읽을 필요가 없다면 Index Full Scan이 수행될 수도 있다.(`SELECT id FROM 직원` )
- 정렬이 필요한 경우, 추가 정렬 비용 없이 빠르게 조회 가능.
- 인덱스만으로 데이터를 찾을 수 없다면 추가적인 비용이든다.

### 5. Index Skip Scan

Oracle, MySQL 등의 일부 DBMS에서 지원하는 기능으로 복합 인덱스(Multi-Column Index)의 첫 번째 컬럼 없이 검색해야 할 때 사용하는 방법이다.

즉, 두 번째 컬럼부터 인덱스를 활용할 수 있는 방법이다.

``` sql
CREATE INDEX idx_직원_부서_이름 ON 직원 (부서, 이름);

SELECT * FROM 직원 WHERE 이름 = '마케팅팀2';
```

#### 탐색 과정

```
	     [ 개발팀,         마케팅팀,           인사팀,          재무팀]  <- Root Node
                /               |                |               \
              /                 |                |                 \
 [개발팀1, 개발팀2, 개발팀3] [마케팅팀1, 마케팅팀2] [인사팀1, 인사팀2] [재무팀1, 재무팀2, 재무팀3]  <- Leaf Nodes
```

1. 부서, 이름으로 생성된 복합 인덱스 구조에서 부서에 해당하는 Root Node 탐색을 Skip
2. Leaf Nodes 탐색 -> 마케팅팀2 반환

#### 특징
- 복합 인덱스에서 첫 번째 컬럼이 검색 조건에 없더라도 인덱스를 활용할 수 있음.
- 컬럼 **중복도가 높을 경우 유리**함.
- 항상 자동으로 Index Skip Scan을 수행하진 않음.

### 6. Index Fast Full Scan

Index Full Scan과 유사하지만 Parallel Read를 수행하여 속도를 최적화한다.

MySQL, Oracle 등과 같은 일부 DBMS에서 지원하는 방법으로, 인덱스만 읽고 테이블을 조회할 필요가 없을 때 수행된다.

#### 특징
- 멀티 블록 읽기를 통해 속도 향상 (Parallel Read 가능).
- 정렬, 테이블 조회가 필요 없는 경우 유리함.
- 특정 최적화 시에만 자동 적용됨.

### Index Scan Methods 요약

| **Index Scan Method**    | **설명**                  | **WHERE 조건**              | **예시**     |
| ------------------------ | ----------------------- | ------------------------- | ---------- |
| **Index Scan**           | 기본적인 인덱스 검색             | `id = 10`                 | 단일 Row 검색  |
| **Index Range Scan**     | 범위 검색                   | `id BETWEEN 5 AND 15`     | 범위 조회      |
| **Index Unique Scan**    | 고유 값 검색                 | `id = 1` (PK, Unique Key) | 하나의 Row 검색 |
| **Index Full Scan**      | 인덱스 전체 검색               | `ORDER BY id`             | 정렬이 필요한 경우 |
| **Index Skip Scan**      | 복합 인덱스에서 일부 컬럼 조건이 없을 때 | `이름 = '개발팀2'`             | 복합 인덱스 활용  |
| **Index Fast Full Scan** | 멀티 블록 병렬 리드             | `SELECT id FROM 직원`       | 빠른 인덱스 읽기  |

여기까지 데이터 저장 구조, Scan 방식 등 데이터베이스 성능을 개선하기 위해서 필요한 지식의 일부를 어렴풋이라도 알아봤다.

DBMS 마다 차이점이 존재하기 때문에 올바른 내용을 작성하지 못했을 수도 있지만 데이터베이스의 데이터 조회 방법에 대해 알아봤다.

<br> 

Ref.

[https://hoon93.tistory.com/53](https://hoon93.tistory.com/53)

[https://pyoungt.tistory.com/67](https://pyoungt.tistory.com/67)

[https://escapefromcoding.tistory.com/777](https://escapefromcoding.tistory.com/777)

[https://www.pragimtech.com/blog/sql-optimization/what-is-heap-table/](https://www.pragimtech.com/blog/sql-optimization/what-is-heap-table/)

[https://vipulvyas.medium.com/understanding-database-internals-how-tables-and-indexes-are-stored-on-disk-and-queried-7cf09a6a48a4](https://vipulvyas.medium.com/understanding-database-internals-how-tables-and-indexes-are-stored-on-disk-and-queried-7cf09a6a48a4)

[https://www.linkedin.com/pulse/how-data-organized-disk-database-systems-manish-pokhriyal-2rpwc](https://www.linkedin.com/pulse/how-data-organized-disk-database-systems-manish-pokhriyal-2rpwc)

[https://sqlsunday.com/2013/02/19/indexing-basics/](https://sqlsunday.com/2013/02/19/indexing-basics/)


