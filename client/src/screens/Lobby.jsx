import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player'
import { useSocket } from '../context/SocketProvider';
import {
  Video,
  Users,
  Mail,
  User,
  Hash,
  ArrowRight,
  Camera,
  Mic,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

const Lobby = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    roomNumber: ''
  });
  const [showPreview, setShowPreview] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    }

    if (!formData.roomNumber) {
      newErrors.roomNumber = 'Room number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleJoinRoom = async (e) => {
  //   e.preventDefault();

  //   if (!validateForm()) return;

  //   setIsLoading(true);

  //   // Simulate API call
  //   setTimeout(() => {
  //     console.log('Joining room with:', formData);
  //     setIsLoading(false);
  //     // Here you would typically navigate to the video chat room
  //   }, 1500);
  // };

  //const toggleVideo = () => setIsVideoOn(!isVideoOn);
  //const toggleMic = () => setIsMicOn(!isMicOn);
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      console.log(email, name, room)
      socket.emit("room:join", { email, name, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback((data) => {
    const { email, name, room } = data
    navigate(`/room/${room}`);
  }, [navigate])

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom)
    }
  }, [socket, handleJoinRoom])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* Left Side - Branding & Preview */}
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Video className="text-white" size={24} />
              </div>
              <h1 className="text-4xl font-bold text-white">VideoChat</h1>
            </div>
            <p className="text-gray-300 text-lg">Connect with anyone, anywhere</p>
          </div>

          {/* Video Preview */}
          <div className="relative">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Camera Preview</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showPreview ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

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


              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-all ${isVideoOn
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-red-500 hover:bg-red-600'
                    }`}
                >
                  <Camera size={20} className="text-white" />
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full transition-all ${isMicOn
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-red-500 hover:bg-red-600'
                    }`}
                >
                  <Mic size={20} className="text-white" />
                </button>

                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-all">
                  <Settings size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700">
              <Users className="text-blue-400 mb-2" size={24} />
              <h4 className="text-white font-semibold mb-1">Multi-participant</h4>
              <p className="text-gray-400 text-sm">Connect with multiple people simultaneously</p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700">
              <Video className="text-green-400 mb-2" size={24} />
              <h4 className="text-white font-semibold mb-1">HD Quality</h4>
              <p className="text-gray-400 text-sm">Crystal clear video and audio experience</p>
            </div>
          </div>
        </div>

        {/* Right Side - Join Form */}
        <form onSubmit={handleSubmitForm}>
          <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Join a Meeting</h2>
              <p className="text-gray-300">Enter your details to get started</p>
            </div>

            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-600'
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your username"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.username ? 'border-red-500' : 'border-gray-600'
                      }`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-400">{errors.username}</p>
                )}
              </div>

              {/* Room Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Enter room number"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  />
                </div>
                {errors.roomNumber && (
                  <p className="mt-2 text-sm text-red-400">{errors.roomNumber}</p>
                )}
              </div>

              {/* Join Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <span>Join Room</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                <span>Secure and encrypted</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>


  )
}

export default Lobby
