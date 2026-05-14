import {
  type User,
  type TeamMember,
  type ErrorIssue,
  type Comment,
} from '@prisma/client';
import { hash } from 'bcrypt';
import { faker } from '@faker-js/faker/locale/ko';

import prisma from '../src/common/config/prisma.js';

function randomItem<T>(arr: T[]): T {
  return faker.helpers.arrayElement(arr);
}

/** 히트맵용: 최근 180일 중 날짜를 가중치(최근일수록 확률 높음)로 랜덤 선택 */
function weightedRecentDate(maxDaysAgo = 180): Date {
  const r = Math.random();
  const daysAgo = Math.floor(Math.pow(r, 0.4) * maxDaysAgo);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(
    faker.number.int({ min: 8, max: 22 }),
    faker.number.int({ min: 0, max: 59 }),
    0,
    0,
  );
  return d;
}

const tagOptions = [
  'typescript',
  'prisma',
  'database',
  'auth',
  'jwt',
  'bug',
  'performance',
  'postgresql',
  'api',
  'security',
  'race-condition',
  'webhook',
  'slack',
  'pagination',
  'feature-request',
  'validation',
  'error-handling',
  'social-login',
  'cascade',
  'notification',
  'redis',
  'docker',
  'ci-cd',
  'testing',
  'refactor',
  'logging',
  'cors',
  'cache',
  'orm',
  'migration',
];

const issueContents = [
  '로그인 API 호출 시 간헐적으로 500 에러가 발생합니다. 특정 유저에서만 재현되고 있으며 스택 트레이스를 첨부합니다.',
  'JWT 토큰이 만료된 상태에서 요청을 보내면 401이 아닌 500이 반환됩니다. 미들웨어 에러 핸들링 문제로 보입니다.',
  'Prisma unique constraint 위반 시 에러가 클라이언트에 그대로 노출됩니다. 적절한 에러 응답으로 변환이 필요합니다.',
  '데이터가 10만 건 이상일 때 목록 조회 API 응답이 3초 이상 걸립니다. 인덱스 추가 또는 쿼리 최적화가 필요합니다.',
  'Slack Webhook URL이 잘못된 경우 에러를 catch하지 않아 서버 로그에도 남지 않습니다. 에러 핸들링 추가가 필요합니다.',
  '팀 초대 수락 API를 호출해도 TeamMember status가 PENDING에서 ACTIVE로 변경되지 않습니다. 업데이트 쿼리가 누락된 것 같습니다.',
  '동일 이슈에 대해 여러 댓글을 동시에 채택할 수 있습니다. 트랜잭션 처리와 중복 체크 로직이 필요합니다.',
  '소셜 로그인으로 가입한 유저(password=null)가 이메일 로그인 시도 시 bcrypt.compare에서 에러가 납니다. null 체크가 필요합니다.',
  '스택 트레이스가 매우 긴 에러 발생 시 ErrorLog DB insert가 실패합니다. 저장 전 길이 제한 처리가 필요합니다.',
  '알림을 개별로만 읽음 처리할 수 있어 알림이 많을 때 UX가 불편합니다. 전체 읽음 처리 API 추가가 필요합니다.',
  'isPublic=false인 이슈가 공개 피드 조회 API에서 노출됩니다. where 조건에 isPublic 필터가 누락된 것으로 보입니다.',
  '댓글이 추가돼도 ErrorIssue의 updatedAt이 갱신되지 않아 최신 활동 기준 정렬이 부정확합니다.',
  '팀 삭제 시 Team → TeamMember cascade는 동작하지만 ScoreLog가 삭제되지 않고 남아 있습니다.',
  '동일 태그를 이슈에 중복 추가하면 unique constraint 에러가 500으로 클라이언트에 노출됩니다. 적절한 에러 처리가 필요합니다.',
  'OAuth 콜백 처리 중 state 파라미터 검증이 누락되어 CSRF 공격에 취약할 수 있습니다. 검증 로직 추가가 필요합니다.',
  '페이지네이션 API에서 totalCount 계산을 위한 count 쿼리가 매번 실행되어 성능이 저하됩니다. 캐싱 적용이 필요합니다.',
  '파일 업로드 API에서 확장자 검증 없이 저장하고 있습니다. 허용 확장자 화이트리스트 검증이 필요합니다.',
  'refreshToken 재발급 API에서 기존 토큰을 무효화하지 않아 탈취된 토큰으로 계속 갱신이 가능합니다.',
  '에러 이슈 검색 API에서 SQL injection 방어를 위한 파라미터 바인딩이 제대로 적용되지 않은 부분이 있습니다.',
  '팀 멤버 score 업데이트 시 동시 요청이 들어오면 race condition으로 점수가 정확히 반영되지 않습니다.',
  'Redis 캐시에서 TTL 설정 오류로 인해 만료되지 않은 데이터가 계속 반환됩니다. TTL 계산 로직을 검토해야 합니다.',
  'Docker 컨테이너 재시작 시 환경변수가 제대로 로드되지 않아 서버가 시작되지 않습니다. 시작 스크립트에 검증 로직 추가가 필요합니다.',
  'CORS 설정에서 허용 도메인 목록이 하드코딩되어 있어 환경별로 다른 설정이 불가능합니다. 환경변수 기반으로 변경해야 합니다.',
  '로그 레벨 설정이 production에서도 debug로 되어 있어 민감한 정보가 로그에 출력됩니다. 환경별 로그 레벨 분리가 필요합니다.',
  '마이그레이션 파일이 팀원 간 순서가 달라 충돌이 발생합니다. 마이그레이션 명명 규칙과 프로세스 정립이 필요합니다.',
  'API 응답에서 비밀번호 해시가 그대로 포함되어 반환됩니다. select 절에서 password 필드 제외가 필요합니다.',
  '테스트 환경에서 실제 DB를 사용해 테스트 간 데이터 오염이 발생합니다. 테스트 DB 격리 전략이 필요합니다.',
  '무한 스크롤 구현 시 cursor 기반 페이지네이션에서 중복 데이터가 반환됩니다. cursor 조건 쿼리를 재검토해야 합니다.',
  'WebSocket 연결이 idle 상태에서 30분 후 자동으로 끊어집니다. keepalive 핑 메커니즘 추가가 필요합니다.',
  '이미지 업로드 시 리사이징 없이 원본 파일이 저장되어 스토리지 비용이 급증하고 있습니다.',
];

