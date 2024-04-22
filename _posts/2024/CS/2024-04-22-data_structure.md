---
#layout: single
title:	"[CS] 자료 구조(Data structure)의 기본 개념과 종류"
date:	2024-04-22 12:00:00
categories:
  - Computer Science
tags:
  - Data Structure
comment: true
#published: false 
---
컴퓨터 공학에서의 자료 구조란 자료(Data)에 효율적으로 접근하고, 정의하는데 의의를 두며 자료의 구성, 관리, 저장 형식과 더불어 데이터값과 그사이에서의 관계, 데이터를 적용하기 위한 기능이나 동작을 이야기한다.

간단하게 "데이터를 효율적으로 다루기 위한 방법" 정도로 알고 있으면 될 것 같다.

## 필요성
개발에서 "효율" 이라는 이라는 단어를 들으면 보통 무엇이 생각나는가.

일단 필자는 "알고리즘" 이 생각난다.

알고리즘 자체는 문제를 해결하는 상세한 방법이지만 컴퓨터한테 이걸 시키려면 어떤 자료 형을 써야 하고, 어떤 탐색 과정을 거치는지 등등 말은 쉽지 과정을 일일이 구현해야 한다.

거기다가 자원을 낭비하지 않아야 좋은 알고리즘이라고 할 수 있겠다.

알고리즘에서 효율성을 높여줄 수 있는 방법중 하나는 크지도 않고 작지도 않은, 적절하게 자료를 담을 그릇과 방법을 정하는 것이다.

결국 자료 구조도 애플리케이션 효율을 위해 포함될 수밖에 없는 요소가 된다.

## 사용
자료 구조는 사용하기 위해서는 추상 데이터 타입(Abstract data type, ADT)을 구체화한다.

여기서 ADT는 일종의 틀이며, 구체화된 데이터가 어떤 데이터 형(정수, 문자...)을 사용할 것인지, 어떤 연산을 수행하는지 등의 특성을 정해준다.

그리고 효율을 위해서는 애플리케이션마다 추구하는 목적에 맞는 적합한 자료 구조를 사용한다.

예를 들어RDB는는 B-tree 인덱스를 사용하여 검색을 수행하고, 컴파일러는 식별을 위해 hash table의 구조를 사용하는 것처럼.


## 구현
자료 구조는 여러 가지 프로그래밍 언어와 기술들을 이용하여 구현할 수 있으며, 공통적으로로 효율적인 데이터 구조를 가지고 이를 저장하는데 목표가 있다.

프로그램을 이용하여 데이터를 수정하고, 저장하기 위해서 Pointer라 불리는 비트 스트링으로 이루어진 메모리의 주소로 위치를 지정한다.

자료 구조는 데이터를 저장할 때, 포인터를 어떻게 계산하느냐에 따라 특성이 달라지기도 한다.

Array의 경우에는 연속적으로 포인터를 할당되는 구조를 가졌기에 순차적인 데이터 처리에 최적화되었다.

효율적으로 데이터를 다루기 위한 자료 구조를 구현하기 위해서는 인스턴스 생성, 조작하는 등의 일련의 프로시저를작성해야 한다.


## 자료 구조의 예시
Integer, Boolean, Floating-point numbers 등과 같은 기본 자료형으로 ADT의 데이터 타입을 정하여 자료 구조를 인스턴스화 시킨다. 이용하여 자료 구조가 빌드된다.

대표적인 자료 구조의 종류를 알아보자.
### Array
똑같은 데이터 타입의 값들이 순서를 가지고 연속적으로 저장된 자료구조이다.

정수를 인덱스로 제공함으로써 해당 위치에 있는 데이터에 접근할 수 있다.
첫 번째 데이터에 접근하고 싶다면 0번 인덱스로 접근하면 된다.

Array의 저장 공간 즉, 길이는 보통 고정하여 사용하지만 resieable 하다.

저장될 때는 데이터 타입의 사이즈만큼 주소에 더해지는 식으로 위치가 배정된다.

예를 들어 4byte의 int 형으로 Array를 선언했다면,
인스턴스화 시킬 때 컴퓨터가 2000의 위치로 첫 번째 데이터를 저장, 2004의 위치에 두 번째 데이터를 저장, 2008의 위치에 데이터를 저장하는 식으로 점진적 위치 배정이 이루어진다.

![array]({{ site.baseurl }}/assets/images/posts/2024/CS/data-structure/array.png)

*https://www.ggorantala.dev/introduction-to-array-ds/*


### Linked list(List)
노드(Node)라는 단위를 선형적(순서를 가진)으로 배치시켜 데이터를 저장한다.

노드는 값을 가지고 있고, 다른 Linked list의 노드 주소를 가지고 있다.

다음 노드의 주소가 지정되지 않았다면 더 이상 데이터가 없다는 의미를 가진다.

값과 다음 노드의 주소를 가진 Singly linked list, 이전 노드의 주소와 값, 다음 노드의 주소를 가진 Doubly linked list, 마지막 노드의 다음 주소를 linked list의 시작 노드로 저장해 놓은 Cicular linked list 등등 노드의 종류도 여러 가지다.

Array와 비교하였을 때 Array는 값만 가지고 있기에 한 요소를 지우면 그 위치는 빈 상태로 유지되거나 이를 방지하기 위해 해당 위치에서부터 뒤에 있는 요소들을 하나씩 앞으로 당겨 오고, 사이즈를 줄이는 등 번거로운 작업을 수행해야 한다.

반면 Linked list는 데이터 요소의 생성, 삭제에서는 노드끼리 결합이 되어있기에, 노드 사이에 노드가 삭제 되거나 추가 되었을 때 이전 노드의 다음 주소를 재배치하는 노드의 주소로 넣고, 재배치 하는 노드에 다음 노드의 주소를 넣어주면 간단하게 변경 가능하다. (Singly linked list)

