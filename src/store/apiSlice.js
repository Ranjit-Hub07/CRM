import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

let rawUrl = (import.meta.env.VITE_API_URL || '/api').trim();
if (rawUrl.startsWith('http')) {
  rawUrl = rawUrl.replace(/\/+$/, '');
  if (!rawUrl.endsWith('/api')) {
    rawUrl += '/api';
  }
}
const BASE_URL = rawUrl;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ['Lead', 'Customer', 'Deal', 'Activity', 'Notification', 'Team', 'Dashboard', 'Reports', 'User'],
  endpoints: (builder) => ({
    // ── Auth ────────────────────────────────
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    getProfile: builder.query({
      query: () => '/auth/profile',
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/auth/profile', method: 'PUT', body }),
    }),

    // ── Leads ───────────────────────────────
    getLeads: builder.query({
      query: (params) => ({ url: '/leads', params }),
      providesTags: ['Lead'],
    }),
    getLeadStats: builder.query({
      query: () => '/leads/stats',
      providesTags: ['Lead'],
    }),
    createLead: builder.mutation({
      query: (body) => ({ url: '/leads', method: 'POST', body }),
      invalidatesTags: ['Lead', 'Dashboard'],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/leads/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Lead', 'Dashboard'],
    }),
    convertLead: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/leads/${id}/convert`, method: 'POST', body }),
      invalidatesTags: ['Lead', 'Customer', 'Deal', 'Dashboard'],
    }),

    // ── Customers ───────────────────────────
    getCustomers: builder.query({
      query: (params) => ({ url: '/customers', params }),
      providesTags: ['Customer'],
    }),
    getCustomerStats: builder.query({
      query: () => '/customers/stats',
      providesTags: ['Customer'],
    }),
    createCustomer: builder.mutation({
      query: (body) => ({ url: '/customers', method: 'POST', body }),
      invalidatesTags: ['Customer', 'Dashboard'],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/customers/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Customer'],
    }),

    // ── Deals ───────────────────────────────
    getDeals: builder.query({
      query: (params) => ({ url: '/deals', params }),
      providesTags: ['Deal'],
    }),
    getDealStats: builder.query({
      query: () => '/deals/stats',
      providesTags: ['Deal'],
    }),
    createDeal: builder.mutation({
      query: (body) => ({ url: '/deals', method: 'POST', body }),
      invalidatesTags: ['Deal', 'Dashboard'],
    }),
    updateDeal: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/deals/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Deal'],
    }),
    updateDealStage: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/deals/${id}/stage`, method: 'PATCH', body }),
      invalidatesTags: ['Deal', 'Dashboard'],
    }),

    // ── Activities ──────────────────────────
    getActivities: builder.query({
      query: (params) => ({ url: '/activities', params }),
      providesTags: ['Activity'],
    }),
    getActivityStats: builder.query({
      query: () => '/activities/stats',
      providesTags: ['Activity'],
    }),
    createActivity: builder.mutation({
      query: (body) => ({ url: '/activities', method: 'POST', body }),
      invalidatesTags: ['Activity', 'Dashboard'],
    }),
    toggleActivityStatus: builder.mutation({
      query: (id) => ({ url: `/activities/${id}/toggle`, method: 'PATCH' }),
      invalidatesTags: ['Activity'],
    }),

    // ── Notifications ───────────────────────
    getNotifications: builder.query({
      query: (params) => ({ url: '/notifications', params }),
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),

    // ── Team ────────────────────────────────
    getTeamMembers: builder.query({
      query: () => '/team',
      providesTags: ['Team'],
    }),

    // ── Dashboard / Reports ─────────────────
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
    getReportsOverview: builder.query({
      query: () => '/reports/overview',
      providesTags: ['Reports'],
    }),

    // ── Users ───────────────────────────────
    getAllUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
    createUser: builder.mutation({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetLeadsQuery,
  useGetLeadStatsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useConvertLeadMutation,
  useGetCustomersQuery,
  useGetCustomerStatsQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetDealsQuery,
  useGetDealStatsQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useUpdateDealStageMutation,
  useGetActivitiesQuery,
  useGetActivityStatsQuery,
  useCreateActivityMutation,
  useToggleActivityStatusMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetTeamMembersQuery,
  useGetDashboardStatsQuery,
  useGetReportsOverviewQuery,
  useGetAllUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = apiSlice;
