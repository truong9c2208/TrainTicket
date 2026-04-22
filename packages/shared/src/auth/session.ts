export const ACCESS_TOKEN_KEY = 'accessToken';

export type AuthSession = {
  accessToken: string;
  userId: string;
};

export function toAuthSession(data: { accessToken: string; user: { id: string } }): AuthSession {
  return {
    accessToken: data.accessToken,
    userId: data.user.id,
  };
}
