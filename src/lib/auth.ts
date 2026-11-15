import { account, OAuthProvider } from './appwrite';
import { type Models } from 'appwrite';

export type UserType = Models.User<Models.Preferences> | null;

/** Create a short-lived Appwrite JWT for protected same-origin API calls. */
export async function getApiAuthHeaders(): Promise<Record<string, string>> {
  const { jwt } = await account.createJWT();
  return { Authorization: `Bearer ${jwt}` };
}

/**
 * Initiates Google OAuth2 login flow with Appwrite
 */
export async function signInWithGoogle(redirectPath: string = window.location.pathname): Promise<void> {
  const origin = window.location.origin;
  const successUrl = `${origin}${redirectPath}?auth=success`;
  const failureUrl = `${origin}${redirectPath}?auth=error`;

  try {
    account.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl);
  } catch (error) {
    console.error('[Auth] Failed to initialize Google OAuth:', error);
    throw error;
  }
}

/**
 * Gets currently logged-in user profile
 */
export async function getCurrentUser(): Promise<UserType> {
  try {
    return await account.get();
  } catch {
    // No active session is a normal state for guest visitors
    return null;
  }
}

/**
 * Logs out currently authenticated user
 */
export async function signOut(): Promise<void> {
  try {
    await account.deleteSession('current');
  } catch (error) {
    console.error('[Auth] Logout failed:', error);
    throw error;
  }
}