const commentContents = [
  '동일한 문제를 겪었습니다. 트랜잭션으로 감싸니 해결됐어요.',
  '해당 서비스 코드 확인해보니 null 체크가 누락되어 있습니다. 옵셔널 체이닝으로 처리하면 될 것 같습니다.',
  '인덱스 추가 후 쿼리 성능이 크게 개선됐습니다. EXPLAIN ANALYZE 결과 공유드릴게요.',
  '미들웨어 순서 문제일 수 있습니다. auth 미들웨어 위치를 확인해 보세요.',
  '재현 조건 공유해 주시면 로컬에서 디버깅해 볼게요.',
  'Prisma 버전 업그레이드 후 발생했나요? changelog 확인 부탁드립니다.',
  '환경변수 누락인지 먼저 확인해 주세요. .env.example과 비교해 보시면 됩니다.',
  '단위 테스트 추가해서 edge case를 잡는 게 좋을 것 같습니다.',
  '임시로 try-catch 추가했는데 근본 원인은 추가 분석이 필요합니다.',
  'PR 올렸습니다. 리뷰 부탁드립니다.',
  '스테이징에서는 재현되는데 로컬에서는 안 됩니다. 환경 차이인 것 같습니다.',
  '해당 API에 rate limiting도 같이 적용하면 좋을 것 같습니다.',
  '로그 보니 DB connection pool이 부족한 것 같습니다. pool size 설정 확인해 보세요.',
  '캐싱 레이어 추가하면 성능 이슈 해결될 것 같습니다. Redis 도입을 고려해 보시죠.',
  '코드 리뷰하다 발견했는데 관련 부분에 타입 가드도 추가하면 좋을 것 같아요.',
  'Zod 스키마로 입력 검증 추가하면 이 문제는 바로 잡힐 것 같습니다.',
  'select 절에서 해당 필드를 제외하면 됩니다. password: false 추가해 보세요.',
  '해당 훅에서 의존성 배열을 잘못 설정한 것 같아요. 리렌더링 문제 확인해 보세요.',
  '저도 같은 이슈 만났는데 bcrypt.compare 앞에 if (!password) return false 추가하면 됩니다.',
  '제가 직접 수정해서 테스트해봤는데 정상 동작했습니다. 코드 공유드릴게요.',
];

