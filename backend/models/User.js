const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'buyer', 'expert', null], default: null },
    bio: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    profileImage: { type: String, default: 'https://i.pravatar.cc/150?u=default' },
    coverPhoto: { type: String, default: 'https://source.unsplash.com/1600x900/?nature,landscape' },

    // --- NEW FIELD TO STORE EXPERT-SPECIFIC DATA ---
    expertDetails: {
        specializations: {
            type: [String],
            default: [],
        },
        experienceYears: {
            type: Number,
            default: 0,
        }
    }
    
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;