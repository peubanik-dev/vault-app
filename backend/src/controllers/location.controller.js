import Device from "../models/device.model.js";
import Location from "../models/location.model.js";
import { checkGeofence } from "../services/geofence.service.js";
import { calculateDistance } from "../utils/distance.js";
export const updateLocation = async (req, res) => {
    try {
        const {
            deviceId,
             deviceSecret,
            latitude,
            longitude,
            speed,
            accuracy,
            battery,
        } = req.body;

        if (!deviceId ||!deviceSecret|| latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        
        if (latitude < -90 ||latitude > 90 ||longitude < -180 ||longitude > 180) {
    return res.status(400).json({
        message: "Invalid coordinates",
    });
}

        const device = await Device.findOne({ deviceId, deviceSecret, });

        if (!device) {
            return res.status(401).json({
       message: "Invalid device credentials",
        });
        }
            
        const location = await Location.create({

            device: device._id,
            latitude,
            longitude,
            speed,
            accuracy,
        });
        console.log("Incoming GPS:", {
    latitude,
    longitude,
});

        const geofenceAlerts = await checkGeofence(
            device._id,
            latitude,
           longitude
          );
        
        const io = req.app.get("io");
        
        device.lastSeen = new Date();
        device.isOnline = true;

        if (battery !== undefined) {
            device.battery = battery;
        }

        await device.save();
        console.log("About to emit socket event");
     if(io){

         io.emit("locationUpdated", {
     deviceId: device.deviceId,
     latitude: location.latitude,
     longitude: location.longitude,
     speed: location.speed,
     accuracy: location.accuracy,
     battery: device.battery,
     isOnline: device.isOnline,
     lastSeen: device.lastSeen,
     createdAt: location.createdAt,
 });
     

if (geofenceAlerts.length > 0) {

    io.emit("geofenceAlert", {
        deviceId: device.deviceId,
        alerts: geofenceAlerts,
        timestamp: new Date()
    });

}
console.log("GEOfence socket emitted", geofenceAlerts);
     }


       return res.status(201).json({
    message: "Location updated successfully",
    location,
    geofenceAlerts,
});
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const getLatestLocation = async (req, res) => {
    try {
        const { deviceId } = req.params;

        const device = await Device.findOne({ deviceId });

        if (!device) {
            return res.status(404).json({
                message: "Device not found",
            });
        }

        const location = await Location.findOne({
            device: device._id,
        })
            .sort({ createdAt: -1 })
            .populate("device");

        if (!location) {
            return res.status(404).json({
                message: "No location found for this device",
            });
        }

        return res.status(200).json({
            message: "Latest location fetched successfully",
            location,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
export const getLocationHistory = async (req, res) => {
    try {
        const { deviceId } = req.params;

        
        const device = await Device.findOne({ deviceId });

        if (!device) {
            return res.status(404).json({
                success: false,
                message: "Device not found"
            });
        }

        const history = await Location.find({
            device: device._id,
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: history.length,
            history,
        });

    } catch (error) {
        console.log("Error fetching location history:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
export const getTravelStats = async (req, res) => {
    try {
        const { deviceId } = req.params;

        const device = await Device.findOne({ deviceId });

        if (!device) {
            return res.status(404).json({
                message: "Device not found",
            });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const locations = await Location.find({
            device: device._id,
            createdAt: { $gte: startOfDay },
        }).sort({ createdAt: 1 });

        let totalDistance = 0;

        for (let i = 1; i < locations.length; i++) {
            totalDistance += calculateDistance(
                locations[i - 1].latitude,
                locations[i - 1].longitude,
                locations[i].latitude,
                locations[i].longitude
            );
        }

        let averageSpeed = 0;

        if (locations.length > 0) {
            averageSpeed =
                locations.reduce((sum, loc) => sum + (loc.speed || 0), 0) /
                locations.length;
        }

        return res.status(200).json({
            distance: (totalDistance / 1000).toFixed(2),
            averageSpeed: (averageSpeed * 3.6).toFixed(2),
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


