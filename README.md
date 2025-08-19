---

# 📹 One-to-One Video Chat Application with Messaging

A real-time **video chat application** with a built-in **messaging feature**, built using **WebRTC**, **Socket.io**, **Node.js**, and **React**.
The project enables two users to connect in a **private room**, allowing them to **video call, mute/unmute mic, enable/disable camera, and exchange text messages**.

---

## 🚀 Features

* ✅ One-to-one **video call** using WebRTC
* ✅ Real-time **text messaging** inside the same room
* ✅ **Mute/Unmute microphone** & **Turn on/off video** controls
* ✅ **Socket.io signaling server** for peer discovery & connection setup
* ✅ **React Context** for managing Socket connection across components
* ✅ Deployed on **Render (Backend)** & **Vercel (Frontend)**

---

## 🏗️ Project Structure

```
video-chat-app/
│
├── client/        # React Frontend (Vercel)
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoPlayer.js     # Handles video/audio rendering
│   │   │   ├── ChatBox.js         # Messaging UI & logic
│   │   │   ├── Controls.js        # Mic/Video toggle buttons
│   │   │
│   │   ├── context/
│   │   │   └── SocketProvider.js  # Global Socket.io context
│   │   │
│   │   ├── App.js                 # Main app entry, routes rooms
│   │   └── index.js               # React entry point
│   │
│   └── package.json
│
├── server/        # Node.js Backend (Render)
│   ├── index.js   # Socket.io signaling server
│   └── package.json
│
└── README.md
```

---

## ⚙️ How It Works

### 1. **Frontend (React)**

* `SocketProvider.js`
  Wraps the app with a **Socket.io client instance**, connecting to backend (`Render` URL via `.env`).

* `VideoPlayer.js`
  Uses **WebRTC `getUserMedia` API** to capture webcam & microphone stream.
  Establishes **peer-to-peer connection** once the signaling is done via Socket.io.

* `ChatBox.js`
  Simple chat window where users exchange messages using **socket events**.

* `Controls.js`
  Buttons to **mute/unmute microphone** and **enable/disable camera** (toggling `MediaStreamTrack.enabled`).

---

### 2. **Backend (Node.js + Socket.io)**

The backend acts as a **signaling server** (does not transmit video/audio, only coordinates connections).

* **Maps emails/users to socket IDs**
* Handles events:

  * `room:join` → When a user joins a room
  * `user:joined` → Notifies all users in the room about new participant
  * `signal` → Relays WebRTC offer/answer/ICE candidates between peers

```js
io.on("connection", (socket) => {
  socket.on("room:join", (data) => {
    const { email, name, room } = data;
    socket.join(room);
    io.to(room).emit("user:joined", { email, name, id: socket.id });
  });

  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });
});
```

---

### 3. **WebRTC Flow**

1. User A joins → requests camera & mic access
2. User A emits `room:join` → server maps user to room
3. User B joins same room → both discover each other
4. Peers exchange **SDP Offer/Answer & ICE Candidates** via Socket.io
5. Direct **peer-to-peer connection established** → video/audio streams flow directly
6. Text messages exchanged over **Socket.io events**

---

## 🛠️ Installation & Setup

### Backend (Server - Render)

```bash
cd server
npm install
npm start
```

* Runs on `http://localhost:8000` by default

### Frontend (Client - React - Vercel)

```bash
cd client
npm install
npm start
```

* Runs on `http://localhost:3000` by default

---

## 🌍 Deployment

### Backend

* Deployed on [Render](https://render.com/)
* Add a **Start Command** in `package.json` → `"start": "node index.js"`

### Frontend

* Deployed on [Vercel](https://videochatappwebrtc.vercel.app/)
* Add `.env` in client:

  ```bash
  REACT_APP_SOCKET_URL=https://your-render-backend.onrender.com
  ```

---

## 📦 Tech Stack

* **Frontend**: React, Context API, Socket.io-client, WebRTC
* **Backend**: Node.js, Socket.io
* **Deployment**: Render (server), Vercel (client)

---

## 🎯 Future Improvements

* Group video calls (multi-user rooms)
* Authentication & user profiles
* Chat persistence with database (MongoDB/Postgres)
* Screen sharing support

---

## 👨‍💻 Author

Developed by **Adarsh Gupta** 🚀

---

👉 Would you like me to also add a **quick usage guide with screenshots/GIFs** (showing how two users connect in a room), so recruiters get a visual idea in your GitHub repo?
