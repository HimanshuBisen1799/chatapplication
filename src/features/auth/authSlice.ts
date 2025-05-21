
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface User {
  id: string;
  username: string;
  username: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

// Load initial state from localStorage if available
const loadState = (): AuthState => {
  try {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      token: savedToken,
    };
  } catch (e) {
    return {
      user: null,
      token: null,
    };
  }
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
