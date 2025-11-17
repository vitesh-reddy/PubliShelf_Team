import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { getPlatformAnalytics } from '../../../services/admin.services';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.user);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getPlatformAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar adminName={user?.name} isSuperAdmin={user?.isSuperAdmin} />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar adminName={user?.name} isSuperAdmin={user?.isSuperAdmin} />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-circle text-4xl text-purple-600 mb-4"></i>
            <p className="text-gray-600">{error}</p>
            <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Managers',
      value: analytics?.managers || 0,
      icon: 'fa-users-cog',
      color: 'purple',
      subtitle: 'Active managers'
    },
    {
      title: 'Total Publishers',
      value: analytics?.publishers || 0,
      icon: 'fa-building',
      color: 'indigo',
      subtitle: 'Verified publishers'
    },
    {
      title: 'Total Buyers',
      value: analytics?.buyers || 0,
      icon: 'fa-user',
      color: 'blue',
      subtitle: 'Registered buyers'
    },
    {
      title: 'Total Books',
      value: analytics?.books || 0,
      icon: 'fa-book',
      color: 'green',
      subtitle: 'Available in catalog'
    },
    {
      title: 'Total Orders',
      value: analytics?.orders || 0,
      icon: 'fa-shopping-bag',
      color: 'orange',
      subtitle: `₹${analytics?.ordersRevenue?.toLocaleString() || 0} revenue`
    }
  ];

  const colorClasses = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar adminName={user?.name} isSuperAdmin={user?.isSuperAdmin} />
      
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className={`text-2xl font-bold ${colorClasses[card.color].text} mt-1`}>
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  </div>
                  <div className={`${colorClasses[card.color].bg} rounded-full p-3`}>
                    <i className={`fas ${card.icon} ${colorClasses[card.color].text} text-xl`}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Overview</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                  <span className="text-gray-700 font-medium">Managers</span>
                  <span className="font-bold text-purple-600">{analytics?.managers || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                  <span className="text-gray-700 font-medium">Publishers</span>
                  <span className="font-bold text-indigo-600">{analytics?.publishers || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                  <span className="text-gray-700 font-medium">Buyers</span>
                  <span className="font-bold text-blue-600">{analytics?.buyers || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <span className="text-gray-700 font-medium">Books</span>
                  <span className="font-bold text-green-600">{analytics?.books || 0}</span>
                </div>
                <button 
                  onClick={() => navigate('/admin/managers')}
                  className="w-full mt-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-[550] rounded-lg transition-colors"
                >
                  Manage Managers
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/admin/managers')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left border border-gray-100"
                >
                  <span className="flex items-center">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <i className="fas fa-user-check text-purple-600"></i>
                    </div>
                    <span className="font-medium text-gray-900">Review Pending Managers</span>
                  </span>
                  <i className="fas fa-arrow-right text-gray-400"></i>
                </button>
                <button 
                  onClick={() => navigate('/admin/settings')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left border border-gray-100"
                >
                  <span className="flex items-center">
                    <div className="bg-indigo-100 rounded-full p-2 mr-3">
                      <i className="fas fa-cog text-indigo-600"></i>
                    </div>
                    <span className="font-medium text-gray-900">Platform Settings</span>
                  </span>
                  <i className="fas fa-arrow-right text-gray-400"></i>
                </button>
                {user?.isSuperAdmin && (
                  <button 
                    onClick={() => navigate('/admin/settings?tab=team')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left border border-gray-100"
                  >
                    <span className="flex items-center">
                      <div className="bg-orange-100 rounded-full p-2 mr-3">
                        <i className="fas fa-users-cog text-orange-600"></i>
                      </div>
                      <span className="font-medium text-gray-900">Manage Admin Team</span>
                    </span>
                    <i className="fas fa-arrow-right text-gray-400"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Last Login</p>
                <p className="font-medium text-gray-900">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Account Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Role</p>
                <p className="font-medium text-purple-600">
                  {user?.isSuperAdmin ? 'Super Admin' : 'Admin'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
