import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  language: 'ru',
  currency: 'KZT',
  showBalance: true,
  unreadNotifications: 0,
  isOnboardingCompleted: false,
  snackbar: {
    visible: false,
    message: '',
    type: 'info', // 'success' | 'error' | 'warning' | 'info'
  },
  bottomSheetVisible: false,
  bottomSheetContent: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    toggleShowBalance: (state) => {
      state.showBalance = !state.showBalance;
    },
    setShowBalance: (state, action) => {
      state.showBalance = action.payload;
    },
    setUnreadNotifications: (state, action) => {
      state.unreadNotifications = action.payload;
    },
    incrementUnreadNotifications: (state) => {
      state.unreadNotifications += 1;
    },
    decrementUnreadNotifications: (state) => {
      if (state.unreadNotifications > 0) {
        state.unreadNotifications -= 1;
      }
    },
    setOnboardingCompleted: (state, action) => {
      state.isOnboardingCompleted = action.payload;
    },
    showSnackbar: (state, action) => {
      state.snackbar = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.visible = false;
    },
    showBottomSheet: (state, action) => {
      state.bottomSheetVisible = true;
      state.bottomSheetContent = action.payload;
    },
    hideBottomSheet: (state) => {
      state.bottomSheetVisible = false;
      state.bottomSheetContent = null;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setCurrency,
  toggleShowBalance,
  setShowBalance,
  setUnreadNotifications,
  incrementUnreadNotifications,
  decrementUnreadNotifications,
  setOnboardingCompleted,
  showSnackbar,
  hideSnackbar,
  showBottomSheet,
  hideBottomSheet,
} = uiSlice.actions;

export const selectTheme = (state) => state.ui.theme;
export const selectLanguage = (state) => state.ui.language;
export const selectCurrency = (state) => state.ui.currency;
export const selectShowBalance = (state) => state.ui.showBalance;
export const selectUnreadNotifications = (state) => state.ui.unreadNotifications;
export const selectIsOnboardingCompleted = (state) => state.ui.isOnboardingCompleted;
export const selectSnackbar = (state) => state.ui.snackbar;
export const selectBottomSheet = (state) => ({
  visible: state.ui.bottomSheetVisible,
  content: state.ui.bottomSheetContent,
});

export default uiSlice.reducer;
