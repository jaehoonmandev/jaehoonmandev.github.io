---
#layout: single
title:	"[Spring Boot] Web Socket을 통한 채팅 시스템"
date:	2024-05-15 12:00:00
categories:
  - Spring Boot
tags:
  - Java
  - Lambda
  - Method Reference Operator
  - Anonymous Class
comment: true
#published: false 
---
Spring Boot를 통해 Web Socket을 이용한 채팅 시스템을 구축해보겠다

여기서 왜 채팅 시스템은 유독 Web Socket을 이용하여 구현하는지 궁금할 수도 있다.

## 왜 Web Socket 사용?

간단히 말하자면 반응성이 좋은 실시간 서비스에 적합하기 때문이다.

기존에 HTTP 통신은 요청이 있을 때마다 연결을 열고 메시지 교환을하고 바로 닫는 Connectionless와 클라이언트의 상태를 보존하지 않는 Stateless의 특징을 가지고 있다.

일단 Connectionless 의 특징으로 클라이언트는 매번 hand-shake 과정을 겪으면서 자원 낭비로인한 성능 저하 문제가 있었으며,
Stateless로 인해 클라이언트의 상태가 항상 유지 되지 않았기에 핸들링에 불편함을 겪어야했다.

이로인해 HTTP 기반의 메시지 교환은
- 주기적으로 요청을 보내는 Polling.
- 연결 세션을 오래동안 유지하면서 빠르게 인입을 핸들링할 수 있는 Long-Polling.
- Web Socket과 비슷하게 연결을 유지하는 Streaming

의 기법도 생기긴했지만 HTTP의 특성 상
- Header가 불필요하게 큼.
- Long Polling, Streaming은 클라이언트에서 서버로 메시지를 보내는 것이 어렵다.
  등의 단점은 여전히 존재했다.

여기서 TCP/IP 기반의 Web Socket이 등장하는데 이는
- 연결 지향 프로토콜이기에 한 번 연결을 생성하면 유지된다.
- 지연 시간을 최소화 할 수 있다.
- 연속적으로 데이터를 처리하기에 처리량을 향상 시킨다.
  등의 장점을 가지고 있다.

그럼 이를 구현하는데 필요한 기술들을 뭐가 있을까?

## 구현을 위해서
위에서만 보면 장점만 있는 것 같지만 역시 아니다.

Web Socket은 기본적으로 페이로드를 Plain text로 교환한다.

이 뜻은 데이터를 가공하는데 있어 공수가 필요하다는 뜻.

또한 요즘은 뭐 그럴일이 상당히 드물겠지만 Web Socket을 지원하지 않는 브라우저라던가 버전이 있을 수도 있다.

이를 위해서 SockJS와 STOMP.js(Simple Text Oriented Messaging Protocol)를 사용한다.

이 또한 간단히 설명하자면 SockJS는 웹 소켓을 지원하지 않아도 사용 가능하게 해주며, STOMP.js는 메시지 교환의 형식은 물론 송/수신, 구독 등의 구조로 구현의 까다로움을 덜어준다.

우리는 STOMP, SockJS, Message Broker를 기반으로 채팅 시스템을 구축할 것이다.

## 기본 흐름

1. 클라이언트는 브라우저를 통해 웹 소켓 통신을 연결을 요청한다.
2. 서버는 이를 수락하며 웹 소켓을 통해 연결을 수립한다.
3. 양방향으로 연결된 세션의 메시지를 중간에서 브로커가 관리한다.
4. 클라이언트 혹은 서버에서 연결을 종료한다.

1,2 과정을 통해 세션 생성, 세션 등록(입장)을 각각 Publish, Subscribe라 표현한다.

# 메시지 브로커

Web Socket에서 메시지 브로커는 클라이언트 - 서버간의 메시지 교환을 중간에서 관리하는 시스템이다.

Publish  / Subscribe 의 패턴이 활용될 것이다.

다수의 클라이언트가 특정 주제(topic)에 대해 구독하고 해당 주제로 메시지를 주고 받는 개념이다.

좀 어려울 수 있는데 Publish는 주제(topic)를 나누기 위해 마련된 방이고, 그 방안에 들어가기 위해 Subscribe를 한다 생각해보자.

클라이언트는 주제(topic)를 가지고 방(Publish)안에서 대화를 나눈다.
방(Publish) 안에 있는 사람은 해당 주제(topic)로 대화(message)를 나누기 위해 모였기에 방안에 들어와있는 사람들은 누군가 대화를하면 이 내용이 방안에서 다른 사람들에게 전달될 것이다.(subscribe)

