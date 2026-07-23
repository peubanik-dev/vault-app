import Geofence from "../models/geofence.model.js";
import { calculateDistance } from "../utils/distance.js";


export const checkGeofence = async (
    deviceId,
    latitude,
    longitude
) => {

    const fences = await Geofence.find({
        device: deviceId,
        isActive: true
    });


    const alerts = [];


    for (const fence of fences) {


        const distance = calculateDistance(
            latitude,
            longitude,
            fence.latitude,
            fence.longitude
        );


        const currentStatus =
            distance <= fence.radius
            ? "inside"
            : "outside";


        if (currentStatus !== fence.lastStatus) {


            alerts.push({

                type:
                currentStatus === "inside"
                ? "ENTER"
                : "EXIT",

                fenceName: fence.name,

                distance: Math.round(distance)

            });


            fence.lastStatus = currentStatus;

            await fence.save();

        }

    }


    return alerts;
};