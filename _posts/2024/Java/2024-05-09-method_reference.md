---
#layout: single
title:	"[Java] Method Reference Operator"
date:	2024-05-09 12:00:00
categories:
  - Java
tags:
  - Lambda
  - Method Reference Operator
  - Anonymous Class
comment: true
#published: false 
---
메서드 참조라고 불리우는 기능으로 이전에 포스트 하였던 람다식을 이해했다면 이보다 더 간편하고 가독성 좋게 코드를 작성하게 해준다.

`::` 로 이를 표현하며 PostgreSQL등과 같은 DB를 사용할 시 형변환의 용도로 사용해보았을 수도 있다.

기존에 있는 메서드를 참조하여 간단한 람다식을 만든다.

람다식을 기반으로하는 특수한 타입이기 때문에 람다식의 기반 지식이 있어야하고, 추가로 익명 클래스의 내용도 이해하면 좋을 것 같다.

이전 포스트는
- 람다
- 익명함수
  를 보면된다.

메서드 참조는 4가지 종류가 있다.
- Static methods
- Instance methods of particular objects
- Instance methods of an arbitrary object of a paticular type
- Constructor

## Reference to a Static Method
정적 메서드를 참조하는 방법이다.

특정 클래스의 메서드를 호출하는 경우로 사용자가 구현한 메서드가 아닌 Java 자체에서 구현한 메서드를 호출하는 방법이라 이해하면 될 것 같다.

```java
ClassName::methodName
```

의 형태로 사용한다.

`::`가 핵심이며 methodName에는 `()`가 붙지 않는다.

간단한 예시를 보고 가자.

``` java
public static void main(String[] args) {  
    //List 생성 및 초기화.  
    List<String> messages = Arrays.asList("hello", "baeldung", "readers!");  
  
    //람다식을 사용.  
    messages.forEach( str -> System.out.println(str));  
  
    // 메서드 참조  
    messages.forEach(System.out::println);  
  
}
```

초기화한 Collection을 순회하면서 요소를 출력하는 간단한 예시다.

람다식을 사용한
``` java 
messages.forEach( str -> System.out.println(str));  
```
와
메서드 참조를 사용한
``` java
messages.forEach(System.out::println); 
```
가 있다.

정적 메서드를 사용하는 형식의 기본이
```java
ClassName::methodName
```
라 했었는데

`println`의 메서드는 `System.out` 클래스에 있는 메서드이기에 `System.out::println` 로 표현할 수 있다.
## Reference to an Instance Method of a Particular Object

특정 객체를 인스턴스 메서드 참조로 사용하는 방법이다.

interface와 함께 사용한 예시를 보자.

```java

@FunctionalInterface
interface Convert{  
    public String convertUpperLowerToggle(String str);  
}  
  
public class MethodReferenceOperator {  
  
    public static void main(String[] args) {  
        //List 생성 및 초기화.  
        List<String> messages = Arrays.asList("hello", "baeldung", "readers!");  
  
        //interface를 구현하는데 람다식을 사용하는 방법  
        Convert convert = str -> str.toUpperCase();  
        messages.forEach((str) -> System.out.println(convert.convertUpperLowerToggle(str)));  
  
        System.out.println();  
  
        //interface를 구현하는데 메서드 참조를 사용하는 방법  
        Convert convert2 = String::toLowerCase;  
        messages.forEach((str) -> System.out.println(convert2.convertUpperLowerToggle(str)));  
  
  
    }  
}
```

적절한 예시인지는 모르겠다만...


Convert interface를 직접 참조하여 메서드를 구현하는데 2가지 방법을 사용하였다.

``` java 
Convert convert = str -> str.toUpperCase();  
...
Convert convert2 = String::toLowerCase; 
```


## Reference to an Instance Method of an Arbitrary Object of a Particular Type

바로 위에서 보았던 방식과 비슷한데 커스텀 객체를 생성하지 않고 사용하는 방법이다.

``` java

public static void main(String[] args) {  
    //List 생성 및 초기화.  
    List<Integer> numbers = Arrays.asList(5, 3, 50, 24, 40, 2, 9, 18);  
      
    numbers.stream()  
            //람다식을 사용.  
            //.sorted((a, b) -> a.compareTo(b))            //메서드 참조  
            .sorted(Integer::compareTo)  
            .forEach(System.out::println);  
}

```

사용자 정의 객체가 아닌 `.sorted`에서 요구하는 Comparator를 구현하여 파라미터로 넘겨서 사용할 수 있다.

## Reference to a Constructor
생성자를 참조하여 사용하는 방법이다.

첫 번째 static method를 참조한 방법과 같은 방법으로 사용할 것이지만 `new` 키워드를 사용하여 호출해볼 것이다.
```java
ClassName::new
```
와 같이 말이다.

``` java
public static void main(String[] args) {  
    // 생성자 참조를 사용하여 ArrayList 객체 생성  
    Supplier<List<String>> listSupplier = ArrayList::new;  
  
    // 생성된 객체에 값을 추가  
    List<String> list = listSupplier.get();  
    list.add("apple");  
    list.add("banana");  
    list.add("orange");  
  
    // 리스트 출력  
    System.out.println("List: " + list);  
}
```

`ArrayList::new`는 `Supplier` 에게 기본 생성자를 제공하고, `Supplier<List<String>>`에 제네릭 타입을 설정하여 객체를 제공한다.

즉 `<List<String>>`는 `ArrayList`의 인스턴스가 되고 `Supplier.get`으로 해당 인스턴스를 가져와 add를 한다.

<br/>

Ref.  
[https://www.baeldung.com/java-method-references](https://www.baeldung.com/java-method-references)  
[https://futurecreator.github.io/2018/08/02/java-lambda-method-references/](https://futurecreator.github.io/2018/08/02/java-lambda-method-references/)


