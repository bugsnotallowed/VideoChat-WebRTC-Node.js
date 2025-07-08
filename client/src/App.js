// import "bootstrap/dist/css/bootstrap.min.css";
//import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Lobby from "./screens/Lobby";
import RoomPage from "./screens/Room";

function App() {
  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
