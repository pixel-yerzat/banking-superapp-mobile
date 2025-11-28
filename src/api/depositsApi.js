import { baseApi } from './baseApi';

export const depositsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Calculate Deposit
    calculateDeposit: builder.mutation({
      query: ({ principalAmount, interestRate, termMonths, depositType }) => ({
        url: '/deposits/calculate',
        method: 'POST',
        body: {
          principal_amount: principalAmount,
          interest_rate: interestRate,
          term_months: termMonths,
          deposit_type: depositType,
        },
      }),
    }),
    
    // Open Deposit
    openDeposit: builder.mutation({
      query: (depositData) => ({
        url: '/deposits',
        method: 'POST',
        body: {
          account_id: depositData.accountId,
          deposit_type: depositData.depositType,
          principal_amount: depositData.principalAmount,
          interest_rate: depositData.interestRate,
          term_months: depositData.termMonths,
          is_auto_renewal: depositData.isAutoRenewal,
        },
      }),
      invalidatesTags: [{ type: 'Deposits', id: 'LIST' }, 'Accounts'],
    }),
    
    // Get All Deposits
    getDeposits: builder.query({
      query: () => '/deposits',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Deposits', id })),
              { type: 'Deposits', id: 'LIST' },
            ]
          : [{ type: 'Deposits', id: 'LIST' }],
    }),
    
    // Get Deposit by ID
    getDepositById: builder.query({
      query: (depositId) => `/deposits/${depositId}`,
      providesTags: (result, error, depositId) => [{ type: 'Deposits', id: depositId }],
    }),
    
    // Close Deposit
    closeDeposit: builder.mutation({
      query: ({ depositId, isEarly }) => ({
        url: `/deposits/${depositId}/close`,
        method: 'POST',
        body: { is_early: isEarly },
      }),
      invalidatesTags: (result, error, { depositId }) => [
        { type: 'Deposits', id: depositId },
        { type: 'Deposits', id: 'LIST' },
        'Accounts',
      ],
    }),
    
    // Toggle Auto Renewal
    toggleAutoRenewal: builder.mutation({
      query: ({ depositId, enabled }) => ({
        url: `/deposits/${depositId}/auto-renewal`,
        method: 'PATCH',
        body: { enabled },
      }),
      invalidatesTags: (result, error, { depositId }) => [
        { type: 'Deposits', id: depositId },
      ],
    }),
    
    // Get Deposit Stats
    getDepositStats: builder.query({
      query: () => '/deposits/stats',
      providesTags: ['Deposits'],
    }),
    
    // Get Interest History
    getInterestHistory: builder.query({
      query: (depositId) => `/deposits/${depositId}/interest-history`,
      providesTags: (result, error, depositId) => [{ type: 'Deposits', id: depositId }],
    }),
  }),
});

export const {
  useCalculateDepositMutation,
  useOpenDepositMutation,
  useGetDepositsQuery,
  useGetDepositByIdQuery,
  useCloseDepositMutation,
  useToggleAutoRenewalMutation,
  useGetDepositStatsQuery,
  useGetInterestHistoryQuery,
} = depositsApi;
