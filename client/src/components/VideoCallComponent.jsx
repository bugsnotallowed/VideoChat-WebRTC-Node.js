import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const VideoCallComponent = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    setIsCameraOff(!isCameraOff);
  };

  const leaveCall = () => {
    alert("Leaving the call...");
  };

  return (
    <div className="container-fluid bg-dark text-white vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="video-container position-relative bg-secondary rounded" style={{ width: "70%", height: "60%" }}>
        {/* Video stream */}
        <video
          className={`w-100 h-100 ${isCameraOff ? "bg-dark" : ""}`}
          autoPlay
          muted={isMuted}
          style={{ objectFit: "cover", borderRadius: "10px" }}
        >
          {/* Add a video source here if needed */}
        </video>

        {/* Overlay if camera is off */}
        {isCameraOff && (
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <i className="bi bi-camera-video-off display-4"></i>
            <p>Camera is off</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 d-flex justify-content-center gap-3">
        <button className="btn btn-danger" onClick={leaveCall}>
          <i className="bi bi-telephone-fill"></i> Leave
        </button>
        <button className="btn btn-secondary" onClick={toggleMute}>
          <i className={`bi ${isMuted ? "bi-mic-mute-fill" : "bi-mic-fill"}`}></i> {isMuted ? "Unmute" : "Mute"}
        </button>
        <button className="btn btn-secondary" onClick={toggleCamera}>
          <i className={`bi ${isCameraOff ? "bi-camera-video-off-fill" : "bi-camera-video-fill"}`}></i>{" "}
          {isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
        </button>
      </div>
    </div>
  );
};

export default VideoCallComponent;