//client/src/pages/auth/signup/manager/ManagerSignup.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { signupManager } from "../../../../services/manager.services.js";

const ManagerSignup = () => {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({ mode: "onBlur" }); // validate only onBlur

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Watch password for strength meter
  const passwordValue = watch("password", "");

  // Calculate password strength (not required to submit)
  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 3) score++;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const passwordStrength = calculateStrength(passwordValue);

  const getStrengthInfo = (score) => {
    switch (score) {
      case 0:
        return { label: "Too Weak", color: "bg-gray-300" };
      case 1:
        return { label: "Very Weak", color: "bg-red-400" };
      case 2:
        return { label: "Weak", color: "bg-orange-400" };
      case 3:
        return { label: "Moderate", color: "bg-yellow-400" };
      case 4:
        return { label: "Strong", color: "bg-green-500" };
      case 5:
        return { label: "Very Strong", color: "bg-purple-600" };
      default:
        return { label: "Too Weak", color: "bg-gray-300" };
    }
  };

  const strengthInfo = getStrengthInfo(passwordStrength);

  // Password criteria checks for realtime factor hints
  const criteria = {
    min3: {
      ok: passwordValue.length >= 3,
      hint: "At least 3 characters",
    },
    min6: {
      ok: passwordValue.length >= 6,
      hint: "At least 6 characters (stronger)",
    },
    uppercase: {
      ok: /[A-Z]/.test(passwordValue),
      hint: "Add an uppercase letter (A-Z)",
    },
    number: {
      ok: /[0-9]/.test(passwordValue),
      hint: "Add a number (0-9)",
    },
    special: {
      ok: /[^A-Za-z0-9]/.test(passwordValue),
      hint: "Add a special character (e.g. !@#$%)",
    },
  };

  const onSubmit = async (data) => {
    setServerError("");

    const firstname = data.firstname.trim();
    const lastname = data.lastname.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    setIsLoading(true);

    try {
      const response = await signupManager({
        firstname,
        lastname,
        email,
        password,
      });

      if (response.success) {
        window.location.href = "/auth/login";
      } else {
        setServerError(response.message || "An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setServerError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white bg-gray-50">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <a href="/" className="inline-block">
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              PubliShelf
            </span>
          </a>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Manager Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/auth/login" className="font-medium text-purple-600 hover:text-purple-500">
              Sign in
            </a>
          </p>
        </div>

        {/* Form */}
        <form id="signupForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white p-8 shadow-lg rounded-xl space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full py-2 border px-3 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                  {...register("firstname", {
                    required: "First name is required.",
                    validate: {
                      noEmpty: (v) => v.trim() !== "" || "First name cannot be empty.",
                      alphabetsOnly: (v) =>
                        /^[A-Za-z\s]+$/.test(v) || "Only alphabets and spaces allowed.",
                    },
                  })}
                  onBlur={() => trigger("firstname")}
                />
                {errors.firstname && (
                  <p className="text-red-500 text-[11px]">{errors.firstname.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full py-2 border px-3 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                  {...register("lastname", {
                    required: "Last name is required.",
                    validate: {
                      noEmpty: (v) => v.trim() !== "" || "Last name cannot be empty.",
                      alphabetsOnly: (v) =>
                        /^[A-Za-z\s]+$/.test(v) || "Only alphabets and spaces allowed.",
                    },
                  })}
                  onBlur={() => trigger("lastname")}
                />
                {errors.lastname && (
                  <p className="text-red-500 text-[11px]">{errors.lastname.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400"></i>
                </div>
                <input
                  type="email"
                  placeholder="manager@example.com"
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  {...register("email", {
                    required: "Email is required.",
                    pattern: {
                      // format check (allows uppercase so we can surface separate uppercase message)
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address.",
                    },
                    validate: {
                      noUpper: (v) =>
                        v === v.toLowerCase() || "Uppercase letters are not allowed.",
                    },
                  })}
                  onBlur={() => trigger("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 3,
                      message: "Password must be at least 3 characters long.",
                    },
                  })}
                  onBlur={() => {
                    trigger("password");
                    trigger("confirmPassword");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-gray-400`}></i>
                </button>
              </div>

              {/* Password Strength Bar */}
              {passwordValue && (
                <div className="mt-2 relative">
                  <div className="h-2 w-full bg-gray-200 rounded">
                    <div
                      className={`h-full rounded transition-all duration-300 ${strengthInfo.color}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>

                  <div className="absolute top-[2px] inset-x-0 flex flex-row-reverse justify-between items-center">
                    <p className="text-xs mt-1 text-purple-600 font-medium">{strengthInfo.label}</p>

                    <div className="h-5 mt-2 overflow-hidden relative w-[80%]">
                      {(() => {
                        const orderedCriteria = [
                          { key: "min3", ...criteria.min3 },
                          { key: "uppercase", ...criteria.uppercase },
                          { key: "number", ...criteria.number },
                          { key: "special", ...criteria.special },
                          { key: "min6", ...criteria.min6 },
                        ];

                        const nextRequirement = orderedCriteria.find((c) => !c.ok);
                        if (!nextRequirement) return null;

                        return (
                          <div
                            key={nextRequirement.key}
                            className={`
                              absolute left-0 text-xs flex items-center whitespace-nowrap
                              animate-[slideIn_0.45s_ease-out]
                              ${nextRequirement.ok ? "animate-[slideOut_0.45s_ease-in]" : ""}
                            `}
                          >
                            <p className="text-gray-600">{nextRequirement.hint}</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  {...register("confirmPassword", {
                    required: "Please confirm your password.",
                    validate: (v) =>
                      v === passwordValue || "Passwords do not match.",
                  })}
                  onBlur={() => {
                    trigger("confirmPassword");
                    trigger("password");
                  }}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                {...register("termsAccepted", {
                  required: "You must agree to the Terms and Privacy Policy.",
                })}
                onBlur={() => trigger("termsAccepted")}
              />
              <label className="ml-2 block text-sm text-gray-700">
                I agree to the{" "}
                <a href="#" className="text-purple-600 hover:text-purple-500">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-purple-600 hover:text-purple-500">Privacy Policy</a>
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="text-red-500 text-sm">{errors.termsAccepted.message}</p>
            )}

            {/* Global Server Error */}
            {serverError && (
              <p className="text-red-500 text-sm">{serverError}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white 
              ${isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}
              focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300`}
            >
              {isLoading ? "Creating Account..." : "Create Manager Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerSignup;