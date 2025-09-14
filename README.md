<p align="center">
  <img src="frontend/public/AgriGro-Logo.png" alt="AgriGrow-AI Logo" width="200"/>
</p>

<h1 align="center">AgriGrow-AI</h1>

<p align="center">
  <a href="https://nodejs.org/en/" target="_blank">
    <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js v18+">
  </a>
  <a href="https://react.dev/" target="_blank">
    <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Frontend">
  </a>
  <a href="https://expressjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js Backend">
  </a>
  <a href="https://www.mongodb.com/" target="_blank">
    <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Database">
  </a>
  <a href="https://socket.io/" target="_blank">
    <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO Realtime">
  </a>
  <a href="https://cloud.google.com/vertex-ai" target="_blank">
    <img src="https://img.shields.io/badge/Google_Cloud-Vertex_AI-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Google Cloud Vertex AI">
  </a>
</p>

## Table of Contents
- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Project Structure](#project-structure)

## About the Project

AgriGrow-AI is a comprehensive platform designed to empower farmers with advanced tools and resources. It combines AI-driven insights, a thriving marketplace, and expert consultations to enhance farm productivity and profitability.

## Tech Stack

**Frontend:**
- **Framework:** React
- **Build Tool:** Vite
- **UI Components:** shadcn/ui, Radix UI
- **Styling:** Tailwind CSS
- **State Management:** React Query, Context API
- **Routing:** React Router
- **Form Handling:** React Hook Form, Zod
- **Charting:** Recharts
- **Real-time Communication:** Socket.IO Client

**Backend:**
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT, bcryptjs
- **Real-time Communication:** Socket.IO
- **AI Integration:** Google Cloud Vertex AI
- **File Storage:** Cloudinary
- **Caching:** Redis

## Key Features

- **AI-Powered Crop Doctor:** Diagnose crop diseases and receive expert recommendations.
- **Marketplace:** Buy and sell agricultural products with ease.
- **Expert Consultations:** Connect with agricultural experts for personalized advice.
- **Community Feed:** Share knowledge and interact with other farmers.
- **Expense Tracker:** Monitor and manage farm-related expenses.
- **Real-time Messaging:** Communicate with buyers, sellers, and experts.
- **Service Discovery:** Find and offer agricultural services like equipment rental.
- **Weather Forecasting:** Access localized weather updates to plan farming activities.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm / yarn / pnpm
- MongoDB

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/agrigrow-ai.git
   cd agrigrow-ai
   ```

2. **Set up the backend:**
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file in the `backend` directory and add the following environment variables:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     ```
   - Start the backend server:
     ```bash
     npm run dev
     ```

3. **Set up the frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   - Start the frontend development server:
     ```bash
     npm run dev
     ```

## Project Structure

The project is organized into two main directories: `frontend` and `backend`.

- **`/frontend`**: Contains the React-based user interface.
  - **`src/`**: Main source code directory.
    - **`components/`**: Reusable UI components.
    - **`pages/`**: Top-level page components.
    - **`context/`**: React context providers for state management.
    - **`services/`**: API service functions for interacting with the backend.
    - **`hooks/`**: Custom React hooks.
    - **`App.tsx`**: Main application component with routing.

- **`/backend`**: Contains the Express.js server and API logic.
  - **`src/`**: Main source code directory.
    - **`models/`**: Mongoose schemas for database models.
    - **`routes/`**: API route definitions.
    - **`controllers/`**: Request handlers for API routes.
    - **`middleware/`**: Custom middleware functions.
    - **`utils/`**: Utility functions.
    - **`index.ts`**: Main server entry point.