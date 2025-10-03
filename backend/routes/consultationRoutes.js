const express = require('express');
const router = express.Router();
const { protect, expert } = require('../middleware/authMiddleware');
const {
    requestConsultation,
    getConsultations,
    acceptConsultation,
    declineConsultation,
    proposeNewTime,
    completeConsultation,
    cancelConsultation,
    createConsultationType,
    getConsultationTypes,
    updateConsultationType,
    deleteConsultationType,
    createAvailability,
    getAvailability,
    deleteAvailability
} = require('../controllers/consultationController');

// Consultation Routes
router.route('/')
    .post(protect, requestConsultation)
    .get(protect, getConsultations);

router.route('/:id/accept').patch(protect, expert, acceptConsultation);
router.route('/:id/decline').patch(protect, expert, declineConsultation);
router.route('/:id/reschedule').patch(protect, expert, proposeNewTime);
router.route('/:id/complete').patch(protect, expert, completeConsultation);
router.route('/:id/cancel').patch(protect, cancelConsultation);

// Consultation Type Routes (for experts)
router.route('/types')
    .post(protect, expert, createConsultationType)
    .get(protect, expert, getConsultationTypes);

router.route('/types/:id')
    .put(protect, expert, updateConsultationType)
    .delete(protect, expert, deleteConsultationType);

// Availability Routes (for experts)
router.route('/availability')
    .post(protect, expert, createAvailability)
    .get(protect, expert, getAvailability);

router.route('/availability/:id')
    .delete(protect, expert, deleteAvailability);

module.exports = router;