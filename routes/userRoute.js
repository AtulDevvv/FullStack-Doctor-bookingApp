 import express from 'express'
import { bookAppointment, cancelAppointment, listAppointment, loginUser, paymentStripe, registerUser, updateProfile, verifyStripePayment } from '../controllers/userController.js'
import { authUser, getProfile } from '../middleware/authUser.js'
import upload from '../middleware/multer.js'

 const router= express.Router()

  router.post('/register',registerUser)
  router.post('/login',loginUser)
  router.get('/get-profile',authUser,getProfile)
  router.post('/update-profile',upload.single('image'),authUser,updateProfile)
  router.post('/book-appointment',authUser,bookAppointment)
  router.get('/appointments',authUser,listAppointment)
  router.post('/cancel-appointment',authUser,cancelAppointment)
  router.post('/payment-stripe',authUser,paymentStripe)
  router.post('/verifyStripe',authUser,verifyStripePayment)

  


  export default router;