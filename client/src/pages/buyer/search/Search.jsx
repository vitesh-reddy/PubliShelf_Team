  import React, { useState, useEffect } from "react";
  import { Link, useNavigate, useSearchParams } from "react-router-dom";
  import { toast } from "sonner";
  import { searchBooks, addToWishlist, removeFromWishlist } from "../../../services/buyer.services.js";
  import BookGrid from "./components/BookGrid.jsx";
  import { useDispatch } from 'react-redux';
  import { addToWishlist as addToWishlistInStore, removeFromWishlist as removeFromWishlistInStore } from '../../../store/slices/wishlistSlice';
  import { useWishlist } from '../../../store/hooks';
  import Navbar from "../components/Navbar.jsx";
  import Footer from "../components/Footer.jsx";

  const SearchPage = () => {
    const dispatch = useDispatch();
    const { items: wishlistItems } = useWishlist();
    
    const [books, setBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentCategory, setCurrentCategory] = useState("All Books");
    const [currentPriceFilter, setCurrentPriceFilter] = useState("all");
    const [currentSort, setCurrentSort] = useState("relevance");

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q");

    const fetchBooks = async () => {
      try {
        setLoading(true);
        setAllBooks([]);
        setBooks([]);

        const response = await searchBooks(q);

        if (response.success) {
          console.log("search resbooks", response.data.books);
          const newBooks = response.data.books || [];
          setAllBooks(newBooks);
          setError("");
        } else {
          setAllBooks([]);
          setError(response.message);
        }
      } catch (err) {
        setAllBooks([]);
        setError("Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchBooks();
    }, [q]);

    useEffect(() => {
      if (allBooks.length === 0) return;
      let filtered = [...allBooks];
      if (currentCategory !== "All Books") {
        filtered = filtered.filter((b) => b.genre?.toLowerCase().includes(currentCategory.toLowerCase()));
      }
      switch (currentPriceFilter) {
        case "under500": filtered = filtered.filter((b) => (b.price || 0) < 500); break;
        case "500-1000": filtered = filtered.filter((b) => (b.price || 0) >= 500 && (b.price || 0) <= 1000); break;
        case "1000-2000": filtered = filtered.filter((b) => (b.price || 0) >= 1000 && (b.price || 0) <= 2000); break;
        case "2000-3000": filtered = filtered.filter((b) => (b.price || 0) >= 2000 && (b.price || 0) <= 3000); break;
        case "over3000": filtered = filtered.filter((b) => (b.price || 0) > 3000); break;
        default: break;
      }
      switch (currentSort) {
        case "price-asc": filtered.sort((a,b) => (a.price || 0) - (b.price || 0)); break;
        case "price-desc": filtered.sort((a,b) => (b.price || 0) - (a.price || 0)); break;
        case "rating-asc": filtered.sort((a,b) => (a.rating || 0) - (b.rating || 0)); break;
        case "rating-desc": filtered.sort((a,b) => (b.rating || 0) - (a.rating || 0)); break;
        case "quantity-asc": filtered.sort((a,b) => (a.quantity || 0) - (b.quantity || 0)); break;
        case "quantity-desc": filtered.sort((a,b) => (b.quantity || 0) - (a.quantity || 0)); break;
        case "newest": filtered.sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt)); break;
        default: break;
      }
      setBooks(filtered);
    }, [allBooks, currentCategory, currentPriceFilter, currentSort]);

    const handleCategoryClick = (category) => setCurrentCategory(category);
    const handlePriceRangeChange = (e) => setCurrentPriceFilter(e.target.value);
    const handleSortChange = (e) => setCurrentSort(e.target.value);
    const handleResetFilters = () => {
      setCurrentCategory("All Books");
      setCurrentPriceFilter("all");
      setCurrentSort("relevance");
    };

    const handleWishlistAdd = async (bookId, e) => {
      const buttonEl = e?.currentTarget;
      const iconEl = buttonEl?.querySelector('i');
      const isAlreadyInWishlist = wishlistItems.some(item => item._id === bookId);

      if (isAlreadyInWishlist) {
        // Optimistic remove
        dispatch(removeFromWishlistInStore({ bookId }));
        if (iconEl) {
          iconEl.classList.remove('fas', 'text-red-500');
          iconEl.classList.add('far', 'text-gray-600');
        }
        try {
          const response = await removeFromWishlist(bookId);
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

      // Find the book from the books array
      const bookToAdd = books.find(b => b._id === bookId);
      if (!bookToAdd) return;

      // Optimistic add
      dispatch(addToWishlistInStore(bookToAdd));
      if (iconEl) {
        iconEl.classList.remove('far', 'text-gray-600');
        iconEl.classList.add('fas', 'text-red-500');
      }
      try {
        const response = await addToWishlist(bookId);
        if (response.success) {
          toast.success('Added to wishlist');
        } else {
          toast.error(`Failed to add to wishlist: ${response.message}`);
        }
      } catch {
        toast.error('Error adding to wishlist');
      }
    };

    const handleLogout = () => {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      navigate("/auth/login");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />

        <div className="pt-16">
          <div className="bg-white border-b border-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8 py-4">
                {["All Books", "Fiction", "Non-Fiction", "Mystery", "Science Fiction", "Romance", "Thriller", "Other"].map(category => (
                  <Link key={category} to="#" className={`${currentCategory === category ? "text-purple-600 border-b-2 border-purple-600 pb-4 -mb-4" : "text-gray-600 hover:text-purple-600"}`} onClick={(e)=>{e.preventDefault(); handleCategoryClick(category);}}>{category}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xs px-4 py-3 transition-all">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 tracking-tight">Filter & Sort Books</h2>
                <p className="text-sm text-gray-500 hidden sm:block">Refine your results by price or sort preferences</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <select value={currentSort} onChange={handleSortChange} className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition">
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Rating: High to Low</option>
                    <option value="rating-asc">Rating: Low to High</option>
                    <option value="quantity-desc">Quantity: High to Low</option>
                    <option value="quantity-asc">Quantity: Low to High</option>
                    <option value="newest">Newest First</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-[15px] text-gray-500 pointer-events-none text-xs"></i>
                </div>
                <div className="relative">
                  <select value={currentPriceFilter} onChange={handlePriceRangeChange} className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition">
                    <option value="all">All Prices</option>
                    <option value="under500">Under ₹500</option>
                    <option value="500-1000">₹500 - ₹1000</option>
                    <option value="1000-2000">₹1000 - ₹2000</option>
                    <option value="2000-3000">₹2000 - ₹3000</option>
                    <option value="over3000">Over ₹3000</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-[15px] text-gray-500 pointer-events-none text-xs"></i>
                </div>
                <button onClick={handleResetFilters} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition">
                  Reset Filters
                </button>
              </div>
            </div>

            <BookGrid books={books} onWishlistAdd={handleWishlistAdd}/>

            {/* Pagination (Commented out to match EJS) */}
            {/* <div className="flex justify-center mt-8">
              <nav className="flex space-x-2">
                <button className="px-3 py-2 rounded-lg bg-purple-600 text-white">1</button>
                <button className="px-3 py-2 rounded-lg text-gray-600 hover:bg-purple-50">2</button>
                <button className="px-3 py-2 rounded-lg text-gray-600 hover:bg-purple-50">3</button>
                <span className="px-3 py-2">...</span>
                <button className="px-3 py-2 rounded-lg text-gray-600 hover:bg-purple-50">10</button>
              </nav>
            </div> */}
          </div>
        </div>

        <Footer />
      </div>
    );
  };

  export default SearchPage;