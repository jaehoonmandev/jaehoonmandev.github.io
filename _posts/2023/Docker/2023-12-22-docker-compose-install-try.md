---
title:	"[Docker] Docker Compose - 설치 및 사용"
date:	2023-12-22 12:00:00
categories:
  - Docker
tags:
  - Docker
  - Docker Compose
comment: true
#published: true 
---
Docker Compose를 사용하여 간단한 Python 웹 애플리케이션을 빌드해보자.
추가로 Flask 프레임워크와 히트 카운터 관리를 위해 Redis를 사용할 것이다.
(간단한 구현이므로 Python, Flask, Redis를 자세히 몰라도 된다.)

Docker Compose를 사용하기 위해서는
- Docker Engine과 Docker Compose를 각각 설치.
- Docker Engine과 Docker Compose가 포함된 Docker Desktop 설치
  의 방법 중 하나를 택하여 환경을 구성하면된다.

여기서 Python, Redis는 Docker image로 제공 받을 것이기에 따로 설치하지 않는다.

Docker Compose 사용 환경을 구성하기 위한 간단한 방법인 Docker Desktop을 설치 하도록 하자.

# 설치
Docker Compose는 기본적으로 Docker Desktop을 설치하면 함께 따라오는 플러그인이다.

Docker Desktop을 설치하는 것이 가장 쉬운 방법이며 설치 시나리오는
1. Docker Desktop 설치.
2. Compose 플러그인 설치.
3. Compose만 설치하기

