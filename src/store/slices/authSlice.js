import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  requires2FA: false,
  pendingUserId: null,
  biometricEnabled: false,
  pinEnabled: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setRequires2FA: (state, action) => {
      state.requires2FA = action.payload.requires2FA;
      state.pendingUserId = action.payload.userId;
    },
    clear2FA: (state) => {
      state.requires2FA = false;
      state.pendingUserId = null;
    },
    setBiometricEnabled: (state, action) => {
      state.biometricEnabled = action.payload;
    },
    setPinEnabled: (state, action) => {
      state.pinEnabled = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.requires2FA = false;
      state.pendingUserId = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const {
  setUser,
  setLoading,
  setRequires2FA,
  clear2FA,
  setBiometricEnabled,
  setPinEnabled,
  logout,
  updateUserProfile,
} = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectRequires2FA = (state) => state.auth.requires2FA;
export const selectPendingUserId = (state) => state.auth.pendingUserId;
export const selectBiometricEnabled = (state) => state.auth.biometricEnabled;
export const selectPinEnabled = (state) => state.auth.pinEnabled;

export default authSlice.reducer;
