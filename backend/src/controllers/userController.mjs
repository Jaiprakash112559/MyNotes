import userModel from "../models/userModel.mjs";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { secretToken } from "../../config.mjs";
const registerUser=async (req,res)=>{
    try {
        let {name,email,password,role,phone}=req.body;
        // console.log(req.body)
        if(!name){
            return res.status(400).send({status:"failed",message:"Name is required"});
        }
        if(!email){
            return res.status(400).send({status:"failed",message:"Email is required"});
        }
         if(!password){
            return res.status(400).send({status:"failed",message:"Password is required"});
        }
         if(!role){
            return res.status(400).send({status:"failed",message:"Role is required"});
        }
        if(!phone){
            return res.status(400).send({status:"failed",message:"Phone is required"});
        }

        password= await bcrypt.hash(password, 10);
        // console.log(password)
        const createdUser= await userModel.create({name,email,password,role,phone});
        return res.status(201).send({status:"ok",message:"User registered successfully"});
    } catch (error) {
        if(error.message.includes('validation')){
            return res.status(400).send({status:"failed",message:error.message});
        }else  if(error.message.includes('duplicate')){
            return res.status(400).send({status:"failed",message:error.message});
        }else{
            return res.status(500).send({status:"failed",message:error.message});
        }
    }
}

const loginUser=async (req,res)=>{
    try {
        const {email,password }= req.body;
        const user= await userModel.findOne({email:email});
        if(!user){
            return res.status(400).send({status:"failed",message:"user does not exist"});
        }
        let hashcode= user.password;
        // console.log(hashcode);
        let check= await bcrypt.compare(password,hashcode);
        // console.log(check)
        if(!check){
            return res.status(400).send({status:"failed",message:"invalid credentials"});
        }
        let token = jwt.sign({role:user.role,id:user._id},secretToken,{expiresIn:'24h'});
        if(!token){
            return res.status(500).send({status:"failed",message:"try in some time"});
        }
        let data={name:user.name, email:user.email, role:user.role, phone:user.phone, token:token,id:user._id};
        // req.headers.setHeader("auth-token",token);
        return res.status(200).send({status:"ok",data:data});

    } catch (error) {
         if(error.message.includes('validation')){
            return res.status(400).send({status:"failed",message:error.message});
        }else  if(error.message.includes('duplicate')){
            return res.status(400).send({status:"failed",message:error.message});
        }else{
            return res.status(500).send({status:"failed",message:error.message});
        }
    }
}
const updateUser=async (req,res)=>{
    try {
        const {email, name}=req.body;
        const updatedData= await userModel.updateOne({email:email},{$set:{name:name}});
        return res.send({status:"ok", data:updatedData})
    } catch (error) {
         return res.send({status:"failed", message:error.message})
    }
}
const getProfile= async(req,res)=>{
    try {
        const id= req.params.id;
        const user= await userModel.findById(id).select("-password");
        if(!user){
            return res.status(404).send({status:"failed",message:"User not found"});
        }
        return res.status(200).send({status:"ok",data:user});
    } catch (error) {
         if(error.message.includes('validation')){
            return res.status(400).send({status:"failed",message:error.message});
        }else  if(error.message.includes('duplicate')){
            return res.status(400).send({status:"failed",message:error.message});
        }else{
            return res.status(500).send({status:"failed",message:error.message});
        }
    }
}

const changePassword = async (req, res) => {
    try {
        const userId = req.user.id; // From authentication middleware
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).send({ status: "failed", message: "Current and new passwords are required" });
        }

        // Fetch user to get the current hashed password
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({ status: "failed", message: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({ status: "failed", message: "Invalid current password" });
        }

        // Hash new password and update
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await userModel.findByIdAndUpdate(userId, { password: hashedNewPassword });

        return res.status(200).send({ status: "ok", message: "Password updated successfully" });

    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).send({ status: "failed", message: "An error occurred while changing password" });
    }
}

export {registerUser,loginUser,updateUser,getProfile,changePassword}