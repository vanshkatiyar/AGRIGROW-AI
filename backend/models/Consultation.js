const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    consultationType: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsultationType', required: true },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'RESCHEDULE_PROPOSED', 'COMPLETED', 'CANCELED', 'CANCELED_BY_EXPERT'],
        default: 'PENDING',
    },
    requested_datetime: { type: Date, required: true },
    scheduled_datetime: { type: Date },
    farmer_notes: { type: String },
    expert_notes: { type: String },
    meeting_link: { type: String },
    attachments: [{ type: String }] // For file uploads
}, { timestamps: true });

const Consultation = mongoose.model('Consultation', consultationSchema);
module.exports = Consultation;