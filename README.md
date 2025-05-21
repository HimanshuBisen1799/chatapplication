
# Feed App - React Frontend

This project is a React-based single-page application that demonstrates key frontend skills including authentication, state management, and real-time communication.

## Features

- Token-based authentication with DummyJSON API
- Light/dark theme toggle with React Context API
- Responsive design with Tailwind CSS
- Redux Toolkit with RTK Query for data fetching and WebSocket communication
- Infinite scrolling feed
- Real-time chat using WebSockets

## Technologies Used

- React with React Router v7
- TypeScript
- Redux Toolkit & RTK Query
- Tailwind CSS & shadcn/ui
- React Hook Form & Zod for form validation
- WebSocket for real-time chat

## Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/HimanshuBisen1799/chatapplication.git
   cd feed-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:8080`

## Demo Login Credentials

For testing purposes, you can use the following credentials:

- username: `himanshubisen@gmail.com`
- Password: `123456`

## Architecture Decisions

### State Management
- **Redux Toolkit**: Used for global state management including authentication state and chat messages.
- **RTK Query**: Implemented for data fetching, caching, and WebSocket communication, providing a clean way to handle API and WebSocket interactions.

### Authentication
- Token-based authentication with localStorage persistence for session management.
- Protected routes using a custom RequireAuth component.

### UI/UX
- Light/dark theme using React Context API and Tailwind's dark mode.
- Responsive design that works well on mobile and desktop.
- Infinite scroll implementation for better user experience with large datasets.

### WebSocket Implementation
- WebSocket connection established through RTK Query's cache entry subscription.
- Chat panel with real-time message exchange through "echo" websocket server.

## Project Structure

- `/src/app`: Redux store configuration
- `/src/components`: Reusable UI components
- `/src/contexts`: React Context providers (e.g., Theme context)
- `/src/features`: Feature-based modules with slices and API definitions
- `/src/pages`: Application pages/routes
- `/src/lib`: Utility functions

## API Integration

This application integrates with:
- [DummyJSON](https://dummyjson.com/docs/auth) for authentication and feed data
- [Echo WebSocket](wss://echo.websocket.org/.ws) for real-time chat
