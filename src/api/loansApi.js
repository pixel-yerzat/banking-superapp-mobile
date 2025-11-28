import { baseApi } from "./baseApi";

export const loansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Calculate Loan
    calculateLoan: builder.mutation({
      query: ({ principalAmount, interestRate, termMonths }) => ({
        url: "/loans/calculate",
        method: "POST",
        body: {
          principal_amount: principalAmount,
          interest_rate: interestRate,
          term_months: termMonths,
        },
      }),
    }),

    // Create Loan Application
    createLoan: builder.mutation({
      query: (loanData) => ({
        url: "/loans",
        method: "POST",
        body: {
          loan_type: loanData.loanType,
          principal_amount: loanData.principalAmount,
          interest_rate: loanData.interestRate,
          term_months: loanData.termMonths,
        },
      }),
      invalidatesTags: [{ type: "Loans", id: "LIST" }],
    }),

    // Get All Loans
    getLoans: builder.query({
      query: () => "/loans",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Loans", id })),
              { type: "Loans", id: "LIST" },
            ]
          : [{ type: "Loans", id: "LIST" }],
    }),

    // Get Loan by ID
    getLoanById: builder.query({
      query: (loanId) => `/loans/${loanId}`,
      providesTags: (result, error, loanId) => [{ type: "Loans", id: loanId }],
    }),

    // Get Loan Schedule
    getLoanSchedule: builder.query({
      query: (loanId) => `/loans/${loanId}/schedule`,
      providesTags: (result, error, loanId) => [{ type: "Loans", id: loanId }],
    }),

    // Get Loan Payment Schedule (alias for getLoanSchedule)
    getLoanPaymentSchedule: builder.query({
      query: (loanId) => `/loans/${loanId}/schedule`,
      providesTags: (result, error, loanId) => [{ type: "Loans", id: loanId }],
    }),

    // Pay Loan
    payLoan: builder.mutation({
      query: ({ loanId, accountId, amount }) => ({
        url: `/loans/${loanId}/pay`,
        method: "POST",
        body: { account_id: accountId, amount },
      }),
      invalidatesTags: (result, error, { loanId }) => [
        { type: "Loans", id: loanId },
        "Accounts",
        "Transactions",
      ],
    }),

    // Early Repayment
    earlyRepayLoan: builder.mutation({
      query: ({ loanId, accountId }) => ({
        url: `/loans/${loanId}/early-repay`,
        method: "POST",
        body: { account_id: accountId },
      }),
      invalidatesTags: (result, error, { loanId }) => [
        { type: "Loans", id: loanId },
        { type: "Loans", id: "LIST" },
        "Accounts",
        "Transactions",
      ],
    }),

    // Get Loan Stats
    getLoanStats: builder.query({
      query: () => "/loans/stats",
      providesTags: ["Loans"],
    }),

    // Approve Loan (Demo)
    approveLoan: builder.mutation({
      query: ({ loanId, accountId }) => ({
        url: `/loans/${loanId}/approve`,
        method: "POST",
        body: { account_id: accountId },
      }),
      invalidatesTags: (result, error, { loanId }) => [
        { type: "Loans", id: loanId },
        { type: "Loans", id: "LIST" },
        "Accounts",
      ],
    }),

    // Submit Loan Application
    submitLoanApplication: builder.mutation({
      query: (applicationData) => ({
        url: "/loans/",
        method: "POST",
        body: {
          loan_type: applicationData.loan_type,
          principal_amount: applicationData.principal_amount,
          term_months: applicationData.term_months,
          interest_rate: applicationData.interest_rate,
          employment_type: applicationData.employment_type,
          monthly_income: applicationData.monthly_income,
          work_experience: applicationData.work_experience,
        },
      }),
      invalidatesTags: [{ type: "Loans", id: "LIST" }],
    }),
  }),
});

export const {
  useCalculateLoanMutation,
  useCreateLoanMutation,
  useGetLoansQuery,
  useGetLoanByIdQuery,
  useGetLoanScheduleQuery,
  useGetLoanPaymentScheduleQuery,
  usePayLoanMutation,
  useEarlyRepayLoanMutation,
  useGetLoanStatsQuery,
  useApproveLoanMutation,
  useSubmitLoanApplicationMutation,
} = loansApi;
