// client/src/pages/manager/dashboard/Dashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProfile, updateProfile } from "../../../services/manager.services";
import { logout } from "../../../services/auth.services";
import { clearAuth } from "../../../store/slices/authSlice";
import { clearUser } from "../../../store/slices/userSlice";
import ManagerNavbar from "../components/ManagerNavbar";
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

// Analytics charts removed per requirement

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [user, setUser] = useState({ firstname: "", lastname: "", email: "" });
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const saveBtnRef = useRef(null);

  useEffect(() => {
    loadProfile();
    console.log("in manager dashboard useeffect");
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      if (res?.success && res?.data?.user) {
        setUser(res.data.user);
        setFormData({
          firstname: res.data.user.firstname,
          lastname: res.data.user.lastname,
          email: res.data.user.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
      if (res?.data?.analytics) {
        setAnalytics(res.data.analytics);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword) {
      setFormErrors({ currentPasswordError: "Current password is required to update profile." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormErrors({ generalError: "Please enter a valid email address." });
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setFormErrors({ passwordError: "New passwords do not match." });
        return;
      }
    }

    try {
      saveBtnRef.current.innerText = "Saving...";
      saveBtnRef.current.disabled = true;

      const res = await updateProfile(formData);
      if (res?.success) {
        setUser(res.data);
        setShowEditDialog(false);
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setFormErrors({ generalError: res?.message || "Failed to update profile" });
      }
    } catch (err) {
      setFormErrors({ generalError: err.response?.data?.message || "Failed to update profile" });
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
    dispatch(clearAuth());
    dispatch(clearUser());
    setShowLogoutDialog(false);
    navigate("/auth/login");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ManagerNavbar managerName={`${user.firstname} ${user.lastname}`} />

      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-purple-600 rounded-full w-20 h-20 flex items-center justify-center text-white text-3xl font-bold">
                  {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.firstname} {user.lastname}
                  </h1>
                  <p className="text-gray-600 mt-1">{user.email}</p>
                  <p className="text-purple-600 font-medium mt-1 flex items-center gap-2">
                    <i className="fas fa-user-shield"></i>
                    Platform Manager
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEditDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-[550] px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-edit"></i>
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 font-[550] rounded-lg transition-colors flex items-center gap-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'recent'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Recent Activity
              </button>
              {/* Analytics tab removed */}
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-8">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Books Stats - temporarily disabled */}
                {/**
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <i className="fas fa-book text-blue-600 text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Books</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">{analytics.bookStats.total}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-yellow-600">
                        <i className="fas fa-clock mr-1"></i>
                        {analytics.bookStats.pending} pending
                      </span>
                    </div>
                  </div>
                </div>
                **/}

                {/* Auctions Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 rounded-full p-3">
                      <i className="fas fa-gavel text-purple-600 text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Auctions</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">{analytics.auctionStats.total}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-yellow-600">
                        <i className="fas fa-clock mr-1"></i>
                        {analytics.auctionStats.pending} pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Publishers Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 rounded-full p-3">
                      <i className="fas fa-users text-green-600 text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Publishers</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">{analytics.publisherStats.total}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600">
                        <i className="fas fa-check mr-1"></i>
                        {analytics.publisherStats.active} active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Platform Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-indigo-100 rounded-full p-3">
                      <i className="fas fa-chart-line text-indigo-600 text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Platform</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">Active</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="fas fa-check-circle text-green-500"></i>
                      <span>All systems operational</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/**
                  <button
                    onClick={() => navigate('/manager/books/pending')}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <div className="bg-yellow-100 rounded-full p-3">
                      <i className="fas fa-clock text-yellow-600 text-xl"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Review Pending Books</p>
                      <p className="text-sm text-gray-500">{analytics.bookStats.pending} items</p>
                    </div>
                  </button>
                  **/}

                  <button
                    onClick={() => navigate('/manager/auctions/pending')}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <div className="bg-purple-100 rounded-full p-3">
                      <i className="fas fa-gavel text-purple-600 text-xl"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Review Pending Auctions</p>
                      <p className="text-sm text-gray-500">{analytics.auctionStats.pending} items</p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/manager/publishers')}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <div className="bg-green-100 rounded-full p-3">
                      <i className="fas fa-users text-green-600 text-xl"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Manage Publishers</p>
                      <p className="text-sm text-gray-500">{analytics.publisherStats.total} total</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recent' && analytics && (
            <div className="space-y-6">
              {/* Recent Books - temporarily disabled */}
              {/**
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Book Submissions</h2>
                {analytics.recentBooks && analytics.recentBooks.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentBooks.map((book) => (
                      <div key={book._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          {book.image ? (
                            <img src={book.image} alt={book.title} className="w-12 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-16 bg-purple-100 rounded flex items-center justify-center">
                              <i className="fas fa-book text-purple-600"></i>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{book.title}</p>
                            <p className="text-sm text-gray-600">by {book.author}</p>
                            <p className="text-xs text-gray-500">
                              Publisher: {book.publisher?.firstname} {book.publisher?.lastname}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">₹{book.price}</p>
                          <p className="text-sm text-gray-500">{new Date(book.publishedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent book submissions</p>
                )}
              </div>
              **/}

              {/* Recent Auctions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Auction Submissions</h2>
                {analytics.recentAuctions && analytics.recentAuctions.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentAuctions.map((auction) => (
                      <div key={auction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          {auction.itemImage ? (
                            <img src={auction.itemImage} alt={auction.itemName} className="w-12 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-16 bg-purple-100 rounded flex items-center justify-center">
                              <i className="fas fa-gavel text-purple-600"></i>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{auction.itemName}</p>
                            <p className="text-sm text-gray-600">{auction.category}</p>
                            <p className="text-xs text-gray-500">
                              Publisher: {auction.publisher?.firstname} {auction.publisher?.lastname}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">₹{auction.startingBid}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            auction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            auction.status === 'approved' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {auction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent auction submissions</p>
                )}
              </div>
            </div>
          )}

          {/* Analytics charts removed */}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-0"
                    required
                  />
                  {formErrors.currentPasswordError && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.currentPasswordError}</p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Change Password (Optional)</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-0"
                      />
                      {formErrors.passwordError && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.passwordError}</p>
                      )}
                    </div>
                  </div>
                </div>

                {formErrors.generalError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {formErrors.generalError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditDialog(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    ref={saveBtnRef}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
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
    </div>
  );
};

export default Dashboard;
