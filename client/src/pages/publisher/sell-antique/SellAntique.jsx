import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { sellAntique } from "../../../services/publisher.services.js";

const SellAntique = () => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    genre: "",
    condition: "",
    basePrice: "",
    auctionStart: "",
    auctionEnd: "",
    itemImage: null,
    authenticationImage: null,
  });
  const [imagePreview1, setImagePreview1] = useState(null);
  const [imagePreview2, setImagePreview2] = useState(null);
  const [showImagePreview1, setShowImagePreview1] = useState(false);
  const [showImagePreview2, setShowImagePreview2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();
    const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    const startInput = document.getElementById("auctionStart");
    const endInput = document.getElementById("auctionEnd");
    if (startInput) startInput.min = localISOTime;
    if (endInput) endInput.min = localISOTime;
  }, []);

  useEffect(() => {
    const start = document.getElementById("auctionStart");
    const end = document.getElementById("auctionEnd");

    if (start && end && formData.auctionStart) {
      const startDate = new Date(formData.auctionStart);
      const minEnd = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour
      const minISO = new Date(minEnd.getTime() - minEnd.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      end.min = minISO; // restrict user from choosing before +1hr
      if (formData.auctionEnd && formData.auctionEnd < minISO) {
        setFormData((prev) => ({ ...prev, auctionEnd: "" }));
      }
    }
  }, [formData.auctionStart]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleItemImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, itemImage: file });
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview1(ev.target.result);
        setShowImagePreview1(true);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, itemImage: "" }));
    } else {
      setShowImagePreview1(false);
      setImagePreview1(null);
    }
  };

  const handleAuthImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, authenticationImage: file });
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview2(ev.target.result);
        setShowImagePreview2(true);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, authenticationImage: "" }));
    } else {
      setShowImagePreview2(false);
      setImagePreview2(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // 🧠 Unicode regex patterns
    const validTextRegex = /^[\p{L}\p{N}\p{P}\p{Zs}]+$/u; // allows letters, digits, punctuation, spaces
    const nonNumericRegex = /[^\d]/u; // ensures not all digits

    // 🧾 Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Book title is required.";
      isValid = false;
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Book title must be at least 3 characters.";
      isValid = false;
    } else if (!validTextRegex.test(formData.title.trim())) {
      newErrors.title = "Book title contains invalid characters.";
      isValid = false;
    } else if (!nonNumericRegex.test(formData.title.trim())) {
      newErrors.title = "Book title cannot be only numbers.";
      isValid = false;
    }

    // 🧑 Author validation
    if (!formData.author.trim()) {
      newErrors.author = "Author name is required.";
      isValid = false;
    } else if (formData.author.trim().length < 3) {
      newErrors.author = "Author name must be at least 3 characters.";
      isValid = false;
    } else if (!validTextRegex.test(formData.author.trim())) {
      newErrors.author = "Author name contains invalid characters.";
      isValid = false;
    } else if (!nonNumericRegex.test(formData.author.trim())) {
      newErrors.author = "Author name cannot be only numbers.";
      isValid = false;
    }

    // 📝 Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
      isValid = false;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
      isValid = false;
    } else if (!validTextRegex.test(formData.description.trim())) {
      newErrors.description = "Description contains invalid characters.";
      isValid = false;
    } else if (!nonNumericRegex.test(formData.description.trim())) {
      newErrors.description = "Description cannot be only numbers.";
      isValid = false;
    }

    // 🏷️ Genre & Condition
    if (!formData.genre) {
      newErrors.genre = "Please select a genre.";
      isValid = false;
    }

    if (!formData.condition) {
      newErrors.condition = "Please select a condition.";
      isValid = false;
    }

    // 💰 Base price
    const basePrice = Number(formData.basePrice);
    if (!formData.basePrice?.toString().trim()) {
      newErrors.basePrice = "Base price is required.";
      isValid = false;
    } else if (isNaN(basePrice) || basePrice <= 0) {
      newErrors.basePrice = "Base price must be a number greater than 0.";
      isValid = false;
    } else if (basePrice > 1000000) {
      newErrors.basePrice = "Base price seems too high.";
      isValid = false;
    }

    // 🖼️ Image validation
    const imageCheck = (file, field, label) => {
      if (!file) {
        newErrors[field] = `Please upload ${label.toLowerCase()}.`;
        return false;
      }
      return true;
    };

    if (!imageCheck(formData.itemImage, "itemImage", "Item image")) isValid = false;
    if (!imageCheck(formData.authenticationImage, "authenticationImage", "Authentication image")) isValid = false;

    // ⏰ Auction time validation
    const startTime = formData.auctionStart ? new Date(formData.auctionStart) : null;
    const endTime = formData.auctionEnd ? new Date(formData.auctionEnd) : null;

    if (!startTime) {
      newErrors.auctionStart = "Auction start time is required.";
      isValid = false;
    }

    if (!endTime) {
      newErrors.auctionEnd = "Auction end time is required.";
      isValid = false;
    }

    if (startTime && endTime) {
      if (endTime <= startTime) {
        newErrors.auctionEnd = "End time must be after the start time.";
        isValid = false;
      } else if (endTime - startTime < 60 * 60 * 1000) {
        newErrors.auctionEnd = "End time must be at least 1 hour after start time.";
        isValid = false;
      }
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
      if (["itemImage", "authenticationImage"].includes(key) && formData[key]) {
        submitData.append(key, formData[key]);
      } else if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    try {
      setLoading(true);
      const response = await sellAntique(submitData);
      if (response.success) {
        toast.success("Auction created successfully!");
        navigate("/publisher/dashboard");
      } else {
        toast.error("Failed to create auction. " + response.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting form. Please try again.");
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
            <h1 className="text-2xl font-bold text-gray-900">Sell Antique Book</h1>
            <p className="text-gray-500 mt-1">Create an auction for your antique book</p>
          </div>

          <form
            method="POST"
            action="/publisher/sell-antique"
            encType="multipart/form-data"
            className="p-6 space-y-6 animate-fade-in"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-700 block text-sm font-medium">Book Title</label>
                <input
                  type="text"
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`mt-1 px-2 py-2 block w-full rounded-lg border-gray-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.title ? "border-red-500" : ""
                  }`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 error-msg">{errors.title}</p>}
              </div>

              <div>
                <label className="text-gray-700 block text-sm font-medium">Author</label>
                <input
                  type="text"
                  required
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className={`mt-1 px-2 py-2 block w-full rounded-lg border-gray-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.author ? "border-red-500" : ""
                  }`}
                />
                {errors.author && <p className="text-red-500 text-xs mt-1 error-msg">{errors.author}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows="4"
                required
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`border-gray-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none mt-1 px-2 py-2 block w-full rounded-lg ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1 error-msg">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-700 block text-sm font-medium">Genre</label>
                <select
                  required
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className={`bg-white mt-1 px-2 py-2 block w-full rounded-lg border-gray-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.genre ? "border-red-500" : ""
                  }`}
                >
                  <option disabled hidden value="">Select Genre</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Thriller">Other</option>
                </select>
                {errors.genre && <p className="text-red-500 text-xs mt-1 error-msg">{errors.genre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Condition</label>
                <select
                  required
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className={`bg-white mt-1 px-2 py-2 block w-full rounded-lg border-gray-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.condition ? "border-red-500" : ""
                  }`}
                >
                  <option disabled hidden value="">Select Condition</option>
                  <option>Mint</option>
                  <option>Near Mint</option>
                  <option>Excellent</option>
                  <option>Very Good</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
                {errors.condition && <p className="text-red-500 text-xs mt-1 error-msg">{errors.condition}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  required
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  className={`mt-1 px-2 py-2 block w-full rounded-lg border-gray-300 shadow-sm hover:shadow-md outline-none focus:outline-purple-500 ${
                    errors.basePrice ? "border-red-500" : ""
                  }`}
                />
                {errors.basePrice && <p className="text-red-500 text-xs mt-1 error-msg">{errors.basePrice}</p>}
              </div>

              <div>
                <label className="font-medium block text-sm text-gray-700">Auction Start</label>
                <input
                  type="datetime-local"
                  id="auctionStart"
                  required
                  name="auctionStart"
                  value={formData.auctionStart}
                  onChange={handleInputChange}
                  className={`block w-full rounded-lg mt-1 px-2 py-2 border-gray-300 shadow-sm hover:shadow-md outline-none focus:outline-purple-500 ${
                    errors.auctionStart ? "border-red-500" : ""
                  }`}
                />
                {errors.auctionStart && <p className="text-red-500 text-xs mt-1 error-msg">{errors.auctionStart}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Auction End</label>
                <input
                  type="datetime-local"
                  id="auctionEnd"
                  required
                  name="auctionEnd"
                  value={formData.auctionEnd}
                  onChange={handleInputChange}
                  className={`mt-1 px-2 py-2 block w-full rounded-lg border-gray-300 shadow-sm hover:shadow-md outline-none focus:outline-purple-500 ${
                    errors.auctionEnd ? "border-red-500" : ""
                  }`}
                />
                {errors.auctionEnd && <p className="text-red-500 text-xs mt-1 error-msg">{errors.auctionEnd}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Item Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="text-center space-y-1">
                  <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl"></i>
                  <div className="flex text-sm text-gray-600">
                    <label className="bg-white rounded-md relative cursor-pointer font-medium text-purple-600 hover:text-purple-500">
                      <span>Upload Image</span>
                      <input
                        id="itemImage"
                        name="itemImage"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        required
                        onChange={handleItemImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              <div id="imagePreviewContainer1" className={`mt-4 ${showImagePreview1 ? "" : "hidden"}`}>
                <h4 className="text-gray-700 mb-2 text-sm font-medium">Item Image Preview:</h4>
                <img
                  id="imagePreview1"
                  className="w-48 h-64 object-cover rounded-lg shadow-md"
                  src={imagePreview1}
                  alt="Uploaded Image Preview"
                />
              </div>
              {errors.itemImage && <p className="text-red-500 text-xs mt-1 error-msg">{errors.itemImage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Authentication Image</label>
              <div className="pb-6 border-2 border-gray-300 border-dashed rounded-lg mt-1 flex justify-center px-6 pt-5">
                <div className="space-y-1 text-center">
                  <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl"></i>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                      <span>Upload Image</span>
                      <input
                        id="authenticationImage"
                        name="authenticationImage"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        required
                        onChange={handleAuthImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              <div id="imagePreviewContainer2" className={`mt-4 ${showImagePreview2 ? "" : "hidden"}`}>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Authentication Image Preview:</h4>
                <img
                  id="imagePreview2"
                  className="w-48 h-64 object-cover rounded-lg shadow-md"
                  src={imagePreview2}
                  alt="Uploaded Image Preview"
                />
              </div>
              {errors.authenticationImage && (
                <p className="text-red-500 text-xs mt-1 error-msg">{errors.authenticationImage}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                to="/publisher/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`bg-indigo-600 px-4 py-2 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Starting..." : "Start Auction"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellAntique;