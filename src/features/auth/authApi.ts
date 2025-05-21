
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { setCredentials, logout, User } from './authSlice';

// Define your backend URL with the MongoDB connection
const BACKEND_URL = 'https://healthgoods-data-backend.onrender.com/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  image?: string;
  token: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    dummyLogin: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'https://dummyjson.com/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: {
                id: data.id,
                username: data.username,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                gender: data.gender,
                image: data.image,
              },
              token: data.token,
            })
          );
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
    
    // MongoDB login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: {
                id: data.id,
                username: data.username,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                gender: data.gender,
                image: data.image,
              },
              token: data.token,
            })
          );
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
    
    // Registration endpoint
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    getUserDetails: builder.query<User, void>({
      query: () => `/users/me`,
      providesTags: ['User'],
    }),
    
    // MongoDB configuration endpoint
    getMongoConfig: builder.query<{ mongoUri: string }, void>({
      query: () => '/config/mongo',
    }),
  }),
});

export const { 
  useDummyLoginMutation,
  useLoginMutation, 
  useRegisterMutation,
  useGetUserDetailsQuery,
  useGetMongoConfigQuery
} = authApi;
