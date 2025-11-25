//client/src/pages/auth/login/Login.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { login } from "../../../services/auth.services.js";
import { useDispatch } from "react-redux";
import { setAuth } from "../../../store/slices/authSlice";
import { setUser } from "../../../store/slices/userSlice";
import { setCart } from "../../../store/slices/cartSlice";
import { setWishlist } from "../../../store/slices/wishlistSlice";
import { useNavigate } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "../../../components/ui/AlertDialog";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    watch
  } = useForm({ mode: "onBlur" });

  const emailValue = watch("email", "");
  const passwordValue = watch("password", "");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const [alertDialog, setAlertDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: ""
  });

  /* --------------------------- SUBMIT -------------------------- */
  const onSubmit = async (data) => {
    setServerError("");

    setIsLoading(true);
    try {
      const response = await login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (response.success) {
        const userData = response.data.user;

        dispatch(setAuth({ role: userData.role }));
        dispatch(setUser({ ...userData }));
        dispatch(setCart(userData.cart || []));
        dispatch(setWishlist(userData.wishlist || []));

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }

        navigate(`/${userData.role}/dashboard`);
      } else {
        const message = response.message || "Unexpected error occurred.";
        const details = response.data;

        if (
          message.includes("pending verification") ||
          message.includes("under review") ||
          message.includes("rejected") ||
          message.includes("banned")
        ) {
          let title = "Account Status";
          let type = "warning";
          let fullMessage = message;

          if (message.includes("banned")) {
            title = "Account Banned";
            type = "error";
            if (details) {
              fullMessage = `Your account has been banned.\n\nReason: ${details.reason}\nAction by: ${details.actionBy}${
                details.actionDate
                  ? `\nDate: ${new Date(details.actionDate).toLocaleString()}`
                  : ""
              }`;
            }
          } else if (message.includes("rejected")) {
            title = "Account Rejected";
            type = "error";
            if (details) {
              fullMessage = `Your account verification was rejected.\n\nReason: ${details.reason}\nRejected by: ${details.actionBy}${
                details.actionDate
                  ? `\nDate: ${new Date(details.actionDate).toLocaleString()}`
                  : ""
              }`;
            }
          } else if (message.includes("pending") || message.includes("under review")) {
            type = "info";
          }

          setAlertDialog({ open: true, title, message: fullMessage, type });
        } else {
          setServerError(message);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setServerError("An error occurred. Please try again later.");
    }
    setIsLoading(false);
  };

  /* ------------------- BACKDROP CLICK CLOSE -------------------- */
  useEffect(() => {
    const closeOnBackdrop = (e) => {
      if (showSignupModal && e.target.id === "signupModal") {
        setShowSignupModal(false);
        document.body.style.overflow = "auto";
      }
    };
    document.addEventListener("click", closeOnBackdrop);
    return () => document.removeEventListener("click", closeOnBackdrop);
  }, [showSignupModal]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white bg-gray-50">
      <div className="max-w-md w-full">

        {/* Logo + Heading */}
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

        {/* ------------------------------- FORM ------------------------------ */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6 animate-fade-in">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>

              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400"></i>
                </div>

                <input
                  type="email"
                  placeholder="user@gmail.com"
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  {...register("email", {
                    required: "Email is required.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address.",
                    },
                    validate: {
                      lowercaseOnly: (v) =>
                        v === v.toLowerCase() || "Uppercase letters are not allowed.",
                      noSpaces: (v) =>
                        v.trim() === v || "Email cannot contain leading or trailing spaces.",
                    },
                  })}
                  onBlur={() => trigger("email")}
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>

              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 3,
                      message: "Password must be at least 3 characters long.",
                    },
                    validate: {
                      noLeadingTrailingSpaces: (v) =>
                        v.trim() === v || "Password cannot start or end with spaces.",
                    },
                  })}
                  onBlur={() => trigger("password")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    } text-gray-400`}
                  ></i>
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* GLOBAL SERVER ERROR */}
            {serverError && (
              <p className="text-red-500 text-sm">{serverError}</p>
            )}

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded cursor-pointer"
                />
                <label className="ml-2 text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>

              <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white 
              ${isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}
              focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300`}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {/* --------------------------- SIGNUP MODAL --------------------------- */}
        <div
          id="signupModal"
          className={`fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 ${
            showSignupModal ? "" : "hidden"
          }`}
        >
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Choose Account Type</h3>
              <button
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
                className="block p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div className="flex items-center">
                  <i className="fas fa-user-tag text-2xl text-purple-600 mr-4"></i>
                  <div>
                    <h4 className="text-lg font-semibold">Buyer</h4>
                    <p className="text-sm text-gray-600">Browse and purchase books</p>
                  </div>
                </div>
              </a>

              <a
                href="/publisher/signup"
                className="block p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div className="flex items-center">
                  <i className="fas fa-book-open text-2xl text-purple-600 mr-4"></i>
                  <div>
                    <h4 className="text-lg font-semibold">Publisher</h4>
                    <p className="text-sm text-gray-600">List and sell your books</p>
                  </div>
                </div>
              </a>

              <a
                href="/manager/signup"
                className="block p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div className="flex items-center">
                  <i className="fas fa-user-shield text-2xl text-purple-600 mr-4"></i>
                  <div>
                    <h4 className="text-lg font-semibold">Manager</h4>
                    <p className="text-sm text-gray-600">Manage platform operations</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* -------------------- ACCOUNT STATUS DIALOG ------------------------- */}
        <AlertDialog
          open={alertDialog.open}
          onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {alertDialog.type === "error" && <i className="fas fa-exclamation-circle text-red-600"></i>}
                {alertDialog.type === "warning" && <i className="fas fa-exclamation-triangle text-yellow-600"></i>}
                {alertDialog.type === "info" && <i className="fas fa-info-circle text-blue-600"></i>}
                {alertDialog.title}
              </AlertDialogTitle>
            </AlertDialogHeader>

            <AlertDialogDescription className="text-gray-700 whitespace-pre-line">
              {alertDialog.message}
            </AlertDialogDescription>

            {alertDialog.type === "error" && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600">
                  <i className="fas fa-question-circle mr-2"></i>
                  Need help? Contact{" "}
                  <a href="mailto:support@publishelf.com" className="text-purple-600 underline">
                    support@publishelf.com
                  </a>
                </p>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() =>
                  setAlertDialog({ open: false, title: "", message: "", type: "" })
                }
              >
                Understood
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Login;
