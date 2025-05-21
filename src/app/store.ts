
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from '../features/auth/authApi';
import { postsApi } from '../features/posts/postsApi';
import { chatApi } from '../features/chat/chatApi';
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    [authApi.reducerPath]: authApi.reducer,
    [postsApi.reducerPath]: postsApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      postsApi.middleware,
      chatApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
