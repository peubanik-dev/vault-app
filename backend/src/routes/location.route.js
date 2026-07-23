import express from "express";
import {updateLocation,getLatestLocation,getLocationHistory} from "../controllers/location.controller.js";

const router = express.Router();

router.post("/update", updateLocation);
router.get("/latest/:deviceId", getLatestLocation);
router.get("/history/:deviceId", getLocationHistory);

export default router;