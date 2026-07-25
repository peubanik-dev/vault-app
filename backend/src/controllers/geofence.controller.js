import Device from "../models/device.model.js";
import Geofence from "../models/geofence.model.js";

export const createGeofence = async (req, res) => {
  try {
    const { deviceId, name, latitude, longitude, radius } = req.body;

    if (!deviceId || !name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    const geofence = await Geofence.findOneAndUpdate(
      {
    device: device._id,
    name: name
},
      {
        device: device._id,
        name,
        latitude,
        longitude,
        radius,
      },
      {
         returnDocument: "after",
        upsert: true,
      }
    );

    res.status(200).json({
      message: "Geofence saved successfully",
      geofence,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const getGeofence = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    const geofences = await Geofence.find({
      device: device._id,
    });

    if (geofences.length===0) {
      return res.status(200).json([]);
    }

    res.status(200).json(geofences);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const deleteGeofence = async (req, res) => {
  try {
    const { id } = req.params;

    await Geofence.findByIdAndDelete(id);

    res.status(200).json({
      message: "Geofence deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};