import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      default: "Emergency SOS",
    },
    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SOS", sosSchema);