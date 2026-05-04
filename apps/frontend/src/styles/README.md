# styles 사용 가이드

`theme.css`는 프론트 디자인 토큰의 기준 파일입니다.

- 컬러 토큰
- 폰트 토큰
- 타이포그래피 유틸리티
- Tailwind v4에서 사용할 semantic token

위 항목들을 이 파일에서 관리합니다.

## 파일 구조

- [theme.css](./theme.css): 디자인 토큰 정의
- [index.css](../index.css): 폰트 CDN import, Tailwind import, `theme.css` 연결

## import 흐름

`index.css`에서 아래 순서로 연결합니다.

```css
@import url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/DungGeunMo.css');
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');
@import 'tailwindcss';
@import './styles/theme.css';
```

## 토큰 구조

`theme.css`는 크게 3층으로 나뉩니다.

1. 피그마 원본 팔레트 토큰
2. 실제 화면에서 쓰는 semantic token
3. Tailwind와 typography 유틸리티 연결

### 1. 피그마 원본 팔레트 토큰

```css
--palette-main-color
--palette-main-background
--palette-input-background
--palette-block-color
--palette-solved-status
--palette-unsaved-status
--palette-unselected
--palette-comment-background
```

이 이름들은 피그마에서 정한 원본 명칭을 그대로 유지합니다.

### 2. semantic token

컴포넌트에서는 가능하면 팔레트 원본 이름보다 semantic token을 우선 사용합니다.

대표 예시:

```css
--background
--foreground
--card
--input
--border
--primary
--secondary
--accent
--destructive
--status-success
--status-unsaved
--surface-panel
--surface-selected
```

## Tailwind 클래스 사용법

`@theme inline`에 연결된 토큰은 Tailwind 클래스 형태로 사용할 수 있습니다.

예시:

```tsx
<div className="bg-background text-foreground" />
<div className="bg-card text-card-foreground border border-border" />
<input className="bg-input text-foreground" />
<button className="bg-primary text-primary-foreground" />
<span className="bg-solved-status text-white" />
<span className="bg-unsaved-status text-white" />
<div className="bg-comment-background" />
```

자주 쓰는 클래스:

- `bg-background`
- `text-foreground`
- `bg-card`
- `bg-input`
- `border-border`
- `bg-primary`
- `text-primary-foreground`
- `bg-secondary`
- `bg-accent`
- `bg-solved-status`
- `bg-unsaved-status`
- `bg-comment-background`

## CSS 변수 직접 사용법

`@theme inline`에 연결되지 않은 토큰이나, 더 구체적인 제품용 토큰은 CSS에서 직접 사용합니다.

예시:

```css
.panel {
  background: var(--surface-panel);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.selected-item {
  background: var(--surface-selected);
}

.comment-chip {
  background: var(--surface-comment);
}
```

## 폰트 정책

- 기본 본문 폰트: `Pretendard Variable`
- 디스플레이 폰트: `DungGeunMo`

기본 본문은 `body { font-family: var(--font-body); }`로 적용됩니다.

Tailwind에서도 아래처럼 사용할 수 있습니다.

```tsx
<p className="font-sans">본문 텍스트</p>
<h1 className="font-display">제목 텍스트</h1>
```

## 타이포그래피 유틸리티

피그마 기준 텍스트 스타일은 utility class로 정의되어 있습니다.

- `typo-medium-40`
- `typo-regular-20`
- `typo-semibold-18`
- `typo-medium-16`
- `typo-regular-16`
- `typo-regular-14`

예시:

```tsx
<h1 className="typo-medium-40 text-foreground">팀 생성</h1>
<p className="typo-regular-20 text-foreground">설명 문구</p>
<label className="typo-semibold-18 text-foreground">팀 이름</label>
<input className="typo-regular-16 bg-input text-foreground" />
<span className="typo-regular-14 text-muted-foreground">보조 문구</span>
```

## 사용 원칙

- 가능하면 팔레트 원본 이름보다 semantic token을 먼저 사용합니다.
- 공통 UI는 Tailwind semantic class를 우선 사용합니다.
- 제품 특화 배경이나 선택 상태는 CSS 변수 직접 사용도 허용합니다.
- 제목과 본문은 폰트 패밀리를 분리해서 사용합니다.

권장:

- `bg-primary`
- `bg-card`
- `bg-input`
- `typo-medium-40`
- `typo-regular-16`

비권장:

- 컴포넌트 안에서 raw hex 직접 작성
- 의미 없는 임시 색 이름 추가
- 같은 역할에 서로 다른 타이포 클래스 혼용

## 새 토큰 추가할 때

1. 피그마 기준 이름이 있으면 먼저 `palette`에 추가합니다.
2. 화면에서 재사용될 역할이면 semantic token으로 한 번 더 매핑합니다.
3. Tailwind 클래스가 필요하면 `@theme inline`에 연결합니다.
4. 타이포 스타일이면 `typo-*` utility를 추가합니다.

## 참고

- 컬러 변경이 필요하면 먼저 `theme.css`의 palette와 semantic mapping을 확인합니다.
- 컴포넌트 작업 시 하드코딩된 색상보다 토큰 사용을 우선합니다.
