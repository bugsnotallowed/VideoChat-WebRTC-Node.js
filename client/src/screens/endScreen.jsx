import React, { useState, useEffect } from 'react';
import { 
  Video, 
  RotateCcw, 
  Home, 
  Copy, 
  Share2, 
  Clock, 
  Users, 
  Calendar,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EndScreen = () => {
  const [meetingData, setMeetingData] = useState({
    duration: '45:32',
    participants: 2,
    roomId: '1',
    startTime: '2:30 PM',
    endTime: '3:15 PM',
    date: 'Today'
  });
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(meetingData.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRating = (rate) => {
    setRating(rate);
    if (rate > 0) {
      setShowFeedback(true);
    }
  };

  const submitFeedback = () => {
    console.log('Feedback submitted:', { rating, feedback });
    setShowFeedback(false);
    // Handle feedback submission
  };

  const navigate = useNavigate();
  const rejoinMeeting = () => {
    console.log('Rejoining meeting...');
    
    window.history.back();
    // Handle rejoin logic
  };

  const startNewMeeting = () => {
    console.log('Starting new meeting...');
    navigate(`/`);
    // Handle new meeting logic
  };

  const goHome = () => {
    console.log('Going to home...');
    navigate(`/`);
    // Handle navigation to home
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        
        {/* Main End Screen Card */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center">
          
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Meeting Ended</h1>
            <p className="text-gray-300 text-lg">Thanks for joining the VideoChat meeting</p>
          </div>

          {/* Meeting Summary */}
          <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Meeting Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Clock className="text-blue-400 mx-auto mb-2" size={24} />
                <p className="text-gray-300 text-sm">Duration</p>
                <p className="text-white font-semibold">{meetingData.duration}</p>
              </div>
              <div className="text-center">
                <Users className="text-green-400 mx-auto mb-2" size={24} />
                <p className="text-gray-300 text-sm">Participants</p>
                <p className="text-white font-semibold">{meetingData.participants}</p>
              </div>
              <div className="text-center">
                <Calendar className="text-purple-400 mx-auto mb-2" size={24} />
                <p className="text-gray-300 text-sm">Date</p>
                <p className="text-white font-semibold">{meetingData.date}</p>
              </div>
              <div className="text-center">
                <Video className="text-orange-400 mx-auto mb-2" size={24} />
                <p className="text-gray-300 text-sm">Time</p>
                <p className="text-white font-semibold">{meetingData.startTime} - {meetingData.endTime}</p>
              </div>
            </div>
          </div>

          {/* Room ID Share */}
          <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-8">
            <p className="text-gray-300 text-sm mb-2">Room ID for future use:</p>
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-gray-600 px-4 py-2 rounded-lg">
                <code className="text-white font-mono">{meetingData.roomId}</code>
              </div>
              <button
                onClick={copyRoomId}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={rejoinMeeting}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <RotateCcw size={20} />
              <span>Rejoin Meeting</span>
            </button>
            
            <button
              onClick={startNewMeeting}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Video size={20} />
              <span>New Meeting</span>
            </button>
            
            <button
              onClick={goHome}
              className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Go Home</span>
            </button>
          </div>

          {/* Rating Section */}
          <div className="border-t border-gray-600 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">How was your meeting experience?</h3>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={`transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-300'
                  }`}
                >
                  <Star size={32} fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            
            {showFeedback && (
              <div className="max-w-md mx-auto">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us about your experience (optional)"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                />
                <div className="flex space-x-3 mt-3">
                  <button
                    onClick={submitFeedback}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Brand Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <Video className="text-white" size={14} />
            </div>
            <span className="text-sm">Powered by VideoChat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndScreen;