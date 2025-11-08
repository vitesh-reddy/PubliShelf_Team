import React, { useState } from "react";

const FAQSection = () => {
  const faqData = [
    {
      question: "How do I sell my books?",
      answer:
        "Sign up as a seller, list your books with details and photos, set your price, and start selling to our community of book lovers.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit cards, PayPal, and various digital payment methods for your convenience.",
    },
    {
      question: "How does shipping work?",
      answer:
        "Sellers handle shipping. Most items are shipped within 2-3 business days, and tracking information is provided once available.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq-section" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div key={index} className="faqBtnStyle">
                <button
                  className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-content-${index}`}
                >
                  <span className="font-semibold">{item.question}</span>
                  <i
                    className={`fas fa-chevron-${openIndex === index ? "up" : "down"}`}
                  ></i>
                </button>
                <div
                  id={`faq-content-${index}`}
                  className={`faqContentStyle ${openIndex === index ? "block" : "hidden"}`}
                >
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
