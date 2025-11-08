//client/src/pages/auth/login/Login.jsx
import { useState, useEffect } from "react";
import { login } from "../../../services/auth.services.js";
import { useDispatch } from 'react-redux';
import { setAuth } from '../../../store/slices/authSlice';
import { setUser } from '../../../store/slices/userSlice';
import { setCart } from '../../../store/slices/cartSlice';
import { setWishlist } from '../../../store/slices/wishlistSlice';
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 3) {
      setError("Password must be at least 3 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({ email, password });
      if (response.success) {
        const userData = response.data.user;
        console.log("login userdata", userData)
        
        // Populate all stores on login
        dispatch(setAuth({ role: userData.role }));
        dispatch(setUser({...userData}));
        dispatch(setCart(userData.cart || []));
        console.log("login", userData.cart);
        dispatch(setWishlist(userData.wishlist || []));
        
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
        
        navigate(`/${userData.role}/dashboard`);
      } else {
        setError(response.message || "Unexpected error occurred. Please try again.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal on outside click
  useEffect(() => {
    const handleBackdropClick = (e) => {
      if (showSignupModal && e.target.id === "signupModal") {
        setShowSignupModal(false);
        document.body.style.overflow = "auto";
      }
    };
    document.addEventListener("click", handleBackdropClick);
    return () => document.removeEventListener("click", handleBackdropClick);
  }, [showSignupModal]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white bg-gray-50">
      <div className="max-w-md w-full">
        {/* Logo and Welcome */}
        <div className="text-center mb-10">
          <a href="/" className="inline-block">
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              PubliShelf
            </span>
          </a>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              id="showSignupOptions"
              onClick={() => {
                setShowSignupModal(true);
                document.body.style.overflow = "hidden";
              }}
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6 animate-fade-in">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pr-3 pl-10 py-2 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                      placeholder-gray-400 transition-all duration-300"
                    placeholder="user@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none w-full block pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                      placeholder-gray-400 transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <i
                      className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-gray-400 hover:text-gray-600 cursor-pointer`}
                    ></i>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p id="PasswordIncorrectClass" style={{ color: "red" }}>
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              id="SignInButtonInAuthLogin"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                ${isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 
                transition-all duration-300 transform hover:-translate-y-0.5`}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {/* Signup Modal */}
        <div
          id="signupModal"
          className={`fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 ${
            showSignupModal ? "" : "hidden"
          }`}
        >
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Choose Account Type</h3>
              <button
                id="closeModal"
                onClick={() => {
                  setShowSignupModal(false);
                  document.body.style.overflow = "auto";
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="space-y-4">
              <a
                href="/buyer/signup"
                className="block w-full p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-300"
              >
                <div className="flex items-center">
                  <i className="fas fa-user-tag text-2xl text-purple-600 mr-4"></i>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Buyer</h4>
                    <p className="text-sm text-gray-600">Browse and purchase books</p>
                  </div>
                </div>
              </a>
              <a
                href="/publisher/signup"
                className="block w-full border border-gray-200 p-4 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-300"
              >
                <div className="flex items-center">
                  <i className="fas fa-book-open text-2xl text-purple-600 mr-4"></i>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Publisher</h4>
                    <p className="text-sm text-gray-600">List and sell your books</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;