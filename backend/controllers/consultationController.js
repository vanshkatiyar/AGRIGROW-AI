const Consultation = require('../models/Consultation');
const User = require('../models/User');
const ConsultationType = require('../models/ConsultationType');
const ExpertProfile = require('../models/ExpertProfile');
const Availability = require('../models/Availability');
const { createNotification } = require('./notificationController');

// @desc    Request a new consultation
// @route   POST /api/consultations
// @access  Private (Farmer)
const requestConsultation = async (req, res) => {
    const { expertId, consultationTypeId, requested_datetime, farmer_notes, attachments } = req.body;
    const farmerId = req.user._id;

    try {
        const expert = await User.findById(expertId);
        if (!expert || expert.role !== 'expert') {
            return res.status(404).json({ message: 'Expert not found' });
        }

        const consultationType = await ConsultationType.findById(consultationTypeId);
        if (!consultationType) {
            return res.status(404).json({ message: 'Consultation type not found' });
        }

        const consultation = new Consultation({
            farmer: farmerId,
            expert: expertId,
            consultationType: consultationTypeId,
            requested_datetime,
            farmer_notes,
            attachments,
            status: 'PENDING'
        });

        const createdConsultation = await consultation.save();
        await createNotification(expertId, `You have a new consultation request from ${req.user.name}`, `/consultations/${createdConsultation._id}`);
        res.status(201).json(createdConsultation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get consultations for the logged-in user
// @route   GET /api/consultations
// @access  Private
const getConsultations = async (req, res) => {
    try {
        const query = {};
        if (req.user.role === 'farmer') {
            query.farmer = req.user._id;
        } else if (req.user.role === 'expert') {
            query.expert = req.user._id;
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        const consultations = await Consultation.find(query)
            .populate('farmer', 'name profileImage')
            .populate('expert', 'name profileImage')
            .populate('consultationType')
            .sort({ createdAt: -1 });

        res.json(consultations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Accept a consultation request
// @route   PATCH /api/consultations/:id/accept
// @access  Private (Expert)
const acceptConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        if (consultation.expert.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        consultation.status = 'ACCEPTED';
        consultation.scheduled_datetime = req.body.scheduled_datetime || consultation.requested_datetime;
        const updatedConsultation = await consultation.save();
        await createNotification(consultation.farmer, `Your consultation request has been accepted by ${req.user.name}`, `/consultations/${consultation._id}`);
        res.json(updatedConsultation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Decline a consultation request
// @route   PATCH /api/consultations/:id/decline
// @access  Private (Expert)
const declineConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        if (consultation.expert.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        consultation.status = 'DECLINED';
        consultation.expert_notes = req.body.reason;
        const updatedConsultation = await consultation.save();
        await createNotification(consultation.farmer, `Your consultation request has been declined by ${req.user.name}`, `/consultations/${consultation._id}`);
        res.json(updatedConsultation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Propose a new time for a consultation
// @route   PATCH /api/consultations/:id/reschedule
// @access  Private (Expert)
const proposeNewTime = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        if (consultation.expert.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        consultation.status = 'RESCHEDULE_PROPOSED';
        consultation.scheduled_datetime = req.body.new_datetime;
        consultation.expert_notes = req.body.message;
        const updatedConsultation = await consultation.save();
        await createNotification(consultation.farmer, `${req.user.name} has proposed a new time for your consultation`, `/consultations/${consultation._id}`);
        res.json(updatedConsultation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Complete a consultation
// @route   PATCH /api/consultations/:id/complete
// @access  Private (Expert)
const completeConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        if (consultation.expert.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        consultation.status = 'COMPLETED';
        consultation.expert_notes = req.body.notes;
        const updatedConsultation = await consultation.save();
        await createNotification(consultation.farmer, `Your consultation with ${req.user.name} has been marked as complete`, `/consultations/${consultation._id}`);
        res.json(updatedConsultation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Cancel a consultation
// @route   PATCH /api/consultations/:id/cancel
// @access  Private
const cancelConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        if (req.user.role === 'expert' && consultation.expert.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (req.user.role === 'farmer' && consultation.farmer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        consultation.status = req.user.role === 'expert' ? 'CANCELED_BY_EXPERT' : 'CANCELED';
        const updatedConsultation = await consultation.save();
        if (req.user.role === 'expert') {
            await createNotification(consultation.farmer, `Your consultation with ${req.user.name} has been canceled`, `/consultations/${consultation._id}`);
        } else {
            await createNotification(consultation.expert, `Your consultation with ${req.user.name} has been canceled`, `/consultations/${consultation._id}`);
        }
        res.json(updatedConsultation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new consultation type
// @route   POST /api/consultations/types
// @access  Private (Expert)
const createConsultationType = async (req, res) => {
    const { title, description, duration_minutes, price } = req.body;
    try {
        const consultationType = new ConsultationType({
            expert: req.user._id,
            title,
            description,
            duration_minutes,
            price
        });
        const createdType = await consultationType.save();
        res.status(201).json(createdType);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all consultation types for an expert
// @route   GET /api/consultations/types
// @access  Private (Expert)
const getConsultationTypes = async (req, res) => {
    try {
        const types = await ConsultationType.find({ expert: req.user._id });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a consultation type
// @route   PUT /api/consultations/types/:id
// @access  Private (Expert)
const updateConsultationType = async (req, res) => {
    const { title, description, duration_minutes, price } = req.body;
    try {
        const type = await ConsultationType.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Consultation type not found' });
        }
        if (type.expert.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        type.title = title || type.title;
        type.description = description || type.description;
        type.duration_minutes = duration_minutes || type.duration_minutes;
        type.price = price || type.price;
        const updatedType = await type.save();
        res.json(updatedType);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a consultation type
// @route   DELETE /api/consultations/types/:id
// @access  Private (Expert)
const deleteConsultationType = async (req, res) => {
    try {
        const type = await ConsultationType.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Consultation type not found' });
        }
        if (type.expert.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await type.remove();
        res.json({ message: 'Consultation type removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new availability slot
// @route   POST /api/consultations/availability
// @access  Private (Expert)
const createAvailability = async (req, res) => {
    const { startTime, endTime } = req.body;
    try {
        const availability = new Availability({
            expert: req.user._id,
            startTime,
            endTime
        });
        const createdAvailability = await availability.save();
        res.status(201).json(createdAvailability);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all availability for an expert
// @route   GET /api/consultations/availability
// @access  Private (Expert)
const getAvailability = async (req, res) => {
    try {
        const availability = await Availability.find({ expert: req.user._id });
        res.json(availability);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete an availability slot
// @route   DELETE /api/consultations/availability/:id
// @access  Private (Expert)
const deleteAvailability = async (req, res) => {
    try {
        const availability = await Availability.findById(req.params.id);
        if (!availability) {
            return res.status(404).json({ message: 'Availability not found' });
        }
        if (availability.expert.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await availability.remove();
        res.json({ message: 'Availability removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
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
};