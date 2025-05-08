# CheckMate - 노션 API 기반 출퇴근 관리 시스템

## 소개

CheckMate는 노션 API를 활용한 출퇴근 관리 시스템입니다. React와 Vite를 기반으로 하여 모던하고 반응형 UI를 제공합니다.

## 주요 기능

- 직원 선택 및 정보 표시
- 출근/퇴근 기록
- 출퇴근 기록 열람
- 노션 데이터베이스 연동

## 기술 스택

- **프론트엔드**: React, TypeScript, Tailwind CSS
- **서버리스 함수**: Vercel Serverless Functions
- **데이터 저장소**: Notion API

## Vercel 배포 방법

프로젝트는 Vercel에 배포하도록 설정되어 있습니다.

### 1. 환경 변수 설정

Vercel 프로젝트에 다음 환경 변수를 설정해야 합니다:

- `NOTION_API_KEY`: 노션 API 키
- `EMPLOYEES_DATABASE_ID`: 직원 정보가 저장된 노션 데이터베이스 ID
- `ATTENDANCE_DATABASE_ID`: 출퇴근 기록이 저장된 노션 데이터베이스 ID

### 2. 배포 방법

1. GitHub에 코드를 푸시합니다.
2. Vercel 대시보드에서 새 프로젝트를 생성합니다.
3. GitHub 저장소를 연결합니다.
4. 환경 변수를 설정합니다.
5. 배포 버튼을 클릭합니다.

## 노션 데이터베이스 설정

### 직원 데이터베이스 필수 속성

- 이름 (title)
- 부서 (select)
- 직급 (select)
- 사원번호 (rich_text)
- 연락처 (rich_text) - 선택사항
- 이메일 (email) - 선택사항
- 프로필사진 (files) - 선택사항

### 출퇴근 기록 데이터베이스 필수 속성

- 날짜 (date)
- 직원 (relation) - 직원 데이터베이스와 연결
- 출근시간 (rich_text)
- 퇴근시간 (rich_text)
- 근무시간 (rich_text)
- 상태 (select) - 근무중, 퇴근완료 등

## 로컬 개발 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 이슈 및 문제 해결

### Tailwind CSS 관련 오류

"It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin" 오류가 발생하는 경우 `postcss.config.js` 파일을 수정하고 Tailwind v3 버전을 사용하세요.

### 노션 API 연결 문제

서버에서 데이터베이스 ID 오류와 속성 이름 오류가 발생하는 경우, 노션 데이터베이스의 구조와 ID를 확인하세요. 필수 속성이 모두 올바르게 설정되어 있어야 합니다.
