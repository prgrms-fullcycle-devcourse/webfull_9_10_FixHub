import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { faker } from '@faker-js/faker/locale/ko';

const prisma = new PrismaClient();

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

function randomItem<T>(arr: T[]): T {
  return faker.helpers.arrayElement(arr);
}

// ─── 더미 데이터 풀 ──────────────────────────────────────────────────────────

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
];

const issueContents = [
  '로그인 API 호출 시 간헐적으로 500 에러가 발생합니다. 특정 유저에서만 재현되고 있으며 스택 트레이스 첨부합니다.',
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
];

const sources = [
  'api-gateway',
  'auth-service',
  'user-service',
  'notification-worker',
  'team-service',
];

// ─── 시드 메인 ───────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding started...\n');

  // 1. 유저 생성
  console.log('👤 Creating users...');
  const hashedPw = await hash('password1234!', 10);

  const users = await Promise.all(
    Array.from({ length: 7 }).map(() =>
      prisma.user.upsert({
        where: { email: faker.internet.email() },
        update: {},
        create: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: hashedPw,
          profileImg: faker.image.avatar(),
          provider: 'local',
        },
      }),
    ),
  );
  console.log(`  ✅ ${users.length} users created\n`);

  // 2. 팀 생성
  console.log('🏢 Creating team...');
  const team = await prisma.team.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: `${faker.company.name()} Dev Team`,
      description: faker.company.catchPhrase(),
      slackWebhookUrl: null,
    },
  });
  console.log(`  ✅ Team "${team.name}" ready\n`);

  // 3. 팀 멤버 생성 (첫 번째 유저 = LEADER)
  console.log('👥 Creating team members...');
  const teamMembers = await Promise.all(
    users.map(async (user, idx) => {
      const existing = await prisma.teamMember.findFirst({
        where: { teamId: team.id, userId: user.id },
      });
      if (existing) return existing;
      return prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: user.id,
          role: idx === 0 ? 'LEADER' : 'MEMBER',
          status: 'ACTIVE',
          score: faker.number.int({ min: 0, max: 300 }),
          joinedAt: faker.date.past({ years: 1 }),
        },
      });
    }),
  );
  console.log(`  ✅ ${teamMembers.length} team members created\n`);

  // 4. 이슈 대량 생성
  const ISSUE_COUNT = 50;
  console.log(`📋 Creating ${ISSUE_COUNT} issues...`);

  for (let i = 0; i < ISSUE_COUNT; i++) {
    const author = randomItem(users);
    const isSolved = faker.datatype.boolean({ probability: 0.4 });
    const createdAt = faker.date.recent({ days: 90 });

    const issue = await prisma.errorIssue.create({
      data: {
        userId: author.id,
        teamId: team.id,
        title: `[${String(i + 1).padStart(3, '0')}] ${randomItem(issueTitles)}`,
        content: randomItem(issueContents),
        isPublic: faker.datatype.boolean({ probability: 0.6 }),
        status: isSolved ? 'SOLVED' : 'UNSOLVED',
        createdAt,
        updatedAt: createdAt,

        tags: {
          create: faker.helpers
            .arrayElements(tagOptions, { min: 2, max: 3 })
            .map((tagName) => ({ tagName })),
        },

        errorLogs: {
          create: Array.from({
            length: faker.number.int({ min: 1, max: 2 }),
          }).map((_, li) => ({
            logType: li === 0 ? 'RECEIVED' : 'SENT',
            source: randomItem(sources),
            message: randomItem(issueContents).slice(0, 100),
            stackTrace: [
              `Error: Unexpected error occurred`,
              `  at ${randomItem(sources)} (src/services/index.ts:${faker.number.int({ min: 10, max: 300 })}:${faker.number.int({ min: 1, max: 30 })})`,
              `  at async Handler (src/handlers/index.ts:${faker.number.int({ min: 10, max: 100 })}:${faker.number.int({ min: 1, max: 20 })})`,
            ].join('\n'),
            requestData: {
              method: randomItem(['GET', 'POST', 'PUT', 'DELETE']),
              path: `/api/v1/${randomItem(sources)}/${faker.number.int({ min: 1, max: 100 })}`,
            },
            responseData: {
              status: randomItem([400, 401, 403, 500]),
              message: 'Internal Server Error',
            },
            capturedAt: createdAt,
          })),
        },

        comments: {
          create: Array.from({
            length: faker.number.int({ min: 0, max: 4 }),
          }).map((_, ci) => {
            const commentAuthor = randomItem(users);
            const isAdopted =
              isSolved &&
              ci === 0 &&
              faker.datatype.boolean({ probability: 0.5 });
            return {
              userId: commentAuthor.id,
              content: randomItem(commentContents),
              isAdopted,
              rewardScore: isAdopted
                ? faker.number.int({ min: 10, max: 50 })
                : null,
              createdAt: faker.date.between({
                from: createdAt,
                to: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
              }),
            };
          }),
        },
      },
    });

    if ((i + 1) % 10 === 0 || i === ISSUE_COUNT - 1) {
      console.log(`  ✅ ${i + 1} / ${ISSUE_COUNT} issues created`);
    }

    if (isSolved) {
      const rewardMember = randomItem(teamMembers);
      await prisma.scoreLog.create({
        data: {
          teamMemberId: rewardMember.id,
          amount: faker.number.int({ min: 10, max: 50 }),
          reason: `이슈 해결 기여`,
          issueId: issue.id,
          createdAt,
        },
      });
    }
  }

  // 5. 알림 샘플 생성
  console.log('\n🔔 Creating sample notifications...');
  await Promise.all(
    users.slice(0, 3).map((user) =>
      prisma.notification.create({
        data: {
          userId: user.id,
          type: randomItem(['ISSUE_COMMENT', 'ISSUE_SOLVED', 'TEAM_INVITE']),
          content: randomItem(commentContents),
          isRead: faker.datatype.boolean(),
        },
      }),
    ),
  );
  console.log('  ✅ Notifications created\n');

  // ─── 요약 ────────────────────────────────────────────────────────────────
  const [issueCount, commentCount, logCount, scoreLogCount] = await Promise.all(
    [
      prisma.errorIssue.count(),
      prisma.comment.count(),
      prisma.errorLog.count(),
      prisma.scoreLog.count(),
    ],
  );

  console.log('─'.repeat(40));
  console.log('🎉 Seed complete!');
  console.log(`  • Users        : ${users.length}`);
  console.log(`  • Team members : ${teamMembers.length}`);
  console.log(`  • Issues       : ${issueCount}`);
  console.log(`  • Comments     : ${commentCount}`);
  console.log(`  • Error logs   : ${logCount}`);
  console.log(`  • Score logs   : ${scoreLogCount}`);
  console.log('─'.repeat(40));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
