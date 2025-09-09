const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');

describe('Message Socket Handler', () => {
    let io, serverSocket, clientSocket1, clientSocket2;
    let testUser1, testUser2, testConversation;
    let httpServer;

    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/agrigrow_test');

        // Set JWT secret for testing
        process.env.JWT_SECRET = 'test_secret';
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async (done) => {
        // Clean up database
        await User.deleteMany({});
        await Message.deleteMany({});
        await Conversation.deleteMany({});

        // Create test users
        testUser1 = new User({
            name: 'Test User 1',
            email: 'test1@example.com',
            password: 'password123',
            location: 'Test Location'
        });
        await testUser1.save();

        testUser2 = new User({
            name: 'Test User 2',
            email: 'test2@example.com',
            password: 'password123',
            location: 'Test Location'
        });
        await testUser2.save();

        // Create test conversation
        testConversation = await Conversation.createConversation(testUser1._id, testUser2._id);

        // Create HTTP server and Socket.IO server
        httpServer = createServer();
        io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        // Import and setup socket handlers
        const {
            authenticateSocket,
            handleConnection,
            handleSendMessage,
            handleJoinConversation,
            handleMarkAsRead,
            handleTyping,
            handleStopTyping,
            handleDisconnect
        } = require('../../socket/messageSocketHandler');

        // Setup socket authentication and handlers
        io.use(authenticateSocket);

        io.on('connection', async (socket) => {
            serverSocket = socket;
            await handleConnection(socket, io);

            socket.on('sendMessage', (data) => {
                handleSendMessage(socket, data, io);
            });

            socket.on('joinConversation', (conversationId) => {
                handleJoinConversation(socket, conversationId);
            });

            socket.on('markAsRead', (messageId) => {
                handleMarkAsRead(socket, messageId, io);
            });

            socket.on('typing', (data) => {
                handleTyping(socket, data, io);
            });

            socket.on('stopTyping', (data) => {
                handleStopTyping(socket, data, io);
            });

            socket.on('disconnect', () => {
                handleDisconnect(socket, io);
            });
        });

        httpServer.listen(() => {
            const port = httpServer.address().port;

            // Create JWT tokens for test users
            const token1 = jwt.sign({ id: testUser1._id }, process.env.JWT_SECRET);
            const token2 = jwt.sign({ id: testUser2._id }, process.env.JWT_SECRET);

            // Create client connections
            clientSocket1 = new Client(`http://localhost:${port}`, {
                auth: { token: token1 }
            });

            clientSocket2 = new Client(`http://localhost:${port}`, {
                auth: { token: token2 }
            });

            // Wait for both clients to connect
            let connectedCount = 0;
            const checkConnected = () => {
                connectedCount++;
                if (connectedCount === 2) {
                    done();
                }
            };

            clientSocket1.on('connect', checkConnected);
            clientSocket2.on('connect', checkConnected);
        });
    });

    afterEach(() => {
        io.close();
        clientSocket1.close();
        clientSocket2.close();
        httpServer.close();
    });

    describe('Authentication', () => {
        test('should authenticate user with valid token', (done) => {
            expect(clientSocket1.connected).toBe(true);
            done();
        });

        test('should reject connection with invalid token', (done) => {
            const invalidClient = new Client(`http://localhost:${httpServer.address().port}`, {
                auth: { token: 'invalid_token' }
            });

            invalidClient.on('connect_error', (error) => {
                expect(error.message).toBe('Authentication error');
                invalidClient.close();
                done();
            });
        });
    });

    describe('Message Sending', () => {
        test('should send message successfully', (done) => {
            const messageData = {
                recipientId: testUser2._id.toString(),
                content: 'Test message',
                conversationId: testConversation._id.toString()
            };

            clientSocket2.on('newMessage', (message) => {
                expect(message.content).toBe('Test message');
                expect(message.senderId._id).toBe(testUser1._id.toString());
                done();
            });

            clientSocket1.emit('sendMessage', messageData);
        });

        test('should confirm message delivery', (done) => {
            const messageData = {
                recipientId: testUser2._id.toString(),
                content: 'Test message',
                conversationId: testConversation._id.toString()
            };

            clientSocket1.on('messageDelivered', (data) => {
                expect(data.messageId).toBeDefined();
                done();
            });

            clientSocket1.emit('sendMessage', messageData);
        });

        test('should reject empty message', (done) => {
            const messageData = {
                recipientId: testUser2._id.toString(),
                content: '',
                conversationId: testConversation._id.toString()
            };

            clientSocket1.on('messageError', (error) => {
                expect(error.message).toBe('Invalid message data');
                done();
            });

            clientSocket1.emit('sendMessage', messageData);
        });

        test('should reject message that is too long', (done) => {
            const messageData = {
                recipientId: testUser2._id.toString(),
                content: 'a'.repeat(1001),
                conversationId: testConversation._id.toString()
            };

            clientSocket1.on('messageError', (error) => {
                expect(error.message).toBe('Message too long');
                done();
            });

            clientSocket1.emit('sendMessage', messageData);
        });
    });

    describe('Conversation Management', () => {
        test('should join conversation successfully', (done) => {
            clientSocket1.on('joinedConversation', (data) => {
                expect(data.conversationId).toBe(testConversation._id.toString());
                done();
            });

            clientSocket1.emit('joinConversation', testConversation._id.toString());
        });

        test('should reject joining unauthorized conversation', (done) => {
            // Create conversation between other users
            const unauthorizedConversation = new mongoose.Types.ObjectId();

            clientSocket1.on('error', (error) => {
                expect(error.message).toBe('Access denied to conversation');
                done();
            });

            clientSocket1.emit('joinConversation', unauthorizedConversation.toString());
        });
    });

    describe('Read Receipts', () => {
        test('should mark message as read and notify sender', async (done) => {
            // First, send a message
            const message = new Message({
                senderId: testUser1._id,
                recipientId: testUser2._id,
                conversationId: testConversation._id,
                content: 'Test message'
            });
            await message.save();

            clientSocket1.on('messageRead', (data) => {
                expect(data.messageId).toBe(message._id.toString());
                expect(data.readBy).toBe(testUser2._id.toString());
                done();
            });

            clientSocket2.emit('markAsRead', message._id.toString());
        });
    });

    describe('Typing Indicators', () => {
        test('should broadcast typing status', (done) => {
            clientSocket2.on('userTyping', (data) => {
                expect(data.conversationId).toBe(testConversation._id.toString());
                expect(data.userId).toBe(testUser1._id.toString());
                expect(data.isTyping).toBe(true);
                done();
            });

            // Both users join the conversation first
            clientSocket1.emit('joinConversation', testConversation._id.toString());
            clientSocket2.emit('joinConversation', testConversation._id.toString());

            setTimeout(() => {
                clientSocket1.emit('typing', { conversationId: testConversation._id.toString() });
            }, 100);
        });

        test('should broadcast stop typing status', (done) => {
            clientSocket2.on('userTyping', (data) => {
                if (!data.isTyping) {
                    expect(data.conversationId).toBe(testConversation._id.toString());
                    expect(data.userId).toBe(testUser1._id.toString());
                    expect(data.isTyping).toBe(false);
                    done();
                }
            });

            // Both users join the conversation first
            clientSocket1.emit('joinConversation', testConversation._id.toString());
            clientSocket2.emit('joinConversation', testConversation._id.toString());

            setTimeout(() => {
                clientSocket1.emit('typing', { conversationId: testConversation._id.toString() });
                setTimeout(() => {
                    clientSocket1.emit('stopTyping', { conversationId: testConversation._id.toString() });
                }, 100);
            }, 100);
        });
    });

    describe('User Status', () => {
        test('should broadcast user online status', (done) => {
            // This test verifies that user status is broadcasted when connecting
            // The status should be updated in the database
            setTimeout(async () => {
                const user = await User.findById(testUser1._id);
                expect(user.isOnline).toBe(true);
                done();
            }, 100);
        });

        test('should broadcast user offline status on disconnect', (done) => {
            clientSocket2.on('userStatusChanged', (data) => {
                expect(data.userId).toBe(testUser1._id.toString());
                expect(data.isOnline).toBe(false);
                done();
            });

            setTimeout(() => {
                clientSocket1.disconnect();
            }, 100);
        });
    });
});