와 같이 3개가 존재하는데,  
포스트에서는 Mac M1 환경에서의 `1. Docker Desktop 설치` 만 다룰 예정이다.  
(추가적인 정보는 [이곳](https://docs.docker.com/compose/install/)을 참고해주길 바란다.)

[https://docs.docker.com/desktop/install/mac-install/](https://docs.docker.com/desktop/install/mac-install/)  
의 사이트로 접근하면 상단에 설치 파일을 다운로드 받을 수 있는 버튼 링크가  있다.

![Docker Desktop Install]({{ site.baseurl }}/assets/images/posts/2023/Docker/docker_desktop_install.png)

M1이후의 모델은 Apple Silicon 버전을, 이전 모델은 Intel chip버전을 다운 받자.

최소 4GB의 램을 요구하며,
Docker Desktop 4.3.0 부터는 Rosetta2를 설치하는 요구 사항을 제거하였으며, 좀 더 나은 유저 경험을 위해서는 `$ softwareupdate --install-rosetta` 를 통해 설치하라고 권장한다.

`Docker.dmg` 설치 파일을 더블 클릭하여 지시대로 설치를 마치게되면 Docker compose,Docker engine이 포한된 Docker Desktop 설치가 완료된다.

이후 설치된 Docker Desktop을 실행하여 Docker 서비스가 구동되게하자.

![Docker Desktop Running]({{ site.baseurl }}/assets/images/posts/2023/Docker/docker_desktop_running.png)


# 사용해보기
Docker Compose 를 사용할 수 있는 환경이 구성되었다.

## 1 단계 : 애플리케이션 의존성 정의

### 1. 프로젝트를 위한 디렉터리 만들기
프로젝트를 설치하고 관리할 디렉토리를 따로 구성해주자.
원하는 위치에 GUI를 이용해 생성, 접근하거나
```
$ mkdir composetest
$ cd composetest
```
와 같이 CLI로 진행하자.

### 2. `app.py`의 이름으로 코드 파일 만들기.

``` python
import time

import redis
from flask import Flask

app = Flask(__name__)
cache = redis.Redis(host='redis', port=6379)

def get_hit_count():
    retries = 5
    while True:
        try:
            return cache.incr('hits')
        except redis.exceptions.ConnectionError as exc:
            if retries == 0:
                raise exc
            retries -= 1
            time.sleep(0.5)

@app.route('/')
def hello():
    count = get_hit_count()
    return 'Hello World! I have been seen {} times.\n'.format(count)
```
의 내용이 담긴 `app.py` 파일을 생성.
### 3. `requirements.txt` 파일 샐성하기
```
flask
redis
```
의 내용이 담긴 `requirements.txt` 파일을 생성.

## 2 단계: Dockerfile 생성하기.
Dockerfile 은 Docker image를 빌드하기 위해 사용한다.
이미지 컨테이너들은 Python과 이를 사용하기 위한 모든 의존성을 포함시켜준다.

이전 단계에서 생성한 디렉토리에 `Dockerfile` 의 이름을 가진 파일을 생성한다.
내부에는
``` dockerfile
# syntax=docker/dockerfile:1
FROM python:3.7-alpine
WORKDIR /code
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
EXPOSE 5000
COPY . .
CMD ["flask", "run"]
```
의 코드를 넣는다.

이는
- Python 3.7로 이미지 빌드를 시작한다.
- 작업할 디렉토리를 `/code` 로 지정한다.
- flask 에서 사용할 환경 변수를 설정한다.
- gcc와 다른 의존성들을 설치한다.
- `requirements.txt` 를 복사하고, Python 의존성들을 설치한다.
- 5000번 포트로 컨테이너가 수신한다는 것을 설명하는 이미지에 메타 데이터를 추가한다.
- Dockerfile이 실행되는 현재 디렉토리를 이미지의 workdir에 복사한다.
- Flask를 실행시키는 기본 명령을 설정한다.

Dockerfile에 대한 상세한 정보는 [Docker user guide](https://docs.docker.com/develop/) / [Dockerfile reference](https://docs.docker.com/engine/reference/builder/) 를 참고하자.


## 3 단계 : Compose 파일에 서비스 정의하기.
`compose.yaml` 라는 이름으로 파일을 만들고 아래의 내용을 작성하자.

``` yaml
services:
  web:
    build: .
    ports:
      - "8000:5000"
  redis:
    image: "redis:alpine"
```

compose 파일내에 `web`과 `redis` 서비스가 정의되었다.

`web` 서비스는 이미지를 현재 디렉토리에 있는 `Dockerfile`로 사용할 것이다.  
`web` 컨테이너와 호스트 머신은 외부에서 `8000`포트로 접근할 수 있으며 , Flask 웹 서버의 기본 포트`5000` 에 바인딩한다.

`redis`는 Docker Hub 저장소에서 이미지를 불러온다.


## 4 단계 : Compose와 함께 애플리케이션 빌드, 실행.
### 1. 작업중인 디렉토리에서 `docker compose up` 명령어를 입력하여 애플리케이션 빌드 및 실행.

![Docker Compose Up]({{ site.baseurl }}/assets/images/posts/2023/Docker/docker_compose_up.png)

명령어를 실행하면 Compose는 Redis 이미지를 pull 해오며, 코드를 위한 빌드를 수행, 사용자가 정의한 대로 서비스가 바로 실행될 것이다.

현재의 경우에는 빌드 타임동안 이미지에 코드는 정적으로 복사 해놓는다.

### 2. http://localhost:8000/ 로 실행중인 서비스에 접근.

![Docker Compose Running]({{ site.baseurl }}/assets/images/posts/2023/Docker/docker_compose_running.png)

와 같은 화면을 볼 수 있게된다.

새로 고침 시 마다 times 가 +1 된다.(이미 한 번 해서 2로 표시.)

### 3.  로컬 이미지 확인하기.

이전 터미널에서는 서비스가 실행 중이니 다른 터미널 윈도우로 옮겨가자.

이후 다른 터미널 윈도우에서 `docker image ls` 를 입력하면, 

![Docker Image ls]({{ site.baseurl }}/assets/images/posts/2023/Docker/docker_image_ls.png)

와 같이 설치된 이미지들의 정보가 뜬다(어? Python이 없네!)

이미지를 상세하게 보고 싶다면 `docker inspect <tag or id>` 를 사용하자.

### 4. 애플리케이션 정지
서비스가 실행중인 터미널에서 CTRL+C를 입력하거나 다른 터미널 윈도우에서 `docker compose down` 을 입력하여 애플리케이션을 정지시키자.

## 5단계 : mount bind를 위해 Compose 파일 수정하기.
기존의 `compose.yaml`의 내용을 아래의 내용으로 수정하자.
``` yaml
services:
  web:
    build: .
    ports:
      - "8000:5000"
    volumes:
      - .:/code
    environment:
      FLASK_DEBUG: "true"
  redis:
    image: "redis:alpine"
```

이전에는 없던 `volumes` 옵션이 있는데 이는 이미지를 다시 빌드하지 않고 코드를 즉시 수정할 수 있도록 호스트의 프로젝트 디렉토리를 컨테이너 내부에 마운트한다.

`environment` 키의 옵션으로 `FLASK_DEBUG: "true"` 를 설정함으로써 `flask run` 시 개발자 모드로 실행하며, 코드 변경 시 리로드를 수행한다.(개발 모드에서만 수행됨)

`volume` 옵션에서 `.` 즉, 현재 `compose.yaml`이 있는 현재 디렉토리를 `:`로 web 서비스의 `/code` 디렉토리로 맵핑시켜 놓았다.

Docker 파일에 설정한
```
WORKDIR /code
ENV FLASK_APP=app.py
```
의 옵션으로 인해 작업 디렉토리는 `/code`, 플라스크의 웹 애플리케이션은 `app.py`로 지정하였기에 이로인해 `app.py`의 코드를 수정하면 바로 적용된다.


## 6단계 : Compose 와 함께 재빌드 및 실행
정지 시킨 서비스를 다시 `docker compose up`으로 실행시키면 수정한 옵션들이 적용된다.

## 7단계: 애플리케이션 업데이트
현재 애플리케이션 코드는 `volume`옵션으로 컨테이너에 마운트 되었다.  
마운트한 코드에 수정 사항이 있다면 이미지를 재빌드할 필요 없이  즉시 변경될 것이다.

서비스가 실행되는 동안에 `app.py`의 코드를 수정해보자
``` python
return '안녕하세요! {}번 째로 뵙게됩니다.\n'.format(count)
```

수정 후 브라우저를 새로고침하면

![Docker Compose Up 2]({{ site.baseurl }}/assets/images/posts/2023/Docker/docker_desktop_running2.png)

와 같이 변경 후 Docker를 재빌드 하지 않아도 변경되는 것을 알 수 있다.


## 8단계 : 옵션과 함께 명령어 실행하기.
서비스를 백그라운드에서 실행하고 싶다면 `-d`(detached) 옵션을 사용하자.
```
$ docker compose up -d
$ docker compose ps
```

![Docker Compose Up as Background]({{ site.baseurl }}/assets/images/posts/2023/Docker/docker_compose_up_d.png)

백그라운드로 실행 한뒤 `docker compose ps`로 실행중인 프로세스를 확인할 수 있다.

`-d`로 백그라운드 실행을 시켰다면 `docker compose stop` 로 정지 시킬 수 있으며,
`docker compose down` 으로 모든 컨테이너를  중지 시키고 삭제할 수 있다.

`--volumes` 옵션을 사용한다면 Redis 컨테이너에 사용한 볼륨 데이터도 삭제할 수 있다.

`docker compose down --volumes`로 생성한 컨테이너를 모두 정지시키고 삭제하자.


Ref.
[https://docs.docker.com/compose/](https://docs.docker.com/compose/)  
[https://docs.docker.com/compose/gettingstarted/](https://docs.docker.com/compose/gettingstarted/)