import mongoose from "mongoose";
const deviceSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim: true,
    },
    deviceId:{
        type:String,
         required:true,
        unique:true,
    },

    deviceSecret: {
  type: String,
  required: true,
},
    owner:{
         type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    battery: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
},

    isOnline: {
      type: Boolean,
      default: false,
    },
     lastSeen: {
      type: Date,
      default: Date.now,
    },
},
{ timestamps: true }
)
const Device=mongoose.model("Device",deviceSchema);
export default Device;