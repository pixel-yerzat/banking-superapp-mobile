import { baseApi } from './baseApi';

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send Message
    sendMessage: builder.mutation({
      query: (message) => ({
        url: '/chat/message',
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: ['Chat'],
    }),
    
    // Get Chat History
    getChatHistory: builder.query({
      query: ({ limit = 50 } = {}) => `/chat/history?limit=${limit}`,
      providesTags: ['Chat'],
    }),
    
    // Clear Chat History
    clearChatHistory: builder.mutation({
      query: () => ({
        url: '/chat/history',
        method: 'DELETE',
      }),
      invalidatesTags: ['Chat'],
    }),
    
    // Get FAQ
    getFaq: builder.query({
      query: ({ category } = {}) =>
        category ? `/chat/faq?category=${category}` : '/chat/faq',
      providesTags: ['Chat'],
    }),
    
    // Search FAQ
    searchFaq: builder.query({
      query: (query) => `/chat/faq/search?q=${query}`,
    }),
    
    // Get Chat Stats
    getChatStats: builder.query({
      query: () => '/chat/stats',
      providesTags: ['Chat'],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetChatHistoryQuery,
  useClearChatHistoryMutation,
  useGetFaqQuery,
  useSearchFaqQuery,
  useLazySearchFaqQuery,
  useGetChatStatsQuery,
} = chatApi;
