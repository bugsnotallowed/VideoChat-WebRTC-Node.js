const { Server } = require("socket.io");

const port = 8000;

const io = new Server(port, {
  cors: true,
});

const emailToSocketMap = new Map();
const socketIdToEmailMap = new Map();

io.on('connection', (socket) => {
  console.log('Connection established with socket id:', socket.id);

  socket.on('room:join', (data) => {
    const { email, name, room } = data;
    emailToSocketMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, { email, name });
    io.to(room).emit('user:joined', { email, name, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit('room:join', data);
  });

  socket.on('user:call', ({ to, offer }) => {
    io.to(to).emit('incomming:call', { from: socket.id, offer });
  });

  socket.on('call:accepted', ({ to, ans }) => {
    io.to(to).emit('call:accepted', { from: socket.id, ans });
  });

  socket.on('peer:nego:needed', ({ to, offer }) => {
    console.log('peer:nego:needed', offer);
    io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
  });

  socket.on('peer:nego:done', ({ to, ans }) => {
    console.log('peer:nego:done', ans);
    io.to(to).emit('peer:nego:final', { from: socket.id, ans });
  });

  socket.on('chat:send', ({ room, message, sender, time }) => {
    console.log(`Message from ${sender} in room ${room}: ${message}`);
    io.to(room).emit('chat:receive', {
      id: Date.now(),
      sender,
      message,
      time,
    });
  });

  socket.on('call:end', ({ to }) => {
    io.to(to).emit('call:end', { from: socket.id });
  });

  socket.on('ice:candidate', ({ to, candidate }) => {
    io.to(to).emit('ice:candidate', { candidate });
  });

  socket.on('disconnect', () => {
    const user = socketIdToEmailMap.get(socket.id);
    if (user) {
      emailToSocketMap.delete(user.email);
      socketIdToEmailMap.delete(socket.id);
      console.log(`User with socket id ${socket.id} disconnected`);
    }
  });
});