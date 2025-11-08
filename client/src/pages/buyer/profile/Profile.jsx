// client/src/pages/buyer/profile/Profile.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getProfile, updateProfileById } from "../../../services/buyer.services.js";
import { useDispatch } from 'react-redux';
import { updateUser } from '../../../store/slices/userSlice';
import { clearAuth } from '../../../store/slices/authSlice';
import { clearUser } from '../../../store/slices/userSlice';
import { clearCart } from '../../../store/slices/cartSlice';
import { clearWishlist } from '../../../store/slices/wishlistSlice';
import { useUser, useWishlist } from '../../../store/hooks';
import { logout } from "../../../services/auth.services";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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

const BuyerProfile = () => {
  const dispatch = useDispatch();
  const user = useUser();
  const { items: wishlistItems } = useWishlist();
  const { orders = [] } = useUser();
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await getProfile();
        if (!ignore && res?.success && res?.data?.user) {
          const srvUser = res.data.user;
          dispatch(updateUser({
            firstname: srvUser.firstname,
            lastname: srvUser.lastname,
            email: srvUser.email,
            createdAt: srvUser.createdAt,
            orders: Array.isArray(srvUser.orders) ? srvUser.orders : [],
          }));
          if (res.data.analytics) {
            setAnalytics(res.data.analytics);
          }
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
      }
    };
    load();
    return () => { ignore = true; };
  }, [dispatch]);
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    email: user.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({
    emailError: "",
    currentPasswordError: "",
    passwordError: "",
    generalError: "",
  });
  const saveBtnRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({
      emailError: "",
      currentPasswordError: "",
      passwordError: "",
      generalError: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, currentPassword, newPassword, confirmPassword } = formData;

    // Current password is always required
    if (!currentPassword) {
      setFormErrors({ ...formErrors, currentPasswordError: "Current password is required to update profile." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormErrors({ ...formErrors, generalError: "Please enter a valid email address." });
      return;
    }

    // If changing password, validate new password fields
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setFormErrors({ ...formErrors, passwordError: "New passwords do not match." });
        return;
      }
    }

    try {
      saveBtnRef.current.innerText = "Saving...";
      saveBtnRef.current.disabled = true;

      const response = await updateProfileById({
        id: user._id,
        profileData: {
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim(),
          email: formData.email.trim(),
          currentPassword: formData.currentPassword.trim(),
          // Only include confirmPassword if user wants to change password
          confirmPassword: formData.newPassword ? formData.confirmPassword.trim() : "",
        },
      });

      if (!response.success) {
        setFormErrors({ ...formErrors, generalError: response.message });
      } else {
        toast.success("Profile updated successfully.");
        dispatch(updateUser({
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim(),
          email: formData.email.trim(),
        }));
        setShowEditDialog(false);
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      dispatch(updateUser(previousUserData));
      setFormErrors({ ...formErrors, generalError: "Something went wrong. Please try again." });
    } finally {
      saveBtnRef.current.innerText = "Save Changes";
      saveBtnRef.current.disabled = false;
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    // Clear all Redux stores
    dispatch(clearAuth());
    dispatch(clearUser());
    dispatch(clearCart());
    dispatch(clearWishlist());
    setShowLogoutDialog(false);
    navigate("/auth/login");
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setFormErrors({
      emailError: "",
      currentPasswordError: "",
      passwordError: "",
      generalError: "",
    });
  };

  const getTimeAgo = (date) => {
    return `Member since ${new Date(date).toLocaleString("en-US", { month: "long", year: "numeric" })}`;
  };

  console.log(user);
  if (!user || !user._id) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const wishlist = wishlistItems || [];

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toFixed(2)}`;
  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-[#333] leading-[1.6] overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-7xl mt-20 mb-[20px] mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8 border border-gray-200">
          <div className="flex items-center justify-between max-md:flex-col max-md:items-start">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user.firstname ? user.firstname[0].toUpperCase() : "U"}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-800">{user.firstname} {user.lastname}</h1>
                <p className="text-gray-600 text-base">{user.email}</p>
                <p className="text-gray-500 text-sm mt-1">{getTimeAgo(user.createdAt)}</p>
              </div>
            </div>
            <div className="flex gap-3 max-md:mt-4">
              <button
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
                onClick={() => setShowEditDialog(true)}
              >
                <i className="fas fa-edit mr-2"></i>
                Edit Profile
              </button>
              <button
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{analytics.totalOrders}</p>
                  <p className="text-green-600 text-xs mt-2 font-medium">{analytics.deliveredOrders} delivered</p>
                </div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-800">{formatCurrency(analytics.totalSpent)}</p>
                  <p className="text-gray-600 text-xs mt-2 font-medium">Avg: {formatCurrency(analytics.averageOrderValue)}</p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Books Purchased</p>
                  <p className="text-3xl font-bold text-gray-800">{analytics.totalItemsPurchased}</p>
                  <p className="text-blue-600 text-xs mt-2 font-medium">{analytics.pendingOrders} pending</p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Wishlist Items</p>
                  <p className="text-3xl font-bold text-gray-800">{analytics.wishlistCount}</p>
                  <p className="text-pink-600 text-xs mt-2 font-medium">Saved for later</p>
                </div>
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-2">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'wishlist'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Wishlist ({wishlist.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Favorite Genres */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Favorite Genres
                  </h3>
                  {analytics.favoriteGenres && analytics.favoriteGenres.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.favoriteGenres.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium capitalize">{item._id}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(item.count / analytics.favoriteGenres[0].count) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-purple-600 font-bold text-sm w-8">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No genre data available</p>
                  )}
                </div>

                {/* Monthly Spending */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    Spending Trends
                  </h3>
                  {analytics.monthlySpending && analytics.monthlySpending.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.monthlySpending.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-medium">{formatMonth(item.month)}</span>
                          <span className="text-green-600 font-bold">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No spending data available</p>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Activity
                </h3>
                {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-gray-700 font-medium">
                              {activity.books && activity.books.length > 0 ? (
                                activity.books.length === 1 ? activity.books[0] : `${activity.books[0]} +${activity.books.length - 1} more`
                              ) : (
                                `${activity.itemCount} item(s)`
                              )}
                            </span>
                          </div>
                          <span className="text-gray-500 text-xs ml-4">
                            {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-blue-600 font-bold">{formatCurrency(activity.total)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            activity.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Your Orders
              </h3>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders
                    .filter((order) => order.book)
                    .map((order) => (
                      <div
                        key={order._id}
                        className="flex gap-6 bg-gradient-to-r from-white to-purple-50 rounded-xl shadow-md p-6 border border-purple-100 hover:shadow-xl transition-all duration-300 hover:border-purple-300 max-md:flex-col"
                      >
                        <img
                          src={order.book.image || "https://m.media-amazon.com/images/I/61R+Cpm+HxL._SL1000_.jpg"}
                          alt={order.book.title}
                          className="w-32 h-44 object-cover rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => navigate(`/buyer/product-detail/${order.book._id}`)}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-xl font-bold text-purple-700 hover:text-purple-900 cursor-pointer" onClick={() => navigate(`/buyer/product-detail/${order.book._id}`)}>
                              {order.book.title}
                            </h4>
                            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                              order.delivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.delivered ? "Delivered" : "Pending"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 font-medium">Author:</span>
                              <span className="ml-2 text-gray-800">{order.book.author}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Genre:</span>
                              <span className="ml-2 text-gray-800">{order.book.genre}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Price:</span>
                              <span className="ml-2 text-purple-600 font-bold">₹{order.book.price || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Quantity:</span>
                              <span className="ml-2 text-gray-800">{order.quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Order Date:</span>
                              <span className="ml-2 text-gray-800">
                                {new Date(order.orderDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                          {order.book.description && (
                            <p className="mt-3 text-sm text-gray-600 line-clamp-2">{order.book.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No orders yet</p>
                  <button
                    onClick={() => navigate('/buyer/dashboard')}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Your Wishlist
              </h3>
              {wishlist && wishlist.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {wishlist.map((book, idx) => (
                    <div
                      key={book._id + idx}
                      className="bg-white rounded-xl shadow-md p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-pink-100 cursor-pointer"
                      onClick={() => navigate(`/buyer/product-detail/${book._id}`)}
                    >
                      <img
                        src={book.image || "https://m.media-amazon.com/images/I/61R+Cpm+HxL._SL1000_.jpg"}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <h4 className="text-purple-700 font-semibold text-sm mb-1 line-clamp-2">{book.title}</h4>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-1">{book.author}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-pink-600 font-bold text-sm">₹{book.price || 0}</p>
                        <button className="text-pink-600 hover:text-pink-700">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-gray-500 text-lg">Your wishlist is empty</p>
                  <button
                    onClick={() => navigate('/buyer/dashboard')}
                    className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Discover Books
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {showEditDialog && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-[100] p-4"
          onClick={closeEditDialog}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={closeEditDialog}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Form */}
              <form
                id="updateProfileForm"
                className="space-y-4"
                onSubmit={handleSubmit}
              >
                <div>
                  <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  {formErrors.emailError && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.emailError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  {formErrors.currentPasswordError && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.currentPasswordError}
                    </p>
                  )}
                </div>


                {/* Change Password Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Change Password (Optional)
                  </p>                  
                  <div className="space-y-3">

                    <div>
                      <label htmlFor="newPassword" className="block text-sm text-gray-600 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm text-gray-600 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {formErrors.passwordError && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.passwordError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* General Error */}
                {formErrors.generalError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {formErrors.generalError}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditDialog}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    ref={saveBtnRef}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default BuyerProfile;  