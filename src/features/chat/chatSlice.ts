
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface Message {
  id: number | string;
  text: string;
  sentByMe: boolean;
  timestamp: string;
  senderName: string;
}

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  connected: boolean;
}

const initialState: ChatState = {
  messages: [],
  isOpen: false,
  connected: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
  },
});

export const { addMessage, toggleChat, setConnected } = chatSlice.actions;

export default chatSlice.reducer;

export const selectMessages = (state: RootState) => state.chat.messages;
export const selectIsChatOpen = (state: RootState) => state.chat.isOpen;
export const selectIsConnected = (state: RootState) => state.chat.connected;
