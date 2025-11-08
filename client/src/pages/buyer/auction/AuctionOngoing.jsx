import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuctionOngoing, placeBidApi } from "../../../services/antiqueBook.services.js";
import { useUser } from '../../../store/hooks';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Reusable Countdown & Progress Component (same logic as EJS)
const CountdownProgress = ({ auctionStart, auctionEnd, isActive }) => {
  const [countdown, setCountdown] = useState("");
  const [progress, setProgress] = useState(0);
  const { name } = useUser();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(auctionEnd);
      const start = new Date(auctionStart);

      if (now >= end) {
        setCountdown("Auction Ended");
        setProgress(100);
        return;
      }

      const diff = end - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      const total = end - start;
      const elapsed = now - start;
      const prog = Math.min((elapsed / total) * 100, 100);
      setProgress(prog);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [auctionStart, auctionEnd]);

  if (!isActive) {
    return (
      <div>
        <p className={`font-medium ${isActive ? "text-green-600" : "text-red-600"}`}>
          {isActive ? "Active" : "Ended"} Auction
        </p>
        <div className="space-y-1">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Time Remaining</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className={`font-medium ${isActive ? "text-green-600" : "text-red-600"}`}>
        {isActive ? "Active" : "Ended"} Auction
        <span className="text-gray-600 ml-2"> Ends in: <span className="font-semibold">{countdown}</span> </span>
      </p>
      <div className="space-y-1">
        <div className="flex justify-between text-gray-600 text-sm">
          <span>Time Remaining</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const AuctionOngoing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useUser();
  const buyerName = user.firstname ? `${user.firstname} ${user.lastname || ''}`.trim() : "Buyer";
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [showBidModal, setShowBidModal] = useState(false);
  const [modalBidAmount, setModalBidAmount] = useState(0);
  const [formError, setFormError] = useState("");

  useEffect(() => {

    fetchAuction(true);
    const interval = setInterval(() => {
      fetchAuction(false);
    }, 1000000);

    return () => clearInterval(interval);
  }, [id]);


  const fetchAuction = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const response = await getAuctionOngoing(id);
      if (response.success) {
        setBook(response.data.book);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to fetch auction");
    } finally {
      if (showLoader) setLoading(false);
    }
  };


  const handlePlaceBid = () => {
    const current = book.currentPrice || book.basePrice;
    const minBid = current + 100;
    const bid = parseInt(bidAmount);

    if (isNaN(bid) || bid < minBid) {
      setFormError(`Bid must be at least ₹${minBid} (minimum ₹100 increment)`);
      return;
    }

    setFormError("");
    setModalBidAmount(bid);
    setShowBidModal(true);
  };

  const confirmBid = async () => {
    try {
      const response = await placeBidApi({ auctionId: id, bidAmount: modalBidAmount });
      if (response.success) {
        alert("Bid placed successfully!");
        fetchAuction();
        setShowBidModal(false);
        setBidAmount("");
      } else {
        alert(response.message);
      }
    } catch (err) {
      alert("Error placing bid");
      console.log(err.message)
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!book) return <div className="min-h-screen flex items-center justify-center">Auction not found</div>;

  const isActive = new Date() < new Date(book.auctionEnd);
  const authImages = Array.isArray(book.authenticationImage)
    ? book.authenticationImage
    : [book.authenticationImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4ebf0c?auto=format&fit=crop&q=80&w=150"];

  const sortedBids = [...(book.biddingHistory || [])].sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
  const highestBid = sortedBids.length > 0 ? Math.max(...sortedBids.map(b => b.bidAmount)) : 0;

  const getTimeAgo = (date) => {
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + (interval === 1 ? " year ago" : " years ago");
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + (interval === 1 ? " month ago" : " months ago");
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " minutes ago");
    return "Just now";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
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
                  <Link to={`/buyer/auction-item-detail/${book._id}`} className="text-gray-700 hover:text-purple-600">
                    Auctions
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
                  <span className="text-gray-500">{book.title}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={book.image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600"}
                    alt={book.title}
                    className="mx-auto w-[70%] h-[500px] object-contain transform transition-transform duration-500 hover:scale-[1.01]"
                  />
                  {isActive && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                      Live
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div
                    id="document-carousel"
                    className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth space-x-3"
                  >
                    {authImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Document ${index + 1}`}
                        className="h-24 w-24 rounded-lg object-contain snap-center cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{book.title}</h1>
                  <p className="text-base md:text-lg text-gray-600 mt-1">{book.author}</p>
                  <p className="text-gray-600 text-sm">Genre: {book.genre}</p>
                  <p className="text-gray-600 text-sm">Condition: {book.condition}</p>
                </div>

                <div className="fl space-x-3 text-sm">                  
                  <CountdownProgress auctionStart={book.auctionStart} auctionEnd={book.auctionEnd} isActive={isActive} />
                </div>

                <div className="border-y border-gray-300 py-3">
                  <div className="flex items-baseline space-x-4">
                    <div>
                      <span className="text-3xl font-bold text-gray-900" id="current-bid">
                        ₹{(book.currentPrice || book.basePrice).toLocaleString("en-IN")}
                      </span>
                      <p className="text-gray-600 text-xs">Current Bid</p>
                    </div>
                    <div>
                      <span className="text-lg text-gray-600">₹{book.basePrice.toLocaleString("en-IN")}</span>
                      <p className="text-gray-600 text-xs">Base Price</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 flex items-end gap-1">
                  <div className="relative w-full">
                    <label htmlFor="bid-amount" className="text-gray-600 text-sm">
                      Your Bid (₹)
                    </label>
                    <input
                      type="number"
                      id="bid-amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={(book.currentPrice || book.basePrice) + 100}
                      placeholder={`Enter bid (min ₹${(book.currentPrice || book.basePrice) + 100})`}
                      className="w-full px-3 py-3 mt-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={!isActive}
                    />
                    <span
                      className="absolute right-2 top-9 text-gray-400 cursor-pointer"
                      title={`Bid must be at least ₹${(book.currentPrice || book.basePrice) + 100}`}
                    >
                      <i className="fas fa-info-circle text-xs"></i>
                    </span>
                  </div>
                  <button
                    id="enter-bid"
                    onClick={handlePlaceBid}
                    disabled={!isActive}
                    className={`w-full bg-purple-600 text-white px-4 h-[45px] rounded-lg ${
                      isActive ? "hover:bg-purple-700" : "bg-gray-400 cursor-not-allowed"
                    } transition-colors flex items-center justify-center space-x-2 text-sm mb-3`}
                  >
                    <i className="fas fa-gavel"></i>
                    <span>{isActive ? "Place Bid" : "Auction Ended"}</span>
                  </button>
                </div>
                {formError && (
                  <p id="error-message" className="text-red-600 text-xs">
                    {formError}
                  </p>
                )}

                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Description</h3>
                  <p className="text-gray-600 text-sm">{book.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bidding History */}
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Bidding History</h3>
            <div className="bg-white rounded-xl shadow-lg p-5">
              {sortedBids.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-300">
                    <div>
                      <p className="text-sm text-gray-600">
                        Total Bids: <span className="font-semibold text-gray-800">{sortedBids.length}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Highest Bid: <span className="font-bold text-purple-600">₹{highestBid.toLocaleString("en-IN")}</span>
                      </p>
                    </div>
                  </div>
                  <div id="bidding-history" className="space-y-3">
                    {sortedBids.map((bid, index) => {
                      const bidder = bid.bidder || {};
                      const bidderName = bidder.firstname && bidder.lastname
                        ? `${bidder.firstname} ${bidder.lastname}`
                        : "Anonymous";
                      const isCurrentUser = (bid?.bidder?._id === user._id);
                      const bidTime = new Date(bid.bidTime);
                      const timeAgo = getTimeAgo(bidTime);

                      return (
                        <div
                          key={bid._id}
                          className={`group flex items-center justify-between border-b border-gray-300 pb-3 ${
                            index === 0 ? "bg-purple-50 rounded-md px-3 pt-2" : "px-1"
                          } hover:bg-gray-50 transition-all duration-200 ${
                            isCurrentUser ? "border-l-4 border-l-blue-400 pl-2" : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(bidderName)}&background=${
                                  isCurrentUser ? "3b82f6" : "random"
                                }&color=ffffff`}
                                alt={bidderName}
                                className="w-10 h-10 rounded-full shadow-sm"
                              />
                              {index === 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-600 rounded-full w-4 h-4 flex items-center justify-center">
                                  <span className="text-white text-xs">1</span>
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors duration-200">
                                {bidderName}
                                {isCurrentUser && <span className="text-blue-600 text-xs font-medium ml-1.5">(You)</span>}
                                {index === 0 && <span className="text-purple-600 text-xs font-semibold ml-1.5">(Top Bidder)</span>}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500">
                                <p className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {bidder.email || "N/A"}
                                </p>
                                <p className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span title={bidTime.toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}>
                                    {timeAgo}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-600 text-base group-hover:scale-110 transition-transform duration-200">
                              ₹{bid.bidAmount.toLocaleString("en-IN")}
                            </p>
                            {index === 0 && <span className="text-xs text-purple-700 font-medium">Current highest</span>}
                            {index === 1 && (
                              <span className="text-xs text-gray-500">
                                +₹{(bid.bidAmount - sortedBids[0].bidAmount).toLocaleString("en-IN")} needed to lead
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {sortedBids.length > 10 && (
                    <div className="flex justify-center mt-4">
                      <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                        Load more bids
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 mt-2">No bids yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Be the first to place a bid!</p>
                </div>
              )}
            </div>
          </div>

          {/* Bid Modal */}
          {showBidModal && (
            <div
              id="bid-modal"
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-lg p-5 w-full max-w-sm transform transition-all duration-200">
                <h3 className="text-lg font-bold text-gray-900">Confirm Bid</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Place a bid of <span id="modal-bid-amount" className="font-bold text-purple-600">₹{modalBidAmount.toLocaleString("en-IN")}</span> for {book.title}?
                </p>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    id="modal-cancel"
                    onClick={() => setShowBidModal(false)}
                    className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    id="modal-confirm"
                    onClick={confirmBid}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AuctionOngoing;