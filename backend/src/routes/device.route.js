import express from "express";
import {
    addDevice,
    getDevices,
    verifyDevice,
    deleteDevice,
} from "../controllers/device.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/verify", verifyDevice);
router.use(protectRoute);

router.post("/add", addDevice);

router.get("/", getDevices);



router.delete("/:id", deleteDevice);

export default router;