const express = require('express');
const { createAppointment, getAvailableSlots } = require('../controllers/appointmentController');
const router = express.Router();

router.post('/book', createAppointment);
router.get('/available-slots', getAvailableSlots);

module.exports = router;