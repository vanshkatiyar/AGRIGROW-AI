const express = require('express');
const router = express.Router();
const { getAllExperts } = require('../controllers/expertController');
const Consultation = require('../models/Consultation');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/experts
// @desc    Get all experts
// @access  Public
router.get('/', getAllExperts);

// @route   GET /api/experts/stats
// @desc    Get dashboard statistics for the logged-in expert
// @access  Private (Experts only)
router.get('/stats', protect, async (req, res) => {
    // Ensure the user is an expert
    if (req.user.role !== 'expert') {
        return res.status(403).json({ message: 'Forbidden: Access is restricted to experts.' });
    }

    try {
        const expertId = req.user._id;

        // --- Calculate All Stats Concurrently for Performance ---
        const [
            totalConsultations,
            activeClientsResult,
            monthlyEarningsResult,
            avgRatingResult,
            revenueHistory
        ] = await Promise.all([
            // 1. Total Consultations (all non-rejected)
            Consultation.countDocuments({ expert: expertId, status: { $ne: 'rejected' } }),
            
            // 2. Active Clients (count of unique farmers the expert has consulted with)
            Consultation.distinct('farmer', { expert: expertId }),

            // 3. Current Month's Earnings
            Consultation.aggregate([
                { $match: { 
                    expert: expertId, 
                    status: 'completed',
                    // Filter for consultations updated in the current calendar month and year
                    updatedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } 
                }},
                { $group: { _id: null, total: { $sum: '$consultationFee' } } }
            ]),

            // 4. Average Rating (from all completed consultations that have a rating)
            Consultation.aggregate([
                { $match: { expert: expertId, status: 'completed', rating: { $exists: true, $ne: null } } },
                { $group: { _id: null, avg: { $avg: '$rating' } } }
            ]),
            
            // 5. Revenue History for the last 6 months
            Consultation.aggregate([
                { $match: { 
                    expert: expertId, 
                    status: 'completed',
                    updatedAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } // Performance optimization
                }},
                {
                    $group: {
                        _id: { year: { $year: "$updatedAt" }, month: { $month: "$updatedAt" } },
                        total: { $sum: '$consultationFee' }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ])
        ]);
        
        // --- Format Revenue Data for Recharts Graph ---
        // This ensures that months with zero revenue are still included in the graph.
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRevenue = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // JS months are 0-indexed, MongoDB are 1-indexed
            const monthName = monthNames[date.getMonth()];

            const record = revenueHistory.find(r => r._id.year === year && r._id.month === month);
            monthlyRevenue.push({ name: monthName, revenue: record ? record.total : 0 });
        }

        // --- Construct Final Response Object ---
        const stats = {
            totalConsultations: totalConsultations,
            activeClients: activeClientsResult.length,
            monthlyEarnings: monthlyEarningsResult[0]?.total || 0,
            averageRating: avgRatingResult[0]?.avg || 0,
            monthlyRevenue: monthlyRevenue,
        };

        res.json(stats);

    } catch (error) {
        console.error('Error fetching expert stats:', error);
        res.status(500).json({ message: 'Server error while fetching expert statistics.' });
    }
});

module.exports = router;