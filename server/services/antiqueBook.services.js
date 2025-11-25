//services/antiqueBook.services.js
import AntiqueBook from "../models/AntiqueBook.model.js";

export const addBid = async (bookId, bidderId, bidAmount) => {
  const book = await AntiqueBook.findById(bookId);

  if (!book) {
    throw new Error("Antique book not found");
  }

  // Enforce only approved and active auctions accept bids
  const now = new Date();
  if (book.status !== 'approved') {
    throw new Error("Bidding not allowed: auction not approved");
  }
  if (now < new Date(book.auctionStart)) {
    throw new Error("Bidding not allowed: auction hasn't started");
  }
  if (now > new Date(book.auctionEnd)) {
    throw new Error("Bidding not allowed: auction has ended");
  }

  // Enforce bid increment rules (at least basePrice, and greater than currentPrice)
  const minAllowed = Math.max(book.basePrice || 0, book.currentPrice || 0);
  if (bidAmount <= minAllowed) {
    throw new Error(`Bid must be greater than ₹${minAllowed}`);
  }

  book.biddingHistory.push({
    bidder: bidderId,
    bidAmount,
  });

  book.currentPrice = bidAmount;

  await book.save();
  return book;
};

export const createAntiqueBook = async (bookData) => {
  try {
    const newAntiqueBook = new AntiqueBook(bookData);
    return await newAntiqueBook.save();
  } catch (error) {
    console.error("Error creating antique book:", error);
    throw new Error("Failed to create antique book.");
  }
};

export const getOngoingAuctions = async () => {
  return await AntiqueBook.find({
    status: 'approved',
    auctionStart: { $lte: new Date() },
    auctionEnd: { $gte: new Date() },
  }).sort({ auctionEnd: 1 }).lean();
};

export const getFutureAuctions = async () => {
  return await AntiqueBook.find({
    status: 'approved',
    auctionStart: { $gt: new Date() },
  }).sort({ auctionStart: 1 }).lean();
};

export const getEndedAuctions = async () => {
  const docs = await AntiqueBook.find({
    status: 'approved',
    auctionEnd: { $lt: new Date() },
  })
    .sort({ auctionEnd: -1 })
    .populate('biddingHistory.bidder', 'firstname lastname')
    .lean();

  // Attach winner info if sold
  return docs.map((d) => {
    if (Array.isArray(d.biddingHistory) && d.biddingHistory.length > 0 && (d.currentPrice || 0) > 0) {
      // Determine highest bid; if tie, latest occurrence wins
      let winnerBid = d.biddingHistory[0];
      for (const bid of d.biddingHistory) {
        if (
          bid.bidAmount > winnerBid.bidAmount ||
          (bid.bidAmount === winnerBid.bidAmount && new Date(bid.bidTime) > new Date(winnerBid.bidTime))
        ) {
          winnerBid = bid;
        }
      }
      const name = winnerBid.bidder
        ? `${winnerBid.bidder.firstname || ''} ${winnerBid.bidder.lastname || ''}`.trim()
        : undefined;
      return {
        ...d,
        winnerBuyer: winnerBid.bidder ? { _id: winnerBid.bidder._id, name } : undefined,
        finalPrice: d.currentPrice || d.basePrice,
      };
    }
    return { ...d, finalPrice: d.currentPrice || d.basePrice };
  });
};

export const getAuctionItemById = async (bookId) => {
  const book = await AntiqueBook.findById(bookId)
    .populate("biddingHistory.bidder", "firstname lastname email")
    .lean();
  if (!book) {
    throw new Error("Antique book not found");
  }
  if (book.status !== 'approved') {
    throw new Error("Auction not available");
  }
  return book;
};