# Real-Time Chat App

A full-featured real-time chat application leveraging modern web technologies for seamless communication.

## Features

- **Real-time Messaging:** Instantly send and receive messages using WebSockets.
- **User Authentication:** Secure registration and login with JWT-based authentication.
- **Responsive UI:** Optimized for desktops, tablets, and mobile devices.
- **Chat Rooms:** Create, join, and manage multiple chat rooms.
- **User Presence:** See who is online in each chat room.
- **Message History:** Persistent chat history stored in MongoDB.
- **Typing Indicators:** See when other users are typing.
- **Notifications:** In-app notifications for new messages and user activity.

## Tech Stack

- **Frontend:** React, Socket.IO-client, Redux, Tailwind CSS
- **Backend:** Node.js, Express, Socket.IO, JWT
- **Database:** MongoDB (Mongoose ODM)
- **Other:** dotenv for environment variables, bcrypt for password hashing

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/real-time-chat-app.git
    cd real-time-chat-app
    ```

2. **Install dependencies for both client and server:**
    ```bash
    cd server
    npm install
    cd ../client
    npm install
    ```

3. **Set up environment variables:**
    - Copy `.env.example` to `.env` in both `server` and `client` directories.
    - Fill in the required values (e.g., MongoDB URI, JWT secret, client/server ports).

4. **Start the backend server:**
    ```bash
    cd ../server
    npm start
    ```

5. **Start the frontend:**
    ```bash
    cd ../client
    npm start
    ```

6. **Access the app:**
    - Open your browser and navigate to `http://localhost:3000` (or the port specified in your `.env`).

## Usage

1. **Register** a new account or **log in** with existing credentials.
2. **Create** a new chat room or **join** an existing one.
3. **Chat** in real time with other users.
4. **View** online users and chat history.
5. **Receive** notifications and see typing indicators.

## Project Structure

```
real-time-chat-app/
├── client/         # React frontend
├── server/         # Node.js/Express backend
├── README.md
└── ...
```

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

This project is licensed under the MIT License.
