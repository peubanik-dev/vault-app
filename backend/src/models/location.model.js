import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
    {
        
        device: {
            type: mongoose.Schema.Types.ObjectId,
           ref: "Device",
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

        speed: {
            type: Number,
            default: 0,
        },

        accuracy: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);
locationSchema.index({ device: 1, createdAt: -1 });

const Location = mongoose.model("Location", locationSchema);

export default Location;