여기서 대화(message)를 중간에서 관리해주는 역할이 Broker이다.

Sprint Boot에서는 내부 메모리를 사용하는 내부 브로커와 DB와 같은 저장 공간에 메시지를 저장하는 외부 브로커가 있다.

![내부 브로커]({{ site.baseurl }}/assets/images/posts/2024/spring-boot/web-socket-chat/inner_broker.png)  

![외부 브로커]({{ site.baseurl }}/assets/images/posts/2024/spring-boot/web-socket-chat/external_broker.png)
*https://infinitecode.tistory.com/60*



우리는 내부 브로커로 웹 소켓의 개념을 채팅 시스템을 구현하며 알아보자.

샘플 코드는 [웹 소켓 채팅 샘플](https://github.com/jaehoonmandev/WSChatDemo) 에 올려두었다.


## Spring Dependencies

``` java
dependencies {  
    implementation 'org.springframework.boot:spring-boot-starter-web'  
    implementation 'org.springframework.boot:spring-boot-starter-websocket'  
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'  
  
    compileOnly 'org.projectlombok:lombok'  
    developmentOnly 'org.springframework.boot:spring-boot-devtools'  
    annotationProcessor 'org.projectlombok:lombok'  
    testImplementation 'org.springframework.boot:spring-boot-starter-test'  
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'  
}
```


## 구현

### Config

Web Socket 서버를 열어주는 역할을 수행할 것이다.

`@EnableWebSocketMessageBroker` 을 통해 STOMP 기반 Web Socket 통신을 활성화 시켜준다.

이후 `WebSocketMessageBrokerConfigurer`의 interface를 통해 Endpoint, CORS, SockJS를 설정해준다.

여기서 `WebSocketConfigurer`을 implements 하여 구현하는 경우도 있는데 이는 엔드포인트를 설정하고, Broker 역할을 하는 핸들러는 직접 구성하여 등록 시켜야한다.

`WebSocketMessageBrokerConfigurer`는 STOMP와 함께 메시지 브로커를 구성하는데 사용한다.

`configureMessageBroker` 에서는 Server -> Client / Client -> Server의 메시지 교환 Broker 경로를 설정해준다.

``` java
@Configuration  
@EnableWebSocketMessageBroker // STOMP를 기반으로하는 Web Socket 서버로 활용하기 위해.  
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {  
  
    /**  
     * Web Socket 통신 수립을 위한 엔드포인트, CORS, SockJS 등을 설정한다.  
     * @param registry  
     */  
    @Override  
    public void registerStompEndpoints(StompEndpointRegistry registry) {  
  
        registry.addEndpoint("/ws/chat") // Web Socket 연결 수립을 위한 End-point 설정.  
                .setAllowedOrigins("http://localhost:8080/*") // CORS를 모두 허용한다.  
                .withSockJS(); // SocketJS를 기반으로 설정한다.  
    }  
  
    /**  
     * STOMP를 통해 메시지를 핸들링하기 위한 브로커를 설정한다.  
     * @param registry  
     */  
    @Override  
    public void configureMessageBroker(MessageBrokerRegistry registry) {  
        /** Server -> Client | 해당 경로를 Subscribe 하는 Client들에게 메시지 보낸다.  
         * 서버에서 Client로 Message를 보내는 경로이기 때문에 사용자가 실시간으로 Message를 receive하기 위해서는  
         * '/topic' 으로 시작하는 WS 경로를 subscribe 해야한다.  
         */        
         registry.enableSimpleBroker("/topic");  
  
        /** Client -> Server | Client가 보낸 메시지를 Broking 하는 경로를 설정.  
         *  Client가 Server로 Message를 보내는 경로이기에 sendMessage의 경로는  
         *  '/app'를 포함하는 경로에 send 해야한다.  
         */  
        registry.setApplicationDestinationPrefixes("/app");  
    }  
}
```

`configureMessageBroker` 에서 `/ws/chat`, `/app`, `/topic`과 의 경로를 설정했는데 위에서 설명했던 Publish / Subscribe / Broker 의 개념이 각각 적용된다.

웹 소켓 메시지 교환을 위해 `/ws/chat`으로 Publicsh를 하고, 클라이언트는 서버에서 메시지를 듣기 위해 `/topic`의 경로를 Subscribe하고 메시지를 보내기 위해 `/topic`의 경로로 메시지 브로커를 통해 메시지를 전송한다.

### Model

데이터 형식은 두 가지로 나눌 것이다.

첫 번째는 채팅 메시지를 담는 객체 `ChatMessage`, 두 번째는 채팅방을 관리하는 `ChatRoom`을 구성할 것이다.

``` java
@Data  
@AllArgsConstructor  
@NoArgsConstructor  
public class ChatMessage {  
  
    /**  
     * 채팅에 사용되는 메시지를 다루기위한 객체.  
     */  
    /**     * 메시지 타입에 따라 액션 핸들링이 달라진다  
     * ENTER : 입장.  
     * TALK : 메시지 전송.  
     * LEAVE : 퇴장.  
     */    public enum MessageType{  
        ENTER, TALK, LEAVE;  
    }  
  
    private MessageType type; // 메시지 타입  
    private String roomId; // 채팅방 번호  
    private String sender; // 메시지 전송자  
    private String message; // 메시지  
  
}
```

메시지 타입을 구분하여 입장, 입장 중 메시지 송수신, 퇴장 시 메시지를 구분하였다.

메시지를 작성한 채팅 세션의 id, 전송자, 메시지 내용을 저장한다.

``` java
@Data  
public class ChatRoom {  
  
    /**  
     * 채팅을 위해 생성된 방의 정보  
     */  
    private String roomId; // 채팅방 ID    
    private String roomName; // 채팅방 이름  
  
    /**  
     * 생성자.  
     * ChatRoom을 new하여 신규 방을 생성할 시 랜덤 ID와 생성할 방 이름을 저장한다.  
     * @param roomName  
     */  
    public ChatRoom(String roomName){  
        this.roomId = UUID.randomUUID().toString();  
        this.roomName = roomName;  
    }  
}
```

채팅방을 저장하는 객체이다.

ID와 이름을 저장하고 생성 시 초기화하는 생성자외에는 별거 없다.


### Service

채팅방의 생성, 조회를 담당하는 서비스 레이어다.

메시지 브로커를 내부에서 핸들링하기 때문에 디바이스 메모리에 데이터를 상주시킬 것이다.

외부 브로커를 사용한다면 Repository를 호출하는 부분이 될 것이다.

``` java
@Service  
public class ChatRoomService {  
  
    /**  
     * 채팅방의 생성, 조회를 담당하는 서비스 레이어.  
     */  
    // 채팅 정보를 K:V의 구조로 메모리에 저장하기 위한 Map    private Map<String, ChatRoom> chatRooms;  
  
    // 초기화 시 Map을 인스턴스화 시켜준다.  
    @PostConstruct  
    private void init(){  
        chatRooms = new LinkedHashMap<>();  
    }  
  
    // Map에 저장된 모든 데이터들을 가져온다.  
    public List<ChatRoom> findAllRoom() {  
        return new ArrayList<>(chatRooms.values());  
    }  
  
    //K:V의 구조로 Key 값에 해당하는 Value를 하나 가져온다.  
    public ChatRoom findRoomById(String roomId) {  
        return chatRooms.get(roomId);  
    }  
  
    // 방을 생성한다.  
    public ChatRoom createRoom(String roomName) {  
        ChatRoom chatRoom = new ChatRoom(roomName);  
        chatRooms.put(chatRoom.getRoomId(), chatRoom);  
        return chatRoom;  
    }  
  
}
```

### Contoller
컨트롤러도 Model과 같이 두 가지로 나눌 것이다.

채팅방을 관리하는 `ChatRoomController`와 Message Broker의 역할을 수행할 `StompChatController`다

``` java
@Controller  
@RequiredArgsConstructor  
@RequestMapping("/chat") // Controller 호출의 prefix를 설정
public class ChatRoomController {  
  
    /**  
     *  채팅방 핸들링을 위한 컨트롤러  
     *  생성, 채팅 조회 등의 기능을 가진다.  
     */    
     private final ChatRoomService chatRoomService;
      
    /**  
     * 채팅 메인 화면 렌더링
     * '@RequestMapping("/chat")'를 설정했기에 이를 호출하기 위해
     * '/chat/room' 의 경로로 호출해야한다.
     * @param model  
     * @return  
     */  
    @GetMapping("/room")  
    public String rooms(Model model) {  
        return "/chat/room-list";  
    }  
  
    /**  
     * 채팅방 생성  
     * POST 호출 시 Body에 방제목을 담아서 이를 토대로 방을 생성한다.  
     */    
	@PostMapping("/room")  
    @ResponseBody  
    public ChatRoom createRoom(@RequestBody Map<String, String> requestBody) {  
  
        String roomName = requestBody.get("roomName");  
  
        // 채팅방 생성 시 ChatRoom Model의 생성자를 이용한다.  
        return chatService.createRoom(roomName);  
    }  
  
    /**  
     * 활성화된 웹 소켓 채팅 방 리스트 반환  
     * 메인 화면에서 WS 연결 수립(방생성) 시마다 호출한다.  
     */    
    @GetMapping("/rooms")  
    @ResponseBody  
    public List<ChatRoom> room() {  
        /*  
            방 생성 시 Map<String, ChatRoom>으로 메모리에 상주 시킨 데이터를  
            ArrayList 향태로가져온다.  
         */        return chatService.findAllRoom();  
    }  
  
  
    /**  
     * 채팅방 입장 화면 렌더링.  
     * 호출 시 ID 값을 Detail 화면으로 토스한다.  
    */    
    @GetMapping("/room/enter/{roomId}")  
    public String roomDetail(Model model, @PathVariable String roomId) {  
        model.addAttribute("roomId", roomId);  
        return "/chat/room-detail";  
    }  
  
    /**  
     * 채팅방 입장 시 넘겨 받은 ID 값으로 방제목과 같은 상세 정보를 구해온다.  
    */    
    @GetMapping("/room/{roomId}")  
    @ResponseBody  
    public ChatRoom roomInfo(@PathVariable String roomId) {  
        return chatService.findRoomById(roomId);  
    }  
}
```

``` java
@RestController  
@RequiredArgsConstructor  
public class StompChatController {  
  
    /**  
     * STOMP 기반의 메시지 처리 브로커.  
     */  
    // 웹 소켓 메시징 기능을 사용하기 위한.  
    private final SimpMessageSendingOperations sendingOperations;  
  
    /**  
     * Client가 메시지를 보내는 경로와 메시지를 처리하는 로직  
     * config 에서 setApplicationDestinationPrefixes("/app")를 설정했기에  
     * 클라이언트는 `/app`을 포하한 경로로 메시지를 전송해야한다.  
     * @param message  
     */  
    @MessageMapping("/chat/sendMessage")  
    public void sendMessage(ChatMessage message) {  
          
        // 메시지 타입에 따른 메시지 빌딩  
        //최초 입장 시  
        if (ChatMessage.MessageType.ENTER.equals(message.getType())) {  
            message.setMessage(message.getSender()+"님이 입장하였습니다.");  
        }  
        // 퇴장 시  
        else if (ChatMessage.MessageType.LEAVE.equals(message.getType())) {  
            message.setMessage(message.getSender()+"님이 퇴장하였습니다.");  
        }  
          
        // "/topic/chat/room/" 의 경로로 메시지를 보내면 아래의 handleMessages() 가 처리를한다.  
        sendingOperations.convertAndSend("/topic/chat/room/"+message.getRoomId(),message);  
    }  
  
    /**  
     * 송수신 되는 메시지의 브로커.  
     * "/topic/chat/room/ + id" 를 구독하는 사용자에게 메시지를 전송한다.  
     * @param messages  
     * @return  
     */  
    @MessageMapping("/topic/chat/room/{roomId}")  
    @SendTo("/topic/chat/room/{roomId}")  
    public List<ChatMessage> handleMessages(List<ChatMessage> messages) {  
        return messages;  
    }  
}
```

`StompChatController`의 컨트롤러는 View의 코드 일부와 함께 설명하는게 이해하기 쉬울 듯하다.

client가 채팅방에 입장 시
``` javascript
ws.subscribe('/topic/chat/room/' + roomId ...) 
```
의 경로로 먼저 publish에 구독을 하고

메시지를 보낼 시에는
``` javascript
ws.send("/app/chat/sendMessage"...)
```
의 경로로 메시지를 보내게 될 것이다.

메시지를 보내게되면 `StompChatController`의
```java
@MessageMapping("/chat/sendMessage") public void sendMessage(ChatMessage message)
```

에 mapping 될 것이다.

여기서 `setApplicationDestinationPrefixes("/app")` 를 설정하였기에 controller에는 `/app`의 경로를 포함시키지 않는다.

`sendMessage()`의 내부에서 클라이언트가 보낸 메시지를

```java
sendingOperations.convertAndSend("/topic/chat/room/"+message.getRoomId(),message);
```

를 통해 채팅방에 있는 모두에게 전송한다.

```java
@MessageMapping("/topic/chat/room/{roomId}")  
@SendTo("/topic/chat/room/{roomId}")  
public List<ChatMessage> handleMessages(List<ChatMessage> messages) {  
    return messages;  
}
```
의 `@MessageMapping`는 `convertAndSend`의 경로 설정으로 메시지를 받아오고
`@SendTo`를 통해 위에서 보았던
```javascript
ws.subscribe('/topic/chat/room/' + roomId ...) 
```
의 경로로 subscribe한 방에 입장한 클라이언트에게 메시지를 전송한다.


### View

채팅방에 접근하기전에 렌더링하는 `room-list.html`와 채팅방에 접속하여 채팅을하는 `room-detail.html`으로 구성하였다.

``` html
<!DOCTYPE html>  
<html>  
    <head>        
	    <title>웹 소켓 채팅</title>  
    </head>    
    <body>
            <script>  
            //전송자명 입력하기  
            var sender = prompt('대화명을 입력해 주세요.');  
  
            if (sender !== "") {  
                localStorage.setItem('sender', sender);  
            }  
  
            //로드 시 바로 생성된 방 불러오기.  
            getRoomList();  
  
            function getRoomList() {  
                // Fetch API를 사용하여 GET 요청 전송  
                fetch('/chat/rooms')  
                    .then(response => response.json())  
                    .then(roomList => {  
                        console.log("채팅방 목록: ", roomList);  
  
                        // HTML 테이블에 채팅방 목록을 표시  
                        var tableHTML = '<table id="roomListTable">';  
                        roomList.forEach(function (room) {  
                            tableHTML += '<tr>';  
                            tableHTML += '<td><a href="/chat/room/enter/' + room.roomId + '">' + room.roomName + '</a></td>';  
                            tableHTML += '</tr>';  
                        });  
                        tableHTML += '</table>';  
  
                        // 기존의 테이블을 교체함  
                        var existingTable = document.getElementById('roomListTable');  
                        if (existingTable) {  
                            existingTable.innerHTML = tableHTML;  
                        } else {  
                            document.body.innerHTML += tableHTML;  
                        }  
                    })  
                    .catch(error => console.error("채팅방 목록 가져오기 실패:", error));  
            }  
  
            //채팅방 생성하기.  
            function createRoom() {  
  
                // 입력 필드에서 방 이름 가져오기  
                var roomName = document.getElementById('roomName').value;  
  
                // Fetch API를 사용하여 POST 요청 전송  
                fetch('/chat/room', {  
                    method: 'POST',  
                    headers: {  
                        'Content-Type': 'application/json'  
                    },  
                    body: JSON.stringify({roomName: roomName})  
                })  
                    .then(response => response.json())  
                    .then(room => {  
                        // 채팅방 생성이 완료되면 리스트에 표시하기  
                        getRoomList();  
                    })  
                    .catch(error => console.error("방 생성 실패:", error));  
            }  
  
  
        </script>  
  
        <div>            <input type="text" id="roomName" placeholder="방제목을 입력해주세요">  
            <button onclick="createRoom()">생성하기</button>  
        </div>  
  
    </body></html>
```

![채팅방 리스트]({{ site.baseurl }}/assets/images/posts/2024/spring-boot/web-socket-chat/room-list.png)


처음 렌더링 시 채팅방에서 사용될 전송자명을 설정하고, 채팅방 생성을 하는 영역이다.

방생성 시 이름을 설정하고 생성하기를 클릭하면 생성된 채팅방 리스트가 렌더링된다.


``` html
<!DOCTYPE html>  
<html xmlns:th="http://www.thymeleaf.org">  
<head>  
    <meta charset="UTF-8">  
    <title>채팅방</title>  
</head>  
<body>  
<script src="https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.5.0/sockjs.min.js"></script>  
<script src="https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js"></script>  
<script th:inline="javascript">  
  
    //웹 소켓 인스턴스  
    var socket = new SockJS('/ws/chat');  
    var ws = Stomp.over(socket);  
  
    // localStorage에 등록한 전송자명 변수.  
    var sender = localStorage.getItem('sender');  
    // Controller에서 토스하여 받아온 ID를 저장하는 변수.  
    var roomId = [[${roomId}]];  
	
	//채팅방 상세 정보 로드 시 가져오기.
    getRoomData();  
  
    // 웹 소켓 인스턴스를 기반으로 연결 및 Subscribe    ws.connect({}, function(frame) {  
  
        console.log('연결: ' + frame);  
  
        //채팅방의 ID 값으로 해당 채팅방만을 Subscribe한다.  
        ws.subscribe('/topic/chat/room/' + roomId , function(message) {  
            showMessage(JSON.parse(message.body).sender + ": " + JSON.parse(message.body).message);  
        });  
        // 최초 입장시 다른 클라이언트들이 볼 수 있도록 메시지 전송.  
        // 클라이언트가 서버에 메지시를 보내야한다면 '/app'의 경로를 지정해줘야한다.  
        ws.send("/app/chat/sendMessage", {}, JSON.stringify(  
            {  
                type:'ENTER',  
                roomId: roomId,  
                sender: sender  
            }  
        ));  
    });  
      
    // 서버에서 받아온 메시지 핸들링  
    ws.onmessage = function (e) {  
        showMessage(e.message);  
    }  
  
  
      
    //ID 값으로 채팅방의 이름 등과 같은 정보를 가져온다.   
function getRoomData() {  
        fetch('/chat/room/' + roomId)  
            .then(response => response.json())  
            .then(roomInfo => {  
                  
                //현재는 방제목 외에 특별한 값이 없기에 방 제목만 바꿔준다.  
                var room_name = document.getElementById('room_name');  
  
                room_name.innerText = "방제목 : " + roomInfo.roomName;  
  
            })  
            .catch(error => console.error("채팅방 정보 가져오기 실패:", error));  
    }  
      
    //메시지 전송  
    function sendMessage() {  
        var messageInput = document.getElementById('messageInput');  
          
        //클라이언틑가 서버에   
ws.send("/app/chat/sendMessage", {}, JSON.stringify({  
            type: 'TALK',  
            roomId: roomId,  
            message: messageInput.value,  
            sender: sender  
        }));  
        messageInput.value = '';  
    }  
      
    // 나가기.  
    function quit() {  
        ws.send("/app/chat/sendMessage", {}, JSON.stringify({  
            type: 'LEAVE',  
            roomId: roomId,  
            sender: sender  
        }));  
          
        //연결해제  
        ws.disconnect();  
        localStorage.removeItem('sender');  
        window.history.back();  
    }  
      
    // 메시지 렌더링  
    function showMessage(message) {  
        var messageArea = document.getElementById('messageArea');  
        var p = document.createElement('p');  
        p.textContent = message;  
        messageArea.appendChild(p);  
    }  
  
  
</script>  
  
<h1 id="room_name"> </h1>  
  
<div>  
  
    <input type="text" id="messageInput" placeholder="메시지를 입력하세요">  
    <button onclick="sendMessage()">전송</button>  
    <button onclick="quit()">나가기</button>  
</div>  
  
<div id = "messageArea"></div>  
  
</body>  
</html>
```

입장 시 웹 소켓 서버에 connect를 하고, 통신을 위해 subscribe하고 메시지를 send, onmessage, disconnect 하는 페이지다.

위에서 설명한 것과 같이
subscribe는 `/topic/chat/room/' + roomId`의 경로를,
메시지 전송은 `/app/chat/sendMessage`을 통해한다.

![채팅방 상세]({{ site.baseurl }}/assets/images/posts/2024/spring-boot/web-socket-chat/room-detail.png)




<br/>

Ref.  

[https://velog.io/@hahan/Polling-Long-Polling-Streaming](https://velog.io/@hahan/Polling-Long-Polling-Streaming)

[https://velog.io/@sanizzang00/%EC%BA%A1%EC%8A%A4%ED%86%A4%EB%94%94%EC%9E%90%EC%9D%B8-Spring-Boot-STOMP%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-Chatting-%EA%B5%AC%ED%98%84-1](https://velog.io/@sanizzang00/%EC%BA%A1%EC%8A%A4%ED%86%A4%EB%94%94%EC%9E%90%EC%9D%B8-Spring-Boot-STOMP%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-Chatting-%EA%B5%AC%ED%98%84-1)

[https://brilliantdevelop.tistory.com/162](https://brilliantdevelop.tistory.com/162)

[https://velog.io/@sunkyuj/Spring-%EC%9B%B9%EC%86%8C%EC%BC%93%EC%9C%BC%EB%A1%9C-%EC%8B%A4%EC%8B%9C%EA%B0%84-%EC%B1%84%ED%8C%85-%EA%B5%AC%ED%98%84](https://velog.io/@sunkyuj/Spring-%EC%9B%B9%EC%86%8C%EC%BC%93%EC%9C%BC%EB%A1%9C-%EC%8B%A4%EC%8B%9C%EA%B0%84-%EC%B1%84%ED%8C%85-%EA%B5%AC%ED%98%84)


