
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const http = require('http');
const corsOptions = require('./config/cors.config');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://scovers.org', 'https://www.scovers.org', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/applications', require('./routes/application.routes'));
app.use('/api/institutions', require('./routes/institution.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/scholarships', require('./routes/scholarship.routes'));
app.use('/api/upi', require('./routes/upi.routes'));
app.use('/api/blogs', require('./routes/blog.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/investor', require('./routes/investor.routes'));
app.use('/api/university', require('./routes/university.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// WebSocket for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
  });
  
  socket.on('application-update', (data) => {
    io.to('admin-dashboard').emit('application-change', data);
    io.to('investor-dashboard').emit('metric-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };



















































// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const { Server } = require('socket.io');
// const http = require('http');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL,
//     methods: ['GET', 'POST', 'PUT', 'DELETE']
//   }
// });

// // Middleware
// app.use(helmet());
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));
// app.use(morgan('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Database connection 
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Routes
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/users', require('./routes/user.routes'));
// app.use('/api/applications', require('./routes/application.routes'));
// app.use('/api/institutions', require('./routes/institution.routes'));
// app.use('/api/courses', require('./routes/course.routes'));
// app.use('/api/scholarships', require('./routes/scholarship.routes'));
// app.use('/api/upi', require('./routes/upi.routes'));
// app.use('/api/blogs', require('./routes/blog.routes'));
// app.use('/api/admin', require('./routes/admin.routes'));
// app.use('/api/investor', require('./routes/investor.routes'));
// app.use('/api/university', require('./routes/university.routes'));
// app.use('/api/analytics', require('./routes/analytics.routes'));

// // WebSocket for real-time updates
// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);
  
//   socket.on('join-room', (room) => {
//     socket.join(room);
//   });
  
//   socket.on('application-update', (data) => {
//     io.to('admin-dashboard').emit('application-change', data);
//     io.to('investor-dashboard').emit('metric-update', data);
//   });
  
//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     message: err.message || 'Internal Server Error',
//     error: process.env.NODE_ENV === 'development' ? err : {}
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = { app, io };