# FixHub

> 팀 단위에서 이슈를 제기하고, 공유하고, 해결까지 관리할 수 있는 협업 플랫폼

---

## 🔗 링크 (Links)
- **프론트**: https://webfull-9-10-fix-hub-frontend.vercel.app
- **백엔드 api 문서**: https://webfull-9-10-fixhub.onrender.com/api-docs

## 🛠 기술 스택 (Tech Stack)

### **Frontend**

| 영역             | 기술                         |
| ---------------- | ---------------------------- |
| Package Manager  | pnpm                         |
| Language         | TypeScript                   |
| Framework        | React (Vite)                 |
| State Management | React Query, Zustand         |
| Styling          | Tailwind CSS, shadcn/ui      |
| API Client       | Axios, Orval                 |
| Code Quality     | ESLint, Prettier, commitlint |
| Deployment       | Vercel                       |
| Design           | Figma                        |

---

### **Backend**

| 영역            | 기술                         |
| --------------- | ---------------------------- |
| Package Manager | pnpm                         |
| Language        | TypeScript                   |
| Framework       | Express                      |
| Database        | PostgreSQL                   |
| ORM             | Prisma                       |
| Backend Service | Supabase                     |
| Validation      | Zod                          |
| API Docs        | Swagger (zod-to-openapi)     |
| Environment     | dotenv                       |
| Code Quality    | ESLint, Prettier, commitlint |
| Deployment      | Render                       |

---

### **Common**

| 영역     | 기술      |
| -------- | --------- |
| Monorepo | Turborepo |

---

## 📂 폴더 구조 (Folder Structure)

### 🖥️ Frontend

```text
apps/frontend/
├── public/           # 정적 파일
└── src/
    ├── api/          # API 요청 (axios, orval)
    ├── assets/       # 이미지, 아이콘 등
    ├── components/   # 공통 UI 컴포넌트
    ├── hooks/        # 커스텀 훅
    ├── pages/        # 페이지 단위 컴포넌트
    ├── router/       # 라우팅 설정
    ├── styles/       # 전역 스타일
    ├── types/        # 타입 정의
    └── utils/        # 유틸 함수
```

### ⚙️ Backend

```text
apps/backend/
├── prisma/           # DB 스키마 및 마이그레이션
└── src/
    ├── config/       # 환경 설정
    ├── controllers/  # 요청 처리 (req/res)
    ├── docs/         # Swagger 문서 설정
    ├── middlewares/  # 미들웨어
    ├── repositories/ # DB 접근 로직
    ├── routes/       # 라우팅 정의
    ├── services/     # 비즈니스 로직
    ├── types/        # 타입 정의
    ├── utils/        # 공통 유틸
    └── validations/  # Zod 스키마
```

---

## 📝 커밋 컨벤션 (Commit Convention)

| 태그         | 설명                                               |
| ------------ | -------------------------------------------------- |
| **Feat**     | 새로운 기능 추가                                   |
| **Fix**      | 버그 수정                                          |
| **Design**   | UI 디자인 수정                                     |
| **Test**     | 테스트 코드 및 테스트 관련 작업                    |
| **Chore**    | 빌드 프로세스 및 환경 설정 변경                    |
| **Refactor** | 코드 리팩토링 (구조 개선, 가독성 향상 등)          |
| **Comment**  | 주석 추가 및 변경                                  |
| **Rename**   | 파일/폴더명 수정 또는 이동                         |
| **Remove**   | 파일 삭제                                          |
| **Style**    | 코드 포맷 변경 (세미콜론, 공백 등, 로직 변경 없음) |
| **Docs**     | 문서 수정                                          |
| **Security** | 보안 취약점 수정 및 관련 변경                      |

---

## 🚀 로컬 실행 방법 (Getting Started)

프로젝트를 로컬 환경에서 실행하고 테스트하는 방법입니다.

### 1. 레포지토리 클론 및 폴더 이동

```bash
git clone https://github.com/prgrms-fullcycle-devcourse/webfull_9_10_FixHub

cd webfull_9_10_FixHub
```

### 2. 패키지 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

프로젝트 최상위 경로에 `.env` 파일을 생성하고 `.env.example`을 참고하여 환경 변수를 채워주세요.

### 4. 프로젝트 실행

```bash
pnpm dev        # 개발 모드 실행

pnpm start      # 프로덕션 실행
```

---

## 🧑‍💻 팀원 소개 (Team)

| 프로필                                                        | 이름   | 역할      | GitHub                                             |
| ------------------------------------------------------------- | ------ | --------- | -------------------------------------------------- |
| <img src="https://github.com/aeri123443.png" width="50" />    | 정애리 | Fullstack | [@aeri123443](https://github.com/aeri123443)       |
| <img src="https://github.com/kimbseong0814.png" width="50" /> | 김병성 | Fullstack | [@kimbseong0814](https://github.com/kimbseong0814) |
| <img src="https://github.com/lvyest.png" width="50" />        | 김가영 | Fullstack | [@lvyest](http://github.com/lvyest)                |
| <img src="https://github.com/s576air.png" width="50" />       | 한재민 | Fullstack | [@s576air](https://github.com/s576air)             |
| <img src="https://github.com/TeemoGB.png" width="50" />       | 정영호 | Fullstack | [@TeemoGB](https://github.com/TeemoGB)             |

---

## 문서

- [Orval 가이드](./docs/orval-usage.md): 배포된 OpenAPI URL 기준으로 API client와 TanStack Query 훅을 생성하는 방법
