import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token') || null;
const userStr = localStorage.getItem('user');
let user = null;
if (userStr && userStr !== 'undefined') {
  try {
    user = JSON.parse(userStr);
  } catch (e) {
    console.error('Failed to parse cached user', e);
  }
}

const theme = localStorage.getItem('theme') || 'dark';

const initialState = {
  user,
  token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
  theme
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfileSuccess: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    bookmarkToggleSuccess: (state, action) => {
      if (state.user) {
        state.user.bookmarks = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
      // Toggle body tag dark class
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    initTheme: (state) => {
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
});

export const {
  authStart,
  authSuccess,
  authFailure,
  updateProfileSuccess,
  bookmarkToggleSuccess,
  logout,
  toggleTheme,
  initTheme
} = authSlice.actions;

export default authSlice.reducer;
