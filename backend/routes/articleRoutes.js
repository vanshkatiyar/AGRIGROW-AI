const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/articles
// @desc    Create a new article
// @access  Private (Experts)
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'expert') {
        return res.status(403).json({ message: 'Only experts can publish articles.' });
    }

    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }

    try {
        const newArticle = new Article({
            title,
            content,
            author: req.user._id,
        });

        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ message: 'Server error while creating article.' });
    }
});

// @route   GET /api/articles/author/:authorId
// @desc    Get all published articles by a specific author
// @access  Private
router.get('/author/:authorId', protect, async (req, res) => {
    try {
        const articles = await Article.find({ 
            author: req.params.authorId, 
            status: 'published' 
        })
        .sort({ createdAt: -1 });

        res.json(articles);
    } catch (error)
    {
        console.error('Error fetching articles by author:', error);
        res.status(500).json({ message: 'Server error while fetching articles.' });
    }
});

module.exports = router;