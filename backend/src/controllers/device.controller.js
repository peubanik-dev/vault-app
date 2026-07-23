import Device from "../models/device.model.js";
import crypto from "crypto";
export const addDevice= async(req,res)=>{
try {
    const {name,deviceId}=req.body;
    if(!name || !deviceId){
        return res.status(400).json({
        message: "All fields are required",
    });
    }
    const existingDevice=await Device.findOne({deviceId});
    if(existingDevice){
         return res.status(400).json({
        message: "Device already exists",
    });
    }
    const deviceSecret = crypto.randomBytes(32).toString("hex");
    const device = await Device.create({
    name,
    deviceId,
    deviceSecret,
    owner: req.user._id,
});
    return res.status(201).json({
    message: "Device added successfully",
    device,
   
});

} catch (error) {
    console.error(error);

return res.status(500).json({
    message: "Internal Server Error",
    });
}
}

export const getDevices=async (req,res)=>{
   
    try {
        const devices=await Device.find({
            owner:req.user._id
        })

        return res.status(200).json({
            message: devices.length === 0 ? "No devices found" : "Devices fetched successfully",
            devices,
        });

        
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }

}

export const deleteDevice=async (req,res)=>{
    try {
        const {id}=req.params;

    const device=await Device.findById(id);

    if(!device){
     return res.status(404).json({
                message: "Device not found",
            });
    }

    if(device.owner.toString()!==req.user._id.toString()){
        return res.status(403).json({
                message: "You are not authorized to delete this device",
            });
    }
    await device.deleteOne();
     return res.status(200).json({
            message: "Device deleted successfully",
        });

    } catch (error) {
         console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
    
}

export const verifyDevice = async (req, res) => {
  try {
    const { deviceId, deviceSecret } = req.body;

    if (!deviceId || !deviceSecret) {
      return res.status(400).json({
        message: "Device ID and Device Secret are required",
      });
    }

    const device = await Device.findOne({
      deviceId,
      deviceSecret,
    });

    if (!device) {
      return res.status(401).json({
        message: "Invalid device credentials",
      });
    }

    return res.status(200).json({
      message: "Device verified successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};