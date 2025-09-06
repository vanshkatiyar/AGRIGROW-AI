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

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Mongoose Models and Middleware ---
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

// --- API Routes ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const marketRoutes = require('./routes/marketRoutes');
const postRoutes = require('./routes/postRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const productRoutes = require('./routes/productRoutes');
const cropDoctorRoutes = require('./routes/cropDoctorRoutes');
const cropRoutes = require('./routes/cropRoutes'); // <-- IMPORT CROP ROUTES

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/crop-doctor', cropDoctorRoutes);
app.use('/api/crops', cropRoutes); // <-- REGISTER CROP ROUTES


// --- Server and Socket.IO Setup ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:8080", methods: ["GET", "POST"] }});

let onlineUsers = {};

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('addUser', (userId) => {
        onlineUsers[userId] = socket.id;
        console.log(`User ${userId} is online.`);
    });

    socket.on('sendMessage', async ({ senderId, recipientId, content }) => {
        try {
            const newMessage = new Message({ senderId, recipientId, content });
            await newMessage.save();

            const recipientSocketId = onlineUsers[recipientId];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('newMessage', newMessage);
            }
        } catch (error) {
            console.error('Error handling sendMessage:', error);
        }
    });

    socket.on('disconnect', () => {
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