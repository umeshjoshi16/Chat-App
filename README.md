# 💬 Real-Time Chat App

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,nodejs,express,mongodb,aws,s3,socketio,tailwind,js" />
</p>

<p align="center">
  <strong>A full-stack real-time chat application built with the MERN stack, Socket.IO, and Amazon S3.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Real--Time-Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Storage-Amazon%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white" />
</p>

---

## 📌 About

This project is a **real-time one-to-one chat application** designed to explore how modern full-stack applications handle real-time communication, authentication, persistent messaging, user presence, and secure cloud file storage.

The application uses:

* ⚛️ **React** for the frontend
* 🟢 **Node.js + Express** for the backend
* 🍃 **MongoDB + Mongoose** for persistent data
* 🔌 **Socket.IO** for real-time communication
* 🔐 **JWT + bcrypt** for authentication and password security
* ☁️ **Amazon S3** for profile image storage
* 🔑 **S3 Presigned URLs** for secure image access

The project helped me understand how HTTP-based APIs and persistent WebSocket-style communication can work together in a full-stack application.

---

# ✨ Features

### 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Password hashing with bcrypt
* Protected routes
* Secure session handling

### 💬 Real-Time Messaging

* One-to-one conversations
* Real-time message delivery
* Persistent chat history
* Socket.IO communication
* Automatic message updates without refreshing the page

### 🟢 User Presence

* Online/offline status
* User connection tracking
* Last seen information

### ⌨️ Typing Indicator

* Real-time typing status
* Start typing event
* Stop typing event

### 🔎 User Search

* Search registered users
* Find users to start conversations
* Search-based chat initiation

### 👤 Profile Management

* Profile information
* Profile picture upload
* Profile image stored in Amazon S3
* Secure image access using presigned URLs

### ☁️ AWS S3 Integration

* Private S3 bucket
* Direct file uploads
* Presigned upload URLs
* Presigned download URLs
* S3 object key stored in MongoDB

### 📱 Responsive UI

* Responsive chat interface
* Mobile-friendly layout
* Tailwind CSS styling

---

# 🛠️ Tech Stack

## Frontend

<p>
  <img src="https://skillicons.dev/icons?i=react,js,tailwind,axios" />
</p>

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React.js         | User interface          |
| JavaScript       | Application logic       |
| Axios            | HTTP requests           |
| Socket.IO Client | Real-time communication |
| Tailwind CSS     | Styling                 |

---

## Backend

<p>
  <img src="https://skillicons.dev/icons?i=nodejs,express,js" />
</p>

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Node.js    | Server runtime          |
| Express.js | REST API                |
| Socket.IO  | Real-time communication |
| JWT        | Authentication          |
| bcrypt     | Password hashing        |
| AWS SDK    | Amazon S3 integration   |

---

## Database

<p>
  <img src="https://skillicons.dev/icons?i=mongodb" />
</p>

| Technology | Purpose     |
| ---------- | ----------- |
| MongoDB    | Database    |
| Mongoose   | MongoDB ODM |

---

## Cloud Storage

<p>
  <img src="https://skillicons.dev/icons?i=aws" />
</p>

| Technology        | Purpose                 |
| ----------------- | ----------------------- |
| Amazon S3         | Profile image storage   |
| S3 Presigned URLs | Secure temporary access |

---

# 🏗️ Application Architecture

The application uses both **HTTP APIs** and **Socket.IO**.

```text
                         ┌───────────────────┐
                         │    React Client   │
                         └─────────┬─────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
              HTTP / REST                    Socket.IO
                    │                             │
                    ▼                             ▼
          ┌─────────────────┐           ┌─────────────────┐
          │ Express Server  │           │ Socket.IO Server│
          └────────┬────────┘           └────────┬────────┘
                   │                             │
                   └──────────────┬──────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
             ┌─────────────┐             ┌─────────────┐
             │   MongoDB   │             │  Amazon S3  │
             │             │             │             │
             │ Users       │             │ Profile     │
             │ Chats       │             │ Images      │
             │ Messages    │             │             │
             └─────────────┘             └─────────────┘
```

---

# ⚡ How Real-Time Messaging Works

When User A sends a message:

```text
User A
   │
   ▼
React Application
   │
   ▼
Socket.IO Client
   │
   ▼
Socket.IO Server
   │
   ├──────────────► MongoDB
   │                  │
   │                  ▼
   │             Store Message
   │
   ▼
Socket.IO Event
   │
   ▼
User B
   │
   ▼
React Application
```

