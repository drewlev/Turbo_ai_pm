export interface SlackOAuthResponse {
  ok: boolean;
  app_id: string;
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
  scope: string;
  token_type: string;
  access_token: string;
  bot_user_id: string;
  team: {
    id: string;
    name: string;
  };
  enterprise: null | any;
  is_enterprise_install: boolean;
}

export interface SlackInstall {
  teamId: string;
  teamName: string;
  botToken: string;
  installerUserId: string;
}

export interface SlackBotInstallation {
  slackTeamId: string;
  teamName: string;
  botToken: string;
  installerUserId: string;
  team?: number | null;
}

export interface SlackApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
