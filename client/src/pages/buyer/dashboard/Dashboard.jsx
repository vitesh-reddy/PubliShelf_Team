//client/src/pages/buyer/dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../../../services/buyer.services.js";
import BookCard from "./components/BookCard.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const Dashboard = () => {
  const [data, setData] = useState({ newlyBooks: [], mostSoldBooks: [], trendingBooks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getDashboard();
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <section className="py-12 pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Newly Added Books</h2>
          <div className="book-carousel" id="topRatedCarousel">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {data.newlyBooks.map((book) => (
                <BookCard key={book._id} book={book} onClick={() => navigate(`/buyer/product-detail/${book._id}`)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Most Sold Books</h2>
          <div className="book-carousel" id="mostSoldCarousel">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {data.mostSoldBooks.map((book) => (
                <BookCard key={book._id} book={book} onClick={() => navigate(`/buyer/product-detail/${book._id}`)} showSold />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Trending Now</h2>
          <div className="book-carousel" id="trendingCarousel">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {data.trendingBooks.map((book, idx) => (
                <BookCard key={book._id} book={book} onClick={() => navigate(`/buyer/product-detail/${book._id}`)} isTrending idx={idx} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;