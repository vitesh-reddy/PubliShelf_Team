//client/src/pages/buyer/auction/AuctionItemDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuctionItemDetail } from "../../../services/antiqueBook.services.js";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Countdown = ({ target, status }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const targetDate = new Date(target);
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft(status === "Ended" ? "Auction Ended" : "Awaiting Start");
        return true;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      return false;
    };

    if (calculateTimeLeft()) return;
    const intervalId = setInterval(() => {
      if (calculateTimeLeft()) clearInterval(intervalId);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [target, status]);

  return <span className="font-semibold">{timeLeft}</span>;
};

const AuctionItemDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAuctionItem();
  }, [id]);

  const fetchAuctionItem = async () => {
    try {
      setLoading(true);
      const response = await getAuctionItemDetail(id);
      if (response.success) {
        setBook(response.data.book);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to fetch auction item");
    } finally {
      setLoading(false);
    }
  };

  const getAuctionStatus = () => {
    if (!book) return "Upcoming";
    const now = new Date();
    if (now < new Date(book.auctionStart)) return "Upcoming";
    if (now > new Date(book.auctionEnd)) return "Ended";
    return "Active";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!book) return <div className="min-h-screen flex items-center justify-center">Auction item not found</div>;

  const status = getAuctionStatus();

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
                  <Link to="/buyer/auction-page" className="text-gray-700 hover:text-purple-600">
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
                    className="mx-auto w-[70%] h-[500px] object-contain transform transition-transform duration-500 hover:scale-101"
                  />
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{book.title}</h1>
                  <p className="text-base md:text-lg text-gray-600 mt-1">{book.author}</p>
                  <p className="text-gray-600 text-sm">Genre: {book.genre}</p>
                  <p className="text-gray-600 text-sm">Condition: {book.condition}</p>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <span
                    className={`font-medium ${
                      status === "Active"
                        ? "text-green-600"
                        : status === "Ended"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {status} Auction
                  </span>
                  {status !== "Ended" ? (
                    <span className="text-gray-600">
                      Ends in: <Countdown target={book.auctionEnd} status={status} />
                    </span>
                  ) : (
                    <span className="text-gray-600">Auction Ended</span>
                  )}
                </div>

                <div className="border-y border-gray-300 py-3">
                  <div className="flex items-baseline space-x-4">
                    <div>
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{book.currentPrice || book.basePrice}
                      </span>
                      <p className="text-gray-600 text-xs">Current Bid</p>
                    </div>
                    <div>
                      <span className="text-lg text-gray-600">₹{book.basePrice}</span>
                      <p className="text-gray-600 text-xs">Base Price</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Description</h3>
                  <p className="text-gray-600 text-sm">{book.description}</p>
                </div>

                <button
                  onClick={() => (window.location.href = `/buyer/auction-ongoing/${book._id}`)}
                  className={`w-full bg-purple-600 text-white px-4 py-2 rounded-lg ${
                    status === "Active" ? "hover:bg-purple-700" : "opacity-50 cursor-not-allowed"
                  } transition-colors flex items-center justify-center space-x-2 text-sm`}
                  disabled={status !== "Active"}
                >
                  <i className="fas fa-gavel"></i>
                  <span>Join Auction</span>
                </button>
              </div>
            </div>
          </div>

          {/* T&C Modal */ }
          {/* <div
            id="tnc-modal"
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center hidden z-50"
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Terms and Conditions</h3>
                <button id="tnc-modal-close" className="text-gray-600 hover:text-gray-900">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="text-gray-600 text-sm space-y-4">
                <p><strong>Last Updated: May 06, 2025</strong></p>
                <p>Welcome to PubliShelf, an online platform for auctioning antique and rare books. By accessing or using our website and services, you agree to be bound by the following Terms and Conditions ("Terms"). If you do not agree, please do not use our services.</p>
                <h4 className="font-semibold">1. Definitions</h4>
                <ul className="list-disc list-inside">
                  <li>"PubliShelf" refers to the online auction platform operated by [Your Company Name].</li>
                  <li>"User" refers to any individual or entity accessing the platform, including buyers and sellers.</li>
                  <li>"Auction" refers to the online bidding process for antique books listed on PubliShelf.</li>
                  <li>"Item" refers to an antique book or related material listed for auction.</li>
                </ul>
                <h4 className="font-semibold">2. Eligibility</h4>
                <p>Users must be at least 18 years old and legally capable of entering contracts. You must register an account with accurate information to participate in auctions. PubliShelf reserves the right to suspend or terminate accounts for non-compliance.</p>
                <h4 className="font-semibold">3. Auction Process</h4>
                <ul className="list-disc list-inside">
                  <li><strong>Bidding</strong>: Bids are binding commitments to purchase the item at the bid price if you are the highest bidder at auction close.</li>
                  <li><strong>Minimum Bid Increment</strong>: Bids must meet or exceed the minimum increment specified for each auction (e.g., ₹100).</li>
                  <li><strong>Auction Duration</strong>: Auctions run from the listed start to end times. PubliShelf may extend auctions in cases of technical issues.</li>
                  <li><strong>Winning Bids</strong>: The highest bidder at auction close is obligated to complete the purchase, subject to payment and verification.</li>
                  <li><strong>No Bid Manipulation</strong>: Users may not engage in shill bidding or other manipulative practices.</li>
                </ul>
                <h4 className="font-semibold">4. Payments</h4>
                <p>Winning bidders must pay the final bid amount plus applicable fees (e.g., taxes, shipping) within 48 hours of auction close. Payments are processed via secure third-party providers. PubliShelf does not store payment information. Failure to pay may result in account suspension and forfeiture of the item.</p>
                <h4 className="font-semibold">5. Item Authenticity</h4>
                <p>All items are accompanied by authentication documents (e.g., certificates, provenance records). PubliShelf verifies item details to the best of its ability but is not liable for errors in third-party authentication. Buyers may request additional verification within 7 days of receipt, subject to our return policy.</p>
                <h4 className="font-semibold">6. Returns and Disputes</h4>
                <p>Returns are accepted within 14 days if the item is significantly not as described or inauthentic, subject to verification. Buyers must contact support@publishelf.com to initiate returns. Disputes are resolved through mediation; PubliShelf’s decision is final.</p>
                <h4 className="font-semibold">7. User Conduct</h4>
                <p>Users must not:</p>
                <ul className="list-disc list-inside">
                  <li>Post false, misleading, or offensive content.</li>
                  <li>Interfere with the platform’s functionality or other users’ experiences.</li>
                  <li>Use PubliShelf for illegal activities.</li>
                </ul>
                <p>PubliShelf may remove content or suspend users violating these rules.</p>
                <h4 className="font-semibold">8. Intellectual Property</h4>
                <p>All content on PubliShelf (e.g., text, images, logos) is owned by or licensed to PubliShelf. Users may not reproduce, distribute, or modify content without permission.</p>
                <h4 className="font-semibold">9. Liability</h4>
                <p>PubliShelf is not liable for:</p>
                <ul className="list-disc list-inside">
                  <li>Losses due to technical failures, including bid submission errors.</li>
                  <li>Inaccuracies in item descriptions provided by sellers.</li>
                  <li>Damages arising from third-party services (e.g., shipping).</li>
                </ul>
                <p>Services are provided "as is" without warranties beyond those expressly stated.</p>
                <h4 className="font-semibold">10. Privacy</h4>
                <p>User data is handled per our Privacy Policy (available via the footer link). By using PubliShelf, you consent to data collection and use as described.</p>
                <h4 className="font-semibold">11. Termination</h4>
                <p>PubliShelf may terminate access for any user violating these Terms. Users may close their accounts by contacting support@publishelf.com.</p>
                <h4 className="font-semibold">12. Governing Law</h4>
                <p>These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts in [Your City].</p>
                <h4 className="font-semibold">13. Changes to Terms</h4>
                <p>PubliShelf may update these Terms at any time. Changes are effective upon posting. Continued use after changes constitutes acceptance.</p>
                <p><strong>Contact Us</strong><br />For questions, contact us at support@publishelf.com or [Your Address].</p>
              </div>
            </div>
          </div> */}

          {/* Privacy Modal */}
          {/* <div
            id="privacy-modal"
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center hidden z-50"
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Privacy Policy</h3>
                <button id="privacy-modal-close" className="text-gray-600 hover:text-gray-900">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="text-gray-600 text-sm space-y-4">
                <p><strong>Last Updated: May 06, 2025</strong></p>
                <p>This is a placeholder Privacy Policy for PubliShelf. For the full policy, please contact support@publishelf.com.</p>
                <p>We collect personal information such as your name, email, and payment details to facilitate auctions and account management. Your data is protected with industry-standard security measures and is not shared with third parties except as required for service delivery (e.g., payment processing, shipping).</p>
                <p>You have the right to access, update, or delete your data by contacting us. We use cookies to enhance your experience, and you can manage preferences via your browser settings.</p>
                <p>For detailed information, please reach out to support@publishelf.com.</p>
              </div>
            </div>
          </div>  */}
        </div>
      </div>


      <Footer />
    </div>
  )
};

export default AuctionItemDetail;