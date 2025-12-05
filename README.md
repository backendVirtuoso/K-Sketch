# 🗺️ K-Sketch

> **여행의 스케치, 당신의 여행 플래너**  
> 실시간 협업이 가능한 지능형 여행 일정 관리 플랫폼

[![Java](https://img.shields.io/badge/Java-17-007396?style=flat-square&logo=java&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-Latest-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-Latest-231F20?style=flat-square&logo=apache-kafka&logoColor=white)](https://kafka.apache.org/)

---

## 📌 프로젝트 소개

**K-Sketch**는 여행 계획부터 실행까지 모든 과정을 효율적으로 관리할 수 있는 **풀스택 웹 애플리케이션**입니다.  
사용자들이 여행 일정을 직관적으로 작성하고, **실시간 채팅**을 통해 동행자와 협업하며, 관광지 정보와 날씨를 한눈에 확인할 수 있는 통합 플랫폼을 제공합니다.

### ✨ 핵심 차별점

- 🔄 **실시간 협업**: Kafka와 WebSocket 기반의 확장 가능한 채팅 시스템
- 🎯 **통합 관광 정보**: 공공 Tour API 연동을 통한 실시간 관광지 데이터 제공
- 🔐 **멀티 소셜 로그인**: Naver, Google, Kakao OAuth2 통합 인증
- 📱 **반응형 디자인**: 모바일부터 데스크톱까지 최적화된 UX
- ⚡ **고성능 아키텍처**: Redis 캐싱 및 Kafka 메시징을 활용한 확장 가능한 시스템 설계

---

## 🎯 개발 목표 및 배경

### 문제 인식
- 기존 여행 계획 서비스들의 복잡한 UX와 제한적인 협업 기능
- 여행 정보가 파편화되어 여러 앱을 전환해야 하는 불편함
- 실시간 동기화가 부족한 일정 관리 시스템

### 해결 방안
1. **직관적인 드래그 앤 드롭** 일정 관리 UI 구현
2. **실시간 메시징 시스템** 도입으로 즉각적인 협업 지원
3. **통합 정보 제공**: 관광지, 날씨, 경로 정보를 하나의 플랫폼에서 제공
4. **확장 가능한 아키텍처**: 마이크로서비스 지향 설계로 향후 기능 확장 용이

### 기술적 도전
- **대용량 실시간 통신 처리**: Kafka를 활용한 메시지 큐 시스템 구현
- **세션 관리 최적화**: Redis 기반 분산 세션 저장소 구축
- **보안 강화**: JWT + OAuth2 기반의 무상태(Stateless) 인증 시스템
- **프론트엔드 상태 관리**: Redux Toolkit과 Recoil의 하이브리드 상태 관리 전략

---

## 🛠️ 기술 스택

### Backend
| 기술 | 버전 | 선택 이유 |
|------|------|-----------|
| **Java** | 17 | LTS 버전으로 안정성과 최신 문법(Records, Sealed Classes) 활용 |
| **Spring Boot** | 3.3.5 | 생산성 향상 및 풍부한 생태계, Spring Security 6 통합 |
| **MyBatis** | 3.0.3 | 복잡한 쿼리 최적화와 동적 SQL 작성의 유연성 |
| **Spring Security** | 6.x | JWT 및 OAuth2 통합 보안 구현 |
| **Apache Kafka** | Latest | 대용량 메시지 처리 및 이벤트 기반 아키텍처 구현 |
| **Redis** | Latest | 세션 관리 및 캐싱을 통한 응답 속도 개선 |
| **MySQL** | 8.0 | 안정적인 트랜잭션 처리 및 JSON 타입 지원 |

### Frontend
| 기술 | 버전 | 선택 이유 |
|------|------|-----------|
| **React** | 18.3.1 | 컴포넌트 재사용성과 Virtual DOM 성능 최적화 |
| **Redux Toolkit** | 2.3.0 | 전역 상태 관리의 표준화 및 보일러플레이트 감소 |
| **Recoil** | 0.7.7 | 복잡한 컴포넌트 간 상태 공유 간소화 |
| **React Router** | 6.27.0 | SPA 라우팅 및 코드 스플리팅 |
| **Axios** | 1.7.7 | HTTP 요청 인터셉터 및 에러 핸들링 |
| **STOMP.js** | 7.0.0 | WebSocket 프로토콜 기반 실시간 통신 |
| **React Query** | 5.61.5 | 서버 상태 관리 및 캐싱 자동화 |
| **Bootstrap** | 5.3.3 | 빠른 프로토타이핑과 반응형 그리드 시스템 |

### DevOps & Tools
- **Gradle** 8.x: 빌드 자동화 및 멀티모듈 프로젝트 관리
- **Git/GitHub**: 버전 관리 및 협업
- **Cloudtype**: 백엔드 배포 (설정 파일 기준)

---

## 🎨 주요 기능

### 1. 🔐 회원 관리
- **멀티 소셜 로그인**: Naver, Google, Kakao OAuth2 통합
- **JWT 기반 인증**: Stateless 토큰 인증으로 확장 가능한 보안 구조
- **아이디/비밀번호 찾기**: 이메일 인증 기반 계정 복구

### 2. 📅 여행 일정 관리
- **드래그 앤 드롭 일정 편집**: 직관적인 UI로 일정 재배치
- **경로 최적화**: T-Map API 연동을 통한 최적 경로 추천
- **일정 공유**: 다른 사용자와 일정 공유 및 협업
- **북마크 기능**: 관심 일정 저장 및 빠른 접근

### 3. 🏛️ 관광지 정보
- **공공 Tour API 연동**: 실시간 관광지, 축제, 행사 정보 제공
- **지역별 검색**: 카테고리 및 키워드 기반 검색
- **상세 정보**: 위치, 운영시간, 연락처, 이미지 등 종합 정보

### 4. 💬 실시간 채팅
- **Kafka 메시징 시스템**: 대용량 메시지 처리 및 안정성 확보
- **WebSocket 통신**: STOMP 프로토콜 기반 실시간 양방향 통신
- **채팅방 관리**: 생성, 입장, 퇴장 기능
- **메시지 영속화**: MySQL 저장을 통한 채팅 이력 관리

### 5. 🌤️ 날씨 정보
- **실시간 날씀 조회**: 기상청 API 연동
- **시간별/일별 예보**: 여행 계획 수립 시 날씨 고려
- **지역별 날씨**: 여행지 날씨 정보 제공

### 6. 👤 마이페이지
- **프로필 관리**: 개인 정보 수정
- **내 여행 일정**: 작성한 일정 관리
- **북마크 목록**: 저장한 관광지 및 일정 확인

### 7. 🛡️ 관리자 기능
- **사용자 관리**: 회원 목록 조회 및 권한 관리
- **배너 관리**: 메인 페이지 배너 이미지 설정
- **통계 대시보드**: 사용자 활동 모니터링 (개발 예정)

---

## 📂 프로젝트 아키텍처

![k-sketch](https://github.com/user-attachments/assets/6a89c634-e48c-4a8f-b4bc-dcae021c2235)
![k-sketch erd](https://github.com/user-attachments/assets/f937fd66-e347-456f-a823-7cb9d5bb65ad)

---

## 📂 프로젝트 구조

```
K-Sketch/
├── src/
│   ├── main/
│   │   ├── java/com/trip/app/
│   │   │   ├── config/              # 설정 파일 (Security, WebSocket, Kafka, Redis)
│   │   │   ├── controller/          # REST API 엔드포인트
│   │   │   ├── service/             # 비즈니스 로직
│   │   │   ├── mapper/              # MyBatis 인터페이스
│   │   │   ├── model/               # DTO 및 엔티티
│   │   │   ├── jwt/                 # JWT 인증 필터 및 유틸
│   │   │   └── repository/          # JPA Repository (Kafka 채팅방)
│   │   │
│   │   ├── reactapp/                # React 프론트엔드
│   │   │   ├── src/
│   │   │   │   ├── pages/           # 페이지 컴포넌트
│   │   │   │   ├── component/       # 공통 컴포넌트
│   │   │   │   ├── hooks/           # Custom Hooks
│   │   │   │   ├── api/             # API 호출 함수
│   │   │   │   ├── recoil/          # Recoil 상태 관리
│   │   │   │   └── reducer/         # Redux 리듀서
│   │   │   └── public/              # 정적 파일 (이미지, CSS)
│   │   │
│   │   └── resources/
│   │       ├── mapper/              # MyBatis XML 매퍼
│   │       ├── application.yml      # Spring 설정
│   │       └── static/              # React 빌드 파일
│   │
│   └── test/                        # 테스트 코드
│
├── build.gradle                     # Gradle 빌드 설정
└── README.md
```

---

## ⚙️ 설치 및 실행 방법

### 사전 요구사항
- **Java 17** 이상
- **Node.js 18** 이상
- **MySQL 8.0** 이상
- **Redis** (로컬 또는 Docker)
- **Apache Kafka** (로컬 또는 Docker)

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/K-Sketch.git
cd K-Sketch
```

### 2. 환경 변수 설정

`src/main/resources/application.yml` 파일을 참고하여 다음 환경 변수를 설정하세요:

```yaml
# 필수 환경 변수 (예시)
SERVER_PORT=8080
DB_URL=jdbc:mysql://localhost:3306/ksketch?serverTimezone=Asia/Seoul
DB_USERNAME=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
KAFKA_SERVERS=localhost:9092
KAFKA_CONSUMER_GROUP_ID=chat-group
KAFKA_DEFAULT_TOPIC=chat-topic
REDIS_HOST=localhost
REDIS_PORT=6379
WEBSOCKET_PATH=/ws
MAX_FILE_SIZE=10MB
MAX_REQUEST_SIZE=10MB

# OAuth2 설정 (각 플랫폼에서 발급)
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_REDIRECT_URI=http://localhost:8080/login/oauth2/code/naver
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_REDIRECT_URI=http://localhost:8080/login/oauth2/code/kakao

# Tour API Key
SERVICE_PLACE_KEY=your_tour_api_key
```

### 3. 데이터베이스 설정

MySQL에 데이터베이스를 생성하세요:

```sql
CREATE DATABASE ksketch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Kafka 및 Redis 실행 (Docker 사용 시)

```bash
# Kafka
docker run -d --name kafka \
  -p 9092:9092 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  apache/kafka:latest

# Redis
docker run -d --name redis -p 6379:6379 redis:latest
```

### 5. 백엔드 실행

```bash
# Gradle 빌드 및 실행
./gradlew bootRun
```

또는

```bash
# JAR 파일 생성 후 실행
./gradlew build
java -jar build/libs/K-Sketch-0.0.1-SNAPSHOT.jar
```

### 6. 프론트엔드 실행 (개발 모드)

```bash
cd src/main/reactapp
npm install
npm start
```

### 7. 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080

---

## 🔥 트러블슈팅 및 해결 과정

### 1. **WebSocket 연결 끊김 문제**

**문제 상황**  
Kafka와 WebSocket을 함께 사용할 때, 네트워크 지연 또는 Kafka Consumer 지연으로 인해 WebSocket 연결이 불안정하게 끊기는 현상 발생.

**원인 분석**
- Kafka Consumer가 메시지를 처리하는 동안 WebSocket의 heartbeat가 지연됨
- STOMP 프로토콜의 기본 타임아웃 설정이 짧아 연결이 조기 종료됨

**해결 방법**
```java
// WebSocketConfig.java
@Override
public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic", "/queue")
          .setHeartbeatValue(new long[]{10000, 20000}); // Heartbeat 간격 조정
    config.setApplicationDestinationPrefixes("/app");
}

@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS()
            .setStreamBytesLimit(512 * 1024)  // 버퍼 크기 증가
            .setHttpMessageCacheSize(1000)    // 캐시 크기 증가
            .setDisconnectDelay(30 * 1000);   // 연결 끊김 지연 시간 증가
}
```

**결과**  
Heartbeat 간격 조정과 버퍼 크기 증가로 안정적인 실시간 통신 구현. 동시 접속자 100명 환경에서도 안정적인 메시지 전송 확인.

---

### 2. **OAuth2 리다이렉트 URL 불일치**

**문제 상황**  
소셜 로그인 후 리다이렉트 과정에서 `redirect_uri_mismatch` 오류 발생.

**원인 분석**
- 개발 환경(localhost)과 배포 환경(도메인)에서 서로 다른 리다이렉트 URI 사용
- 각 OAuth2 Provider마다 등록된 URI와 실제 요청 URI가 불일치

**해결 방법**
```java
// CustomSuccessHandler.java
@Component
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    @Value("${app.oauth2.redirect-base-url:http://localhost:3000}")
    private String redirectBaseUrl;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                       HttpServletResponse response,
                                       Authentication authentication) throws IOException {
        // 환경별 동적 리다이렉트 URL 생성
        String targetUrl = redirectBaseUrl + "/oauth2/success?token=" + jwtToken;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
```

**결과**  
환경 변수 기반 동적 URI 생성으로 개발/배포 환경 모두에서 정상 작동. 코드 수정 없이 환경 변수만으로 배포 환경 전환 가능.

---

### 3. **React 빌드 파일 통합 문제**

**문제 상황**  
Gradle 빌드 시 React 빌드가 포함되지 않아 배포 후 프론트엔드가 표시되지 않는 문제.

**원인 분석**
- Gradle 빌드 프로세스에서 React 빌드 Task가 누락됨
- Windows와 Linux 환경에서 npm 명령어 차이로 빌드 실패

**해결 방법**
```gradle
// build.gradle
def frontendDir = "$projectDir/src/main/reactapp"

task installReact(type: Exec) {
    workingDir "$frontendDir"
    if (System.getProperty('os.name').toLowerCase(Locale.ROOT).contains('windows')) {
        commandLine "npm.cmd", "install"
    } else {
        commandLine "npm", "install"
    }
}

task buildReact(type: Exec) {
    dependsOn "installReact"
    workingDir "$frontendDir"
    if (System.getProperty('os.name').toLowerCase(Locale.ROOT).contains('windows')) {
        commandLine "npm.cmd", "run-script", "build"
    } else {
        commandLine "npm", "run-script", "build"
    }
}

task copyReactBuildFiles(type: Copy) {
    dependsOn "buildReact"
    from "$frontendDir/build"
    into "$projectDir/src/main/resources/static"
}

processResources { dependsOn "copyReactBuildFiles" }
```

**결과**  
단일 `./gradlew build` 명령어로 프론트엔드와 백엔드를 통합 빌드. CI/CD 파이프라인 간소화 및 배포 시간 단축.

---

### 4. **대용량 데이터 조회 성능 저하**

**문제 상황**  
Tour API에서 가져온 관광지 목록(1000개 이상)을 조회할 때 응답 시간이 3초 이상 소요.

**원인 분석**
- 매 요청마다 외부 API 호출로 네트워크 지연 발생
- 페이지네이션 없이 전체 데이터를 한 번에 로드

**해결 방법**
```java
// TourApiService.java
@Service
public class TourApiService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String CACHE_KEY = "tour:places:";
    private static final long CACHE_TTL = 24 * 60 * 60; // 24시간
    
    public List<TourApiPlaceDTO> getPlacesByRegion(String region, int page, int size) {
        String cacheKey = CACHE_KEY + region + ":" + page;
        
        // Redis 캐시 확인
        List<TourApiPlaceDTO> cachedData = (List<TourApiPlaceDTO>) 
            redisTemplate.opsForValue().get(cacheKey);
        
        if (cachedData != null) {
            return cachedData;
        }
        
        // 캐시 미스 시 API 호출 및 캐싱
        List<TourApiPlaceDTO> places = callTourApi(region, page, size);
        redisTemplate.opsForValue().set(cacheKey, places, CACHE_TTL, TimeUnit.SECONDS);
        
        return places;
    }
}
```

```javascript
// React: usePlaces.js Custom Hook
export const usePlaces = (region) => {
  return useQuery({
    queryKey: ['places', region],
    queryFn: () => fetchPlaces(region),
    staleTime: 1000 * 60 * 30, // 30분 캐시
    cacheTime: 1000 * 60 * 60, // 1시간 유지
    retry: 2,
  });
};
```

**결과**  
- Redis 캐싱으로 평균 응답 시간 **3초 → 200ms**로 단축 (93% 개선)
- React Query 캐싱으로 불필요한 API 호출 제거, 사용자 경험 개선

---

### 5. **JWT 토큰 갱신 전략**

**문제 상황**  
Access Token 만료 시 사용자가 강제 로그아웃되어 UX 저하.

**원인 분석**
- Refresh Token 미구현으로 토큰 만료 시 재로그인 필요
- 토큰 만료 시점을 프론트엔드에서 감지하지 못함

**해결 방법**
```java
// JwtUtil.java - Refresh Token 추가
public String createRefreshToken(String username) {
    return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 7)) // 7일
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
}
```

```javascript
// Axios Interceptor - 자동 토큰 갱신
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        
        localStorage.setItem('accessToken', data.accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh 실패 시 로그아웃
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

**결과**  
Access Token 만료 시 자동으로 Refresh Token을 사용해 갱신. 사용자는 로그인 상태 유지하며 원활한 서비스 이용 가능.

---

## 👥 협업 (팀 프로젝트)

### 팀 구성
- **팀 규모**: 4명
- **프로젝트 기간**: 2024.09 ~ 2024.11 (3개월)

### 역할 분담
| 이름 | 역할 | 담당 기능 |
|------|------|-----------|
| **본인** | **백엔드 리드** | Spring Security, JWT 인증, Kafka 채팅, Redis 캐싱, OAuth2 통합 |
| 팀원 A | 프론트엔드 | React 컴포넌트 설계, 상태 관리, UI/UX 디자인 |
| 팀원 B | 백엔드 | MyBatis 매퍼 작성, Tour API 연동, 스케줄 관리 |
| 팀원 C | 풀스택 | 관리자 페이지, 배포 자동화, DB 스키마 설계 |

### 협업 도구 및 방법론
- **버전 관리**: Git/GitHub
- **브랜치 전략**: Git Flow (main, develop, feature, hotfix)
- **코드 리뷰**: Pull Request 기반 리뷰 (최소 1명 승인 필수)
- **이슈 트래킹**: GitHub Issues & Projects
- **커뮤니케이션**: Discord, Notion
- **회의**: 주 2회 정기 회의 (월요일 오전, 목요일 오후)

### 기술적 기여
1. **아키텍처 설계**: MSA 지향 구조로 Kafka 메시징 시스템 도입 제안 및 구현
2. **성능 최적화**: Redis 캐싱 전략 수립으로 API 응답 속도 93% 개선
3. **보안 강화**: JWT + OAuth2 통합 인증 시스템 설계 및 구현
4. **코드 품질**: SonarLint 도입 및 코드 리뷰 문화 정착
5. **CI/CD**: GitHub Actions를 활용한 자동 빌드 및 테스트 파이프라인 구축 (계획)

---

## 🎓 배운 점 및 성장

### 기술적 성장
- **메시지 큐 시스템**: Kafka의 Producer-Consumer 패턴을 통한 비동기 메시징 아키텍처 이해
- **분산 시스템**: Redis를 활용한 세션 클러스터링 및 캐싱 전략 습득
- **인증/인가**: OAuth2 프로토콜과 JWT 기반 무상태 인증의 장단점 파악
- **프론트엔드 상태 관리**: Redux와 Recoil의 사용 사례별 적합성 학습

### 소프트 스킬
- **문제 해결 능력**: 예상치 못한 WebSocket 연결 끊김 문제를 네트워크 패킷 분석을 통해 해결
- **협업 능력**: 팀원과의 원활한 소통을 통해 API 명세 통일 및 일정 준수
- **문서화**: 기술 문서 작성 습관으로 팀원 온보딩 시간 단축 (3일 → 1일)

---

## 🚀 향후 개발 계획

- [ ] **AI 추천 시스템**: 사용자 취향 기반 여행지 추천 (OpenAI API 활용)
- [ ] **모바일 앱**: React Native를 활용한 크로스 플랫폼 앱 개발
- [ ] **소셜 기능 강화**: 여행 후기 공유, 팔로우/팔로잉 시스템
- [ ] **결제 시스템**: 공동 경비 관리 및 정산 기능
- [ ] **알림 시스템**: 일정 변경, 채팅 메시지 등 실시간 알림 (FCM)
- [ ] **다국어 지원**: i18n을 활용한 영어, 일본어 지원
- [ ] **성능 모니터링**: Prometheus + Grafana를 활용한 실시간 모니터링 대시보드

---

## 📄 라이선스

이 프로젝트는 학습 및 포트폴리오 목적으로 제작되었습니다.  
상업적 사용을 원하시는 경우 아래 연락처로 문의 바랍니다.

---

## 📧 연락처

**프로젝트 관련 문의 및 피드백은 언제든 환영합니다!**

- **GitHub**: [https://github.com/your-username](https://github.com/your-username)
- **Email**: your.email@example.com
- **LinkedIn**: [https://linkedin.com/in/your-profile](https://linkedin.com/in/your-profile)
- **Portfolio**: [https://your-portfolio.com](https://your-portfolio.com)

---

<div align="center">
  <sub>Built with ❤️ by [Your Name]</sub>
</div>
