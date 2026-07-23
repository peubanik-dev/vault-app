import mongoose from "mongoose";

const geofenceSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    radius: {
      type: Number,
      required: true,
      default: 100, 
    },

    lastStatus: {
      type: String,
      enum: ["inside", "outside"],
      default: "outside",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

  },
  {
    timestamps: true,
  }
);
geofenceSchema.index(
    {
        device:1,
        name:1
    },
    {
        unique:true
    }
);


export default mongoose.model("Geofence", geofenceSchema);