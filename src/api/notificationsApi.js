import { baseApi } from './baseApi';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Notifications
    getNotifications: builder.query({
      query: ({ limit = 50, offset = 0 } = {}) =>
        `/notifications?limit=${limit}&offset=${offset}`,
      providesTags: ['Notifications'],
    }),
    
    // Get Unread Notifications
    getUnreadNotifications: builder.query({
      query: () => '/notifications/unread',
      providesTags: ['Notifications'],
    }),
    
    // Mark as Read
    markAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    
    // Mark All as Read
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    
    // Delete Notification
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
    
    // Get Notification Settings
    getNotificationSettings: builder.query({
      query: () => '/notifications/settings',
      providesTags: ['Notifications'],
    }),
    
    // Update Notification Settings
    updateNotificationSettings: builder.mutation({
      query: (settings) => ({
        url: '/notifications/settings',
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: ['Notifications'],
    }),
    
    // Get Notification Stats
    getNotificationStats: builder.query({
      query: () => '/notifications/stats',
      providesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useGetNotificationStatsQuery,
} = notificationsApi;
