import express from 'express'
import connectDB from './config/mongoDb.js'
import connectCloudinary from './config/cloudinary.js'
import cors from 'cors'
import 'dotenv/config'
import adminRouter from './routes/adminRoute.js'
import doctorsRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
// const https = require("https");


const app=express()
 
connectDB()
connectCloudinary()

app.use(cors())
app.use(express.json())

// https.globalAgent.options.secureProtocol = "TLSv1_2_method";



 //api endpoints
 app.use('/api/admin',adminRouter)
 app.use('/api/doctor',doctorsRouter)
app.use('/api/user',userRouter)


const port=process.env.PORT || 5000;
 app.listen(port|| 5000,()=>{
    console.log('hello brother is doing great thing')
 })

