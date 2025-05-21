import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { io, Socket } from 'socket.io-client';
import { RootState } from '../../app/store';
import { addMessage, setConnected, setMessages } from './chatSlice';

// Socket.io instance
let socket: Socket | null = null;

// Connect to the Socket.IO server
const connectSocket = (dispatch: any, token: string, chatId: string) => {
  if (socket && socket.connected) {
    // Join new chat room if already connected
    socket.emit('join_chat', chatId);
    return socket;
  }

  // Create socket connection
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

  // Handle incoming messages
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

  // Connection status
  socket.on('connect', () => {
    console.log('Connected to chat server');
    socket?.emit('join_chat', chatId);
    dispatch(setConnected(true));
  });

  // Handle errors
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

// Close socket connection
const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Define the base query for the API
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
    // Connect to chat server
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
          console.error('Failed to connect to chat:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Failed to connect to chat server',
            },
          };
        }
      },
    }),

    // Fetch chat history
    getChatHistory: builder.query<
      { success: boolean; data: { messages: any[] } },
      string
    >({
      query: (chatId) => `/chats/${chatId}`,
      async onQueryStarted(chatId, { dispatch, getState }) {
        try {
          const result = await this.query({ chatId });
          const userId = (getState() as RootState).auth.user?.id;
          if (result.data?.success) {
            const messages = result.data.data.messages.map((msg: any) => ({
              id: msg._id,
              text: msg.content,
              sentByMe: msg.sender._id === userId,
              timestamp: msg.createdAt,
              senderName: msg.sender.name || 'Unknown',
            }));
            dispatch(setMessages(messages));
          }
        } catch (error) {
          console.error('Failed to fetch chat history:', error);
        }
      },
    }),

    // Send a message
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
          const optimisticMessage = {
            id: Date.now(),
            text: content,
            sentByMe: true,
            timestamp: new Date().toISOString(),
            senderName: user?.username || 'You',
          };
          dispatch(addMessage(optimisticMessage));
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      },
    }),

    // Get or create chat with a user
    getOrCreateChat: builder.mutation<
      { success: boolean; chatId: string },
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/chats/user/${userId}`,
        method: 'POST',
      }),
    }),

    // Disconnect from chat
    disconnectFromChat: builder.mutation<{ success: boolean }, void>({
      queryFn: async () => {
        try {
          disconnectSocket();
          return { data: { success: true } };
        } catch (error) {
          console.error('Failed to disconnect from chat:', error);
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