import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player'
import peer from '../service/peer'
import { useSocket } from '../context/SocketProvider'
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  Settings,
  MoreVertical,
  Volume2,
  Camera
} from 'lucide-react';

const RoomPage = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participantCount, setParticipantCount] = useState(2);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Salman', message: 'Hello!', time: '10:30 AM' },
    { id: 2, sender: 'You', message: 'Hi there!', time: '10:31 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const chatContainerRef = useRef(null);

  const [roomId, setRoomId] = useState(''); // Assume roomId is set elsewhere (e.g., via props or URL)
  const [userName, setUserName] = useState('You'); // Assume user name is set (e.g., via auth or input)


  const [showPreview, setShowPreview] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Get media on mount
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to get media:", err);
      }
    };

    getMedia();
  }, []);

  
  // Mute / Unmute Mic
  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
    }
  };

  // Turn Off / On Camera
  const toggleVideo = () => {
    
    setIsVideoOn(!isVideoOn)
    const newVideoState = !isVideoOff;
    setIsVideoOff(newVideoState);

    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !newVideoState;
      });
    }
  };
  // const toggleMute = () => setIsMuted(!isMuted);
  // const toggleVideo = () => setIsVideoOff(!isVideoOff);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);
  const toggleChat = () => setShowChat(!showChat);
  const toggleParticipants = () => setShowParticipants(!showParticipants);

  const navigate = useNavigate();

  const endCall = () => {
    setIsConnected(false);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peer.peer) {
      peer.peer.close();
    }
    socket.emit('call:end', { to: remoteSocketId });
    setRemoteStream(null);
    
    navigate(`/left`);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        sender: 'You',
        message: newMessage,
        time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  }

  const socket = useSocket()
  const [remoteSocketId, setRemoteSocketId] = useState(null)
  const [myStream, setMyStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, name, id }) => {
    console.log(`${name} Joined room with Email id: ${email}.`)
    setRemoteSocketId(id)
  }, [])

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio:true
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });

    setMyStream(stream)
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    console.log(`Incoming Call`, from, offer);
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
  },
    [socket])

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );


  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(
    async ({ ans }) => {
      try {
        await peer.setLocalDescription(ans);
      } catch (err) {
        console.error('Negotiation final failed:', err);
      }
    },
    [peer]
  );


  useEffect(() => {
    peer.peer.addEventListener('track', (ev) => {
      const remoteStream = ev.streams[0];
      console.log('Received remote tracks:', remoteStream);
      setRemoteStream(remoteStream);
      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
      }
    });

    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
    };
  }, [handleNegoNeeded, peer]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall)
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    //socket.on("call:end", handleCallEnd); // Register the call:end event
    socket.on('call:end', () => {
      setRemoteStream(null);
      setRemoteSocketId(null);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsConnected(false);
    });

  

  

  // Auto-scroll to latest message
  // useEffect(() => {
  //   if (chatContainerRef.current) {
  //     chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  //   }
  // }, [chatMessages]);

  // Handle receiving chat messages
  // const handleReceiveMessage = useCallback(
  //   (message) => {
  //     setChatMessages((prevMessages) => [...prevMessages, message]);
  //   },
  //   []
  // );

  // Socket event listeners
  // useEffect(() => {
  //   socket.on('chat:receive', handleReceiveMessage);
  //   socket.on('user:joined', ({ name }) => {
  //     setParticipantCount((prev) => prev + 1);
  //   });
  //   socket.on('room:join', (data) => {
  //     setRoomId(data.room); // Set roomId when joining
  //   });

  //   return () => {
  //     socket.off('chat:receive', handleReceiveMessage);
  //     socket.off('user:joined');
  //     socket.off('room:join');
  //   };
  // }, [socket, handleReceiveMessage]);

  // Send chat message
  const sendMessage = () => {
    if (newMessage.trim() && roomId) {
      const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      socket.emit('chat:send', {
        room: roomId,
        message: newMessage,
        sender: userName,
        time,
      });
      setNewMessage('');
    }
  };

  const toggleChat = () => setShowChat(!showChat);
  const toggleParticipants = () => setShowParticipants(!showParticipants);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off('call:end');
      //socket.off("call:end", handleCallEnd);
    }
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal])

  return (
    <body>
      <div className="h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="text-white font-semibold text-lg">Video Chat</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className={`text-green-400 text-sm ${remoteSocketId ? 'Connected' : 'No one in room : Not Connected'}`}>Connected</span>
              <p className='text'></p>
              <div >{
                remoteSocketId && <button className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition-all" onClick={handleCallUser}>Accept the Incomming Call</button>
              }
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-gray-300 text-sm">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button className="text-gray-400 hover:text-white">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Video Area */}
          <div className="flex-1 relative bg-black">
            {/* Main Video Grid */}
            
            {/* Video Grid Container - Dynamically adjusts based on sidebar state */}
            <div className={`
  h-full p-2 sm:p-4 
  transition-all duration-300 ease-in-out
  ${showChat || showParticipants ? 'pr-2' : 'pr-4'}
  grid gap-2 sm:gap-3 lg:gap-4
  grid-cols-1 lg:grid-cols-2
  auto-rows-fr
`}>
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden group min-h-[200px] sm:min-h-[300px]">
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center relative">
                  
                    {showPreview && (
                      <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className={`rounded-lg shadow-lg w-full max-w-md ${isVideoOn ? "" : "hidden"}`}
                        />
                        {!isVideoOn && (
                          <div className="absolute text-center">
                            <Camera size={48} className="text-white mx-auto mb-2 opacity-50" />
                            <p className="text-white text-sm opacity-75">Camera Off</p>
                          </div>
                        )}
                      </div>
                    )}
                  

                </div>

                {/* Stream Label and Video Element */}
                <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  {myStream && (
                    <>
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                        <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs sm:text-sm font-medium">
                          My Stream
                        </div>
                      </div>

                      <ReactPlayer className="rounded-lg shadow-lg w-full max-w-md "
                            playing
                            muted
                            playsInline
                            style={{ transform: 'scaleX(-1)' }}
                            url={myStream}
                          />
                    </>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center space-x-2 z-10">
                  <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs sm:text-sm">
                    You
                  </div>
                  {isMuted && (
                    <div className="bg-red-500 p-1 rounded">
                      <MicOff size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Remote Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden group min-h-[200px] sm:min-h-[300px]">
                <div className="w-full h-full bg-gradient-to-br from-green-600 to-blue-700 flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold text-gray-800 mx-auto mb-2">
                      J
                    </div>
                    <p className="text-white text-sm sm:text-base">John Doe</p>
                  </div>
                </div>

                {/* Remote Stream Label and Video Element */}
                <div className="absolute inset-0">
                  

                <div className="aspect-video bg-gradient-to-br from-green-600 to-blue-700 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  {remoteStream && (
                    <>
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                        <div className="bg-green-500 text-white px-2 py-1 rounded text-xs sm:text-sm font-medium">
                          Remote Stream
                        </div>
                      </div>

                      

                      <ReactPlayer className="rounded-lg shadow-lg w-full max-w-md h-[600px]"
                            playing
                            muted
                            playsInline
                            style={{ transform: 'scaleX(-1)' }}
                            url={remoteStream}
                          />
                        
                    </>
                    
                  )}
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center space-x-2 z-10">
                  <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs sm:text-sm">
                    John Doe
                  </div>
                </div>

                {/* More options (appears on hover) */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-3 flex items-center space-x-3">
                {/* Microphone */}
                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full transition-all ${isMuted
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                  {isMuted ? (
                    <MicOff size={20} className="text-white" />
                  ) : (
                    <Mic size={20} className="text-white" />
                  )}
                </button>

                {/* Video */}
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-all ${isVideoOff
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                  {isVideoOff ? (
                    <VideoOff size={20} className="text-white" />
                  ) : (
                    <Video size={20} className="text-white" />
                  )}
                </button>

                {/* Screen Share */}
                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-full transition-all ${isScreenSharing
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                  <Monitor size={20} className="text-white" />
                </button>

                {/* Chat */}
                <button
                  onClick={toggleChat}
                  className={`p-3 rounded-full transition-all ${showChat
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                  <MessageSquare size={20} className="text-white" />
                </button>

                {/* Participants */}
                <button
                  onClick={toggleParticipants}
                  className={`p-3 rounded-full transition-all relative ${showParticipants
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                  <Users size={20} className="text-white" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {participantCount}
                  </span>
                </button>


                <button className="p-3 bg-green-500 hover:bg-green-600 rounded-full transition-all" onClick={handleCallUser}>
                  <Phone size={20} className="text-white" />
                </button>


                {/* End Call */}
                <button
                  onClick={endCall}
                  className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-all"
                >
                  <PhoneOff size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold">In-call messages</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-gray-300 font-medium">{msg.sender}</span>
                      <span className="text-gray-500 text-xs">{msg.time}</span>
                    </div>
                    <p className="text-gray-200">{msg.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Participants Sidebar */}
          {showParticipants && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold">Participants ({participantCount})</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    Y
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">You</p>
                    <p className="text-gray-400 text-sm">Host</p>
                  </div>
                  <div className="flex space-x-1">
                    {isMuted && <MicOff size={16} className="text-red-500" />}
                    {isVideoOff && <VideoOff size={16} className="text-red-500" />}
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">John Doe</p>
                    <p className="text-gray-400 text-sm">Participant</p>
                  </div>
                  <div className="flex space-x-1">
                    <Volume2 size={16} className="text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </body>
  )
};

export default RoomPage;
