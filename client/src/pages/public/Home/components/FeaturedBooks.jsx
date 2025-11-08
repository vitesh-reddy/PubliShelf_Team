const FeaturedBooks = ({ newlyBooks, mostSoldBooks, trendingBooks }) => (
  <>
    {/* Newly Added Books */}
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Newly Added Books</h2>
        <div className="book-carousel" id="topRatedCarousel">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newlyBooks.map((book) => (
              <div
                key={book._id}
                className="bookCardStyle"
                onClick={() => (window.location.href = `/buyer/product-detail/${book._id}`)}
              >
                <img src={book.image} alt={book.title} className="w-full h-64 object-contain" />
                <div className="p-3">
                  <h3 className="text-lg font-semibold mb-1 truncate">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-600 text-sm">₹{book.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Most Sold Books */}
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Most Sold Books</h2>
        <div className="book-carousel" id="mostSoldCarousel">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mostSoldBooks.map((book) => (
              <div
                key={book._id}
                className="bookCardStyle"
                onClick={() => (window.location.href = `/buyer/product-detail/${book._id}`)}
              >
                <img src={book.image} alt={book.title} className="w-full h-64 object-contain" />
                <div className="p-3">
                  <h3 className="text-lg font-semibold mb-1 truncate">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 text-sm">Total Sold: {book.totalSold}</span>
                    <span className="font-bold text-purple-600 text-sm">₹{book.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Trending Books */}
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Trending Now</h2>
        <div className="book-carousel" id="trendingCarousel">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingBooks.map((book, idx) => (
              <div
                key={book._id}
                className="bookCardStyle"
                onClick={() => (window.location.href = `/buyer/product-detail/${book._id}`)}
              >
                <div className="relative">
                  <img src={book.image} alt={book.title} className="w-full h-64 object-contain" />
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    #{idx}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-lg font-semibold mb-1 truncate">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 text-sm">Trending</span>
                    <span className="font-bold text-purple-600 text-sm">₹{book.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </>
);

export default FeaturedBooks;