The receiver gets the message immediately without manually refreshing the page.

---

# 🔌 Socket.IO Events

The application uses events such as:

```text
connection
disconnect

sendMessage
receiveMessage

typing
stopTyping

userOnline
userOffline
```

### Example message flow

```text
User A
   │
   │ sendMessage
   ▼
Socket.IO Server
   │
   ├── Save message
   │
   └── Emit receiveMessage
             │
             ▼
           User B
```

---

# ☁️ Profile Image Storage

Profile images are **not stored directly inside MongoDB**.

Instead:

```text
User
  │
  ▼
Select Image
  │
  ▼
React Client
  │
  ▼
Request Presigned URL
  │
  ▼
Express Server
  │
  ▼
AWS S3
  │
  ▼
Presigned Upload URL
  │
  ▼
Upload Directly to S3
  │
  ▼
Store Object Key in MongoDB
```

MongoDB stores information such as:

```text
profileImageKey
```

rather than the actual image file.

---

# 🔐 Secure Image Access

When another user needs to display a profile image:

```text
React Client
     │
     ▼
Request User Profile
     │
     ▼
Express Server
     │
     ▼
Read S3 Object Key
     │
     ▼
Generate Presigned URL
     │
     ▼
React Client
     │
     ▼
Display Image
```

The S3 bucket can remain private because the generated URL provides temporary access to the object.

---

# 🗄️ Database Design

The application uses three main collections.

## 👤 Users

Stores user information.

```text
username
email
password
profileImageKey
status
lastSeen
createdAt
updatedAt
```

---

## 💬 Conversations

Stores information about conversations.

```text
participants
lastMessage
createdAt
updatedAt
```

A conversation contains the users participating in the chat.

```text
Conversation
     │
     ├── User A
     └── User B
```

---

## 📨 Messages

Stores individual messages.

```text
conversationId
sender
receiver
content
createdAt
```

Relationship:

```text
User
 │
 ├──────────────┐
 │              │
 ▼              ▼
Conversation   Profile
 │
 ▼
Messages
```

---

# 🔐 Authentication Flow

```text
User
 │
 ▼
Login
 │
 ▼
React
 │
 ▼
POST /login
 │
 ▼
Express
 │
 ├── Find User
 │
 ├── Compare Password
 │
 └── Generate JWT
 │
 ▼
React
 │
 ▼
Authenticated Requests
```

Passwords are hashed using bcrypt and are never stored as plain text.

---



# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone <repository-url>
cd chat-app
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

# 🔑 Environment Variables


Create a `.env` file inside the `backend` directory.


Example:

```env
PORT=your_backend_port_no

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=your_frontend_port_no

AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
```

> ⚠️ **Never commit `.env` or AWS credentials to GitHub.**


Add the following to `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

---

# ▶️ Run the Project

## Start Backend

```bash
cd backend
npm run dev
```

## Start Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Then open the frontend URL displayed by Vite.

---

# 🧠 What I Learned

Building this project helped me understand:

* REST API development with Express
* React ↔ Node.js communication
* MongoDB and Mongoose
* JWT authentication
* Password hashing
* Socket.IO
* Real-time event-based communication
* Online/offline presence
* Typing indicators
* Persistent chat history
* AWS S3 object storage
* S3 presigned URLs
* Secure direct uploads
* Private cloud storage
* Full-stack application architecture
* Separating frontend, backend, database, and storage responsibilities

---

# 🔮 Future Improvements

Planned improvements include:

* 👥 Group chats
* 📎 Image and file sharing
* ❤️ Message reactions
* ✓✓ Read/seen messages
* ✏️ Message editing
* 🗑️ Message deletion
* 🔔 Push notifications
* 🔍 Advanced message search
* 📞 Voice calling
* 🎥 Video calling
* 🌐 Better presence management

---

# 👨‍💻 Author

### Umesh Joshi

**Computer Engineering Student | Full-Stack Developer**

Interested in:

```text
Full-Stack Development
Backend Engineering
Cloud Computing
System Design
Real-Time Applications
```

---

<p align="center">
  ⭐ If you found this project useful, consider starring the repository!
</p>

<p align="center">
  Built with ❤️ using React, Node.js, MongoDB, Socket.IO & AWS
</p>
