//controllers/admin.controller.js
import Admin from "../models/Admin.model.js";
import Publisher from "../models/Publisher.model.js";
import Manager from "../models/Manager.model.js";
import jwt from "jsonwebtoken";
import { getAllPublishers, deletePublisherById, togglePublisherBan } from "../services/publisher.services.js";
import { getAllBuyers, getAllOrders } from "../services/buyer.services.js";
import Order from "../models/Order.model.js";
import Book from "../models/Book.model.js";
import Buyer from "../models/Buyer.model.js";

// ==================== Auth ====================
export const loginAdmin = async (req, res) => {
  try {
    const { adminKey } = req.body;

    if (!adminKey) {
      return res.status(400).json({
        success: false,
        message: "Admin key is required",
        data: null
      });
    }

    const admins = await Admin.find({ isActive: true });
    let authenticatedAdmin = null;

    for (const admin of admins) {
      const isMatch = await admin.compareAdminKey(adminKey);
      if (isMatch) {
        authenticatedAdmin = admin;
        break;
      }
    }

    if (!authenticatedAdmin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin key",
        data: null
      });
    }

    authenticatedAdmin.lastLogin = new Date();
    await authenticatedAdmin.save();

    const token = jwt.sign(
      {
        id: authenticatedAdmin._id,
        role: "admin",
        isSuperAdmin: authenticatedAdmin.isSuperAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        admin: {
          id: authenticatedAdmin._id,
          name: authenticatedAdmin.name,
          email: authenticatedAdmin.email,
          isSuperAdmin: authenticatedAdmin.isSuperAdmin,
          lastLogin: authenticatedAdmin.lastLogin
        }
      }
    });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({
      success: false,
      message: "Error during admin login",
      data: null
    });
  }
};

// ==================== Analytics ====================
export const getPlatformAnalytics = async (req, res) => {
  try {
    const [managersCount, buyersCount, booksCount, ordersAgg, publishersCount] = await Promise.all([
      Manager.countDocuments({ "moderation.status": "approved", "account.status": "active" }),
      getAllBuyers().then(b => b.length),
      Book.countDocuments(),
      Order.aggregate([
        { $match: {} },
        { $group: { _id: null, revenue: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
      ]),
      Publisher.countDocuments({ "moderation.status": "approved" })
    ]);

    const orders = (ordersAgg[0]?.count) || 0;
    const ordersRevenue = (ordersAgg[0]?.revenue) || 0;

    return res.status(200).json({
      managers: managersCount,
      publishers: publishersCount,
      buyers: buyersCount,
      books: booksCount,
      orders,
      ordersRevenue
    });
  } catch (error) {
    console.error("Error fetching platform analytics:", error);
    return res.status(500).json({ message: "Error fetching platform analytics" });
  }
};

// ==================== Dashboard ====================
export const getAdminDashboard = async (req, res) => {
  try {
    const buyers = await getAllBuyers();
    const orders = await getAllOrders();
    const auctions = []; // Placeholder

    const totalBuyers = buyers.length;
    const totalOrders = orders.length;
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
    const activities = [];

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

// ==================== Publisher Ban ====================
export const banPublisher = async (req, res) => {
  try {
    const publisherId = req.params.id;
    const publisher = await togglePublisherBan(publisherId);
    res.status(200).json({
      success: true,
      message: publisher.account?.status === "banned" ? "Publisher banned successfully" : "Publisher unbanned successfully",
      data: {
        banned: publisher.account?.status === "banned",
        account: publisher.account
      }
    });
  } catch (error) {
    console.error("Error toggling publisher ban:", error);
    res.status(500).json({
      success: false,
      message: "Error updating publisher ban status",
      data: null
    });
  }
};
// ==================== Admin Team (Super Admin only) ====================
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-adminKey").populate({ path: "createdBy", select: "name email" });
    return res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return res.status(500).json({ message: "Error fetching admins" });
  }
};

export const getAdminByIdController = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-adminKey").populate({ path: "createdBy", select: "name email" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    return res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin by id:", error);
    return res.status(500).json({ message: "Error fetching admin" });
  }
};

export const createAdminController = async (req, res) => {
  try {
    const { name, email, adminKey, isSuperAdmin = false } = req.body || {};
    if (!name || !email || !adminKey) {
      return res.status(400).json({ message: "Name, email and adminKey are required" });
    }
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ message: "Admin with this email already exists" });
    const createdBy = req.user && req.user.id ? req.user.id : null;
    const admin = new Admin({ name, email, adminKey, isSuperAdmin: Boolean(isSuperAdmin), createdBy });
    await admin.save();
    const sanitized = await Admin.findById(admin._id).select("-adminKey").populate({ path: "createdBy", select: "name email" });
    return res.status(201).json(sanitized);
  } catch (error) {
    console.error("Error creating admin:", error);
    if (error.code === "DUPLICATE_ADMIN_KEY") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error creating admin" });
  }
};

export const deleteAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await Admin.findById(id);
    if (!target) return res.status(404).json({ message: "Admin not found" });
    if (target.isSuperAdmin) return res.status(400).json({ message: "Cannot delete a super admin" });
    if (req.user && String(target._id) === String(req.user.id)) return res.status(400).json({ message: "Admins cannot delete themselves" });
    await Admin.findByIdAndDelete(id);
    return res.status(200).json({ deleted: true });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({ message: "Error deleting admin" });
  }
};

