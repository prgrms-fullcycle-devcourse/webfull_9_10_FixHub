# Orval Guide

## Orval이 하는 일

Orval은 백엔드 OpenAPI 문서를 읽어서 아래 코드를 자동으로 만들어줍니다.

- API 요청 함수
- 요청/응답 타입
- TanStack Query 훅

즉, 우리가 API 코드를 손으로 하나씩 만들지 않게 도와주는 도구입니다.

## 생성 명령어

```bash
pnpm dev    # localhost 기준으로 생성할 때 한정

pnpm orval
```

이 명령어를 실행하면 프론트엔드의 `src/api/generated.ts`에 코드가 생성됩니다.

현재 `package.json` 기준으로 이 프로젝트는 `orval@8.9.0`을 사용합니다.

## 관련 위치

`src/api/mutator.ts`에서 기존 Axios 인스턴스인
`src/api/axios.ts`를 재사용합니다.

그래서 generated 코드도 같은 `withCredentials` 설정을 그대로 사용합니다.
런타임 요청 주소는 `src/api/axios.ts`의 `VITE_API_BASE_URL` 설정을 따릅니다.

## 직접 수정하면 안 되는 파일

아래 폴더는 `pnpm orval`을 다시 실행할 때마다 덮어써집니다.

- `src/api/generated.ts`

즉, generated.ts 파일은 직접 수정하지 않는 것이 원칙입니다.

수정이 필요할 때는 아래 중 하나를 바꿔야 합니다.

- 백엔드 OpenAPI 문서
- `orval.config.ts`
- `src/shared/api/orval/mutator.ts`
- generated 훅을 사용하는 컴포넌트 코드

## 사용 전에 알아둘 점

생성된 훅은 TanStack Query 기반입니다.

그래서 `useGetIssuesSearch` 같은 훅을 쓰려면 앱이 `QueryClientProvider`로 감싸져 있어야 합니다.

이 프로젝트는 `src/main.tsx`에서 `QueryClientProvider`가 설정되어 있습니다.

대부분의 페이지나 컴포넌트에서는 바로 사용하면 됩니다.

## 예시: 조회 훅

```tsx
import { useGetIssuesSearch } from '@/api/generated';

export function Search() {
  const { data, isPending, isError } = useGetIssuesSearch("tag:typescript");

  if (isPending) return <div>Loading...</div>;
  if (isError || !data) return <div>Failed to load.</div>;

  const issues = data.data;

  return (
    <div>{issues.map((issue) => (<h1>{issue.title}</h1>))}</div>
  );
}
```

## 예시: 생성 훅

```tsx
import { usePostFunction } from '@/api/generated';

export function CreateCapsuleButton() {
  const createCapsule = usePostFunction();

  const handleClick = async () => {
    await createCapsule.mutateAsync({
      data: { /* 생략 */ },
    });
  };

  return <button onClick={handleClick}>Create</button>;
}
```

`usePostFunction`은 단순 예시입니다.

