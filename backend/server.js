const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();

// =====================================================
// CORS CONFIGURATION
// =====================================================

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());

// =====================================================
// HTTP SERVER
// =====================================================

const sslOptions = {
    key: fs.readFileSync(
        path.join(__dirname, 'certs', 'server.key')
    ),
    cert: fs.readFileSync(
        path.join(__dirname, 'certs', 'server.crt')
    )
};

const server = https.createServer(sslOptions, app);

// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// =====================================================
// STATIC FRONTEND FILES
// =====================================================

app.use(express.static(path.join(__dirname, '../frontend')));

// =====================================================
// UPLOADS
// =====================================================

app.use(
    '/uploads',
    express.static(path.join(__dirname, 'routes', 'uploads'))
);

// =====================================================
// MONGODB CONNECTION
// =====================================================

// Primary DB comes from .env (MONGODB_URI). If it's not set or unreachable,
// the server automatically falls back to a local database (see connectDB()).
const MONGODB_URI =
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/share2learn';

// Local fallback DB state (used only when the primary DB is unreachable)
let memoryServer = null;

async function connectDB() {
    // 1) Try the configured (Atlas / primary) database — fail fast if unreachable
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
        console.log('✅ Connected to MongoDB (primary database)');
        return;
    } catch (err) {
        console.warn('⚠️  Primary MongoDB unavailable:', err.message);
        console.warn('↪️  Falling back to a LOCAL MongoDB so the app still works...');
    }

    // 2) Fall back to a local MongoDB (data persisted to backend/.localdb)
    try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const dbPath = path.join(__dirname, '.localdb');
        if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

        try {
            memoryServer = await MongoMemoryServer.create({
                instance: { dbName: 'share2learn', dbPath, storageEngine: 'wiredTiger' }
            });
        } catch (persistErr) {
            // If a persistent path can't be used, fall back to a temporary one
            console.warn('   (persistent local DB unavailable, using a temporary one):', persistErr.message);
            memoryServer = await MongoMemoryServer.create();
        }

        await mongoose.connect(memoryServer.getUri('share2learn'));
        console.log('✅ Connected to LOCAL MongoDB fallback');
        console.log('   URI:', memoryServer.getUri('share2learn'));
        console.log('   NOTE: this is a local database on this machine. To use your');
        console.log('   cloud database instead, ensure internet/Atlas access is available.');
    } catch (memErr) {
        console.error('❌ Could not start a local MongoDB fallback either:', memErr);
        console.error('   The server is running but database features will not work.');
    }
}

connectDB();

// Clean up the local DB process on shutdown
process.on('SIGINT', async () => {
    try { if (memoryServer) await memoryServer.stop(); } catch (e) {}
    process.exit(0);
});

// =====================================================
// AUTHENTICATION ROUTES
// =====================================================

app.use('/api/auth', require('./routes/auth'));

// =====================================================
// PROFILE ROUTES
// =====================================================

app.use('/api/profile', require('./routes/profile'));

// =====================================================
// REQUEST ROUTES
// =====================================================

app.use('/api/requests', require('./routes/requestRoutes'));

// =====================================================
// CONNECTION ROUTES
// =====================================================

app.use('/api/connections', require('./routes/connectionRoutes'));

// =====================================================
// MESSAGE ROUTES
// =====================================================

app.use('/api/messages', require('./routes/messageRoutes'));

// =====================================================
// USER ROUTES
// =====================================================

app.use('/api/users', require('./routes/userRoutes'));

// =====================================================
// FEEDBACK ROUTES
// =====================================================

app.use('/api/feedback', require('./routes/feedback'));

// =====================================================
// ADMIN ROUTES
// =====================================================

app.use('/api/admin', require('./routes/admin'));

// =====================================================
// SOCKET.IO EVENTS
// =====================================================

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join personal room
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    // Send message
    socket.on('sendMessage', (message) => {
        io.to(message.receiver).emit('receiveMessage', message);
    });

    // Call invitation
    socket.on('call-user', ({ from, to, roomId }) => {
        console.log(
            `📞 Call from ${from} to ${to} in room ${roomId}`
        );

        io.to(to).emit('incoming-call', {
            from,
            roomId
        });
    });

    // Call accepted
    socket.on('call-accepted', ({ from, to, roomId }) => {
        io.to(to).emit('call-accepted', {
            from,
            roomId
        });
    });

    // Call declined
    socket.on('call-declined', ({ from, to }) => {
        io.to(to).emit('call-declined', {
            from
        });
    });

    // Join video room
    socket.on('join-room', ({ roomId, userId }) => {
        socket.join(roomId);

        console.log(
            `User ${userId} joined room ${roomId}`
        );

        socket.to(roomId).emit('user-joined', userId);
    });

    // WebRTC offer
    socket.on('offer', ({ roomId, sdp }) => {
        console.log(
            `📡 Offer received for room ${roomId}`
        );

        socket.to(roomId).emit('offer', {
            roomId,
            sdp
        });
    });

    // WebRTC answer
    socket.on('answer', ({ roomId, sdp }) => {
        console.log(
            `✅ Answer received for room ${roomId}`
        );

        socket.to(roomId).emit('answer', {
            roomId,
            sdp
        });
    });

    // ICE candidate
    socket.on('ice-candidate', ({ roomId, candidate }) => {
        console.log(
            `🧊 ICE candidate relayed for room ${roomId}`
        );

        socket.to(roomId).emit('ice-candidate', {
            roomId,
            candidate
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(
            'User disconnected:',
            socket.id
        );
    });
});

// =====================================================
// MAIN FRONTEND PAGE
// =====================================================

app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../frontend/newindex.html')
    );
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(
        `🚀 Server is running on port ${PORT}`
    );
});