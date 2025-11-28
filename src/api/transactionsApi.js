import { baseApi } from './baseApi';

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Transactions
    getTransactions: builder.query({
      query: ({ page = 1, limit = 20 }) =>
        `/transactions?page=${page}&limit=${limit}`,
      providesTags: ['Transactions'],
    }),
    
    // Get Transaction by ID
    getTransactionById: builder.query({
      query: (transactionId) => `/transactions/${transactionId}`,
      providesTags: (result, error, transactionId) => [
        { type: 'Transactions', id: transactionId },
      ],
    }),
    
    // Transfer by Phone
    transferByPhone: builder.mutation({
      query: ({ fromAccountId, toPhone, amount, description }) => ({
        url: '/transactions/transfer/phone',
        method: 'POST',
        body: {
          from_account_id: fromAccountId,
          to_phone: toPhone,
          amount,
          description,
        },
      }),
      invalidatesTags: ['Transactions', 'Accounts'],
    }),
    
    // Transfer by Account Number
    transferByAccount: builder.mutation({
      query: ({ fromAccountId, toAccountNumber, amount, description }) => ({
        url: '/transactions/transfer/account',
        method: 'POST',
        body: {
          from_account_id: fromAccountId,
          to_account_number: toAccountNumber,
          amount,
          description,
        },
      }),
      invalidatesTags: ['Transactions', 'Accounts'],
    }),
    
    // Get Transaction Stats
    getTransactionStats: builder.query({
      query: ({ startDate, endDate }) =>
        `/transactions/stats?start_date=${startDate}&end_date=${endDate}`,
      providesTags: ['Transactions'],
    }),
    
    // Cancel Transaction
    cancelTransaction: builder.mutation({
      query: (transactionId) => ({
        url: `/transactions/${transactionId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, transactionId) => [
        { type: 'Transactions', id: transactionId },
        'Transactions',
        'Accounts',
      ],
    }),
    
    // Get Recent Recipients
    getRecentRecipients: builder.query({
      query: ({ limit = 10 }) => `/transactions/recipients?limit=${limit}`,
    }),
    
    // Search Transactions
    searchTransactions: builder.query({
      query: ({ query, page = 1, limit = 20 }) =>
        `/transactions/search?q=${query}&page=${page}&limit=${limit}`,
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useTransferByPhoneMutation,
  useTransferByAccountMutation,
  useGetTransactionStatsQuery,
  useCancelTransactionMutation,
  useGetRecentRecipientsQuery,
  useSearchTransactionsQuery,
} = transactionsApi;
