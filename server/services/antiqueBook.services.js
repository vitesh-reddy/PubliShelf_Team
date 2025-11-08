//services/antiqueBook.services.js
import AntiqueBook from "../models/AntiqueBook.model.js";

export const addBid = async (bookId, bidderId, bidAmount) => {
  const book = await AntiqueBook.findById(bookId);

  if (!book) {
    throw new Error("Antique book not found");
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
    auctionStart: { $lte: new Date() },
    auctionEnd: { $gte: new Date() },
  }).sort({ auctionEnd: 1 }).lean();
};

export const getFutureAuctions = async () => {
  return await AntiqueBook.find({
    auctionStart: { $gt: new Date() },
  }).sort({ auctionStart: 1 }).lean();
};

export const getEndedAuctions = async () => {
  return await AntiqueBook.find({
    auctionEnd: { $lt: new Date() },
  }).sort({ auctionEnd: -1 }).lean();
};

export const getAuctionItemById = async (bookId) => {
  const book = await AntiqueBook.findById(bookId)
    .populate("biddingHistory.bidder", "firstname lastname email")
    .lean();
  if (!book) {
    throw new Error("Antique book not found");
  }
  return book;
};