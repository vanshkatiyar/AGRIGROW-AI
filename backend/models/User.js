const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'buyer', 'expert', 'serviceProvider', null], default: null },
    bio: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    profileImage: { type: String, default: 'https://i.pravatar.cc/150?u=default' },
    coverPhoto: { type: String, default: 'https://source.unsplash.com/1600x900/?nature,landscape' },


    expertDetails: {
        specializations: [String],
        hourlyRate: Number,
        ratings: [{
            farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: Number,
            comment: String,
        }],
    },

    // --- MESSAGING-RELATED FIELDS ---
    lastSeen: {
        type: Date,
        default: Date.now
    },
    isOnline: { 
        type: Boolean, 
        default: false 
    },
    messagingPreferences: {
        allowMessagesFrom: { 
            type: String, 
            enum: ['everyone', 'connections', 'none'], 
            default: 'everyone' 
        },
        emailNotifications: { 
            type: Boolean, 
            default: true 
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
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        console.error('Password comparison error:', error);
        throw new Error('Error comparing passwords');
    }
};

// Messaging-related methods
userSchema.methods.setOnline = function() {
    this.isOnline = true;
    this.lastSeen = new Date();
    return this.save();
};

userSchema.methods.setOffline = function() {
    this.isOnline = false;
    this.lastSeen = new Date();
    return this.save();
};

userSchema.methods.canReceiveMessagesFrom = function(senderId) {
    const { allowMessagesFrom } = this.messagingPreferences;
    
    if (allowMessagesFrom === 'none') return false;
    if (allowMessagesFrom === 'everyone') return true;
    
    // For 'connections' - this would need to be implemented based on your connection logic
    // For now, we'll allow everyone
    return true;
};

// Static methods for messaging
userSchema.statics.findUsersForMessaging = function(currentUserId, searchTerm = '', page = 1, limit = 20) {
    const query = {
        _id: { $ne: currentUserId },
        'messagingPreferences.allowMessagesFrom': { $in: ['everyone', 'connections'] }
    };

    if (searchTerm) {
        query.$or = [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } }
        ];
    }

    return this.find(query)
        .select('name email profileImage isOnline lastSeen role')
        .sort({ name: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
};

userSchema.statics.setUserOnline = function(userId) {
    return this.findByIdAndUpdate(
        userId,
        { 
            isOnline: true, 
            lastSeen: new Date() 
        },
        { new: true }
    );
};

userSchema.statics.setUserOffline = function(userId) {
    return this.findByIdAndUpdate(
        userId,
        { 
            isOnline: false, 
            lastSeen: new Date() 
        },
        { new: true }
    );
};

const User = mongoose.model('User', userSchema);
module.exports = User;