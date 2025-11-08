//client/src/pages/buyer/cart/Cart.jsx
import React, { useMemo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { updateCartQuantity, removeFromCart, addToCart, removeFromWishlist as removeFromWishlistApi, getCart } from "../../../services/buyer.services.js";
import { useDispatch } from 'react-redux';
import { updateCartQuantity as updateCartInStore, removeFromCart as removeFromCartInStore, addToCart as addToCartInStore, setCart } from '../../../store/slices/cartSlice';
import { removeFromWishlist as removeFromWishlistInStore } from '../../../store/slices/wishlistSlice';
import { useCart, useWishlist } from '../../../store/hooks';
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import StarRating from "../components/StarRating.jsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/AlertDialog";

const Cart = () => {
  const dispatch = useDispatch();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [syncingCart, setSyncingCart] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);

  // Sync cart with backend on mount to handle deleted books
  useEffect(() => {
    const syncCart = async () => {
      setSyncingCart(true);
      try {
        const response = await getCart();
        if (response.success && response.data?.cart)
          dispatch(setCart(response.data.cart));
      } catch (err) {
        console.error("Failed to sync cart:", err);
      } finally {
        setSyncingCart(false);
      }
    };
    syncCart();
  }, [dispatch]);

  // Calculate totals from cart items
  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.book?.price || 0) * item.quantity, 0);
    const shipping = subtotal > 35 || !cartItems.length ? 0 : 100;
    const tax = subtotal * 0.02;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [cartItems]);

  const handleQuantityChange = async (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const cartItem = cartItems.find(item => item.book._id === bookId);
    const availableStock = cartItem?.book?.quantity || 0;
    
    if (newQuantity > availableStock) {
      toast.warning(`Only ${availableStock} items available in stock!`);
      return;
    }
    
    dispatch(updateCartInStore({ bookId, quantity: newQuantity }));
    
    try {
      const response = await updateCartQuantity({ bookId, quantity: newQuantity });
      if (!response.success)
        toast.error(response.message || "Failed to update quantity");
    } catch (err) {
      toast.error("Error updating quantity");
    }
  };

  const handleRemoveFromCart = (bookId) => {
    setBookToRemove(bookId);
    setShowRemoveDialog(true);
  };

  const confirmRemoveFromCart = async () => {
    if (!bookToRemove) return;

    dispatch(removeFromCartInStore({ bookId: bookToRemove }));
    setShowRemoveDialog(false);
    
    try {
      const response = await removeFromCart(bookToRemove);
      if (response.success) {
        toast.success("Item removed from cart");
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("Error removing item");
    } finally {
      setBookToRemove(null);
    }
  };

  const handleAddToCartFromWishlist = async (bookId) => {
    // Find the book from wishlist
    const bookToAdd = wishlistItems.find(item => item._id === bookId);
    if (!bookToAdd) return;

    if (bookToAdd.quantity <= 0) {
      toast.error("This book is out of stock!");
      return;
    }

    // Check if already in cart
    const isAlreadyInCart = cartItems.some(item => item.book?._id === bookId);
    if (isAlreadyInCart) {
      toast.info("Book is already in your cart!");
      return;
    }

    // Optimistic update: add to cart store
    dispatch(addToCartInStore({ book: bookToAdd, quantity: 1 }));

    try {
      const response = await addToCart({ bookId, quantity: 1 });
      if (response.success) {
        toast.success("Book added to cart successfully!");
      } else {
        toast.error(response.message || "Failed to add to cart");
      }
    } catch (err) {
      toast.error("Error adding to cart");
    }
  };

  const handleRemoveFromWishlist = async (bookId) => {
    // Update store immediately (optimistic)
    dispatch(removeFromWishlistInStore({ bookId }));
    
    // Sync with backend
    try {
      const response = await removeFromWishlistApi(bookId);
      if (response.success) {
        toast.success("Removed from wishlist");
      } else {
        toast.error(response.message || "Failed to remove from wishlist");
      }
    } catch (err) {
      toast.error("Error removing from wishlist");
    }
  };

  const hasOutOfStockItems = useMemo(() => {
    return cartItems.some(item => item.book?.quantity <= 0);
  }, [cartItems]);

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.warning("Your cart is empty");
      return;
    }
    if (hasOutOfStockItems) {
      toast.warning("Some items in your cart are out of stock. Please remove them before proceeding to checkout.");
      return;
    }
    navigate("/buyer/checkout");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <div className="max-w-7xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
          {syncingCart ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
                <p className="text-gray-600">Syncing your cart...</p>
              </div>
            </div>
          ) : (
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Cart Section */}
            <div className="lg:w-2/3">
              <div className="overflow-hidden bg-white rounded-xl shadow-lg">
                <div className="p-6 border-b border-gray-300">
                  <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                  <p id="cart-count-text" className="mt-1 text-gray-500">
                    You have {cartItems.length} items in your cart
                  </p>
                </div>
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12">
                    <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 text-center mb-4">
                      Some items may have been removed because they're no longer available
                    </p>
                    <button
                      onClick={() => navigate("/buyer/dashboard")}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                <div id="cart-items" className="divide-y divide-gray-300">
                  {cartItems.map((item, idx) => (
                    <div
                      key={"cart" + item._id + idx}
                      className="flex items-center p-6 space-x-4 cart-item"
                      data-book-id={item.book._id}
                    >
                      <img
                        src={item.book.image}
                        alt={item.book.title}
                        className="object-contain w-24 h-32 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/buyer/product-detail/${item.book._id}`)}
                      />
                      <div className="flex-1">
                        <h3 
                          className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={() => navigate(`/buyer/product-detail/${item.book._id}`)}
                        >
                          {item.book.title}
                        </h3>
                        <p className="text-gray-600">by {item.book.author}</p>
                        <div className="flex items-center mt-2">
                          <StarRating rating={item.book?.rating || 0} showValue={true} />
                        </div>
                        {item.book?.quantity <= 0 && (
                          <div className="mt-2 px-2 py-1 bg-red-100 border border-red-300 rounded inline-block">
                            <span className="text-red-700 text-sm font-semibold">
                              <i className="fas fa-exclamation-circle mr-1"></i>
                              Out of Stock - Remove to checkout
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              type="button"
                              className="px-3 py-1 text-gray-600 hover:text-purple-600 decrement-btn"
                              data-book-id={item.book._id}
                              onClick={() => handleQuantityChange(item.book._id, item.quantity - 1)}
                            >
                              <i className="fas fa-minus"></i> 
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              min="1"
                              max={item.book.quantity}
                              className="w-12 text-center border-x border-gray-300 focus:outline-none focus:ring-0 quantity-input"
                              data-book-id={item.book._id}
                              onChange={(e) => handleQuantityChange(item.book._id, parseInt(e.target.value))}
                            />
                            <button
                              type="button"
                              className="px-3 py-1 text-gray-600 hover:text-purple-600 increment-btn"
                              data-book-id={item.book._id}
                              onClick={() => handleQuantityChange(item.book._id, item.quantity + 1)}
                            >
                              <i className="fas fa-plus"></i> 
                            </button>
                          </div>
                          <p className={`text-xs mt-1 text-center ${item.quantity === item.book.quantity ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                            {item.book.quantity} left in stock
                          </p>
                        </div>                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 unit-price" data-unit-price={item.book.price}>
                            ₹{item.book.price}
                          </p>
                          <p className="text-sm text-gray-600">
                            Item total: ₹<span className="line-total">{(item.book.price * item.quantity).toFixed(2)}</span>
                          </p>
                          <button
                            type="button"
                            className="text-sm text-red-500 hover:text-red-600 remove-from-cart-btn"
                            data-book-id={item.book._id}
                            onClick={() => handleRemoveFromCart(item.book._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>

              {/* Wishlist Section */}
              <div id="wishlist-section" className="mt-8 overflow-hidden bg-white rounded-xl shadow-lg">
                <div className="p-6 border-b border-gray-300">
                  <h2 className="text-2xl font-bold text-gray-900">Wishlist</h2>
                  <p className="mt-1 text-gray-500">You have {wishlistItems.length} items in your wishlist</p>
                </div>
                <div className="divide-y">
                  {wishlistItems.map((item, idx) => (
                    <div
                      key={"wishlist" +item._id + idx}
                      className="flex items-center p-6 space-x-4 wishlist-item border-b border-gray-300"
                      data-book-id={item._id}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="object-contain w-24 h-32 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/buyer/product-detail/${item._id}`)}
                      />
                      <div className="flex-1">
                        <h3 
                          className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={() => navigate(`/buyer/product-detail/${item._id}`)}
                        >
                          {item.title}
                        </h3>
                        <p className="text-gray-600">by {item.author}</p>
                        <div className="flex items-center mt-2">
                          <StarRating rating={item.rating || 0} showValue={true} />
                        </div>
                      </div>
                      <div className="space-y-2 text-right">
                        <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                        {item.quantity <= 0 ? (
                          <div>
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-white bg-gray-400 rounded-lg cursor-not-allowed"
                              disabled
                            >
                              Out of Stock
                            </button>
                          </div>
                        ) : (() => {
                          const isInCart = cartItems.some(cartItem => cartItem.book?._id === item._id);
                          return (
                            <button
                              type="button"
                              className={`w-full px-4 py-2 text-white transition-colors rounded-lg add-to-cart-btn ${
                                isInCart 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-purple-600 hover:bg-purple-700'
                              }`}
                              data-book-id={item._id}
                              data-title={item.title}
                              data-author={item.author}
                              data-price={item.price}
                              data-image={item.image}
                              data-rating={item.rating || 0}
                              onClick={() => handleAddToCartFromWishlist(item._id)}
                              disabled={isInCart}
                            >
                              {isInCart ? 'In Cart' : 'Add to Cart'}
                            </button>
                          );
                        })()}
                        <button
                          className="text-sm text-red-500 hover:text-red-600 remove-from-wishlist-btn"
                          data-book-id={item._id}
                          onClick={() => handleRemoveFromWishlist(item._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 overflow-hidden bg-white rounded-xl shadow-lg">
                <div className="p-6 border-b border-gray-300">
                  <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                </div>
                <div
                  id="order-summary"
                  className="p-6 space-y-4"
                  data-tax-rate={cartTotals.subtotal > 0 ? cartTotals.tax / cartTotals.subtotal : 0}
                  data-shipping-charge="35"
                  data-shipping-threshold="35"
                >
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Subtotal (<span id="summary-count">{cartItems.length}</span> items)
                    </span>
                    <span id="summary-subtotal">₹{cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span id="summary-shipping">₹{cartTotals.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span id="summary-tax">₹{cartTotals.tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-300">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span id="summary-total">₹{cartTotals.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Out of stock warning */}
                  {hasOutOfStockItems && (
                    <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <i className="fas fa-exclamation-triangle text-red-600 mt-0.5 mr-2"></i>
                        <p className="text-sm text-red-800">
                          <strong>Cannot proceed:</strong> Some items in your cart are out of stock. 
                          Please remove them before checkout.
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    id="proceedToCheckoutBtn"
                    onClick={handleProceedToCheckout}
                    className={`w-full py-3 text-white transition-colors rounded-lg ${
                      cartItems.length === 0 || hasOutOfStockItems
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                    disabled={cartItems.length === 0 || hasOutOfStockItems}
                  >
                    Proceed to Checkout
                  </button>
                  <div className="text-sm text-center text-gray-500">
                    <p>Free shipping on orders over ₹35</p>
                    <p className="mt-1">Expected delivery: 3-5 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Inline styles from EJS */}
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          margin: 0;
          -webkit-appearance: none;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Remove from Cart Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveFromCart} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default Cart;