const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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
const Message = require('./models/Message');
const Group = require('./models/Group');
const Conversation = require('./models/Conversation');
const { protect } = require('./middleware/authMiddleware');

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
const messageRoutes = require('./routes/messageRoutes');
const pushRoutes = require('./routes/pushRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/crop-doctor', cropDoctorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/push', pushRoutes);


// --- Server and Socket.IO Setup ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] }});

let onlineUsers = {}; // Maps userId to socketId

// Socket.io authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
        socket.userId = decoded.id;
        next();
    });
});


io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} with socket ID: ${socket.id}`);
    
    // Add user to online list and join their private room
    onlineUsers[socket.userId] = socket.id;
    socket.join(socket.userId);

    // Join all group chats the user is a part of
    Group.find({ participants: socket.userId }).then(groups => {
        groups.forEach(group => socket.join(group._id.toString()));
    });

    // Handle 1-on-1 private messages
    socket.on('sendMessage', async ({ recipientId, content, type = 'text' }) => {
        try {
            // Find or create a conversation
            let conversation = await Conversation.findOneAndUpdate(
                { participants: { $all: [socket.userId, recipientId] } },
                { $set: { participants: [socket.userId, recipientId] } },
                { upsert: true, new: true }
            );

            const newMessage = new Message({
                senderId: socket.userId,
                recipientId,
                content,
                type,
                conversationId: conversation._id
            });
            await newMessage.save();

            conversation.lastMessage = newMessage._id;
            await conversation.save();

            const recipientSocketId = onlineUsers[recipientId];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('newMessage', newMessage);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });
    
    // Handle group messages
    socket.on('sendGroupMessage', async ({ groupId, content, type = 'text' }) => {
        try {
            const newMessage = new Message({
                senderId: socket.userId,
                groupId,
                content,
                type,
            });
            await newMessage.save();
            
            // Emit to all members of the group including the sender
            io.to(groupId).emit('newMessage', newMessage);
        } catch (error) {
            console.error('Error sending group message:', error);
        }
    });

    socket.on('disconnect', () => {
        delete onlineUsers[socket.userId];
        console.log(`User disconnected: ${socket.userId}`);
    });
});


// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});