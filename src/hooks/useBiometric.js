import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBiometricEnabled, selectBiometricEnabled } from '../store/slices/authSlice';
import { biometricService } from '../services/biometricService';

export const useBiometric = () => {
  const dispatch = useDispatch();
  const isEnabled = useSelector(selectBiometricEnabled);
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize biometric state
  useEffect(() => {
    const init = async () => {
      try {
        const available = await biometricService.isAvailable();
        setIsAvailable(available);
        
        if (available) {
          const typeName = await biometricService.getBiometricTypeName();
          setBiometricType(typeName);
        }
        
        const enabled = await biometricService.isEnabled();
        dispatch(setBiometricEnabled(enabled));
      } catch (error) {
        console.error('Biometric init error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, [dispatch]);

  // Authenticate with biometrics
  const authenticate = useCallback(async (promptMessage) => {
    if (!isAvailable) {
      return { success: false, error: 'Биометрия недоступна' };
    }
    
    return biometricService.authenticate(promptMessage);
  }, [isAvailable]);

  // Enable biometric
  const enable = useCallback(async (pin) => {
    const result = await biometricService.enable(pin);
    if (result.success) {
      dispatch(setBiometricEnabled(true));
    }
    return result;
  }, [dispatch]);

  // Quick enable (for initial setup)
  const quickEnable = useCallback(async () => {
    const result = await biometricService.quickEnable();
    if (result.success) {
      dispatch(setBiometricEnabled(true));
    }
    return result;
  }, [dispatch]);

  // Disable biometric
  const disable = useCallback(async () => {
    const result = await biometricService.disable();
    if (result.success) {
      dispatch(setBiometricEnabled(false));
    }
    return result;
  }, [dispatch]);

  return {
    isAvailable,
    isEnabled,
    isLoading,
    biometricType,
    authenticate,
    enable,
    quickEnable,
    disable,
  };
};

export default useBiometric;
