const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This creates a link to the User model
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String, // We will store the URL from Cloudinary here
        required: false,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    comments: [
        // We can build this out later
    ],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;