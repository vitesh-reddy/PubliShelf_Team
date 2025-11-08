import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getBook, updateBook } from "../../../services/publisher.services";

const genreOptions = [ "Fiction", "Non-Fiction", "Mystery", "Science Fiction", "Romance", "Thriller", "Other"];

const EditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "",
    price: "",
    description: "",
    quantity: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const stateBook = location?.state?.book;
        if (stateBook) {
          setBook(stateBook);
          setForm({
            title: stateBook.title || "",
            author: stateBook.author || "",
            genre: stateBook.genre || "",
            price: stateBook.price || stateBook.basePrice || "",
            description: stateBook.description || "",
            quantity: stateBook.quantity ?? 0,
          });
          setImagePreview(stateBook.image || "");
          return;
        }
        const res = await getBook(id);
        if (res && res.success) {
          setBook(res.data);
          setForm({
            title: res.data.title || "",
            author: res.data.author || "",
            genre: res.data.genre || "",
            price: res.data.price || res.data.basePrice || "",
            description: res.data.description || "",
            quantity: res.data.quantity ?? 0,
          });
          setImagePreview(res.data.image || "");
        } else {
          toast.error(res.message || "Failed to fetch book");
          navigate("/publisher/dashboard");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch book");
        navigate("/publisher/dashboard");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFileChange = (file) => {
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Drag and drop handlers
  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files && e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("author", form.author);
      payload.append("genre", form.genre);
      payload.append("price", form.price);
      payload.append("description", form.description);
      payload.append("quantity", form.quantity);
      if (imageFile) payload.append("imageFile", imageFile);
      const res = await updateBook(id, payload);
      if (res && res.success) {
        toast.success("Book updated successfully!");
        navigate("/publisher/dashboard");
      } else {
        toast.error(res.message || "Failed to update book");
      }
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  const inputClasses =
    "mt-1 px-2 py-2 block w-full shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none rounded-lg border-gray-300";

  return (
    <div className="bg-gray-50">
      <Link to="/publisher/dashboard" className="flex items-center mb-2 py-4 px-6 shadow-sm bg-white">
        <i className="fas fa-arrow-left text-gray-600 mr-4"></i>
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
          PubliShelf
        </span>
      </Link>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl bg-white shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Book</h1>
            <p className="text-gray-500 mt-1">Update the details of your book</p>
          </div>

          <form
            id="editBookForm"
            className="p-6 space-y-6 animate-fade-in"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-700">
                  Book Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="bookTitle"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  id="author"
                  value={form.author}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                rows="4"
                name="description"
                id="description"
                value={form.description}
                onChange={handleChange}
                required
                className={inputClasses}
              />
            </div>

            {/* Genre, Price, Quantity on same line */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                  Genre
                </label>
                <select
                  name="genre"
                  id="genre"
                  value={form.genre}
                  onChange={handleChange}
                  required
                  className={`bg-white ${inputClasses}`}
                >
                  <option value="" hidden disabled>Select Genre</option>
                  {genreOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={form.price}
                  onChange={handleChange}
                  step="1"
                  min="0"
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Book Cover Image (Optional)
              </label>
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg"
              >
                <div className="space-y-1 text-center">
                  <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl"></i>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="imageFile"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-purple-600 hover:text-purple-500"
                    >
                      <span>Upload a file</span>
                      <input
                        name="imageFile"
                        id="imageFile"
                        type="file"
                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                        className="sr-only"
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Leave empty to keep the current image.
                  </p>
                </div>
              </div>
              <div id="imagePreviewContainer" className={`mt-4 ${imagePreview ? "" : "hidden"}`}>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Image Preview:</h4>
                <img
                  id="imagePreview"
                  src={imagePreview}
                  alt="Image Preview"
                  className="w-48 h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">            
            <div>
              <p className="block text-sm font-medium text-gray-900">Published Date:
              <span className=" text-gray-700 ml-1">
                {new Date(book.publishedAt).toLocaleDateString()}
              </span>
              </p>
              <p className="text-xs text-gray-500 mt-[2px]">
                Published date is not editable.
              </p>
            </div>
            <div className="flex justify-end space-x-4">

              <Link
                to="/publisher/dashboard"
                className="rounded-lg text-gray-700 hover:bg-gray-50 px-4 py-2 border border-gray-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={actionLoading}
                className={`text-white rounded-lg px-4 py-2 bg-purple-600 hover:bg-purple-700 ${
                  actionLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBookPage;