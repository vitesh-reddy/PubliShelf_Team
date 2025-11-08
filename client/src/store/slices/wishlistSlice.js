import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Array of book objects
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Set entire wishlist from backend
    setWishlist: (state, action) => {
      state.items = action.payload || [];
    },
    
    // Add item to wishlist (optimistic)
    addToWishlist: (state, action) => {
      const exists = state.items.find(item => item._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    
    // Remove item (optimistic)
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(
        (item) => item._id !== action.payload.bookId
      );
    },
    
    // Clear wishlist
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const {
  setWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
