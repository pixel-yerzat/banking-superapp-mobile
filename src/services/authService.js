import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants';

class AuthService {
  // Save tokens
  async saveTokens(accessToken, refreshToken) {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      return true;
    } catch (error) {
      console.error('Error saving tokens:', error);
      return false;
    }
  }

  // Get access token
  async getAccessToken() {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Get refresh token
  async getRefreshToken() {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Clear tokens
  async clearTokens() {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      return true;
    } catch (error) {
      console.error('Error clearing tokens:', error);
      return false;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getAccessToken();
    return !!token;
  }

  // Save user data
  async saveUserData(userData) {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData)
      );
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  // Get user data
  async getUserData() {
    try {
      const data = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Clear user data
  async clearUserData() {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  // Save "Remember Me" phone
  async saveRememberMe(phone) {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.REMEMBER_ME, 'true');
      await SecureStore.setItemAsync(STORAGE_KEYS.SAVED_PHONE, phone);
      return true;
    } catch (error) {
      console.error('Error saving remember me:', error);
      return false;
    }
  }

  // Get saved phone
  async getSavedPhone() {
    try {
      const rememberMe = await SecureStore.getItemAsync(STORAGE_KEYS.REMEMBER_ME);
      if (rememberMe === 'true') {
        return await SecureStore.getItemAsync(STORAGE_KEYS.SAVED_PHONE);
      }
      return null;
    } catch (error) {
      console.error('Error getting saved phone:', error);
      return null;
    }
  }

  // Clear "Remember Me"
  async clearRememberMe() {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REMEMBER_ME);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.SAVED_PHONE);
      return true;
    } catch (error) {
      console.error('Error clearing remember me:', error);
      return false;
    }
  }

  // Logout - clear all auth data
  async logout() {
    await this.clearTokens();
    await this.clearUserData();
  }

  // Generate device ID
  async getOrCreateDeviceId() {
    try {
      let deviceId = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error with device ID:', error);
      return null;
    }
  }

  // Check onboarding status
  async isOnboardingCompleted() {
    try {
      const completed = await SecureStore.getItemAsync(
        STORAGE_KEYS.ONBOARDING_COMPLETED
      );
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding:', error);
      return false;
    }
  }

  // Set onboarding completed
  async setOnboardingCompleted() {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      return true;
    } catch (error) {
      console.error('Error setting onboarding:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
