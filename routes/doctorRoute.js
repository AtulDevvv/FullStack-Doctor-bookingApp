import express from 'express'
import { appointmentCancellation, appointmentCompleted, doctorDashBoard, doctorList, doctorLogin, doctorProfile, updateDocData } from '../controllers/doctorController.js'
import { appointmentDoctor, authDoctor } from '../middleware/authDoctor.js'



 const router= express.Router()
router.get('/list',doctorList)
router.post('/login',doctorLogin)
// router.get('/appointments',authDoctor)
router.get('/appointments',authDoctor,appointmentDoctor)
router.post('/appointment-completed',authDoctor,appointmentCompleted)
router.post('/appointment-cancel',authDoctor,appointmentCancellation)
router.get('/doctor-dashBoard',authDoctor,doctorDashBoard)
router.get('/doctor-profile',authDoctor,doctorProfile)
router.post('/update-profile',authDoctor,updateDocData)


export default router;
