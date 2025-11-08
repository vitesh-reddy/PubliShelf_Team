import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload || [];
    },
    addToCart: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.book._id === action.payload.book._id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push(action.payload);
      }
    },
    updateCartQuantity: (state, action) => {
      const { bookId, quantity } = action.payload;
      const item = state.items.find((item) => item.book._id === bookId);
      if (item) {
        item.quantity = quantity;
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.book._id !== action.payload.bookId
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  setCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;