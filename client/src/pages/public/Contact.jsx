import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    const form = document.getElementById("contactForm");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const messageError = document.getElementById("messageError");
    const successMsgElement = document.getElementById("successMsg");

    const handleSubmit = (e) => {
      e.preventDefault();
      let valid = true;

      const namePattern = /^[A-Za-z\s]+$/;
      if (!namePattern.test(nameInput.value.trim()) || nameInput.value.trim().length < 2) {
        nameError.textContent = "Name should contain only letters and be at least 2 characters.";
        nameError.classList.remove("hidden");
        valid = false;
      } else 
        nameError.classList.add("hidden");

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        emailError.classList.remove("hidden");
        valid = false;
      } else
        emailError.classList.add("hidden");

      if (messageInput.value.trim().length < 10) {
        messageError.classList.remove("hidden");
        valid = false;
      } else
        messageError.classList.add("hidden");

      if (valid) {
        successMsgElement.classList.remove("hidden");
        form.reset();
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => successMsgElement.classList.add("hidden"), 3000);
      }
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-gray-50 font-sans">
    
      <Navbar/>
      <section className="pt-40 pb-12 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-fade-in">Contact Us</h1>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in-delay">
              We'd love to hear from you! Reach out to us with any questions or feedback.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-md p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <form id="contactForm" className="space-y-4" noValidate>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    minLength="2"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-600 focus:border-purple-600"
                  />
                  <p id="nameError" className="text-red-500 text-sm mt-1 hidden">
                    Name should contain only letters and be at least 2 characters.
                  </p>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-600 focus:border-purple-600"
                  />
                  <p id="emailError" className="text-red-500 text-sm mt-1 hidden">
                    Please enter a valid email address.
                  </p>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    minLength="10"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-600 focus:border-purple-600"
                  ></textarea>
                  <p id="messageError" className="text-red-500 text-sm mt-1 hidden">
                    Message should be at least 10 characters long.
                  </p>
                </div>
                <div>
                  <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:translate-y-[-2px] transition-all duration-500 linear w-full">
                    Send Message
                  </button>
                </div>
                <p id="successMsg" className="text-green-600 text-center mt-3 hidden">
                  Your message has been sent successfully!
                </p>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 animate-fade-in-delay">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-600 mb-4">Have questions or need assistance? We're here to help!</p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-purple-600 mr-2"></i>
                  <span className="text-gray-600">IIIT Sri City, Boys Hostel-3, Gnan Marg Circle</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-phone text-purple-600 mr-2"></i>
                  <span className="text-gray-600">+91 80992 69269</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-envelope text-purple-600 mr-2"></i>
                  <span className="text-gray-600">publishelf07@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default Contact;