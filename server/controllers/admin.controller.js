//controllers/admin.controller.js
import { getAllPublishers, deletePublisherById } from "../services/publisher.services.js";
import { getAllBuyers, getAllOrders } from "../services/buyer.services.js";
import Order from "../models/Order.model.js";
import Book from "../models/Book.model.js";
import Buyer from "../models/Buyer.model.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const buyers = await getAllBuyers();
    const orders = await getAllOrders();
    const auctions = []; // Placeholder

    const totalBuyers = buyers.length;
    const totalOrders = orders.length; // flattened items count
    const totalRevenue = orders.reduce((sum, r) => sum + (r.book.price || 0) * (r.quantity || 0), 0);
    const activeAuctions = auctions.filter(
      (auction) => auction.status === "ongoing"
    ).length;

    const genreCounts = await Book.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $project: { genre: "$_id", count: 1, _id: 0 } },
    ]);

    const revenueByGenre = await Order.aggregate([
      { $unwind: "$items" },
      { $lookup: { from: "books", localField: "items.book", foreignField: "_id", as: "bookDetails" } },
      { $unwind: "$bookDetails" },
      {
        $group: {
          _id: "$bookDetails.genre",
          revenue: { $sum: { $multiply: ["$items.quantity", "$bookDetails.price"] } },
        },
      },
      { $project: { genre: "$_id", revenue: 1, _id: 0 } },
    ]);

    const admin = { name: "Vitesh", email: "admin1@gmail.com" };
    const publishers = await getAllPublishers();
    const activities = []; // Placeholder as per original

    const analytics = {
      totalBuyers,
      totalOrders,
      totalRevenue,
      activeAuctions,
      genreCounts,
      revenueByGenre,
    };

    res.status(200).json({
      success: true,
      message: "Admin dashboard data fetched successfully",
      data: { admin, publishers, activities, analytics }
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin dashboard data",
      data: null
    });
  }
};

export const banPublisher = async (req, res) => {
  try {
    const publisherId = req.params.id;
    await deletePublisherById(publisherId);
    res.status(200).json({
      success: true,
      message: "Publisher banned successfully",
      data: null
    });
  } catch (error) {
    console.error("Error banning publisher:", error);
    res.status(500).json({
      success: false,
      message: "Error banning publisher",
      data: null
    });
  }
};