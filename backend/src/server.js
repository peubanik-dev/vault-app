import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import Device from "./models/device.model.js";

import http from "http";
import { Server } from "socket.io";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

app.set("io", io);

// deviceId -> Set(socketIds)
const activeDevices = new Map();

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("deviceOnline", async ({ deviceId }) => {
        try {
            const device = await Device.findOne({ deviceId });
            if (!device) return;

            socket.deviceId = deviceId;

            let sockets = activeDevices.get(deviceId);

            if (!sockets) {
                sockets = new Set();
                activeDevices.set(deviceId, sockets);
            }

            sockets.add(socket.id);

            // Only update DB the first time this device comes online
            if (sockets.size === 1) {
                device.isOnline = true;
                device.lastSeen = new Date();
                await device.save();

                io.emit("deviceOnline", { deviceId });
            }

            console.log(
                `${deviceId} online | Active sockets: ${sockets.size}`
            );
        } catch (err) {
            console.error(err);
        }
    });

    socket.on("deviceOffline", async ({ deviceId }) => {
        try {
            const sockets = activeDevices.get(deviceId);

            if (sockets) {
                sockets.delete(socket.id);

                if (sockets.size === 0) {
                    activeDevices.delete(deviceId);

                    const device = await Device.findOne({ deviceId });

                    if (device) {
                        device.isOnline = false;
                        await device.save();
                    }

                    io.emit("deviceOffline", { deviceId });

                    console.log(`${deviceId} explicitly offline`);
                }
            }
        } catch (err) {
            console.error(err);
        }
    });

    socket.on("disconnect", async () => {
        try {
            console.log("Client disconnected:", socket.id);

            if (!socket.deviceId) return;

            const deviceId = socket.deviceId;

            const sockets = activeDevices.get(deviceId);

            if (!sockets) return;

            sockets.delete(socket.id);

            console.log(
                `${deviceId} remaining sockets: ${sockets.size}`
            );

            if (sockets.size > 0) {
                return;
            }

            activeDevices.delete(deviceId);

            // Wait for refresh/reconnect
            setTimeout(async () => {
                if (activeDevices.has(deviceId)) {
                    console.log(`${deviceId} reconnected.`);
                    return;
                }

                const device = await Device.findOne({ deviceId });

                if (!device) return;

                device.isOnline = false;
                await device.save();

                io.emit("deviceOffline", { deviceId });

                console.log(`${deviceId} marked offline`);
            }, 5000);
        } catch (err) {
            console.error(err);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});