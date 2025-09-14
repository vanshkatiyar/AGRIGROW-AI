const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const Post = require('../models/post');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   POST /api/posts
// @desc    Create a new post
router.post('/', protect, upload.single('image'), async (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Post content is required' });

    try {
        let imageUrl = '';
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "smartfarm_posts" }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
                uploadStream.end(req.file.buffer);
            });
            imageUrl = uploadResult.secure_url;
        }
        const newPost = new Post({ author: req.user.id, content, imageUrl });
        const savedPost = await newPost.save();
        const postWithOwner = await Post.findById(savedPost._id).populate('author', 'name profileImage location role');
        res.status(201).json(postWithOwner);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error while creating post' });
    }
});

// @route   GET /api/posts
// @desc    Get all posts
router.get('/', protect, async (req, res) => {
    try {
        const posts = await Post.find({}).populate('author', 'name profileImage location role').sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error while fetching posts' });
    }
});

// --- NEW: DELETE a post ---
// @route   DELETE /api/posts/:id
// @desc    Delete a user's own post
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        // Authorization Check: Make sure the user deleting the post is the author
        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        await post.deleteOne();
        res.json({ message: 'Post removed successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error while deleting post' });
    }
});

// --- NEW: UPDATE a post ---
// @route   PUT /api/posts/:id
// @desc    Update a user's own post
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        // Authorization Check
        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        post.content = content;
        const updatedPost = await post.save();
        const populatedPost = await Post.findById(updatedPost._id).populate('author', 'name profileImage location role');
        res.json(populatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Server error while updating post' });
    }
});

module.exports = router;