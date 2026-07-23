import express from "express";
import {updateLocation,getLatestLocation,getLocationHistory,getTravelStats,} from "../controllers/location.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/update", updateLocation);
router.get("/latest/:deviceId", getLatestLocation);
router.get("/history/:deviceId", getLocationHistory);
router.get("/stats/:deviceId", protectRoute, getTravelStats);

export default router;