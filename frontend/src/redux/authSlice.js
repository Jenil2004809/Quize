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
    setTheme: (state, action) => {
      const selectedTheme = action.payload;
      state.theme = selectedTheme;
      localStorage.setItem('theme', selectedTheme);
      applyThemeToDOM(selectedTheme);
    },
    toggleTheme: (state) => {
      const themes = ['dark', 'oled', 'cyber', 'light'];
      const currentIndex = themes.indexOf(state.theme);
      const nextIndex = (currentIndex + 1) % themes.length;
      const newTheme = themes[nextIndex];
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
      applyThemeToDOM(newTheme);
    },
    initTheme: (state) => {
      const savedTheme = localStorage.getItem('theme') || state.theme || 'dark';
      state.theme = savedTheme;
      applyThemeToDOM(savedTheme);
    }
  }
});

const applyThemeToDOM = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark', 'theme-academic', 'theme-slate', 'theme-oled', 'theme-cyber');

  switch (theme) {
    case 'light':
      root.classList.add('light', 'theme-academic');
      break;
    case 'oled':
      root.classList.add('dark', 'theme-oled');
      break;
    case 'cyber':
      root.classList.add('dark', 'theme-cyber');
      break;
    case 'dark':
    default:
      root.classList.add('dark', 'theme-slate');
      break;
  }
};

export const {
  authStart,
  authSuccess,
  authFailure,
  updateProfileSuccess,
  bookmarkToggleSuccess,
  logout,
  setTheme,
  toggleTheme,
  initTheme
} = authSlice.actions;

export default authSlice.reducer;
