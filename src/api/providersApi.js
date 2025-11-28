import { baseApi } from './baseApi';

export const providersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Providers
    getProviders: builder.query({
      query: ({ category } = {}) =>
        category ? `/providers?category=${category}` : '/providers',
      providesTags: ['Providers'],
    }),
    
    // Get Provider by ID
    getProviderById: builder.query({
      query: (providerId) => `/providers/${providerId}`,
      providesTags: (result, error, providerId) => [
        { type: 'Providers', id: providerId },
      ],
    }),
    
    // Get Popular Providers
    getPopularProviders: builder.query({
      query: ({ limit = 10 } = {}) => `/providers/popular?limit=${limit}`,
      providesTags: ['Providers'],
    }),
    
    // Search Providers
    searchProviders: builder.query({
      query: (query) => `/providers/search?q=${query}`,
    }),
    
    // Pay to Provider
    payToProvider: builder.mutation({
      query: ({ providerId, accountId, amount, paymentData }) => ({
        url: `/providers/${providerId}/pay`,
        method: 'POST',
        body: {
          account_id: accountId,
          amount,
          payment_data: paymentData,
        },
      }),
      invalidatesTags: ['Transactions', 'Accounts'],
    }),
    
    // Get Provider Categories
    getProviderCategories: builder.query({
      query: () => '/providers/categories',
      providesTags: ['Providers'],
    }),
    
    // Get Favorite Providers
    getFavoriteProviders: builder.query({
      query: () => '/providers/favorites',
      providesTags: ['Providers'],
    }),
    
    // Add Provider to Favorites
    addToFavorites: builder.mutation({
      query: (providerId) => ({
        url: `/providers/${providerId}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: ['Providers'],
    }),
    
    // Remove Provider from Favorites
    removeFromFavorites: builder.mutation({
      query: (providerId) => ({
        url: `/providers/${providerId}/favorite`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Providers'],
    }),
  }),
});

export const {
  useGetProvidersQuery,
  useGetProviderByIdQuery,
  useGetPopularProvidersQuery,
  useSearchProvidersQuery,
  useLazySearchProvidersQuery,
  usePayToProviderMutation,
  useGetProviderCategoriesQuery,
  useGetFavoriteProvidersQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} = providersApi;
