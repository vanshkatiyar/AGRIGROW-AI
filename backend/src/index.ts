require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const jwt = require('jsonwebtoken');

const Message = require('./models/Message');
const Group = require('./models/Group');
const User = require('./models/User');

// ROUTES
const authRoutes = require('./routes/authRoutes');
const cropRoutes = require('./routes/cropRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const marketRoutes = require('./routes/marketRoutes');
const postRoutes = require('./routes/postRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const aiRoutes = require('./routes/aiRoutes');
const cropDoctorRoutes = require('./routes/cropDoctorRoutes');
const messageRoutes = require('./routes/messageRoutes');
const pushRoutes = require('./routes/pushRoutes');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ['http://localhost:5173'], credentials: true }
});

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// attach routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/crop-doctor', cropDoctorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/push', pushRoutes);

// socket auth
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', socket => {
  socket.join(socket.userId);

  socket.on('send_message', async ({ recipientId, content, type = 'text' }) => {
    const msg = await Message.create({
      senderId: socket.userId,
      recipientId,
      content,
      type,
      sentAt: new Date(),
      status: 'sent',
    });
    io.to(recipientId).emit('receive_message', msg);
    io.to(socket.userId).emit('message_sent', msg);
  });

  socket.on('send_group_message', async ({ groupId, content, type = 'text' }) => {
    const group = await Group.findById(groupId);
    if (!group) return;
    const msg = await Message.create({
      senderId: socket.userId,
      groupId,
      content,
      type,
      sentAt: new Date(),
    });
    group.participants.forEach(uid =>
      io.to(uid.toString()).emit('receive_group_message', msg)
    );
  });

  socket.on('typing', ({ to, isTyping }) => socket.to(to).emit('typing', { userId: socket.userId, isTyping }));
  socket.on('mark_seen', async ({ messageId }) => {
    await Message.findByIdAndUpdate(messageId, { status: 'seen', seenAt: new Date() });
    io.emit('message_seen', { messageId });
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server on :${PORT}`));