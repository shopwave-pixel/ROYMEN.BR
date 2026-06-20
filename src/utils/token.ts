const TOKEN_KEY = 'royal_token';

/**
 * Retrieves the stored JWT token from localStorage.
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Saves the JWT token to localStorage.
 * @param token The JWT token to store.
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Removes the stored JWT token from localStorage.
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};
