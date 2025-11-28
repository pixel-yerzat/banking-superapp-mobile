import { baseApi } from './baseApi';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Category Stats
    getCategoryStats: builder.query({
      query: ({ startDate, endDate, currency }) =>
        `/analytics/categories?start_date=${startDate}&end_date=${endDate}${currency ? `&currency=${currency}` : ''}`,
      providesTags: ['Analytics'],
    }),
    
    // Get Spending Analysis
    getSpendingAnalysis: builder.query({
      query: ({ period = 'month', currency }) =>
        `/analytics/spending?period=${period}${currency ? `&currency=${currency}` : ''}`,
      providesTags: ['Analytics'],
    }),
    
    // Compare Spending
    compareSpending: builder.query({
      query: ({ currentStart, currentEnd, previousStart, previousEnd }) =>
        `/analytics/compare?current_start=${currentStart}&current_end=${currentEnd}&previous_start=${previousStart}&previous_end=${previousEnd}`,
      providesTags: ['Analytics'],
    }),
    
    // Get Forecast
    getForecast: builder.query({
      query: () => '/analytics/forecast',
      providesTags: ['Analytics'],
    }),
    
    // Get Recommendations
    getRecommendations: builder.query({
      query: () => '/analytics/recommendations',
      providesTags: ['Analytics'],
    }),
    
    // Get Monthly Summary
    getMonthlySummary: builder.query({
      query: ({ year, month }) =>
        `/analytics/monthly-summary?year=${year}&month=${month}`,
      providesTags: ['Analytics'],
    }),
    
    // Get Yearly Summary
    getYearlySummary: builder.query({
      query: ({ year }) => `/analytics/yearly-summary?year=${year}`,
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetCategoryStatsQuery,
  useGetSpendingAnalysisQuery,
  useCompareSpendingQuery,
  useGetForecastQuery,
  useGetRecommendationsQuery,
  useGetMonthlySummaryQuery,
  useGetYearlySummaryQuery,
} = analyticsApi;
