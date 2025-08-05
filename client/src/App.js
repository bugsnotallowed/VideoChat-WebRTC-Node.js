// import "bootstrap/dist/css/bootstrap.min.css";
//import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Lobby from "./screens/Lobby";
import RoomPage from "./screens/Room";
import EndScreen from "./screens/endScreen";

function App() {
  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/left" element={<EndScreen />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
