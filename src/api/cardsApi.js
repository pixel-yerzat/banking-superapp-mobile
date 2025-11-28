import { baseApi } from './baseApi';

export const cardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Cards
    getCards: builder.query({
      query: () => '/cards',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Cards', id })),
              { type: 'Cards', id: 'LIST' },
            ]
          : [{ type: 'Cards', id: 'LIST' }],
    }),
    
    // Create Card
    createCard: builder.mutation({
      query: (cardData) => ({
        url: '/cards',
        method: 'POST',
        body: cardData,
      }),
      invalidatesTags: [{ type: 'Cards', id: 'LIST' }],
    }),
    
    // Get Card by ID
    getCardById: builder.query({
      query: (cardId) => `/cards/${cardId}`,
      providesTags: (result, error, cardId) => [{ type: 'Cards', id: cardId }],
    }),
    
    // Block Card
    blockCard: builder.mutation({
      query: ({ cardId, reason }) => ({
        url: `/cards/${cardId}/block`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { cardId }) => [
        { type: 'Cards', id: cardId },
        { type: 'Cards', id: 'LIST' },
      ],
    }),
    
    // Unblock Card
    unblockCard: builder.mutation({
      query: (cardId) => ({
        url: `/cards/${cardId}/unblock`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, cardId) => [
        { type: 'Cards', id: cardId },
        { type: 'Cards', id: 'LIST' },
      ],
    }),
    
    // Report Card Lost
    reportCardLost: builder.mutation({
      query: (cardId) => ({
        url: `/cards/${cardId}/report-lost`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, cardId) => [
        { type: 'Cards', id: cardId },
        { type: 'Cards', id: 'LIST' },
      ],
    }),
    
    // Update Card Limits
    updateCardLimits: builder.mutation({
      query: ({ cardId, dailyLimit, monthlyLimit }) => ({
        url: `/cards/${cardId}/limits`,
        method: 'PATCH',
        body: { daily_limit: dailyLimit, monthly_limit: monthlyLimit },
      }),
      invalidatesTags: (result, error, { cardId }) => [{ type: 'Cards', id: cardId }],
    }),
    
    // Toggle Contactless Payments
    toggleContactless: builder.mutation({
      query: ({ cardId, enabled }) => ({
        url: `/cards/${cardId}/contactless`,
        method: 'PATCH',
        body: { enabled },
      }),
      invalidatesTags: (result, error, { cardId }) => [{ type: 'Cards', id: cardId }],
    }),
    
    // Toggle Online Payments
    toggleOnlinePayments: builder.mutation({
      query: ({ cardId, enabled }) => ({
        url: `/cards/${cardId}/online-payments`,
        method: 'PATCH',
        body: { enabled },
      }),
      invalidatesTags: (result, error, { cardId }) => [{ type: 'Cards', id: cardId }],
    }),
    
    // Get Card CVV (requires biometric)
    getCardCvv: builder.query({
      query: (cardId) => `/cards/${cardId}/cvv`,
    }),
    
    // Get Card Full Number (requires biometric)
    getCardFullNumber: builder.query({
      query: (cardId) => `/cards/${cardId}/full-number`,
    }),
  }),
});

export const {
  useGetCardsQuery,
  useCreateCardMutation,
  useGetCardByIdQuery,
  useBlockCardMutation,
  useUnblockCardMutation,
  useReportCardLostMutation,
  useUpdateCardLimitsMutation,
  useToggleContactlessMutation,
  useToggleOnlinePaymentsMutation,
  useLazyGetCardCvvQuery,
  useLazyGetCardFullNumberQuery,
} = cardsApi;
