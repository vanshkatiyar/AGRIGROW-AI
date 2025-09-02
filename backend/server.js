const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');

// --- Environment Variable Configuration ---
const credentialsPath = path.join(__dirname, 'google-credentials.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
dotenv.config();
console.log('Google Credentials Path Set:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Mongoose Models and Middleware ---
// These require statements are confirmed to be compatible with your files.
const User = require('./models/User');
const { protect } = require('./middleware/authMiddleware');

// Create the Message Model for the chat functionality
const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
}, { timestamps: true });
const Message = mongoose.model('Message', messageSchema);


// --- Express App Setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Existing API Routes ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const marketRoutes = require('./routes/marketRoutes');
const postRoutes = require('./routes/postRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const productRoutes = require('./routes/productRoutes');
const cropDoctorRoutes = require('./routes/cropDoctorRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/crop-doctor', cropDoctorRoutes);


// --- NEW CHAT API ROUTES ---

// 1. Get a list of all other users to start a conversation with.
app.get('/api/conversations', protect, async (req, res) => {
    try {
        // Find all users except the currently logged-in one
        const allUsers = await User.find({ _id: { $ne: req.user._id } }).select('name profileImage');
        res.json(allUsers);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error while fetching conversations' });
    }
});

// 2. Get the message history between the logged-in user and another user.
app.get('/api/messages/:recipientId', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.user._id, recipientId: req.params.recipientId },
                { senderId: req.params.recipientId, recipientId: req.user._id }
            ]
        }).sort({ createdAt: 'asc' }); // Sort by oldest first
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error while fetching messages' });
    }
});


// --- Server and Socket.IO Setup ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:8080", methods: ["GET", "POST"] }});

// This object maps a userId to their unique socket.id for real-time messaging
let onlineUsers = {};

// --- REAL-TIME CHAT LOGIC ---
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // When a user logs in and connects, they emit this event with their userId
    socket.on('addUser', (userId) => {
        onlineUsers[userId] = socket.id;
        console.log(`User ${userId} is online.`);
    });

    // When a user sends a message from the frontend
    socket.on('sendMessage', async ({ senderId, recipientId, content }) => {
        try {
            // 1. Save the message to the database
            const newMessage = new Message({ senderId, recipientId, content });
            await newMessage.save();

            // 2. Find the recipient's socket if they are online
            const recipientSocketId = onlineUsers[recipientId];

            if (recipientSocketId) {
                // 3. Send the message in real-time to the recipient's client
                io.to(recipientSocketId).emit('newMessage', newMessage);
            }
        } catch (error) {
            console.error('Error handling sendMessage:', error);
        }
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        // Find the user in the onlineUsers object and remove them
        for (let userId in onlineUsers) {
            if (onlineUsers[userId] === socket.id) {
                delete onlineUsers[userId];
                console.log(`User ${userId} went offline.`);
                break;
            }
        }
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});