하지만 랜덤 요소 접근에는 lists는 arrays보다 느리다.
(목적에 맞게 적절한 자료 구조를 사용하라는 의미)

![linked list]({{ site.baseurl }}/assets/images/posts/2024/CS/data-structure/linked_list.png)

*https://medium.com/@ahsan.majeed086/data-structure-and-algorithms-linked-list-bdea21f38e70*


### Record(tuple, struct)
데이터베이스 혹은 스프레드시트에서는 Rows라고도 불리는 Record는 여러 가지 데이터 타입을 가지는 Field 혹은 member의 묶음이다.

예를 들어 년도는 numeric으로 필드를 구성, 달(month)는 string, 일은 string과 numeric을 수용하도록 구성할 수 있다.

정확하진 않겠지만 아래의 구조라 생각하면 쉬울듯하다.

![Record]({{ site.baseurl }}/assets/images/posts/2024/CS/data-structure/record.png)

*https://www.excelcampus.com/pivot-tables/structure-pivot-table-source-data/*


### Hash tables(hash map, hash set)
key를 기반으로 값을 빠르게 검색할 수 있는 데이터 구조.

연관 배열(Associative array)을 구현하였고, hasing 기능을 사용하여 배열의 인덱스에 key를 매핑하여 해당 되는 위치의 bucket의 value를 구할 수 있다.

가장 이상적인 hash 함수는 각 키를 고유한 bucket에 할당하지만, 일반적으로 불완전한 hash 함수를 사용하여 하나의 키에 동일한 인덱스 생성하는 등 충돌이 일어날 수 있다.

이를 해결하기 위해서 chaining, open addressing 과 같은 기술로 충돌을 처리할 수 있다.

![Hash Table]({{ site.baseurl }}/assets/images/posts/2024/CS/data-structure/hash_table.png)

*https://en.wikipedia.org/wiki/Hash_table*

### Graphs
개체(entities) 간에 관계를 나타내는 간선들(Edges)로 연결된 정점들(Nodes, vertices)의 묶음이다.

수학에서의 graph를 나타내기 위한 자료 구조이며, 소셜 네트워크, 컴퓨터 네트워크 등의 모델링에 사용될 수 있다.

방향성을 가질 수도, 가지지 않을 수도 있으며, 순환적 혹은 비순환 적일 수도 있다.  

![Graphs]({{ site.baseurl }}/assets/images/posts/2024/CS/data-structure/graph.png)

*https://www.boardinfinity.com/blog/graphs-in-data-structure/*

### Stack / Queues
쌓다라는 뜻의 Stack은 하나의 출입구(top)를 가지고 있는 자료 구조다.
top 위치에서만 요소의 추가 삭제가 이루어지며, 요소를 추가하는 push와 제거하는 pop, top의 값을 가져오는 peek의 주요 기능이 있다.
Last In, First Out(LIFO) 즉, 마지막에 들어간 요소가 가장 먼저 나오는 구조를 가지고 있다.

push와 pop 마다 현재 위치, 인덱스를 나타내는 top의 위치가 바뀐다.
![Stack]({{ site.baseurl }}/assets/images/posts/2024/CS/data-structure/stack.png)

Quque는 back(tail), front(rear)의 출입구가 있으며, back으로 데이터가 들어가서 front로 나온다.~~인간이랑 반대~~
요소를 추가하는 enqueue와 삭제하는 dequeue, 현재 front(stack의 top과 비슷)에 위치한 값을 보여주는 peek의 주요 기능이 있다.

Queue는 First In First Out(FIFO)의 데이터 구조를 가지고 있다.

![Queue]({{ site.baseurl }}/assets/images/posts/2024/CS/data-structure/queue.png)

*https://en.wikipedia.org/wiki/Queue_(abstract_data_type)*


### Trees
노드들 간의 연결로 이루어진 계층 구조를 가지고 있다.

노드는 부모와 자식 노드로 구분할 수 있는데 부모는 여러 자식을 가질 수 있는 반면,
자식 노드는 하나의 부모만 가질 수 있다.

root라고 불리는 최상위 노드(위로 더 이상 부모가 없는)에서 시작하여 나무의 뿌리 같이 모양으로 depth를 이어간다.

자식 요소의 자식은 자식 요소가 부모가 될 수 있기에 계층 구조라 표현한다.

얼핏 보면 Graph지 않나 싶지만 순환도 허용하는 Graph와 다르게 Tree의 조건으로써 순환되지 않아야 하며, 노드 간에 단절은 허용되지 않는다.

대표적으로 Binary trees, AVL trees, B-trees가 있다.

검색, 정렬, 계층 표현에 효율적인 자료 구조다.  

![Trees]({{ site.baseurl }}/assets/images/posts/2024/CS/data-structure/trees.png)

*https://en.wikipedia.org/wiki/Tree_(data_structure)*


### Trie(Prefix tree, Digital tree)
String을 효율적으로 검색하기 위한 tree 자료 구조이다.

문자열을 노드로 저장하고, 각 간선은 문자를 나타낸다.

빠른 검색, 접두사 기반 작업, 자동 완성, 맞춤법 확인, 사전 구현, 텍스트 처리에 특화 되었다.  

![Tries]({{ site.baseurl }}/assets/images/posts/2024/CS/data-structure/trie.png)

*https://en.wikipedia.org/wiki/Trie*


<br/>
Ref.  
[https://en.wikipedia.org/wiki/Data_structure](https://en.wikipedia.org/wiki/Data_structure)