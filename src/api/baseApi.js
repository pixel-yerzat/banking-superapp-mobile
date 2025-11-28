import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

// Base query with token injection
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    // Get token from SecureStore
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    
    headers.set('Content-Type', 'application/json');
    
    // Get device ID
    try {
      const deviceId = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_ID);
      if (deviceId) {
        headers.set('X-Device-ID', deviceId);
      }
    } catch (error) {
      console.error('Error getting device ID:', error);
    }
    
    headers.set('X-App-Version', '1.0.0');
    
    return headers;
  },
});

// Base query with automatic token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (refreshToken) {
        const refreshResult = await baseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions
        );
        
        if (refreshResult.data) {
          // Store new tokens
          await SecureStore.setItemAsync(
            STORAGE_KEYS.ACCESS_TOKEN,
            refreshResult.data.data.accessToken
          );
          await SecureStore.setItemAsync(
            STORAGE_KEYS.REFRESH_TOKEN,
            refreshResult.data.data.refreshToken
          );
          
          // Retry the original request
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed, logout user
          api.dispatch({ type: 'auth/logout' });
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      api.dispatch({ type: 'auth/logout' });
    }
  }
  
  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Accounts',
    'Cards',
    'Transactions',
    'Templates',
    'Providers',
    'Loans',
    'Deposits',
    'Notifications',
    'Chat',
    'Analytics',
  ],
  endpoints: () => ({}),
});

export default baseApi;
