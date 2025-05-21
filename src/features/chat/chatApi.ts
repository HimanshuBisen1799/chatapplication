import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { io, Socket } from 'socket.io-client';
import { RootState } from '../../app/store';
import { addMessage, setConnected, setMessages } from './chatSlice';

// Socket.io instance
let socket: Socket | null = null;

// Connect to the Socket.IO server
const connectSocket = (dispatch: any, token: string, chatId: string) => {
  if (socket && socket.connected) {
    socket.emit('join_chat', chatId);
    return socket;
  }

  socket = io('https://healthgoods-data-backend.onrender.com', {
    path: '/socket.io',
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('new_message', ({ chatId, message }) => {
    dispatch(
      addMessage({
        id: message._id,
        text: message.content,
        sentByMe: false,
        timestamp: message.createdAt,
        senderName: message.sender?.name || 'Unknown',
      })
    );
  });

  socket.on('connect', () => {
    console.log('Connected to chat server');
    socket?.emit('join_chat', chatId);
    dispatch(setConnected(true));
  });

  socket.on('connect_error', (error: Error) => {
    console.error('Socket.IO connection error:', error);
    dispatch(setConnected(false));
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from chat server');
    dispatch(setConnected(false));
  });

  return socket;
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://healthgoods-data-backend.onrender.com/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    connectToChat: builder.mutation<{ success: boolean }, { chatId: string }>({
      queryFn: async ({ chatId }, { dispatch, getState }) => {
        try {
          const token = (getState() as RootState).auth.token;
          if (!token) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'No authentication token found',
              },
            };
          }
          connectSocket(dispatch, token, chatId);
          return { data: { success: true } };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Failed to connect to chat server',
            },
          };
        }
      },
    }),

    getChatHistory: builder.query<{ messages: any[] }, string>({
      query: (chatId) => `/chats/${chatId}`,
      transformResponse: (response: { success: boolean; data: { messages: any[] } }) => {
        return response.data;
      },
    }),

    sendMessage: builder.mutation<
      { success: boolean; data: any },
      { chatId: string; content: string }
    >({
      query: ({ chatId, content }) => ({
        url: `/chats/${chatId}/message`,
        method: 'POST',
        body: { content },
      }),
      async onQueryStarted({ chatId, content }, { dispatch, getState }) {
        try {
          const user = (getState() as RootState).auth.user;
          dispatch(
            addMessage({
              id: Date.now(),
              text: content,
              sentByMe: true,
              timestamp: new Date().toISOString(),
              senderName: user?.username || 'You',
            })
          );
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      },
    }),

    getOrCreateChat: builder.mutation<
      { success: boolean; chatId: string },
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/chats/user/${userId}`,
        method: 'POST',
      }),
    }),

    disconnectFromChat: builder.mutation<{ success: boolean }, void>({
      queryFn: async () => {
        try {
          disconnectSocket();
          return { data: { success: true } };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Failed to disconnect',
            },
          };
        }
      },
    }),
  }),
});

export const {
  useConnectToChatMutation,
  useGetChatHistoryQuery,
  useSendMessageMutation,
  useGetOrCreateChatMutation,
  useDisconnectFromChatMutation,
} = chatApi;