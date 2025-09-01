const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['farmer', 'buyer', 'expert', null], 
        default: null 
    },
    bio: { 
        type: String, 
        default: '' 
    },
    // The default value provides a nice fallback image for new users
    profileImage: {
        type: String,
        default: 'https://source.unsplash.com/150x150/?portrait,person'
    },
    coverPhoto: { 
        type: String, 
        default: 'https://source.unsplash.com/1600x400/?nature,field,landscape' 
    },
    gender: { 
        type: String, 
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'] 
    },
    // You can add more fields like followers/following here later
}, { timestamps: true }); // timestamps adds createdAt and updatedAt fields automatically

// This function runs automatically BEFORE a new user document is saved to the database.
// It hashes the password for security.
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// A helper method on the user model to compare the entered password with the hashed one in the database.
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;