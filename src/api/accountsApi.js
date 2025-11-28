import { baseApi } from './baseApi';

export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Accounts
    getAccounts: builder.query({
      query: () => '/accounts',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Accounts', id })),
              { type: 'Accounts', id: 'LIST' },
            ]
          : [{ type: 'Accounts', id: 'LIST' }],
    }),
    
    // Create Account
    createAccount: builder.mutation({
      query: (accountData) => ({
        url: '/accounts',
        method: 'POST',
        body: accountData,
      }),
      invalidatesTags: [{ type: 'Accounts', id: 'LIST' }],
    }),
    
    // Get Account by ID
    getAccountById: builder.query({
      query: (accountId) => `/accounts/${accountId}`,
      providesTags: (result, error, accountId) => [{ type: 'Accounts', id: accountId }],
    }),
    
    // Get Account Balance
    getAccountBalance: builder.query({
      query: (accountId) => `/accounts/${accountId}/balance`,
      providesTags: (result, error, accountId) => [{ type: 'Accounts', id: accountId }],
    }),
    
    // Get Total Balance
    getTotalBalance: builder.query({
      query: () => '/accounts/total-balance',
      providesTags: ['Accounts'],
    }),
    
    // Block Account
    blockAccount: builder.mutation({
      query: (accountId) => ({
        url: `/accounts/${accountId}/block`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, accountId) => [
        { type: 'Accounts', id: accountId },
        { type: 'Accounts', id: 'LIST' },
      ],
    }),
    
    // Unblock Account
    unblockAccount: builder.mutation({
      query: (accountId) => ({
        url: `/accounts/${accountId}/unblock`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, accountId) => [
        { type: 'Accounts', id: accountId },
        { type: 'Accounts', id: 'LIST' },
      ],
    }),
    
    // Get Account Transactions
    getAccountTransactions: builder.query({
      query: ({ accountId, page = 1, limit = 20 }) =>
        `/accounts/${accountId}/transactions?page=${page}&limit=${limit}`,
      providesTags: (result, error, { accountId }) => [
        { type: 'Transactions', id: `account-${accountId}` },
      ],
    }),
    
    // Close Account
    closeAccount: builder.mutation({
      query: (accountId) => ({
        url: `/accounts/${accountId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Accounts', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useGetAccountByIdQuery,
  useGetAccountBalanceQuery,
  useGetTotalBalanceQuery,
  useBlockAccountMutation,
  useUnblockAccountMutation,
  useGetAccountTransactionsQuery,
  useCloseAccountMutation,
} = accountsApi;
