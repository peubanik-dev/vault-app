import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import deviceRoutes from "./routes/device.route.js";
import locationRoutes from "./routes/location.route.js";
import geofenceRoutes from "./routes/geofence.routes.js";
import sosRoutes from "./routes/sos.route.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/geofence", geofenceRoutes);
app.use("/api/sos", sosRoutes);

app.get("/", (req, res) => {
    res.send("GPS Tracker API is running...");
});

export default app;