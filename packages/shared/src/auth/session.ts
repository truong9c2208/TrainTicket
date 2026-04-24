export const ACCESS_TOKEN_KEY = 'accessToken';

export type AuthSession = {
  accessToken: string;
  userId: number;
};

export function toAuthSession(data: { accessToken: string; user: { id: number } }): AuthSession {
  return {
    accessToken: data.accessToken,
    userId: data.user.id,
  };
}
