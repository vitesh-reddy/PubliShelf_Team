//client/src/pages/buyer/auction/AuctionPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuctionPage } from "../../../services/antiqueBook.services.js";
import { useUser } from '../../../store/hooks';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// 1. A new, reusable Countdown component using React hooks
const Countdown = ({ target, type }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const targetDate = new Date(target);
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft(type === "end" ? "Auction Ended" : "Auction Started");
        return true; // Timer finished
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      return false; // Timer still running
    };

    // Run once immediately to avoid 1-second delay
    if (calculateTimeLeft()) return; // Stop if already ended

    // Update every second
    const intervalId = setInterval(() => {
      if (calculateTimeLeft()) {
        clearInterval(intervalId); // Stop timer when it ends
      }
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [target, type]);

  // Use the same classes as the original <p> tag
  return <p className="text-sm font-semibold">{timeLeft}</p>;
};

const AuctionPage = () => {
  const user = useUser();
  const buyerName = user.firstname ? `${user.firstname} ${user.lastname || ''}`.trim() : "Buyer";
  
  const [auctions, setAuctions] = useState({ ongoingAuctions: [], futureAuctions: [], endedAuctions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await getAuctionPage();
      if (response.success) {
        setAuctions(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to fetch auctions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb - No changes */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
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
                  <span className="text-gray-500">Auctions</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Ongoing Auctions */}
          {auctions.ongoingAuctions.length > 0 && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Ongoing Auctions</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {auctions.ongoingAuctions.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease hover:translate-y-[-4px] hover:shadow-xl"
                  >
                    <div className="relative">
                      <img src={book.image} alt={book.title} className="w-full h-[260px] object-contain" />
                    </div>
                    <div className="px-4 py-2">
                      <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                      <p className="text-gray-600 text-sm">{book.author}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">Current Bid</p>
                          <p className="text-lg font-bold text-purple-600">
                            ₹{book.currentPrice || book.basePrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Ends in</p>
                          {/* 4. Replaced empty <p> with Countdown component */}
                          <Countdown target={book.auctionEnd} type="end" />
                        </div>
                      </div>
                      <button
                        onClick={() => (window.location.href = `/buyer/auction-item-detail/${book._id}`)}
                        className="mt-4 mb-1 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        View Auction
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Future Auctions */}
          {auctions.futureAuctions.length > 0 && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-8">Upcoming Auctions</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {auctions.futureAuctions.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease hover:translate-y-[-4px] hover:shadow-xl"
                  >
                    <div className="relative">
                      <img src={book.image} alt={book.title} className="w-full h-[260px] object-contain" />
                    </div>
                    <div className="px-4 py-2">
                      <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                      <p className="text-gray-600 text-sm">{book.author}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">Starting Bid</p>
                          <p className="text-lg font-bold text-purple-600">₹{book.basePrice}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Starts in</p>
                          {/* 4. Replaced empty <p> with Countdown component */}
                          <Countdown target={book.auctionStart} type="start" />
                        </div>
                      </div>
                      <button
                        onClick={() => (window.location.href = `/buyer/auction-item-detail/${book._id}`)}
                        className="mt-4 mb-1 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Ended Auctions - No changes needed */}
          {auctions.endedAuctions.length > 0 && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-8">Past Auctions</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {auctions.endedAuctions.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease hover:translate-y-[-4px] hover:shadow-xl"
                  >
                    <div className="relative">
                      <img src={book.image} alt={book.title} className="w-full h-[260px] object-contain" />
                    </div>
                    <div className="px-4 py-2">
                      <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                      <p className="text-gray-600 text-sm">{book.author}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">Final Price</p>
                          <p className="text-lg font-bold text-purple-600">
                            ₹{book.currentPrice || "Not sold"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Status</p>
                          <p className="text-sm font-semibold">{book.currentPrice ? "Sold" : "Not sold"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => (window.location.href = `/buyer/auction-item-detail/${book._id}`)}
                        className="mt-4 mb-1 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* No Auctions - No changes */}
          {auctions.ongoingAuctions.length === 0 &&
            auctions.futureAuctions.length === 0 &&
            auctions.endedAuctions.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-book-open text-5xl text-gray-300 mb-4"></i>
                <h2 className="text-2xl font-semibold text-gray-700">No auctions available</h2>
                <p className="text-gray-500 mt-2">Check back later for new antique book auctions</p>
              </div>
            )}

        </div>
      </div>


      <Footer />
    </div>
  );
};

export default AuctionPage;