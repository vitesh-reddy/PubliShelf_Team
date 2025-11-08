//client/src/pages/publisher/publish-book/PublishBook.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { publishBook } from "../../../services/publisher.services.js";

const PublishBook = () => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    genre: "",
    price: "",
    quantity: "",
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field on input
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setShowImagePreview(true);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, imageFile: "" }));
    } else {
      setShowImagePreview(false);
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // 🧠 Regex patterns
    const nonNumericRegex = /[^\d]/u; // contains at least one non-digit (Unicode safe)
    const validTextRegex = /^[\p{L}\p{N}\p{P}\p{Zs}]+$/u; // allows Unicode letters, numbers, punctuation, and spaces

    // ✅ Helper: text validation
    const validateText = (value, field, minLength, label) => {
      const trimmed = value.trim();
      if (!trimmed) {
        newErrors[field] = `${label} is required.`;
        return false;
      }
      if (trimmed.length < minLength) {
        newErrors[field] = `${label} must be at least ${minLength} characters long.`;
        return false;
      }
      if (!validTextRegex.test(trimmed)) {
        newErrors[field] = `${label} contains invalid characters.`;
        return false;
      }
      if (!nonNumericRegex.test(trimmed)) {
        newErrors[field] = `${label} cannot be only numbers.`;
        return false;
      }
      return true;
    };

    // 🧾 Title
    if (!validateText(formData.title, "title", 3, "Book title")) isValid = false;

    // 🧑 Author
    if (!validateText(formData.author, "author", 3, "Author name")) isValid = false;

    // 📝 Description
    if (!validateText(formData.description, "description", 10, "Description")) isValid = false;

    // 🏷️ Genre
    if (!formData.genre) {
      newErrors.genre = "Please select a genre.";
      isValid = false;
    }

    // 💰 Price
    const price = Number(formData.price);
    if (!formData.price?.toString().trim()) {
      newErrors.price = "Price is required.";
      isValid = false;
    } else if (isNaN(price) || price <= 0) {
      newErrors.price = "Price must be a valid number greater than zero.";
      isValid = false;
    } else if (price > 100000) {
      newErrors.price = "Price seems unusually high (max ₹100,000).";
      isValid = false;
    }

    // 📦 Quantity
    const quantity = Number(formData.quantity);
    if (!formData.quantity?.toString().trim()) {
      newErrors.quantity = "Quantity is required.";
      isValid = false;
    } else if (isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = "Quantity must be at least 1.";
      isValid = false;
    } else if (quantity > 10000) {
      newErrors.quantity = "Quantity cannot exceed 10,000.";
      isValid = false;
    }

    // 🖼️ Image File
    if (!formData.imageFile) {
      newErrors.imageFile = "Please upload a cover image.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "imageFile" && formData[key]) {
        submitData.append(key, formData[key]);
      } else if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    try {
      setLoading(true);
      const response = await publishBook(submitData);
      if (response.success) {
        toast.success("Book published successfully!");
        navigate(response.redirect || "/publisher/dashboard");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Error publishing book:", error);
      toast.error("An error occurred while publishing the book.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Publish New Book</h1>
            <p className="text-gray-500 mt-1">Fill in the details to list your book for sale</p>
          </div>

          <form id="publishBookForm" className="p-6 space-y-6 animate-fade-in" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-700">
                  Book Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="bookTitle"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 px-2 py-2 block w-full shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none
 rounded-lg border-gray-300 ${
                    errors.title ? "border-red-500" : ""
                  }`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 error-msg">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  id="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 px-2 py-2 block w-full rounded-lg border-gray-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none
 ${
                    errors.author ? "border-red-500" : ""
                  }`}
                />
                {errors.author && <p className="text-red-500 text-xs mt-1 error-msg">{errors.author}</p>}
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
                value={formData.description}
                onChange={handleInputChange}
                required
                className={`mt-1 px-2 py-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none hover:shadow-md  ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1 error-msg">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                  Genre
                </label>
                <select
                  name="genre"
                  id="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                  className={`bg-white mt-1 px-2 py-2 block w-full rounded-lg border-gray-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none
 ${
                    errors.genre ? "border-red-500" : ""
                  }`}
                >
                  <option value="" hidden disabled>Select Genre</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Other">Other</option>
                </select>
                {errors.genre && <p className="text-red-500 text-xs mt-1 error-msg">{errors.genre}</p>}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="1"
                  min="0"
                  required
                  className={`block w-full rounded-lg border-gray-300 shadow-sm mt-1 px-2 py-2 hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none
 ${
                    errors.price ? "border-red-500" : ""
                  }`}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1 error-msg">{errors.price}</p>}
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 px-2 py-2 block w-full rounded-lg border-gray-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none
 ${
                    errors.quantity ? "border-red-500" : ""
                  }`}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1 error-msg">{errors.quantity}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Book Cover Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
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
                        onChange={handleImageChange}
                        className="sr-only"
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              <div id="imagePreviewContainer" className={`mt-4 ${showImagePreview ? "" : "hidden"}`}>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Image Preview:</h4>
                <img
                  id="imagePreview"
                  src={imagePreview}
                  alt="Uploaded Image Preview"
                  className="w-48 h-64 object-cover rounded-lg shadow-md"
                />
              </div>
              {errors.imageFile && <p className="text-red-500 text-xs mt-1 error-msg">{errors.imageFile}</p>}
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
                disabled={loading}
                className={`text-white rounded-lg px-4 py-2 bg-purple-600 hover:bg-purple-700 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Publishing..." : "Publish Book"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublishBook;