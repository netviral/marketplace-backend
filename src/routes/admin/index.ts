import { Router } from "express";
import checkIsAdmin from "../../middlewares/admin.middleware.js";
import { getPendingVendors, updateVendorStatus } from "../../controllers/admin/adminVendor.js";

const router = Router();

// Get all vendors with pending status
router.get("/vendors/pending", checkIsAdmin, getPendingVendors);

// Update vendor status
router.put("/vendors/:id/status", checkIsAdmin, updateVendorStatus);

export default router;