export const updateAdminKeyController = async (req, res) => {
  try {
    const { currentKey, newKey } = req.body || {};
    if (!currentKey || !newKey) return res.status(400).json({ message: "Current and new key are required" });
    const admin = await Admin.findById(req.user && req.user.id ? req.user.id : null);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    const matches = await admin.compareAdminKey(currentKey);
    if (!matches) return res.status(401).json({ message: "Current key is incorrect" });
    admin.adminKey = newKey;
    await admin.save();
    return res.status(200).json({ message: "Admin key updated. Please login again." });
  } catch (error) {
    console.error("Error updating admin key:", error);
    if (error.code === "DUPLICATE_ADMIN_KEY") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error updating admin key" });
  }
};

export const changeAdminKeyController = async (req, res) => {
  try {
    const { id } = req.params;
    const { newAdminKey } = req.body;

    if (!newAdminKey || newAdminKey.trim().length < 6) {
      return res.status(400).json({ message: "New admin key must be at least 6 characters" });
    }

    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.isSuperAdmin) return res.status(400).json({ message: "Cannot change key for super admin" });

    // Set the new admin key
    admin.adminKey = newAdminKey;
    
    try {
      await admin.save();
      return res.status(200).json({ 
        success: true, 
        message: "Admin key changed successfully" 
      });
    } catch (error) {
      if (error.code === "DUPLICATE_ADMIN_KEY") {
        return res.status(409).json({ 
          success: false, 
          message: "This admin key is already in use by another admin. Please choose a different key." 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error changing admin key:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error changing admin key" 
    });
  }
};

// ==================== Manager Management ====================
export const getManagersForAdmin = async (req, res) => {
  try {
    const managers = await Manager.find()
      .populate({ path: "moderation.by", select: "name email" })
      .populate({ path: "account.by", select: "name email" })
      .sort({ createdAt: -1 });
    
    // Return managers with full name computed
    const managersData = managers.map(m => ({
      _id: m._id,
      firstname: m.firstname,
      lastname: m.lastname,
      fullName: `${m.firstname} ${m.lastname}`.trim(),
      email: m.email,
      moderation: m.moderation,
      account: m.account,
      lastLogin: m.lastLogin,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }));
    
    return res.status(200).json(managersData);
  } catch (error) {
    console.error("Error fetching managers:", error);
    return res.status(500).json({ message: "Error fetching managers" });
  }
};

export const getManagerDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const manager = await Manager.findById(id)
      .populate({ path: "moderation.by", select: "name email" })
      .populate({ path: "account.by", select: "name email" });
    
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    
    const managerData = {
      _id: manager._id,
      firstname: manager.firstname,
      lastname: manager.lastname,
      fullName: `${manager.firstname} ${manager.lastname}`.trim(),
      email: manager.email,
      moderation: manager.moderation,
      account: manager.account,
      lastLogin: manager.lastLogin,
      createdAt: manager.createdAt,
      updatedAt: manager.updatedAt
    };
    
    return res.status(200).json(managerData);
  } catch (error) {
    console.error("Error fetching manager details:", error);
    return res.status(500).json({ message: "Error fetching manager details" });
  }
};

export const approveManagerController = async (req, res) => {
  try {
    const { id } = req.params;
    const update = {
      $set: {
        "moderation.status": "approved",
        "moderation.by": (req.user && req.user.id) || null,
        "moderation.at": new Date(),
        "moderation.reason": null,
        "account.status": "active"
      }
    };
    const manager = await Manager.findByIdAndUpdate(id, update, { new: true });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    return res.status(200).json({ message: "Manager approved" });
  } catch (error) {
    console.error("Error approving manager:", error);
    return res.status(500).json({ message: "Error approving manager" });
  }
};

export const rejectManagerController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "" } = req.body || {};
    const update = {
      $set: {
        "moderation.status": "rejected",
        "moderation.by": (req.user && req.user.id) || null,
        "moderation.at": new Date(),
        "moderation.reason": reason
      }
    };
    const manager = await Manager.findByIdAndUpdate(id, update, { new: true });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    return res.status(200).json({ message: "Manager rejected" });
  } catch (error) {
    console.error("Error rejecting manager:", error);
    return res.status(500).json({ message: "Error rejecting manager" });
  }
};

export const banManagerController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "" } = req.body || {};
    const update = {
      $set: {
        "account.status": "banned",
        "account.by": (req.user && req.user.id) || null,
        "account.at": new Date(),
        "account.reason": reason
      }
    };
    const manager = await Manager.findByIdAndUpdate(id, update, { new: true });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    return res.status(200).json({ message: "Manager banned" });
  } catch (error) {
    console.error("Error banning manager:", error);
    return res.status(500).json({ message: "Error banning manager" });
  }
};

export const reinstateManagerController = async (req, res) => {
  try {
    const { id } = req.params;
    const update = {
      $set: {
        "account.status": "active",
        "account.by": (req.user && req.user.id) || null,
        "account.at": new Date(),
        "account.reason": null
      }
    };
    const manager = await Manager.findByIdAndUpdate(id, update, { new: true });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    return res.status(200).json({ message: "Manager reinstated" });
  } catch (error) {
    console.error("Error reinstating manager:", error);
    return res.status(500).json({ message: "Error reinstating manager" });
  }
};
