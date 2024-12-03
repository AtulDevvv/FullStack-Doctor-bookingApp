import express from "express";
import { addDoctor, adminDashBoard, adminLogin, allDoctors, appointmentCancel, appointmentsAdmin } from "../controllers/adminController.js";
import upload from "../middleware/multer.js";
import { authAdmin } from "../middleware/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const router=express.Router()

router.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
router.post('/login',adminLogin)
router.post('/all-doctors',authAdmin,allDoctors)
router.post('/change-availability',authAdmin,changeAvailability)
router.get('/appointments',authAdmin,appointmentsAdmin)
router.post('/cancel-appointment',authAdmin,appointmentCancel)
router.get('/dashboard',authAdmin,adminDashBoard)

export default router;