import { useDispatch, useSelector } from 'react-redux';

// Base hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hooks for easy access
export const useAuth = () => {
  return useSelector((state) => state.auth);
};

export const useUser = () => {
  return useSelector((state) => state.user);
};

export const useCart = () => {
  const items = useSelector((state) => state.cart.items);
  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    isEmpty: items.length === 0,
  };
};

export const useWishlist = () => {
  const items = useSelector((state) => state.wishlist.items);
  return {
    items,
    count: items.length,
    isEmpty: items.length === 0,
  };
};
