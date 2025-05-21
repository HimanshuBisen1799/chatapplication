
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: number;
  user?: {
    id: number;
    username: string;
    image: string;
  };
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserResponse {
  id: number;
  username: string;
  image: string;
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://dummyjson.com',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    getPosts: builder.query<PostsResponse, { skip: number; limit: number }>({
      query: ({ skip, limit }) => `/posts?skip=${skip}&limit=${limit}`,
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      // Merge incoming data with existing data
      merge: (currentCache, newItems, { arg }) => {
        if (arg.skip === 0) {
          return newItems;
        }
        return {
          ...newItems,
          posts: [...currentCache.posts, ...newItems.posts],
        };
      },
      // Always refetch when arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.posts.map(({ id }) => ({ type: 'Posts' as const, id })),
              { type: 'Posts', id: 'LIST' },
            ]
          : [{ type: 'Posts', id: 'LIST' }],
    }),
    getUser: builder.query<UserResponse, number>({
      query: (id) => `/users/${id}`,
    }),
  }),
});

export const { useGetPostsQuery, useGetUserQuery } = postsApi;
