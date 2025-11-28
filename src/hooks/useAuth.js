import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setUser,
  setLoading,
  logout as logoutAction,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  setBiometricEnabled,
} from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { biometricService } from '../services/biometricService';
import { useLoginMutation, useLogoutMutation, useGetCurrentUserQuery } from '../api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();

  // Initialize auth state on app start
  const initialize = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      
      const token = await authService.getAccessToken();
      if (token) {
        const userData = await authService.getUserData();
        if (userData) {
          dispatch(setUser(userData));
        }
      }
      
      // Check biometric status
      const biometricEnabled = await biometricService.isEnabled();
      dispatch(setBiometricEnabled(biometricEnabled));
      
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Login
  const login = useCallback(
    async (phone, password, rememberMe = false) => {
      try {
        const result = await loginMutation({ phone, password }).unwrap();
        
        if (result.success) {
          const { user: userData, accessToken, refreshToken, requires2FA } = result.data;
          
          if (requires2FA) {
            return { success: false, requires2FA: true, userId: userData.id };
          }
          
          await authService.saveTokens(accessToken, refreshToken);
          await authService.saveUserData(userData);
          
          if (rememberMe) {
            await authService.saveRememberMe(phone);
          } else {
            await authService.clearRememberMe();
          }
          
          dispatch(setUser(userData));
          return { success: true };
        }
        
        return { success: false, error: result.message };
      } catch (error) {
        console.error('Login error:', error);
        return { 
          success: false, 
          error: error.data?.message || 'Ошибка входа' 
        };
      }
    },
    [dispatch, loginMutation]
  );

  // Login with biometrics
  const loginWithBiometric = useCallback(async () => {
    try {
      const biometricResult = await biometricService.authenticate('Войдите в приложение');
      
      if (!biometricResult.success) {
        return { success: false, error: biometricResult.error };
      }
      
      // Check if we have stored credentials
      const token = await authService.getAccessToken();
      if (token) {
        const userData = await authService.getUserData();
        if (userData) {
          dispatch(setUser(userData));
          return { success: true };
        }
      }
      
      return { success: false, error: 'Нет сохраненных данных' };
    } catch (error) {
      console.error('Biometric login error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Logout
  const logout = useCallback(async () => {
    try {
      const refreshToken = await authService.getRefreshToken();
      if (refreshToken) {
        await logoutMutation(refreshToken).unwrap();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await authService.logout();
      dispatch(logoutAction());
    }
  }, [dispatch, logoutMutation]);

  // Get saved phone for "Remember Me"
  const getSavedPhone = useCallback(async () => {
    return authService.getSavedPhone();
  }, []);

  // Check if biometric is available
  const checkBiometric = useCallback(async () => {
    const isAvailable = await biometricService.isAvailable();
    const isEnabled = await biometricService.isEnabled();
    return { isAvailable, isEnabled };
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isLoginLoading || isLogoutLoading,
    initialize,
    login,
    loginWithBiometric,
    logout,
    getSavedPhone,
    checkBiometric,
  };
};

export default useAuth;
