# Food Waste Management System

A comprehensive food waste management system for IIT Indore mess facilities (FoodSutra, Gowri, Sheela) with student feedback, ticket management, and waste tracking.

## Features

- **Role-based Access Control**: Student, Staff, and Admin dashboards
- **Mess Management**: Support for multiple mess facilities (FoodSutra, Gowri, Sheela)
- **Ticket System**: Students can raise tickets for quality, hygiene, service, and other issues
- **Feedback System**: Students can submit ratings and feedback for meals
- **Waste Tracking**: Staff can log and track food waste with analytics
- **Pre-written Templates**: Quick templates for common issues and feedback
- **Real-time Updates**: Live polling for tickets and feedback

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- Bcrypt

## Project Structure

```
foodwaste-management/
├── client/          # React frontend
├── server/          # Node.js backend
└── package.json     # Root package.json
```

## Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd foodwaste-management
```

2. Install dependencies
```bash
npm run install:server
npm run install:client
```

3. Set up environment variables

Create `server/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=4000
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:4000/api
```

4. Run the application

Development mode:
```bash
npm run dev          # Start server
npm run dev:client   # Start client (in another terminal)
```

Production mode:
```bash
npm run start        # Start server
cd client && npm run build  # Build client
```

## Deployment

### Backend (Server)
Deploy to platforms like:
- Heroku
- Railway
- Render
- AWS/Google Cloud

### Frontend (Client)
Deploy to platforms like:
- Vercel
- Netlify
- GitHub Pages

## Environment Variables

### Server (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 4000)

### Client (.env)
- `VITE_API_URL` - Backend API URL

## License

Private project

