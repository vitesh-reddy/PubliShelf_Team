//routes/admin.routes.js
import express from "express";
import { protect, authorize, checkAdminKey } from "../middleware/auth.middleware.js";
import { getAdminDashboard, banPublisher } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard/:key", checkAdminKey, getAdminDashboard);
router.delete("/publishers/:id/ban", checkAdminKey, banPublisher);

export default router;