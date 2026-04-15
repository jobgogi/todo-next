# 할 일 목록 (Todo Next)

Next.js 기반의 할 일 관리 앱입니다. 우선순위 설정, 드래그 앤 드롭 정렬, 포모도로 타이머 기능을 제공합니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| 드래그 앤 드롭 | @dnd-kit/core, @dnd-kit/sortable |
| 언어 | TypeScript |
| 테스트 | Vitest, Testing Library |

## 주요 기능

- **할 일 CRUD** — 추가, 완료 토글, 인라인 편집, 삭제
- **우선순위** — 낮음 / 보통 / 높음 설정 및 색상 뱃지 표시
- **필터** — 전체 / 진행 중 / 완료 필터링, 완료 항목 일괄 삭제
- **드래그 앤 드롭** — 마우스·터치로 항목 순서 변경
- **포모도로 타이머** — 항목별 25분 작업 / 5분 휴식 타이머, 완료 횟수 뱃지
- **다크 모드** — 시스템 설정에 따라 자동 전환

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 메인 페이지 (DnD 컨텍스트)
├── components/
│   ├── TodoInput.tsx        # 할 일 입력 + 우선순위 선택
│   ├── TodoFilter.tsx       # 필터 탭 + 완료 삭제 버튼
│   ├── TodoItem.tsx         # 할 일 항목 (편집, 포모도로 통합)
│   ├── SortableTodoItem.tsx # dnd-kit 드래그 래퍼
│   └── PomodoroTimer.tsx    # 포모도로 타이머 UI
├── hooks/
│   ├── useTodos.ts          # 할 일 목록 상태 관리
│   └── usePomodoro.ts       # 포모도로 타이머 상태 관리
├── types/
│   ├── todo.ts              # Todo, Priority, FilterType 타입
│   └── pomodoro.ts          # PomodoroState 타입
└── test/                    # 컴포넌트·훅 테스트
```

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 앱을 확인할 수 있습니다.

## 테스트

```bash
# 워치 모드로 테스트 실행
npm test

# 단일 실행
npm run test:run

# 커버리지 리포트 생성
npm run test:coverage
```

## 포모도로 타이머 사용법

1. 할 일 항목에 마우스를 올리면 오른쪽에 시계 아이콘 버튼이 나타납니다.
2. 버튼을 클릭하면 항목 아래에 타이머가 펼쳐집니다.
3. **시작** 버튼을 눌러 25분 작업 세션을 시작합니다.
4. 세션이 끝나면 자동으로 5분 휴식으로 전환되고 완료 횟수가 뱃지에 표시됩니다.
5. 언제든지 **일시정지** / **리셋**이 가능합니다.
