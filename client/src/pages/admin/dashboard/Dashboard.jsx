//client/src/pages/admin/dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AnalyticsCards from "./components/AnalyticsCards";
import Charts from "./components/Charts";
import PublisherTable from "./components/PublisherTable";
import ActivitiesTable from "./components/ActivitiesTable";
import { getDashboardData } from "../../../services/admin.services.js";
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

const AdminDashboard = () => {
  const [data, setData] = useState({ admin: {}, publishers: [], activities: [], analytics: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();
    const { key } = useParams();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardData(key);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || "Failed to fetch dashboard data");
      }
    } catch (err) {
      setError("An error occurred while fetching data");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setShowLogoutDialog(false);
    navigate("/auth/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <>
      {/* Navbar */}
      <nav className="fixed w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/admin/dashboard" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                  PubliShelf
                </span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{data.admin.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r hover:bg-gradient-to-l from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:-translate-y-[2px] transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

          <AnalyticsCards analytics={data.analytics} />
          <Charts analytics={data.analytics} />

          {/* Publisher Approvals */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publisher Approvals</h3>
            <PublisherTable publishers={data.publishers} onUpdate={fetchData} />
          </div>

          {/* Publisher Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Publisher Activities</h3>
            <ActivitiesTable activities={data.activities} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                PubliShelf
              </span>
              <p className="text-sm mt-2">© 2025 PubliShelf. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="/terms" className="text-gray-300 hover:text-purple-400 text-sm">Terms and Conditions</a>
              <a href="/privacy" className="text-gray-300 hover:text-purple-400 text-sm">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access the admin dashboard.
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
    </>
  );
};

export default AdminDashboard;