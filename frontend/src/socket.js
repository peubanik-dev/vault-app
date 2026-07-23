import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: true,
});

socket.on("connect", () => {
  const deviceId = localStorage.getItem("trackerDeviceId");
  const isConnected = localStorage.getItem("trackerConnected") === "true";
  if (deviceId && isConnected) {
    socket.emit("deviceOnline", { deviceId });
  }
});

export default socket;