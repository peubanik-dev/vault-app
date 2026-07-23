import express from "express";
import { sendSOS } from "../controllers/sos.controller.js";

const router = express.Router();

router.post("/send", sendSOS);

export default router;