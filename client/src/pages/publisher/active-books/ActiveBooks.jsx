// client/src/pages/publisher/active-books/ActiveBooks.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { getDashboard, softDeleteBook } from "../../../services/publisher.services";
import PublisherNavbar from "../components/PublisherNavbar";
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

const ActiveBooks = () => {
  const [user, setUser] = useState({ firstname: "", lastname: "" });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBookId, setHoveredBookId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      if (response.success) {
        setUser(response.data.publisher);
        setBooks(response.data.books);
      }
    } catch (err) {
      console.error("Failed to load books:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (book, e) => {
    e?.stopPropagation();
    navigate(`/publisher/edit-book/${book._id}`, { state: { book } });
  };

  const handleDeleteClick = (book, e) => {
    e?.stopPropagation();
    setSelectedBook(book);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedBook) return;

    try {
      setActionLoading(true);
      setShowDeleteDialog(false);
      await softDeleteBook(selectedBook._id);
      setBooks(prevBooks => prevBooks.filter(b => b._id !== selectedBook._id));
      toast.success("Book deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete book");
    } finally {
      setActionLoading(false);
      setSelectedBook(null);
    }
  };

  const handleViewBook = (bookId) => {
    navigate(`/publisher/view-book/${bookId}`);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <PublisherNavbar publisherName={`${user.firstname} ${user.lastname}`} />
        <div className="pt-16 flex items-center justify-center h-screen">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
            <p className="text-gray-600">Loading books...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Active Books</h1>
              <p className="text-gray-600 mt-1">{books.length} books in your inventory</p>
            </div>
            <Link
              to="/publisher/publish-book"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Publish New Book
            </Link>
          </div>

          {/* Books Grid */}
          {books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  onMouseEnter={() => setHoveredBookId(book._id)}
                  onMouseLeave={() => setHoveredBookId(null)}
                >
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-[300px] object-contain bg-white p-2"
                    />
                    
                    {/* Hover Actions */}
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm transition-opacity duration-200 cursor-pointer ${
                        hoveredBookId === book._id ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                      onClick={() => handleViewBook(book._id)}
                    >
                      <button
                        onClick={(e) => handleEditClick(book, e)}
                        className="flex items-center gap-2 bg-white text-purple-600 rounded-lg px-5 py-2.5 shadow-lg hover:bg-purple-50 hover:scale-105 transition-all duration-200"
                      >
                        <i className="fas fa-edit"></i>
                        <span className="font-medium">Edit Book</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(book, e)}
                        className="flex items-center gap-2 bg-white text-red-600 rounded-lg px-5 py-2.5 shadow-lg hover:bg-red-50 hover:scale-105 transition-all duration-200"
                        disabled={actionLoading}
                      >
                        <i className="fas fa-trash"></i>
                        <span className="font-medium">Delete Book</span>
                      </button>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-4 cursor-pointer" onClick={() => handleViewBook(book._id)}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-purple-600">₹{book.price}</span>
                      <div>
                        {book.quantity === 0 ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-red-200">
                            <i className="fas fa-times-circle"></i>
                            Out of Stock
                          </span>
                        ) : book.quantity <= 5 ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-200">
                            <i className="fas fa-exclamation-triangle"></i>
                            Low Stock: {book.quantity}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-green-200">
                            <i className="fas fa-check-circle"></i>
                            Stock: {book.quantity}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                    
                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                        {book.genre}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-book text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No active books</h3>
              <p className="text-gray-500 mb-6">Start by publishing your first book</p>
              <Link
                to="/publisher/publish-book"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <i className="fas fa-plus"></i>
                Publish New Book
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedBook?.title}"? This will soft-delete the book and update buyers' availability/cart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActiveBooks;
