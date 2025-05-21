
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { io, Socket } from 'socket.io-client';
// import { RootState } from '../../app/store';
// import { addMessage, setConnected } from './chatSlice';

// // Socket.io instance
// let socket: Socket | null = null;

// // Connect to the Socket.IO server
// const connectSocket = (dispatch: any, token: string) => {
//   if (socket) return socket;

//   // Create socket connection
//   socket = io('https://healthgoods-data-backend.onrender.com/api', {
//     auth: {
//       token
//     },
//     transports: ['websocket'],
//     reconnection: true,
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000
//   });

//   // Handle incoming messages
//   socket.on('chat message', (message: any) => {
//     dispatch(
//       addMessage({
//         id: message._id || Date.now(),
//         text: message.text,
//         sentByMe: false,
//         timestamp: new Date().toISOString(),
//         senderName: message.senderName || 'User'
//       })
//     );
//   });

//   // Connection status
//   socket.on('connect', () => {
//     console.log('Connected to chat server');
//     dispatch(setConnected(true));
//   });

//   // Handle errors
//   socket.on('connect_error', (error: Error) => {
//     console.error('Socket.IO connection error:', error);
//     dispatch(setConnected(false));
//   });

//   socket.on('disconnect', () => {
//     console.log('Disconnected from chat server');
//     dispatch(setConnected(false));
//   });

//   return socket;
// };

// // Close socket connection
// const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };

// // Define the base query for the API
// export const chatApi = createApi({
//   reducerPath: 'chatApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: 'https://healthgoods-data-backend.onrender.com/api',
//     prepareHeaders: (headers, { getState }) => {
//       const token = (getState() as RootState).auth.token;
//       if (token) {
//         headers.set('authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   endpoints: (builder) => ({
//     // Connect to chat server
//     connectToChat: builder.mutation<{ success: boolean }, void>({
//       queryFn: async (_, { dispatch, getState }) => {
//         try {
//           const token = (getState() as RootState).auth.token;
          
//           if (!token) {
//             return { 
//               error: { 
//                 status: 'CUSTOM_ERROR', 
//                 error: 'No authentication token found' 
//               } 
//             };
//           }
          
//           connectSocket(dispatch, token);
//           return { data: { success: true } };
//         } catch (error) {
//           console.error('Failed to connect to chat:', error);
//           return { 
//             error: { 
//               status: 'CUSTOM_ERROR', 
//               error: 'Failed to connect to chat server' 
//             } 
//           };
//         }
//       }
//     }),
    
//     // Send a message
//     sendMessage: builder.mutation<{ success: boolean }, { text: string }>({
//       queryFn: async ({ text }, { dispatch, getState }) => {
//         try {
//           const state = getState() as RootState;
//           const user = state.auth.user;
          
//           if (!socket || !socket.connected) {
//             return { 
//               error: { 
//                 status: 'CUSTOM_ERROR', 
//                 error: 'Not connected to chat server' 
//               } 
//             };
//           }
          
//           // Create message object
//           const messageData = {
//             text,
//             senderName: user?.username || 'You',
//             userId: user?.id
//           };
          
//           // Emit message to server
//           socket.emit('chat message', messageData);
          
//           // Add to local state immediately
//           const message = {
//             id: Date.now(),
//             text,
//             sentByMe: true,
//             timestamp: new Date().toISOString(),
//             senderName: user?.username || 'You'
//           };
          
//           dispatch(addMessage(message));
          
//           return { data: { success: true } };
//         } catch (error) {
//           console.error('Failed to send message:', error);
//           return { 
//             error: { 
//               status: 'CUSTOM_ERROR', 
//               error: 'Failed to send message' 
//             } 
//           };
//         }
//       }
//     }),
    
//     // Disconnect from chat
//     disconnectFromChat: builder.mutation<{ success: boolean }, void>({
//       queryFn: async () => {
//         try {
//           disconnectSocket();
//           return { data: { success: true } };
//         } catch (error) {
//           console.error('Failed to disconnect from chat:', error);
//           return { 
//             error: { 
//               status: 'CUSTOM_ERROR', 
//               error: 'Failed to disconnect' 
//             } 
//           };
//         }
//       }
//     })
//   }),
// });

// export const { 
//   useConnectToChatMutation, 
//   useSendMessageMutation,
//   useDisconnectFromChatMutation
// } = chatApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { io, Socket } from 'socket.io-client';
import { RootState } from '../../app/store';
import { addMessage, setConnected, setMessages } from './chatSlice';

// Socket.io instance
let socket: Socket | null = null;

// Connect to the Socket.IO server
const connectSocket = (dispatch: any, token: string, orderId: string) => {
  if (socket && socket.connected) {
    // Join new order room if already connected
    socket.emit('join_order_chat', orderId);
    return socket;
  }

  // Create socket connection to /chat namespace
  socket = io('https://healthgoods-data-backend.onrender.com/api/chat', {
    auth: {
      token,
    },
    transports: ['websocket'],
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
        sentByMe: false, // Will be updated in sendMessage for sent messages
        timestamp: message.createdAt,
        senderName: message.sender?.name || 'Unknown',
      })
    );
  });

  // Connection status
  socket.on('connect', () => {
    console.log('Connected to chat server');
    socket?.emit('join_order_chat', orderId);
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
    connectToChat: builder.mutation<{ success: boolean }, { orderId: string }>({
      queryFn: async ({ orderId }, { dispatch, getState }) => {
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

          connectSocket(dispatch, token, orderId);
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
      query: (orderId) => `/order/${orderId}`,
      async onQueryStarted(orderId, { dispatch, getState }) {
        try {
          const result = await this.query({ orderId });
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
      { orderId: string; content: string }
    >({
      query: ({ orderId, content }) => ({
        url: `/order/${orderId}/message`,
        method: 'POST',
        body: { content },
      }),
      async onQueryStarted({ orderId, content }, { dispatch, getState }) {
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
  useDisconnectFromChatMutation,
} = chatApi;
