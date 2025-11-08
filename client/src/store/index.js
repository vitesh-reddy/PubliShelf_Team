import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';

// --- Simple localStorage persistence (no external deps) ---
const PERSIST_KEY = 'publishelf_state_v1';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem(PERSIST_KEY);
    if (!serializedState) return undefined; // Let reducers use their initial state
    const parsed = JSON.parse(serializedState);
    // Only hydrate known slices to avoid accidental shape drift
    return {
      auth: parsed.auth ?? undefined,
      user: parsed.user ?? undefined,
      cart: parsed.cart ?? undefined,
      wishlist: parsed.wishlist ?? undefined,
    };
  } catch (e) {
    console.warn('Failed to load persisted state:', e);
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const toPersist = {
      auth: state.auth,
      user: state.user,
      cart: state.cart,
      wishlist: state.wishlist,
    };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(toPersist));
  } catch (e) {
    // Quota errors or private mode - fail silently
    console.warn('Failed to save state:', e);
  }
};

// Store configuration with separate slices
const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
  preloadedState,
});

// Persist on any state change (lightweight; these slices are small)
store.subscribe(() => saveState(store.getState()));

export default store;
