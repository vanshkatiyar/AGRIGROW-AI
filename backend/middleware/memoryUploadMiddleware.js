const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const memoryUpload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB file size limit
    }
});

module.exports = memoryUpload;