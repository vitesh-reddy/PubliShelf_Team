// client/src/pages/publisher/auctions/Auctions.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../../services/publisher.services";
import PublisherNavbar from "../components/PublisherNavbar";

const Auctions = () => {
  const [user, setUser] = useState({ firstname: "", lastname: "" });
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      if (response.success) {
        setUser(response.data.publisher);
        setAuctions(response.data.auctions || []);
      }
    } catch (err) {
      console.error("Failed to load auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAuctionStatus = (auction) => {
    const now = new Date();
    const start = new Date(auction.auctionStart);
    const end = new Date(auction.auctionEnd);

    if (now < start) return { status: 'upcoming', label: 'Upcoming', color: 'blue' };
    if (now > end) return { status: 'ended', label: 'Ended', color: 'gray' };
    return { status: 'active', label: 'Active', color: 'green' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <PublisherNavbar publisherName={`${user.firstname} ${user.lastname}`} />
        <div className="pt-16 flex items-center justify-center h-screen">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
            <p className="text-gray-600">Loading auctions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <PublisherNavbar publisherName={`${user.firstname} ${user.lastname}`} />

      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Antique Book Auctions</h1>
              <p className="text-gray-600 mt-1">{auctions.length} auctions listed</p>
            </div>
            <Link
              to="/publisher/sell-antique"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <i className="fas fa-gavel"></i>
              Start New Auction
            </Link>
          </div>

          {/* Auctions List */}
          {auctions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {auctions.map((auction) => {
                const auctionStatus = getAuctionStatus(auction);
                
                return (
                  <div
                    key={auction._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-6 p-6">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            src={auction.image}
                            alt={auction.title}
                            className="w-40 h-56 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2">
                            <span className={`bg-${auctionStatus.color}-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg`}>
                              {auctionStatus.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{auction.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">by {auction.author}</p>
                        
                        {/* Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <i className="fas fa-tag text-purple-600 w-4"></i>
                            <span className="text-gray-600">Genre:</span>
                            <span className="font-medium text-gray-900">{auction.genre}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <i className="fas fa-certificate text-purple-600 w-4"></i>
                            <span className="text-gray-600">Condition:</span>
                            <span className="font-medium text-gray-900 capitalize">{auction.condition}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <i className="fas fa-rupee-sign text-purple-600 w-4"></i>
                            <span className="text-gray-600">Base Price:</span>
                            <span className="font-bold text-purple-600 text-lg">₹{auction.basePrice}</span>
                          </div>

                          {auction.bids && auction.bids.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <i className="fas fa-gavel text-indigo-600 w-4"></i>
                              <span className="text-gray-600">Current Bid:</span>
                              <span className="font-bold text-indigo-600 text-lg">
                                ₹{auction.bids[auction.bids.length - 1].amount}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <i className="fas fa-users text-purple-600 w-4"></i>
                            <span className="text-gray-600">Total Bids:</span>
                            <span className="font-medium text-gray-900">{auction.bids?.length || 0}</span>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="border-t border-gray-200 pt-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <i className="fas fa-clock"></i>
                            <span>Start: {formatDate(auction.auctionStart)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <i className="fas fa-flag-checkered"></i>
                            <span>End: {formatDate(auction.auctionEnd)}</span>
                          </div>
                        </div>

                        {/* Recent Bids */}
                        {auction.bids && auction.bids.length > 0 && (
                          <div className="mt-4 border-t border-gray-200 pt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Recent Bids:</p>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {auction.bids.slice(-3).reverse().map((bid, index) => (
                                <div key={index} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded">
                                  <span className="text-gray-600">Bidder {auction.bids.length - index}</span>
                                  <span className="font-semibold text-indigo-600">₹{bid.amount}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-gavel text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No auctions yet</h3>
              <p className="text-gray-500 mb-6">Start your first antique book auction</p>
              <Link
                to="/publisher/sell-antique"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <i className="fas fa-gavel"></i>
                Start New Auction
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auctions;
