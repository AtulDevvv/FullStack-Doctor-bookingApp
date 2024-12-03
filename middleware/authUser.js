import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

 const authUser= async(req,res,next)=>{
    try{
        const {token}=req.headers
 if(!token){
     return res.json({success:false,message :'Not authorized Login Again'})

 }
 const token_decode=jwt.decode(token,process.env.JWT_SECRET)
  req.body.userId=token_decode.id



 next()


    }
    catch(error){

        console.log(error)
        res.json({success:false,message:error.message})


    }
 }
// api to get user profile
  const getProfile=async(req,res)=>{
    try{
        const{userId}=req.body;

        const userData= await User.findById(userId).select('-password')

        res.json({success:true,userData})


    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})

    }
  }

export {authUser,getProfile}