const issueTitles = [
  'NullPointerException in UserService.getProfile()',
  'JWT 토큰 만료 후 401 대신 500 반환',
  'Prisma unique constraint 오류 - 이메일 중복 가입',
  '페이지네이션 cursor 기반 쿼리 성능 저하',
  'Slack Webhook 발송 실패 시 에러 핸들링 누락',
  '팀 초대 수락 후 status가 PENDING에서 변경되지 않음',
  '댓글 채택(isAdopted) 중복 처리 가능',
  'ScoreLog amount 음수 허용으로 점수 마이너스 가능',
  'ErrorLog stackTrace 길이 초과 시 DB insert 실패',
  '알림 전체 읽음 처리 API 미지원',
  'isPublic=false 이슈가 공개 피드에 노출',
  'ErrorIssue updatedAt 댓글 작성 시 미갱신',
  '팀 삭제 시 ScoreLog Cascade 미동작',
  '비밀번호 없는 소셜 유저 bcrypt.compare 에러',
  'ErrorIssueTag 중복 추가 시 500 에러 노출',
  'OAuth state 파라미터 검증 누락',
  '목록 조회 count 쿼리 성능 저하',
  '파일 업로드 확장자 검증 누락',
  'refreshToken 재발급 시 기존 토큰 미무효화',
  '팀 멤버 score 동시 업데이트 race condition',
  'Redis TTL 설정 오류로 만료 데이터 반환',
  'Docker 재시작 시 환경변수 로드 실패',
  'CORS 허용 도메인 하드코딩 문제',
  'production 환경에서 debug 로그 레벨 적용 중',
  'DB 마이그레이션 파일 충돌 문제',
  'API 응답에 password hash 포함 노출',
  '테스트 간 DB 데이터 오염 문제',
  '무한 스크롤 cursor 페이지네이션 중복 반환',
  'WebSocket idle 30분 후 연결 끊김',
  '이미지 업로드 시 원본 저장으로 스토리지 급증',
  'TypeScript strict 모드 적용 후 타입 에러 다수 발생',
  'Swagger 문서와 실제 API 스펙 불일치',
  '에러 응답 포맷이 엔드포인트마다 달라 프론트 처리 어려움',
  'API 버전 관리 전략 미적용으로 하위 호환성 문제',
  'CSV 대용량 파일 import 시 메모리 부족',
  '이메일 인증 토큰 만료 시간이 너무 짧아 UX 불편',
  '댓글 수정 후 원본 내용이 히스토리에 남지 않음',
  '팀 통계 API 응답에 삭제된 이슈도 포함',
  '소셜 로그인 callback URL 환경별 설정 오류',
  '검색 API에서 특수문자 포함 시 쿼리 에러 발생',
  '알림 생성 시 발신자 정보가 포함되지 않아 누가 보낸지 모름',
  '팀 멤버 강제 탈퇴 시 해당 유저의 데이터 처리 미정의',
  'Prisma transaction rollback 실패 케이스 존재',
  '비밀번호 변경 후 기존 세션 무효화되지 않음',
  '장기간 미접속 계정 정책 미정의',
  'API 요청 로깅 시 body에 민감 정보 포함',
  '페이지 새로고침 시 토큰 갱신 로직 중복 실행',
  '팀 이름 변경 후 캐시가 갱신되지 않는 문제',
  '이슈 첨부파일 삭제 후 실제 스토리지에서 미삭제',
  '댓글 알림 발송 시 이슈 작성자 외 팀원에게도 발송',
  '이슈 검색 결과 정렬 기준이 일관되지 않음',
];

