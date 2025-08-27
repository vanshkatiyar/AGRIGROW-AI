const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Expense = require('../models/Expense');

// @route   POST /api/expenses
// @desc    Add a new expense or income record
// @access  Private
router.post('/', protect, async (req, res) => {
    const { title, amount, type, date, category } = req.body;

    try {
        const newExpense = new Expense({
            user: req.user.id,
            title,
            amount,
            type,
            date,
            category,
        });

        const savedExpense = await newExpense.save();
        res.status(201).json(savedExpense);
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Server error while adding expense' });
    }
});

// @route   GET /api/expenses
// @desc    Get all expenses for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error while fetching expenses' });
    }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense record
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        await expense.deleteOne();
        res.json({ message: 'Expense removed successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Server error while deleting expense' });
    }
});

module.exports = router;