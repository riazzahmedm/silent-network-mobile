import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'silent-network.access-token';

export async function getStoredAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function setStoredAccessToken(token: string) {
  return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function clearStoredAccessToken() {
  return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
