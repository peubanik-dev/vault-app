import SOS from "../models/sos.model.js";

export const sendSOS = async (req, res) => {
  try {
    const {
      deviceId,
      latitude,
      longitude,
      message,
    } = req.body;

    if (!deviceId || latitude == null || longitude == null) {
      return res.status(400).json({
        message: "Missing SOS details",
      });
    }

    const sos = await SOS.create({
      deviceId,
      latitude,
      longitude,
      message,
    });

    // send realtime alert
    const io = req.app.get("io");

    if (io) {
      io.emit("sosAlert", sos);
    }

    res.status(201).json({
      message: "SOS sent successfully",
      sos,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};