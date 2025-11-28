import { baseApi } from "./baseApi";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitSupportTicket: builder.mutation({
      query: (payload) => ({
        url: "/support/tickets",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const { useSubmitSupportTicketMutation } = supportApi;