const sources = [
  'api-gateway',
  'auth-service',
  'user-service',
  'notification-worker',
  'team-service',
  'issue-service',
  'comment-service',
  'score-service',
];

// 점수 정책 상수
const SCORE = {
  ISSUE_CREATE: 3,
  COMMENT_CREATE: 1,
  COMMENT_ADOPTED: 10,
} as const;

// 알림 타입 - appNotification.ts의 APP_NOTIFICATION_TYPE과 동일하게 맞춤
const NOTIFICATION_TYPES = {
  ISSUE_CREATED: 'ISSUE_CREATED',
  COMMENT: 'COMMENT',
  REPLY: 'REPLY',
  ADOPTED: 'ADOPTED',
} as const;

async function main() {
  console.log('🌱 Seeding started...\n');

  // ──────────────────────────────────────────
  // 1. Users
  // ──────────────────────────────────────────
  console.log('👤 Creating users...');
  const hashedPw = await hash('password1234!', 10);

  const users: User[] = [];

  const fixedUsers = [
    { name: '김민준', email: 'minjun.kim@fixhub.dev' },
    { name: '이서연', email: 'seoyeon.lee@fixhub.dev' },
    { name: '박지호', email: 'jiho.park@fixhub.dev' },
    { name: '최예린', email: 'yerin.choi@fixhub.dev' },
    { name: '정우성', email: 'woosung.jung@fixhub.dev' },
    { name: '강하은', email: 'haeun.kang@fixhub.dev' },
    { name: '윤도현', email: 'dohyun.yoon@fixhub.dev' },
    { name: '송지아', email: 'jia.song@fixhub.dev' },
    { name: '임태양', email: 'taeyang.lim@fixhub.dev' },
    { name: '한소희', email: 'sohee.han@fixhub.dev' },
  ];

  for (const u of fixedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: hashedPw,
        profileImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`,
        provider: 'local',
      },
    });
    users.push(user);
  }
  console.log(`  ✅ ${users.length} users created\n`);

  // ──────────────────────────────────────────
  // 2. Teams (2개 생성)
  // ──────────────────────────────────────────
  console.log('🏢 Creating teams...');
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: 'FixHub Backend Team',
        description: '백엔드 API 개발 및 인프라 관리',
      },
    }),
    prisma.team.create({
      data: {
        name: 'FixHub Frontend Team',
        description: '프론트엔드 UI/UX 개발',
      },
    }),
  ]);
  console.log(`  ✅ ${teams.length} teams created\n`);

  // ──────────────────────────────────────────
  // 3. TeamMembers
  //    팀1: 모든 유저, 팀2: 절반 유저
  // ──────────────────────────────────────────
  console.log('👥 Creating team members...');

  // 팀1 전원 가입
  const team1Members: TeamMember[] = [];
  for (const [idx, user] of users.entries()) {
    const tm = await prisma.teamMember.create({
      data: {
        teamId: teams[0].id,
        userId: user.id,
        role: idx === 0 ? 'LEADER' : 'MEMBER',
        status: 'ACTIVE',
        score: 0,
        joinedAt: faker.date.past({ years: 1 }),
      },
    });
    team1Members.push(tm);
  }

  // 팀2: 앞 6명만 가입
  const team2Members: TeamMember[] = [];
  for (const [idx, user] of users.slice(0, 6).entries()) {
    const tm = await prisma.teamMember.create({
      data: {
        teamId: teams[1].id,
        userId: user.id,
        role: idx === 0 ? 'LEADER' : 'MEMBER',
        status: 'ACTIVE',
        score: 0,
        joinedAt: faker.date.past({ years: 1 }),
      },
    });
    team2Members.push(tm);
  }

  // teamId → 해당 팀의 TeamMember 목록 맵
  const teamMembersMap: Record<string, TeamMember[]> = {
    [teams[0].id]: team1Members,
    [teams[1].id]: team2Members,
  };

  // userId+teamId → TeamMember 빠른 조회용 맵
  const memberLookup = new Map<string, TeamMember>();
  for (const tm of [...team1Members, ...team2Members]) {
    memberLookup.set(`${tm.userId}:${tm.teamId}`, tm);
  }

  // score 누적 추적 (TeamMember.id → 누적 점수)
  const scoreSums: Record<string, number> = {};
  for (const tm of [...team1Members, ...team2Members]) {
    scoreSums[tm.id] = 0;
  }

  console.log(
    `  ✅ ${team1Members.length + team2Members.length} team members created\n`,
  );

  // ──────────────────────────────────────────
  // 4. Issues + Comments + ErrorLogs + ScoreLogs + Notifications
  // ──────────────────────────────────────────
  const ISSUE_COUNT = 120;
  console.log(`📋 Creating ${ISSUE_COUNT} issues...`);

  const createdIssues: ErrorIssue[] = [];

  for (let i = 0; i < ISSUE_COUNT; i++) {
    // 팀을 랜덤 선택 (팀2는 유저가 적으므로 가중치 조정)
    const team = faker.datatype.boolean({ probability: 0.6 })
      ? teams[0]
      : teams[1];
    const teamMembers = teamMembersMap[team.id];

    // 이슈 작성자: 해당 팀 멤버 중 랜덤
    const authorMember = randomItem(teamMembers);
    const author = users.find((u) => u.id === authorMember.userId)!;

    const isSolved = faker.datatype.boolean({ probability: 0.45 });
    const createdAt = weightedRecentDate(180);

    const issue = await prisma.errorIssue.create({
      data: {
        userId: author.id,
        teamId: team.id,
        title: `[${String(i + 1).padStart(3, '0')}] ${randomItem(issueTitles)}`,
        content: randomItem(issueContents),
        isPublic: faker.datatype.boolean({ probability: 0.65 }),
        status: isSolved ? 'SOLVED' : 'UNSOLVED',
        createdAt,
        updatedAt: createdAt,
        tags: {
          create: faker.helpers
            .arrayElements(tagOptions, { min: 1, max: 4 })
            .map((tagName) => ({ tagName })),
        },
        errorLogs: {
          create: Array.from({
            length: faker.number.int({ min: 1, max: 3 }),
          }).map((_, li) => ({
            logType: li === 0 ? ('RECEIVED' as const) : ('SENT' as const),
            source: randomItem(sources),
            message: randomItem(issueContents).slice(0, 100),
            stackTrace: [
              `Error: Unexpected error occurred`,
              `  at ${randomItem(sources)} (src/services/index.ts:${faker.number.int({ min: 10, max: 300 })}:${faker.number.int({ min: 1, max: 30 })})`,
              `  at async Handler (src/handlers/index.ts:${faker.number.int({ min: 10, max: 100 })}:${faker.number.int({ min: 1, max: 20 })})`,
            ].join('\n'),
            requestData: {
              method: randomItem(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
              path: `/api/v1/${randomItem(sources)}/${faker.number.int({ min: 1, max: 100 })}`,
              headers: { 'content-type': 'application/json' },
            },
            responseData: {
              status: randomItem([400, 401, 403, 404, 422, 500]),
              message: randomItem([
                'Internal Server Error',
                'Unauthorized',
                'Bad Request',
                'Not Found',
              ]),
            },
            capturedAt: createdAt,
          })),
        },
      },
    });

    createdIssues.push(issue);

    // ── ScoreLog: 이슈 작성 +3점 (이슈와 FK 연결)
    await prisma.scoreLog.create({
      data: {
        teamMemberId: authorMember.id,
        amount: SCORE.ISSUE_CREATE,
        reason: '이슈 작성',
        issueId: issue.id, // ← 이슈 FK 연결
        createdAt,
      },
    });
    scoreSums[authorMember.id] += SCORE.ISSUE_CREATE;

    // ── 이슈 생성 알림: 같은 팀의 다른 멤버들에게 알림 (resourceId = issue.id)
    const otherTeamMembers = teamMembers.filter(
      (tm) => tm.userId !== author.id,
    );
    // 알림 수 절감을 위해 최대 4명에게만 발송
    const notifTargets = faker.helpers.arrayElements(otherTeamMembers, {
      min: Math.min(1, otherTeamMembers.length),
      max: Math.min(4, otherTeamMembers.length),
    });
    await prisma.notification.createMany({
      data: notifTargets.map((tm) => ({
        userId: tm.userId,
        resourceId: issue.id, // ← 이슈 FK 연결 (알림 클릭 시 이슈로 이동)
        type: NOTIFICATION_TYPES.ISSUE_CREATED,
        content: `${author.name}님이 새 이슈를 등록했습니다: ${issue.title.slice(0, 40)}`,
        createdAt,
      })),
    });

    // ── 댓글 생성
    const commentCount = faker.number.int({ min: 1, max: 8 });
    let adoptedComment: Comment | null = null;

    for (let ci = 0; ci < commentCount; ci++) {
      const commenterMember = randomItem(teamMembers);
      const commenter = users.find((u) => u.id === commenterMember.userId)!;

      // 첫 번째 댓글만 채택 가능 (solved 이슈 한정, 60% 확률)
      const isAdopted =
        isSolved && ci === 0 && faker.datatype.boolean({ probability: 0.6 });

      const commentCreatedAt = new Date(
        createdAt.getTime() +
          faker.number.int({
            min: 5 * 60 * 1000,
            max: 7 * 24 * 60 * 60 * 1000,
          }),
      );

      const comment = await prisma.comment.create({
        data: {
          issueId: issue.id,
          userId: commenter.id,
          content: randomItem(commentContents),
          isAdopted,
          rewardScore: isAdopted ? SCORE.COMMENT_ADOPTED : null,
          createdAt: commentCreatedAt,
          updatedAt: commentCreatedAt,
        },
      });

      // ScoreLog: 댓글 작성 +1점 (이슈와 FK 연결)
      await prisma.scoreLog.create({
        data: {
          teamMemberId: commenterMember.id,
          amount: SCORE.COMMENT_CREATE,
          reason: '댓글 작성',
          issueId: issue.id, // ← 이슈 FK 연결
          createdAt: commentCreatedAt,
        },
      });
      scoreSums[commenterMember.id] += SCORE.COMMENT_CREATE;

      // 댓글 알림: 이슈 작성자에게 알림 (본인 댓글 제외)
      if (commenter.id !== author.id) {
        await prisma.notification.create({
          data: {
            userId: author.id,
            resourceId: issue.id, // ← 이슈 FK 연결 (알림 클릭 → 해당 이슈로 이동)
            type: NOTIFICATION_TYPES.COMMENT,
            content: `${commenter.name}님이 회원님의 이슈에 댓글을 달았습니다: ${comment.content.slice(0, 40)}`,
            isRead: faker.datatype.boolean({ probability: 0.5 }),
            createdAt: commentCreatedAt,
          },
        });
      }

      if (isAdopted) {
        adoptedComment = comment;
      }

      // 50% 확률로 대댓글 1~3개
      if (faker.datatype.boolean({ probability: 0.5 })) {
        const replyCount = faker.number.int({ min: 1, max: 3 });
        for (let ri = 0; ri < replyCount; ri++) {
          const replierMember = randomItem(teamMembers);
          const replier = users.find((u) => u.id === replierMember.userId)!;

          const replyCreatedAt = new Date(
            comment.createdAt.getTime() +
              faker.number.int({
                min: 1 * 60 * 1000,
                max: 3 * 24 * 60 * 60 * 1000,
              }),
          );

          await prisma.comment.create({
            data: {
              issueId: issue.id,
              userId: replier.id,
              parentId: comment.id,
              content: randomItem(commentContents),
              isAdopted: false,
              rewardScore: null,
              createdAt: replyCreatedAt,
              updatedAt: replyCreatedAt,
            },
          });

          // ScoreLog: 대댓글 작성 +1점 (이슈와 FK 연결)
          await prisma.scoreLog.create({
            data: {
              teamMemberId: replierMember.id,
              amount: SCORE.COMMENT_CREATE,
              reason: '댓글 작성',
              issueId: issue.id, // ← 이슈 FK 연결
              createdAt: replyCreatedAt,
            },
          });
          scoreSums[replierMember.id] += SCORE.COMMENT_CREATE;

          // 대댓글 알림: 원댓글 작성자에게 (본인 제외)
          if (replier.id !== commenter.id) {
            await prisma.notification.create({
              data: {
                userId: commenter.id,
                resourceId: issue.id, // ← 이슈 FK 연결
                type: NOTIFICATION_TYPES.REPLY,
                content: `${replier.name}님이 회원님의 댓글에 답글을 달았습니다.`,
                isRead: faker.datatype.boolean({ probability: 0.4 }),
                createdAt: replyCreatedAt,
              },
            });
          }
        }
      }
    }

    // ── 채택 댓글 ScoreLog + 알림
    if (adoptedComment) {
      const adoptedCommenterMember = memberLookup.get(
        `${adoptedComment.userId}:${team.id}`,
      );

      if (adoptedCommenterMember) {
        // ScoreLog: 채택 +10점 (이슈와 FK 연결)
        await prisma.scoreLog.create({
          data: {
            teamMemberId: adoptedCommenterMember.id,
            amount: SCORE.COMMENT_ADOPTED,
            reason: '댓글 채택',
            issueId: issue.id, // ← 이슈 FK 연결
            createdAt: adoptedComment.createdAt,
          },
        });
        scoreSums[adoptedCommenterMember.id] += SCORE.COMMENT_ADOPTED;

        // 채택 알림: 채택된 댓글 작성자에게 (이슈 작성자 본인 제외)
        if (adoptedComment.userId !== author.id) {
          await prisma.notification.create({
            data: {
              userId: adoptedComment.userId,
              resourceId: issue.id, // ← 이슈 FK 연결
              type: NOTIFICATION_TYPES.ADOPTED,
              content: `회원님의 댓글이 채택되었습니다! +${SCORE.COMMENT_ADOPTED}점`,
              isRead: faker.datatype.boolean({ probability: 0.3 }),
              createdAt: adoptedComment.createdAt,
            },
          });
        }
      }
    }

    if ((i + 1) % 20 === 0 || i === ISSUE_COUNT - 1) {
      console.log(`  ✅ ${i + 1} / ${ISSUE_COUNT} issues created`);
    }
  }

  // ──────────────────────────────────────────
  // 5. 히트맵용 추가 ScoreLog
  //    실제 이슈와 연결하여 issueTitle이 표시되도록
  // ──────────────────────────────────────────
  console.log('\n📊 Creating heatmap score logs...');

  const allTeamMembers = [...team1Members, ...team2Members];

  for (const member of allTeamMembers) {
    const activeDayCount = faker.number.int({ min: 40, max: 90 });
    const usedDates = new Set<string>();

    // 해당 팀의 이슈들로 풀 구성
    const teamIssues = createdIssues.filter((iss) =>
      teams.some(
        (t) =>
          t.id === iss.teamId &&
          teamMembersMap[t.id]?.some((tm) => tm.id === member.id),
      ),
    );

    for (let d = 0; d < activeDayCount; d++) {
      const activityDate = weightedRecentDate(180);
      const dateKey = activityDate.toISOString().slice(0, 10);

      if (
        usedDates.has(dateKey) &&
        faker.datatype.boolean({ probability: 0.5 })
      ) {
        continue;
      }
      usedDates.add(dateKey);

      const dailyCount = faker.number.int({ min: 1, max: 4 });
      for (let k = 0; k < dailyCount; k++) {
        // 실제 이슈와 연결 (issueId가 있어야 마이페이지에서 issueTitle 표시됨)
        const linkedIssue =
          teamIssues.length > 0 ? randomItem(teamIssues) : null;

        const heatmapPools: Array<{ reason: string; amount: number }> = [
          { reason: '댓글 작성', amount: SCORE.COMMENT_CREATE },
          { reason: '댓글 작성', amount: SCORE.COMMENT_CREATE },
          { reason: '댓글 작성', amount: SCORE.COMMENT_CREATE },
          { reason: '이슈 작성', amount: SCORE.ISSUE_CREATE },
          { reason: '이슈 작성', amount: SCORE.ISSUE_CREATE },
          { reason: '댓글 채택', amount: SCORE.COMMENT_ADOPTED },
        ];
        const pick = randomItem(heatmapPools);

        await prisma.scoreLog.create({
          data: {
            teamMemberId: member.id,
            amount: pick.amount,
            reason: pick.reason,
            issueId: linkedIssue?.id ?? null, // ← 가능한 한 이슈 FK 연결
            createdAt: new Date(
              activityDate.getTime() +
                k * faker.number.int({ min: 1, max: 60 * 60 * 1000 }),
            ),
          },
        });
        scoreSums[member.id] += pick.amount;
      }
    }
  }
  console.log('  ✅ Heatmap score logs created');

  // ──────────────────────────────────────────
  // 6. TeamMember.score를 ScoreLog 합산으로 동기화
  // ──────────────────────────────────────────
  console.log('\n🔄 Syncing TeamMember.score with ScoreLog totals...');
  for (const member of allTeamMembers) {
    await prisma.teamMember.update({
      where: { id: member.id },
      data: { score: scoreSums[member.id] },
    });
  }
  console.log('  ✅ Scores synced');

  // ──────────────────────────────────────────
  // 7. Summary
  // ──────────────────────────────────────────
  const [
    issueCount,
    commentCount,
    logCount,
    scoreLogCount,
    notifCount,
    tagCount,
  ] = await Promise.all([
    prisma.errorIssue.count(),
    prisma.comment.count(),
    prisma.errorLog.count(),
    prisma.scoreLog.count(),
    prisma.notification.count(),
    prisma.errorIssueTag.count(),
  ]);

  // ScoreLog 중 issueId가 있는 것 (마이페이지 점수 목록에서 이슈 제목 보임)
  const scoreLogsWithIssue = await prisma.scoreLog.count({
    where: { issueId: { not: null } },
  });

  // Notification 중 resourceId가 있는 것 (클릭 시 이슈로 이동 가능)
  const notifsWithResourceId = await prisma.notification.count({
    where: { resourceId: { not: null } },
  });

  console.log('\n' + '─'.repeat(50));
  console.log('🎉 Seed complete!');
  console.log(`  • Users            : ${users.length}`);
  console.log(`  • Teams            : ${teams.length}`);
  console.log(`  • Team members     : ${allTeamMembers.length}`);
  console.log(`  • Issues           : ${issueCount}`);
  console.log(`  • Tags             : ${tagCount}`);
  console.log(`  • Comments         : ${commentCount}`);
  console.log(`  • Error logs       : ${logCount}`);
  console.log(
    `  • Score logs       : ${scoreLogCount} (issueId 연결: ${scoreLogsWithIssue})`,
  );
  console.log(
    `  • Notifications    : ${notifCount} (resourceId 연결: ${notifsWithResourceId})`,
  );
  console.log('─'.repeat(50));

  console.log('\n📊 Score summary per member (team1):');
  for (const member of team1Members) {
    const user = users.find((u) => u.id === member.userId);
    console.log(
      `  ${(user?.name ?? '').padEnd(12)} score=${scoreSums[member.id]}`,
    );
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
