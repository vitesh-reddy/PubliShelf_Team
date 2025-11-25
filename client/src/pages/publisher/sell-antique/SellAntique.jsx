import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { sellAntique } from "../../../services/publisher.services.js";

// New validation helpers
import {
  alphabetsOnlyRegex,
  descriptionRegex,
  validateAuthFiles,
  validateItemImage,
  MAX_AUTH_DOCS
} from "./sellAntiqueValidations.js";

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
    authenticationImages: [],
  });

  const [imagePreview1, setImagePreview1] = useState(null);
  const [authPreviews, setAuthPreviews] = useState([]); // previews for multiple files
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // ----------------------------
  // Date minimum setters
  // ----------------------------
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

  // Ensure auction end >= start + 1 hour
  useEffect(() => {
    const start = formData.auctionStart;
    const endInput = document.getElementById("auctionEnd");
    if (!start || !endInput) return;

    const minEnd = new Date(new Date(start).getTime() + 60 * 60 * 1000);
    const minISO = new Date(minEnd.getTime() - minEnd.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    endInput.min = minISO;

    if (formData.auctionEnd && formData.auctionEnd < minISO) {
      setFormData((prev) => ({ ...prev, auctionEnd: "" }));
    }
  }, [formData.auctionStart, formData.auctionEnd]);

  // ----------------------------
  // Input Handlers
  // ----------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear existing error first
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Immediate date validations
    if (name === "auctionStart") {
      if (!value) {
        setErrors((prev) => ({ ...prev, auctionStart: "Auction start date & time is required." }));
      } else {
        const startDate = new Date(value);
        const now = new Date();
        if (startDate < now) {
          setErrors((prev) => ({ ...prev, auctionStart: "Auction start must be in the future." }));
        }
        // If end exists ensure gap
        if (formData.auctionEnd) {
          const endDate = new Date(formData.auctionEnd);
          if (endDate <= new Date(startDate.getTime() + 60 * 60 * 1000)) {
            setErrors((prev) => ({ ...prev, auctionEnd: "Auction end must be at least 1 hour after start." }));
          } else {
            setErrors((prev) => ({ ...prev, auctionEnd: "" }));
          }
        }
      }
    }
    if (name === "auctionEnd") {
      if (!value) {
        setErrors((prev) => ({ ...prev, auctionEnd: "Auction end date & time is required." }));
      } else if (formData.auctionStart) {
        const startDate = new Date(formData.auctionStart);
        const endDate = new Date(value);
        if (endDate <= new Date(startDate.getTime() + 60 * 60 * 1000)) {
          setErrors((prev) => ({ ...prev, auctionEnd: "Auction end must be at least 1 hour after start." }));
        }
      }
    }

    // Inline Title validation
    if (name === "title") {
      const trimmed = value.trim();
      if (!trimmed) {
        setErrors((prev) => ({ ...prev, title: "Book title is required." }));
      }
      //  else if (!alphabetsOnlyRegex.test(trimmed)) {
      //   setErrors((prev) => ({ ...prev, title: "Book title must contain only alphabets." }));
      // } 
      else if (trimmed.length < 2) {
        setErrors((prev) => ({ ...prev, title: "Book title must be at least 2 characters." }));
      } else {
        setErrors((prev) => ({ ...prev, title: "" }));
      }
    }

    // Inline Author validation
    if (name === "author") {
      const trimmed = value.trim();
      if (!trimmed) {
        setErrors((prev) => ({ ...prev, author: "Author name is required." }));
      } else if (!alphabetsOnlyRegex.test(trimmed)) {
        setErrors((prev) => ({ ...prev, author: "Author name must contain only alphabets." }));
      } else if (trimmed.length < 2) {
        setErrors((prev) => ({ ...prev, author: "Author name must be at least 2 characters." }));
      } else {
        setErrors((prev) => ({ ...prev, author: "" }));
      }
    }
  };

  // ----------------------------
  // Item Image Upload
  // ----------------------------
  const handleItemImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const errorMsg = validateItemImage(file);
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, itemImage: errorMsg }));
      return;
    }

    setFormData((prev) => ({ ...prev, itemImage: file }));
    setErrors((prev) => ({ ...prev, itemImage: "" }));

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview1(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ----------------------------
  // Authentication Document Upload (IMAGE + PDF + DOC + TXT)
  // ----------------------------
  const handleAuthFilesChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;

    // Merge with existing, avoid duplicates by name+size
    setFormData((prev) => {
      const existing = prev.authenticationImages || [];
      const merged = [...existing];
      incoming.forEach(f => {
        if (!merged.some(m => m.name === f.name && m.size === f.size)) merged.push(f);
      });
      // Enforce max
      if (merged.length > MAX_AUTH_DOCS) {
        setErrors((prevErr) => ({ ...prevErr, authenticationImages: `You can upload up to ${MAX_AUTH_DOCS} documents.` }));
        return prev; // do not apply oversized merge
      }
      const errorMsg = validateAuthFiles(merged);
      if (errorMsg) {
        setErrors((prevErr) => ({ ...prevErr, authenticationImages: errorMsg }));
        return prev;
      }
      // Rebuild previews
      const previewsPromises = merged.map((file) => {
        if (file.type.startsWith("image/")) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve({ isImage: true, src: ev.target.result, name: file.name });
            reader.readAsDataURL(file);
          });
        }
        return Promise.resolve({ isImage: false, name: file.name });
      });
      Promise.all(previewsPromises).then(setAuthPreviews);
      setErrors((prevErr) => ({ ...prevErr, authenticationImages: "" }));
      return { ...prev, authenticationImages: merged };
    });
  };

  const removeAuthFile = (index) => {
    setFormData((prev) => {
      const arr = [...prev.authenticationImages];
      arr.splice(index, 1);
      const previewsPromises = arr.map((file) => {
        if (file.type.startsWith("image/")) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve({ isImage: true, src: ev.target.result, name: file.name });
            reader.readAsDataURL(file);
          });
        }
        return Promise.resolve({ isImage: false, name: file.name });
      });
      Promise.all(previewsPromises).then(setAuthPreviews);
      // Revalidate remaining
      const errorMsg = validateAuthFiles(arr);
      setErrors((prevErr) => ({ ...prevErr, authenticationImages: errorMsg || "" }));
      return { ...prev, authenticationImages: arr };
    });
  };

  const clearItemImage = () => {
    setFormData((prev) => ({ ...prev, itemImage: null }));
    setImagePreview1(null);
    setErrors((prev) => ({ ...prev, itemImage: "" }));
  };

  // ----------------------------
  // Validation
  // ----------------------------
  const validateForm = () => {
    let newErrors = {};
    let valid = true;

    // Title
    if (!formData.title.trim()) {
      newErrors.title = "Book title is required.";
    } else if (!alphabetsOnlyRegex.test(formData.title.trim())) {
      newErrors.title = "Book title must contain only alphabets.";
    }

    // Author
    if (!formData.author.trim()) {
      newErrors.author = "Author name is required.";
    } else if (!alphabetsOnlyRegex.test(formData.author.trim())) {
      newErrors.author = "Author name must contain only alphabets.";
    }

    // Description
    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    } else if (!descriptionRegex.test(formData.description.trim())) {
      newErrors.description = "Description contains invalid characters.";
    }

    // Genre
    if (!formData.genre) {
      newErrors.genre = "Please select a genre.";
    }

    // Condition
    if (!formData.condition) {
      newErrors.condition = "Please select a condition.";
    }

    // Base Price
    const basePrice = Number(formData.basePrice);
    if (!formData.basePrice.trim()) {
      newErrors.basePrice = "Base price is required.";
    } else if (isNaN(basePrice) || basePrice <= 0) {
      newErrors.basePrice = "Base price must be a positive number.";
    }

    // Item Image
    const itemImageError = validateItemImage(formData.itemImage);
    if (itemImageError) newErrors.itemImage = itemImageError;

    // Authentication File
  const authError = validateAuthFiles(formData.authenticationImages);
  if (authError) newErrors.authenticationImages = authError;

    // Dates
    if (!formData.auctionStart) {
      newErrors.auctionStart = "Auction start date & time is required.";
    } else {
      const startDate = new Date(formData.auctionStart);
      const now = new Date();
      if (startDate < now) {
        newErrors.auctionStart = "Auction start must be in the future.";
      }
    }

    if (!formData.auctionEnd) {
      newErrors.auctionEnd = "Auction end date & time is required.";
    } else if (formData.auctionStart) {
      const start = new Date(formData.auctionStart);
      const end = new Date(formData.auctionEnd);
      if (end <= new Date(start.getTime() + 60 * 60 * 1000)) {
        newErrors.auctionEnd = "Auction end must be at least 1 hour after start.";
      }
    }

    setErrors(newErrors);
    valid = Object.keys(newErrors).length === 0;
    return valid;
  };

  // ----------------------------
  // Submit
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const submitData = new FormData();
    // Append scalar fields
    const { authenticationImages, itemImage, ...rest } = formData;
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== null && v !== undefined) submitData.append(k, v);
    });
    // Append files
    if (itemImage) submitData.append("itemImage", itemImage);
    (authenticationImages || []).forEach((file) => submitData.append("authenticationImages", file));

    try {
      setLoading(true);
      const response = await sellAntique(submitData);
      if (response.success) {
        toast.success("Successfully sent for verification");
        navigate("/publisher/dashboard");
      } else {
        toast.error(response.message || "Failed to submit form");
      }
    } catch {
      toast.error("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // RENDER UI
  // ----------------------------
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

          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Sell Antique Book</h1>
            <p className="text-gray-500 mt-1">Create an auction for your antique book</p>
          </div>

          {/* FORM */}
          <form className="p-6 space-y-6 animate-fade-in" onSubmit={handleSubmit}>

            {/* --- Title / Author --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Book Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`mt-1 w-full px-2 py-2 rounded-lg border ${errors.title ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className={`mt-1 w-full px-2 py-2 rounded-lg border ${errors.author ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author}</p>}
              </div>
            </div>

            {/* --- Description --- */}
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`mt-1 w-full px-2 py-2 rounded-lg border ${errors.description ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* --- Genre / Condition --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Genre</label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className={`mt-1 w-full px-2 py-2 bg-white rounded-lg border ${errors.genre ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="" hidden>Select Genre</option>
                  <option>Fiction</option>
                  <option>Non-Fiction</option>
                  <option>Mystery</option>
                  <option>Science Fiction</option>
                  <option>Romance</option>
                  <option>Thriller</option>
                  <option>Other</option>
                </select>
                {errors.genre && <p className="text-red-500 text-xs mt-1">{errors.genre}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className={`mt-1 w-full px-2 py-2 bg-white rounded-lg border ${errors.condition ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="" hidden>Select Condition</option>
                  <option>Mint</option>
                  <option>Near Mint</option>
                  <option>Excellent</option>
                  <option>Very Good</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
                {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition}</p>}
              </div>
            </div>

            {/* --- Base Price + Dates --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Base Price (₹)</label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  className={`mt-1 w-full px-2 py-2 rounded-lg border ${errors.basePrice ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.basePrice && <p className="text-red-500 text-xs mt-1">{errors.basePrice}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Auction Start</label>
                <input
                  type="datetime-local"
                  id="auctionStart"
                  name="auctionStart"
                  value={formData.auctionStart}
                  onChange={handleInputChange}
                  className={`mt-1 w-full px-2 py-2 rounded-lg border ${errors.auctionStart ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.auctionStart && <p className="text-red-500 text-xs mt-1">{errors.auctionStart}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Auction End</label>
                <input
                  type="datetime-local"
                  id="auctionEnd"
                  name="auctionEnd"
                  value={formData.auctionEnd}
                  onChange={handleInputChange}
                  className={`mt-1 w-full px-2 py-2 rounded-lg border ${errors.auctionEnd ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.auctionEnd && <p className="text-red-500 text-xs mt-1">{errors.auctionEnd}</p>}
              </div>
            </div>

            {/* --- Item Image Upload --- */}
            <div>
              <label className="text-sm font-medium text-gray-700">Item Image</label>
              <div className={`mt-2 rounded-lg border-2 border-dashed ${errors.itemImage ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"} p-4`}> 
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md bg-white border">
                    <i className="fas fa-image text-gray-500"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Upload a clear photo of the book</p>
                    <p className="text-xs text-gray-500">JPG, PNG, WebP up to 10MB</p>
                  </div>
                  <label className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700">
                    Browse
                    <input type="file" accept="image/*" onChange={handleItemImageChange} className="hidden" />
                  </label>
                </div>
                {errors.itemImage && <p className="text-red-500 text-xs mt-2">{errors.itemImage}</p>}
                {imagePreview1 && (
                  <div className="mt-3 relative inline-block group">
                    <img src={imagePreview1} className="w-48 h-64 object-cover rounded-lg shadow-md" alt="Item Preview" />
                    <button type="button" onClick={clearItemImage} className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* --- Authentication File Upload (multi-type) --- */}
            <div>
              <label className="text-sm font-medium text-gray-700">Authentication Documents</label>
              <div className={`mt-2 rounded-lg border-2 border-dashed ${errors.authenticationImages ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"} p-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md bg-white border">
                    <i className="fas fa-file-upload text-gray-500"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Upload authentication documents (up to {MAX_AUTH_DOCS})</p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG, WebP, HEIC, DOC, DOCX, TXT up to 10MB each</p>
                  </div>
                  <label className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700">
                    Browse
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx,.txt"
                      multiple
                      onChange={handleAuthFilesChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {errors.authenticationImages && <p className="text-red-500 text-xs mt-2">{errors.authenticationImages}</p>}
                {authPreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {authPreviews.map((p, idx) => (
                      <div key={idx} className="relative border rounded-md bg-white p-2 flex items-center gap-2 shadow-sm group">
                        {p.isImage ? (
                          <img src={p.src} alt={p.name || `auth-${idx}`} className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center rounded bg-gray-100">
                            <i className="fas fa-file-alt text-gray-500"></i>
                          </div>
                        )}
                        <div className="text-xs text-gray-700 truncate flex-1" title={p.name}>{p.name || `file-${idx + 1}`}</div>
                        <button type="button" onClick={() => removeAuthFile(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded px-1 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition" aria-label="Remove document">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* --- Submit Button --- */}
            <div className="flex justify-end gap-3">
              <Link to="/publisher/dashboard" className="px-4 py-2 border rounded-lg">
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${loading && "opacity-50 cursor-not-allowed"}`}
              >
                {loading ? "Submitting…" : "Send for Verification"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default SellAntique;
