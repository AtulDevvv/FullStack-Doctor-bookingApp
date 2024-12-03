import validator from 'validator'
import bcrypt from'bcrypt'
import {v2 as cloudinary} from 'cloudinary'

import Doctor from '../models/doctorsModel.js'

import jwt from 'jsonwebtoken'
import Appointment from '../models/appointmentModel.js'
import User from '../models/userModel.js'



// api for AddingDoctors

 const addDoctor=async(req,res)=>{
     try{
        const {name,email,password,speciality,degree,experience,about,fees,address}=req.body;

        const imageFile=req.file;
          if(!name || !password || !speciality || !experience || !about || !fees || !address){
            return res.json({success:false, message:'Missing Details'})
          }

          if(!validator.isEmail(email)){
            return res.json({success:false, message:'Please enter the valid email'})

          }
          if(password.length<5){
             return res.json({success:false,message:' Please enter a strong password'})

          }

          // hash the password

          const salt= await bcrypt.genSalt(10)
           const hashPassword = await bcrypt.hash(password,salt)
          // upload image to cloudinary

           const imageUpload= await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})

            const imageUrl=imageUpload.url;

            const doctorData={
               name,email,image:imageUrl,password:hashPassword,speciality,degree,experience,about,fees,available:true, address:JSON.parse(address),date:Date.now()
            }

           const newDoctor= new Doctor(doctorData)

            await newDoctor.save();

             res.json({success:true,message:' new Doctors data is saved successfully'})
     }
     catch(error){
        console.log(error)
        res.json({success:false,message:' new Doctors data is not  saved successfully'})

     }

    }

    const adminLogin=async (req,res)=>{
        try{
            const {email,password}=req.body;
          
            if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASS  ){
                const token=jwt.sign(email+password,process.env.JWT_SECRET)

                res.send({success:true,token})


            }else{
                res.json({success:false,message:'invalid credentails'})
            }
             

        }
        catch(error){
             console.log(error)

        }
    }


    const allDoctors =async(req,res)=>{
      try{


        const doctors=await Doctor.find({}).select('-password')
        // console.log(doctors)

        res.json({success:true,doctors})


      }
      catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
      }
    }

    // api for all appointments lists
     const appointmentsAdmin=async (req,res)=>{
       try{
        const appointments=await Appointment.find({})
        res.json({success:true,appointments})
console.log(appointments)
       }
       catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
       }
     }
// api for appointment cancellation for admin side

const appointmentCancel=async (req,res)=>{

 
    try{
       const {appointmentId}=req.body;
   
        const appointmentdata= await Appointment.findById(appointmentId)
 
        
 
        await Appointment.findByIdAndUpdate(appointmentId,{cancelled:true})
 // releasing doctor slot
 
 const {docId,slotDate,slotTime}=appointmentdata
 
 const doctorData= await Doctor.findById(docId)

 let slots_booked=doctorData.slots_booked

 slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime)
 
 await Doctor.findByIdAndUpdate(docId,{slots_booked:slots_booked})
 
 res.json({success:true,message:'Appointment cancelled '})
 
    }
    catch(error){
       console.log(error)
       res.json({success:false,message:error.message})
    }
   }

   // Api for dashboard data for admin

   const adminDashBoard= async (req,res)=>{
    try{
      const doctors=await Doctor.find({})
      const users=await User.find({})
       const appointments= await Appointment.find({})
       

       const dashData={
        doctors:doctors.length,
        users:users.length,
        appointments:appointments.length,
        latestAppointments:appointments.reverse().slice(0,5)
       }
       res.json({success:true,dashData})

    }
    catch(error){
      console.log(error)
      res.json({success:false,message:error.message})

    }
   }



    export { addDoctor,adminLogin,allDoctors,appointmentsAdmin,appointmentCancel,adminDashBoard}