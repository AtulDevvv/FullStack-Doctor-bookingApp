import Doctor from '../models/doctorsModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Appointment from '../models/appointmentModel.js';

 const  changeAvailability=async(req,res)=>{
    try{
        const {docId}=req.body;
        console.log(" the doctor id is->>>.",docId)
         const docData=await Doctor.findById(docId)
          await Doctor.findByIdAndUpdate(docId,{available:!docData.available})

          res.json({success:true,message:'Availabilty'})

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
 }

 const doctorList=async (req,res)=>{
     try{
         console.log('hii')
         const doctors= await Doctor.find({}).select(['-password','-email'])
          res.json({success:true, doctors})

     }
     catch(error){
         console.log(error)
          res.json({success:false, message:error.message})


     }
 }

 // api for doctor login 
 const doctorLogin=async(req,res)=>{
    try{
        const{email,password}=req.body;
        const doctor= await Doctor.findOne({email})
         if(!doctor){
            return res.json({success:false,message:' Invalid credential'})

         }
         const match= await bcrypt.compare(password,doctor.password)
       
         if(match){
            const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET)
            res.json({success:true,token})

         }else{
            res.json({success:false,message:'Invalid or check the password'})
         }

    }   
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})

    }
 }

 // api for mark appointment completed

 const appointmentCompleted=async(req,res)=>{
    try{
        const {docId,appointmentId}=req.body;


        const appointment= await Appointment.findById(appointmentId)

        if( appointment && appointment.docId===docId){
            await Appointment.findByIdAndUpdate(appointmentId,{isCompleted:true})
            
            res.json({success:true,message:'completed Successfully'})



        }
        else{
            res.json({success:false, message:'something went wrong'})
        }

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
 }
 const appointmentCancellation=async(req,res)=>{
    try{
        const {docId,appointmentId}=req.body;


        const appointment= await Appointment.findById(appointmentId)

        if( appointment && appointment.docId===docId){
            await Appointment.findByIdAndUpdate(appointmentId,{cancelled:true})
            
            res.json({success:true,message:'cancelled Successfully'})



        }
        else{
            res.json({success:false, message:'something went wrong'})
        }

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
 }
// api for doctors dashboard panel

const doctorDashBoard=async (req,res)=>{
    try{

        const {docId}=req.body;
       
        const appointments=await Appointment.find({docId})
       

        let earnings=0
        
      

        if(appointments){

            appointments.map((item)=>{
                if(item.isCompleted || item.payment){
                    earnings+=item.amount
                }
             })
              let patients=[]
    
              appointments.map((item)=>{
                if(!patients.includes(item.userId)){
                    patients.push(item.userId)
    
    
                }
    
              })
               const dashData={
                earnings,appointments: appointments.length,
                patients:patients.length,
                latestAppointments:appointments.reverse().slice(0,3)
               }
               console.log(dashData)
    
               res.json({success:true,dashData})
    

        }else{
            const dashData={
                earnings,appointments:0,
                patients:0,
                latestAppointments:[]
               }
    
               res.json({success:true,dashData})
        }

        
         

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
}

// api to get doctor profile

const  doctorProfile = async(req,res)=>{
    try{
        const {docId}=req.body;
        const docData= await Doctor.findById(docId).select('-password')

        res.json({success:true,docData})


    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
        

    }
}

const updateDocData=async(req,res)=>{
    try{
        const{docId,fees,address,available}=req.body;
        const docData= await Doctor.findByIdAndUpdate(docId,{fees:fees,available:available,address:address})

        res.json({success:true,message:'Profile is updated'})

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})

    }
}

 export {changeAvailability,doctorList,doctorLogin,appointmentCancellation,appointmentCompleted,doctorDashBoard,doctorProfile,updateDocData}