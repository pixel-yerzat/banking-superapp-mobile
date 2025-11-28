import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants';

class BiometricService {
  // Check if biometric hardware is available
  async isAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  // Get available authentication types
  async getAvailableTypes() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types;
    } catch (error) {
      console.error('Error getting auth types:', error);
      return [];
    }
  }

  // Get biometric type name
  async getBiometricTypeName() {
    const types = await this.getAvailableTypes();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometric';
  }

  // Authenticate with biometrics
  async authenticate(promptMessage = 'Подтвердите вашу личность') {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return { success: false, error: 'Биометрия недоступна' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Отмена',
        fallbackLabel: 'Использовать пароль',
        disableDeviceFallback: false,
      });

      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if biometric is enabled for the app
  async isEnabled() {
    try {
      const enabled = await SecureStore.getItemAsync(
        STORAGE_KEYS.BIOMETRIC_ENABLED
      );
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled:', error);
      return false;
    }
  }

  // Enable biometric authentication (requires PIN verification)
  async enable(pin) {
    try {
      // First verify PIN
      const savedPin = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_CODE);
      if (savedPin !== pin) {
        return { success: false, error: 'Неверный PIN-код' };
      }

      // Authenticate with biometric
      const authResult = await this.authenticate(
        'Подтвердите для включения биометрии'
      );
      if (!authResult.success) {
        return authResult;
      }

      // Enable biometric
      await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      return { success: true };
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return { success: false, error: error.message };
    }
  }

  // Disable biometric authentication
  async disable() {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return { success: true };
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return { success: false, error: error.message };
    }
  }

  // Quick enable (without PIN, for setup flow)
  async quickEnable() {
    try {
      const authResult = await this.authenticate(
        'Подтвердите для включения биометрии'
      );
      if (!authResult.success) {
        return authResult;
      }

      await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      return { success: true };
    } catch (error) {
      console.error('Error quick enabling biometric:', error);
      return { success: false, error: error.message };
    }
  }
}

export const biometricService = new BiometricService();
export default biometricService;
