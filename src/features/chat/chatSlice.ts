import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface Message {
  id: string | number;
  text: string;
  sentByMe: boolean;
  timestamp: string;
  senderName: string;
}

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  connected: boolean;
  chatPartnerId: string | null;
  chatPartnerName: string | null;
}

const initialState: ChatState = {
  messages: [],
  isOpen: false,
  connected: false,
  chatPartnerId: null,
  chatPartnerName: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setChatPartner: (state, action: PayloadAction<{ id: string, name: string }>) => {
      state.chatPartnerId = action.payload.id;
      state.chatPartnerName = action.payload.name;
    },
    clearChat: (state) => {
      state.messages = [];
      state.chatPartnerId = null;
      state.chatPartnerName = null;
    },
  },
});

export const { 
  addMessage, 
  setMessages, 
  toggleChat, 
  setConnected, 
  setChatPartner,
  clearChat 
} = chatSlice.actions;

export default chatSlice.reducer;

export const selectMessages = (state: RootState) => state.chat.messages;
export const selectIsChatOpen = (state: RootState) => state.chat.isOpen;
export const selectIsConnected = (state: RootState) => state.chat.connected;
export const selectChatPartner = (state: RootState) => ({
  id: state.chat.chatPartnerId,
  name: state.chat.chatPartnerName,
});