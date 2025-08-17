const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'buyer', 'expert', null], default: null },
    // Add other fields from your frontend interface as needed
}, { timestamps: true });

// This function runs BEFORE a user is saved to the database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    // Hash the password with a salt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// A helper method to compare passwords during login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;