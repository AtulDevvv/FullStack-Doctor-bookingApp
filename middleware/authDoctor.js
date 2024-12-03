import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import Appointment from '../models/appointmentModel.js'

 const authDoctor= async(req,res,next)=>{
    try{
        const {token}=req.headers
     
 if(!token){
     return res.json({success:false,message :'Not authorized Login Again'})

 }
 const token_decode=jwt.decode(token,process.env.JWT_SECRET)
 
  req.body.docId=token_decode.id



 next()


    }
    catch(error){

        console.log(error)
        res.json({success:false,message:error.message})


    }
 }


 const appointmentDoctor=async (req,res)=>{
     try{
        const {docId}=req.body;

        const appointments= await Appointment.find({docId})
      

       
            res.json({success:true,appointments})

        
        
     }
     catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
     }
 }

export {authDoctor,appointmentDoctor}