import { baseApi } from './baseApi';

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Templates
    getTemplates: builder.query({
      query: ({ category } = {}) =>
        category ? `/templates?category=${category}` : '/templates',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Templates', id })),
              { type: 'Templates', id: 'LIST' },
            ]
          : [{ type: 'Templates', id: 'LIST' }],
    }),
    
    // Create Template
    createTemplate: builder.mutation({
      query: (templateData) => ({
        url: '/templates',
        method: 'POST',
        body: templateData,
      }),
      invalidatesTags: [{ type: 'Templates', id: 'LIST' }],
    }),
    
    // Get Auto Payments
    getAutoPayments: builder.query({
      query: () => '/templates/auto-payments',
      providesTags: ['Templates'],
    }),
    
    // Update Template
    updateTemplate: builder.mutation({
      query: ({ templateId, ...data }) => ({
        url: `/templates/${templateId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { templateId }) => [
        { type: 'Templates', id: templateId },
        { type: 'Templates', id: 'LIST' },
      ],
    }),
    
    // Delete Template
    deleteTemplate: builder.mutation({
      query: (templateId) => ({
        url: `/templates/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Templates', id: 'LIST' }],
    }),
    
    // Pay by Template
    payByTemplate: builder.mutation({
      query: ({ templateId, accountId, amount, description }) => ({
        url: `/templates/${templateId}/pay`,
        method: 'POST',
        body: { account_id: accountId, amount, description },
      }),
      invalidatesTags: ['Transactions', 'Accounts'],
    }),
    
    // Search Templates
    searchTemplates: builder.query({
      query: (query) => `/templates/search?q=${query}`,
    }),
    
    // Get Template Stats
    getTemplateStats: builder.query({
      query: () => '/templates/stats',
      providesTags: ['Templates'],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useGetAutoPaymentsQuery,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  usePayByTemplateMutation,
  useSearchTemplatesQuery,
  useLazySearchTemplatesQuery,
  useGetTemplateStatsQuery,
} = templatesApi;
