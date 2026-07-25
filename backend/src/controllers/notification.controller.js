import Notification from "../models/notification.model.js";
import Device from "../models/device.model.js";


export const getNotifications = async (req, res) => {
    try {
        const { deviceId } = req.params;

        const device = await Device.findOne({ deviceId });

        if (!device) {
            return res.status(404).json({
                message: "Device not found",
            });
        }

        const notifications = await Notification.find({
            device: device._id,
        })
        .sort({ createdAt: -1 });


        return res.status(200).json({
            success: true,
            notifications,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};