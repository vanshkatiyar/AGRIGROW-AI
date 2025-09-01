const dotenv = require('dotenv');
const path = require('path'); // Import the 'path' module

// --- THIS IS THE DEFINITIVE FIX ---
// We will programmatically set the environment variable that Google's library looks for.
// This is the most reliable way to ensure authentication works.
const credentialsPath = path.join(__dirname, 'google-credentials.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;

// Now, load the rest of the variables from the .env file
dotenv.config();

// Add a check to prove it's working
console.log('Google Credentials Path Set:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const marketRoutes = require('./routes/marketRoutes');
const postRoutes = require('./routes/postRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const productRoutes = require('./routes/productRoutes');
const cropDoctorRoutes = require('./routes/cropDoctorRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "http://localhost:8080", methods: ["GET", "POST"] }});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/crop-doctor', cropDoctorRoutes);

// Socket.IO Logic
io.on('connection', (socket) => { /* ... existing socket logic ... */ });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});