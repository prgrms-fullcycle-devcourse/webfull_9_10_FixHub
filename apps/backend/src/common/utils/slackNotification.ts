import axios from 'axios';

import prisma from '../config/prisma.js';

type SlackNotificationFlag =
  | 'slackNotifyIssueCreated'
  | 'slackNotifyCommentOnMyIssue'
  | 'slackNotifyReplyOnMyComment'
  | 'slackNotifyCommentAdopted';

type SendSlackNotificationToTeamMemberParams = {
  teamId: string;
  userId: string;
  enabledField: SlackNotificationFlag;
  text: string;
};

type SendSlackNotificationToTeamParams = {
  teamId: string;
  excludeUserId?: string;
  enabledField: SlackNotificationFlag;
  text: string;
};

type SlackNotificationSettings = Record<SlackNotificationFlag, boolean>;

function isSlackNotificationEnabled(
  settings: SlackNotificationSettings,
  enabledField: SlackNotificationFlag,
) {
  return settings[enabledField];
}

async function postSlackWebhook(webhookUrl: string, text: string) {
  try {
    await axios.post(
      webhookUrl,
      {
        text,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error(
      'postSlackWebhook() - Slack 알림 전송에 실패했습니다.',
      error,
    );
  }
}

export async function sendSlackNotificationToTeamMember({
  teamId,
  userId,
  enabledField,
  text,
}: SendSlackNotificationToTeamMemberParams) {
  const teamMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
    select: {
      slackWebhookUrl: true,
      slackNotifyIssueCreated: true,
      slackNotifyCommentOnMyIssue: true,
      slackNotifyReplyOnMyComment: true,
      slackNotifyCommentAdopted: true,
    },
  });

  if (
    !teamMember?.slackWebhookUrl ||
    !isSlackNotificationEnabled(teamMember, enabledField)
  ) {
    return;
  }

  await postSlackWebhook(teamMember.slackWebhookUrl, text);
}

export async function sendSlackNotificationToTeam({
  teamId,
  excludeUserId,
  enabledField,
  text,
}: SendSlackNotificationToTeamParams) {
  const teamMembers = await prisma.teamMember.findMany({
    where: {
      teamId,
      status: 'ACTIVE',
      ...(excludeUserId && {
        userId: {
          not: excludeUserId,
        },
      }),
      slackWebhookUrl: {
        not: null,
      },
    },
    select: {
      slackWebhookUrl: true,
      slackNotifyIssueCreated: true,
      slackNotifyCommentOnMyIssue: true,
      slackNotifyReplyOnMyComment: true,
      slackNotifyCommentAdopted: true,
    },
  });

  await Promise.all(
    teamMembers.map((teamMember) =>
      teamMember.slackWebhookUrl &&
      isSlackNotificationEnabled(teamMember, enabledField)
        ? postSlackWebhook(teamMember.slackWebhookUrl, text)
        : Promise.resolve(),
    ),
  );
}
