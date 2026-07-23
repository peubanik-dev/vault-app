import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import validator from "validator";
import jwt from "jsonwebtoken"
import { generateToken } from "../utils/generateToken.js";

 export const signUp= async (req,res)=>{
    try {
       const{name,email,password}=req.body;
       if(!name||!email||!password) {
        return res.status(400).json({
             message: "All fields are required",
        })
       }
       if(!validator.isEmail(email)){
         return res.status(400).json({
                message: "Invalid email",
            });
       }

       if(password.length<6){
        return res.status(400).json({
                 message: "Password must be at least 6 characters",
            });
       }

    
    const existingUser=await User.findOne({email});

    if(existingUser){
        return res.status(400).json({
                message: "User already exists",
            });
    }

    const hashedPassword=await bcrypt.hash(password,10);
    const user=await User.create({
        name,
        email,
        password:hashedPassword,
    })

    const token=generateToken(user._id);

   return res.status(201).json({
         message: "User registered successfully",
         token,
        user:{ 
            id:user._id,
         name:user.name,
         email:user.email 
        },
    });
 }
    catch (error) {
         console.error(error);
         res.status(500).json({
            message: error.message,
        });
    }
 }
 export const login=async (req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email||!password){
            return res.status(400).json({
             message: "All fields are required",
        })
        }

        const authUser=await User.findOne({email});
        if(!authUser){
            return res.status(400).json({
                message: "User does not exist",
            });
        }

        const isMatch=await bcrypt.compare(password,authUser.password);

        if(!isMatch){
           return res.status(400).json({
                message: "Invalid Credentials",
            });
        }
        const token=generateToken(authUser._id);

       return res.status(200).json({
             message: "Logged in successfully",
             token,
        user:{ 
            id:authUser._id,
         name:authUser.name,
         email:authUser.email 
        },
        })
        


    } catch (error) {
         console.error(error);
         res.status(500).json({
            message: error.message,
        });
    }
 }