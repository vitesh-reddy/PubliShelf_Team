// client/src/pages/publisher/deleted-books/DeletedBooks.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getDashboard, restoreBook } from "../../../services/publisher.services";
import PublisherNavbar from "../components/PublisherNavbar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../components/ui/AlertDialog";

const DeletedBooks = () => {
  const [user, setUser] = useState({ firstname: "", lastname: "" });
  const [deletedBooks, setDeletedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
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
        setDeletedBooks(response.data.deletedBooks || []);
      }
    } catch (err) {
      console.error("Failed to load books:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (book, e) => {
    e?.stopPropagation();
    setSelectedBook(book);
    setShowRestoreDialog(true);
  };

  const confirmRestore = async () => {
    if (!selectedBook) return;

    try {
      setActionLoading(true);
      setShowRestoreDialog(false);
      await restoreBook(selectedBook._id);
      setDeletedBooks(prevBooks => prevBooks.filter(b => b._id !== selectedBook._id));
      toast.success("Book restored successfully!");
    } catch (err) {
      console.error("Restore error:", err);
      toast.error("Failed to restore book");
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Deleted Books</h1>
            <p className="text-gray-600 mt-1">{deletedBooks.length} deleted books</p>
          </div>

          {/* Books Grid */}
          {deletedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {deletedBooks.map((book) => (
                <div
                  key={book._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-[300px] object-contain bg-white p-2 grayscale"
                    />
                    
                    {/* Deleted Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Deleted
                      </span>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-gray-500">₹{book.price}</span>
                      <span className="text-xs text-gray-500">{book.genre}</span>
                    </div>

                    {/* Restore Button */}
                    <button
                      onClick={(e) => handleRestoreClick(book, e)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <i className="fas fa-undo"></i>
                      <span className="font-medium">Restore Book</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-trash-restore text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No deleted books</h3>
              <p className="text-gray-500">All your books are active</p>
            </div>
          )}
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{selectedBook?.title}"? This will make it available to buyers again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} className="bg-green-600 hover:bg-green-700">
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeletedBooks;
