import express from "express";
import {
  createGeofence,
  getGeofence,
  deleteGeofence,
} from "../controllers/geofence.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createGeofence);

router.get("/:deviceId", protectRoute, getGeofence);

router.delete("/:id", protectRoute, deleteGeofence);

export default router;