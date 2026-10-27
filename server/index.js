import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import evidenceRoutes from './routes/evidence.js';
import blockerRoutes from './routes/blockers.js';
import dashboardRoutes from './routes/dashboard.js';
import activityRoutes from './routes/activity.js';

// Load environment variables
dotenv.config();

// Initialize MongoDB connection
connectDB();

const app = express();

// Core Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TeamProof server is healthy'
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Nested resource routes (mounted in order of specificity)
app.use(
  '/api/teams/:teamId/projects/:projectId/tasks/:taskId/evidence',
  evidenceRoutes
);
app.use(
  '/api/teams/:teamId/projects/:projectId/tasks/:taskId/blockers',
  blockerRoutes
);
app.use('/api/teams/:teamId/projects/:projectId/tasks', taskRoutes);
app.use('/api/teams/:teamId/projects', projectRoutes);
app.use('/api/teams/:teamId/dashboard', dashboardRoutes);
app.use('/api/teams/:teamId/activity', activityRoutes);
app.use('/api/teams', teamRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

export default app;
