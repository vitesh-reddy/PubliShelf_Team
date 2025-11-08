// services/auth.services.js
import bcrypt from "bcrypt";
import Buyer from "../models/Buyer.model.js";
import Publisher from "../models/Publisher.model.js";
import { generateToken } from "../utils/jwt.js";

export const loginUser = async (email, password) => {
  try {
    // Try to find a buyer first (only one DB hit if found)
    const buyerDoc = await Buyer.findOne({ email })
      .populate("cart.book")
      .populate("wishlist")
      .lean();

    if (buyerDoc) {
      const isPasswordValid = await bcrypt.compare(password, buyerDoc.password);
      if (!isPasswordValid) return { token: null, user: null, code: 401 };
      const { password: _pw, ...userWithoutPassword } = buyerDoc;
      const user = { ...userWithoutPassword, role: "buyer" };

      const token = generateToken(user);
      return { token, user, code: 0 };
    }

    const publisherDoc = await Publisher.findOne({ email })
      .populate("books")
      .lean();

    if (publisherDoc) {
      const isPasswordValid = await bcrypt.compare(password, publisherDoc.password);
      if (!isPasswordValid) return { token: null, user: null, code: 401 };

      const { password: _pw, ...userWithoutPassword } = publisherDoc;
      const user = { ...userWithoutPassword, role: "publisher" };

      const token = generateToken(user);
      return { token, user, code: 0 };
    }

    return { token: null, user: null, code: 403 };
  } catch (error) {
    console.error("Error logging in user:", error);  
    throw new Error("Error logging in user");
  }
};
