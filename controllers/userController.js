import validator from "validator"
import bycrypt from 'bcrypt'
import User from "../models/userModel.js"
import {v2 as cloudinary} from 'cloudinary'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import Doctor from "../models/doctorsModel.js"
import Appointment from "../models/appointmentModel.js"
import Stripe from 'stripe'







const registerUser=async(req,res)=>{
     try{
        const {name,email,password}=req.body

        if(!name || !password || !email){
             return res.json({success:false,message:"Missing Details"})

        }
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"enter a valid email"})

        }
        if(password.length<5){
          return res.json({success:false,message:'password should be strong'})
        }
         
        const salt=await bycrypt.genSalt(10)
        const hashedPass=await bycrypt.hash(password,salt)

        const userData={
          name,
          email,
         password: hashedPass

        }
         const newUser= new User(userData)
          const user= await newUser.save()

          const token=jwt.sign({id:user._id},process.env.JWT_SECRET)

           res.json({success:true,token})




     }
     catch(error){
          console.log(error)
           res.json({success:false,message:error.message})

     }
}

const loginUser=async (req,res)=>{
      try{
          const {email,password}=req.body;
          const user= await User.findOne({email})
           if(!user){
            return     res.json({success:false,message:' user does not exist'})

           }
            const isMatch=await bycrypt.compare(password,user.password)
            if(isMatch){
               const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
               res.json({success:true,token})
            }
            else{
               res.json({success:false,message:'Invalid credentails'})

            }

      }
      catch(error){
          console.log(error)
          res.json({success:false,message:error.message})

      }
}

const updateProfile=async (req,res)=>{
   try{

    const{userId,name,phone,address,dob,gender}=req.body

    const imageFile= req.file
     if(!name || !phone||!dob||!gender){
      return res.json({success:false,message:'Data missing'})
     }

      await User.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})

      if(imageFile){
         const imageUpload= await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})

         const imageUrl= imageUpload.secure_url;


         await User.findByIdAndUpdate(userId,{image:imageUrl})
      }

      res.json({success:true,message:'Profile updated'})

   }
   catch(error){
    console.log(error)
           res.json({success:false,message:error.message})


   }
}

const bookAppointment=async (req,res)=>{
    try{
      const {userId,docId,slotDate,slotTime}=req.body

      const docData= await Doctor.findById(docId).select('-password')

      if(!docData.available){
         res.json({success:false,message:'Sorry Doctor is not available at this time.'})


      }

      let slots_booked = docData.slot_booked || {}; 

      //checking for the slots availability

      if(slots_booked[slotDate]){
         if(slots_booked[slotDate].includes(slotTime))
         {

            return res.json({success:false,message:'Slot not available'})
         }else{
            slots_booked[slotDate].push(slotTime)

         }
      }else{
         slots_booked[slotDate]=[]
         slots_booked[slotDate].push(slotTime)

      }

      const userData= await User.findById(userId).select('-password')

      delete docData.slots_booked

      const appointmentdata={
         userId,docId,userData,docData,amount:docData.fees,slotTime,slotDate,date:Date.now()

      }
         const newAppointment=new Appointment(appointmentdata)

         await newAppointment.save()

// save new slots data in Doctors data
await Doctor.findByIdAndUpdate(docId,{slots_booked})

 res.json({success:true,message:'Appointment Booked'})

    }
    catch(err){

console.log(err.message)
res.json({success:false,message:err.message})
    }


}

// api for user appointments for frontend
 const listAppointment=async(req,res)=>{
  try{
   const {userId}=req.body;
   const appointment=await Appointment.find({userId:userId})
   
   res.json({success:true,appointment})

  }
  catch(error){
   console.log(error)
   res.json({success:false,message:error.message})

  }
 }

 // api for cancel appointment

  const cancelAppointment=async(req,res)=>{
   try{
      const {userId,appointmentId}=req.body;
       const appointmentdata= await Appointment.findById(appointmentId)

       if(appointmentdata.userId!==userId){
         return res.json({success:false,message:'Unauthorized user'})

       }

       await Appointment.findByIdAndUpdate(appointmentId,{cancelled:true})
// releasing doctor slot

const {docId,slotDate,slotTime}=appointmentdata

const doctorData= await Doctor.findById(docId)
let slots_booked=doctorData.slot_booked
slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime)

await Doctor.findByIdAndUpdate(docId,{slots_booked:slots_booked})

res.json({success:true,message:'Appointment cancelled '})

   }
   catch(error){
      console.log(error)
      res.json({success:false,message:error.message})
   }
  }

  // api to make payment of appointment using razorrpay




 // api to make payment of appointment using stripe

 const stripe= new Stripe(process.env.STRIPE_API_KEY)

  const paymentStripe =async(req,res)=>{

   try{
      const {appointmentId}=req.body
       const appointmentData= await Appointment.findById(appointmentId)

       if(!appointmentData){
         return res.json({success:false,message:"Appointment Cancelled or not found"})
         
       }
       const paymentIntent = await stripe.paymentIntents.create({
         amount: appointmentData.amount * 100, // Stripe requires amount in the smallest currency unit (e.g., paise for INR)
         currency:process.env.CURRENCY,
         metadata: { 
            
            appointmentId },
       });

 
        
       

       // creation of order
       res.json({
         success: true,
         clientSecret: paymentIntent.client_secret,
         id: paymentIntent.id,
       });

   }
   catch(error){
      console.log(error)
      res.json({success:false,message:error.message})


   }
  }
// Api for verify payment for razorpay

const verifyStripePayment = async (req, res) => {
   try {
     const { paymentIntentId } = req.body;
 
     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
 
     if (paymentIntent.status === 'succeeded') {
       // Update your database to mark the appointment as paid
       console.log(paymentIntent)
       await Appointment.findByIdAndUpdate(paymentIntent.metadata.appointmentId, {
         payment: true,
       });
       
       res.json({ success: true, message: 'Payment Successful' });
     } else {
       res.json({ success: false, message: 'Payment not completed' });
     }
   } catch (error) {
     console.error(error);
     res.json({ success: false, message: error.message });
   }
 };
 




 export {registerUser,listAppointment,loginUser,updateProfile,bookAppointment,cancelAppointment,paymentStripe,verifyStripePayment}