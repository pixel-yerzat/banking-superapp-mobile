import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Register
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    // Verify 2FA
    verify2FA: builder.mutation({
      query: ({ userId, code }) => ({
        url: '/auth/verify-2fa',
        method: 'POST',
        body: { userId, code },
      }),
      invalidatesTags: ['User'],
    }),
    
    // Refresh Token
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    
    // Logout
    logout: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/logout',
        method: 'POST',
        body: { refreshToken },
      }),
      invalidatesTags: ['User'],
    }),
    
    // Get Current User
    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    
    // Update Profile
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/auth/me',
        method: 'PATCH',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Send OTP
    sendOtp: builder.mutation({
      query: ({ phone, type }) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body: { phone, type },
      }),
    }),
    
    // Verify OTP
    verifyOtp: builder.mutation({
      query: ({ phone, code }) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: { phone, code },
      }),
    }),
    
    // Forgot Password
    forgotPassword: builder.mutation({
      query: ({ phone }) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { phone },
      }),
    }),
    
    // Reset Password
    resetPassword: builder.mutation({
      query: ({ phone, otp, newPassword, confirmPassword }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: { phone, otp, newPassword, confirmPassword },
      }),
    }),
    
    // Change Password
    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword, confirmPassword }) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: { currentPassword, newPassword, confirmPassword },
      }),
    }),
    
    // Enable 2FA
    enable2FA: builder.mutation({
      query: () => ({
        url: '/auth/2fa/enable',
        method: 'POST',
      }),
    }),
    
    // Disable 2FA
    disable2FA: builder.mutation({
      query: ({ code }) => ({
        url: '/auth/2fa/disable',
        method: 'POST',
        body: { code },
      }),
    }),
    
    // Get Active Sessions
    getActiveSessions: builder.query({
      query: () => '/auth/sessions',
    }),
    
    // Terminate Session
    terminateSession: builder.mutation({
      query: (sessionId) => ({
        url: `/auth/sessions/${sessionId}`,
        method: 'DELETE',
      }),
    }),
    
    // Terminate All Sessions
    terminateAllSessions: builder.mutation({
      query: () => ({
        url: '/auth/sessions',
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerify2FAMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useEnable2FAMutation,
  useDisable2FAMutation,
  useGetActiveSessionsQuery,
  useTerminateSessionMutation,
  useTerminateAllSessionsMutation,
} = authApi;
