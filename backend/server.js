const dotenv = require('dotenv');
// Load environment variables BEFORE any other code is imported or run.
dotenv.config();

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');

// Now that .env is loaded, these files can be safely imported.
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const marketRoutes = require('./routes/marketRoutes');
const postRoutes = require('./routes/postRoutes'); // --- CHANGE #1: Import the new post routes ---
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const expenseRoutes = require('./routes/expenseRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "http://localhost:8080", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// This will now correctly find process.env.MONGO_URI
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/posts', postRoutes); // --- CHANGE #2: Use the new post routes ---
app.use('/api/expenses', expenseRoutes);
app.use('/api/products', productRoutes);

// Socket.IO Logic
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) socket.join(userId);

    socket.on('sendMessage', async ({ senderId, recipientId, content }) => {
        try {
            const newMessage = new Message({ senderId, recipientId, content });
            let conversation = await Conversation.findOne({ participants: { $all: [senderId, recipientId] } });
            if (!conversation) {
                conversation = await Conversation.create({ participants: [senderId, recipientId] });
            }
            conversation.messages.push(newMessage._id);
            await Promise.all([newMessage.save(), conversation.save()]);
            io.to(recipientId).emit('newMessage', newMessage);
            socket.emit('newMessage', newMessage);
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});