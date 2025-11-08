//client/src/pages/buyer/product-detail/ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { toast } from "sonner";
import { getProductDetail, addToCart, addToWishlist, removeFromWishlist } from "../../../services/buyer.services.js";
import { useDispatch } from 'react-redux';
import { addToCart as addToCartInStore } from '../../../store/slices/cartSlice';
import { addToWishlist as addToWishlistInStore, removeFromWishlist as removeFromWishlistInStore } from '../../../store/slices/wishlistSlice';
import { useCart, useWishlist } from '../../../store/hooks';
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import StarRating from "../components/StarRating.jsx";

const ProductDetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  
  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  // Check if book is in cart/wishlist from Redux store
  const isInCart = cartItems.some(item => item.book?._id === id);
  const isInWishlist = wishlistItems.some(item => item._id === id);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await getProductDetail(id);
      if (response.success) {
        setBook(response.data.book);
        setSimilarBooks(response.data.similarBooks || []);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to fetch book details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (book.quantity <= 0) {
      toast.error("This book is out of stock!");
      return;
    }
    
    if (isInCart) {
      toast.info("Book is already in your cart!");
      return;
    }
    
    // Optimistic update: add to store immediately
    dispatch(addToCartInStore({ book, quantity: 1 }));
    
    try {
      const response = await addToCart({ bookId: id, quantity: 1 });
      if (response.success) {
        toast.success("Book added to cart successfully!");
      } else {
        // Revert on failure - for now just show message
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("Error adding to cart");
    }
  };

  const handleToggleWishlist = async (targetBook) => {
    const targetId = targetBook?._id || id;
    const alreadyIn = wishlistItems.some(item => item._id === targetId);

    if (alreadyIn) {
      // Optimistic remove
      dispatch(removeFromWishlistInStore({ bookId: targetId }));
      try {
        const response = await removeFromWishlist(targetId);
        if (response.success) {
          toast.success('Removed from wishlist');
        } else {
          toast.error(response.message || 'Failed to remove from wishlist');
        }
      } catch {
        toast.error('Error removing from wishlist');
      }
      return;
    }

    // Optimistic add
    const payloadBook = targetBook || book;
    dispatch(addToWishlistInStore(payloadBook));
    try {
      const response = await addToWishlist(targetId);
      if (response.success) {
        toast.success('Added to wishlist');
      } else {
        toast.error(response.message || 'Failed to add to wishlist');
      }
    } catch {
      toast.error('Error adding to wishlist');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!book) return <div className="min-h-screen flex items-center justify-center">Book not found</div>;

  return (
    <div className="flex flex-col min-h-screen product-detail-page bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/buyer/dashboard" className="text-gray-700 hover:text-purple-600">
                <i className="fas fa-home mr-2"></i>
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
                  <span className="text-gray-500">{book.title}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Image */}
              <div className="space-y-4">
                <div className="w-[500px] h-[600px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="max-w-full min-h-[90%] max-h-[98%] object-contain transform transition-transform duration-500 hover:scale-[1.01]"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                  <p className="text-lg text-gray-600 mt-2">by {book.author}</p>
                  <p className="text-gray-600 mt-1">Genre: <span className="font-medium">{book.genre}</span></p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-700 mr-3 w-20">Rating:</span>
                    <StarRating rating={book.rating || 0} size="text-lg" />
                    <span className="ml-2 text-gray-600 font-medium">{book.rating.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-700 mr-3 w-20">Reviews:</span>
                    <span className="text-gray-600">
                      {book.reviews.length} {book.reviews.length === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-700 mr-3 w-20">Stock:</span>
                    {book.quantity > 0 ? (
                      <span className="text-green-600 font-semibold">
                        <i className="fas fa-check-circle mr-1"></i>
                        In Stock ({book.quantity} available)
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        <i className="fas fa-times-circle mr-1"></i>
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-b border-gray-200 py-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">₹{book.price}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border rounded-lg"></div>
                    {book.quantity > 0 ? (
                      <Link
                        to="/buyer/cart"
                        className="flex flex-1 justify-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <p className="text-white"> Buy Now </p>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="flex flex-1 justify-center bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed"
                      >
                        <p className="text-white"> Out of Stock </p>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative grid grid-cols-2 gap-4">
                      {book.quantity <= 0 ? (
                        <button
                          disabled
                          className="absolute w-full flex items-center justify-center space-x-2 bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed"
                        >
                          <i className="fas fa-shopping-cart text-white"></i>
                          <span className="text-white">Out of Stock</span>
                        </button>
                      ) : isInCart ? (
                        <Link
                          to="/buyer/cart"
                          className="absolute w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <i className="fas fa-shopping-cart text-white" ></i>
                          <span className="text-white">Go to Cart</span>
                        </Link>
                      ) : (
                        <button
                          id="addToCartBtn"
                          onClick={handleAddToCart}
                          className="absolute w-full flex items-center justify-center space-x-2 border border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <i className="fas fa-shopping-cart" ></i>
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                    <button
                      id="addToWishlistBtn"
                      onClick={() => handleToggleWishlist(book)}
                      className={`flex items-center justify-center space-x-2 border border-purple-600 text-purple-600 px-6 py-3 rounded-lg transition-colors ${
                        isInWishlist ? "text-red-500" : "hover:text-red-500"
                      }`}
                    >
                      <i className={isInWishlist ? "fas fa-heart" : "far fa-heart"}></i>
                      <span>{isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-gray-600">{book.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
            {book.reviews.length > 0 ? (
              book.reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-xl shadow-lg mb-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=${review.buyer.firstname}+${review.buyer.lastname}`}
                      alt={`${review.buyer.firstname} ${review.buyer.lastname}`}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          {review.buyer.firstname} {review.buyer.lastname}
                        </h4>
                        <span className="text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="my-1">
                        <StarRating rating={review.rating} size="text-base" />
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No reviews yet. Be the first to review this book!</p>
            )}
          </div>

          {/* Similar Books */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">You May Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarBooks.map((sBook) => {
                const sInWishlist = wishlistItems.some(item => item._id === sBook._id);
                return (
                <div
                  key={sBook._id}
                  className="relative bg-white rounded-lg shadow-md overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer"
                  onClick={() => navigate(`/buyer/product-detail/${sBook._id}`)}
                >
                  <div className="relative w-full h-40 md:h-64 bg-gray-100 flex items-center justify-center">
                    <img
                      src={sBook.image}
                      alt={sBook.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <div className="p-3 md:p-4">
                    <h3 className="text-lg font-semibold mb-1 truncate">{sBook.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">by {sBook.author}</p>

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-600 text-sm">₹{sBook.price}</span>
                    </div>

                    <button
                      className="absolute bottom-3 right-3 wishlist-btn text-gray-600 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWishlist(sBook);
                      }}
                    >
                      <i className={`${sInWishlist ? 'fas text-red-500' : 'far text-gray-600'} fa-heart text-xl`}></i>
                    </button>
                  </div>
                </div>
              );})}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;