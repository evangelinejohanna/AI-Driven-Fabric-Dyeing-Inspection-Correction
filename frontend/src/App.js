import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { FaTachometerAlt, FaUpload, FaCamera } from "react-icons/fa";
import Dashboard from "./Dashboard";
import Upload from "./Upload";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <h2 className="logo">FabScan</h2>
          <nav>
            <ul>
              <li>
                <Link to="/">
                  <FaTachometerAlt /> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/upload">
                  <FaUpload /> Upload
                </Link>
              </li>
              <li>
                <button className="capture-button">
                  <FaCamera /> Scan Fabric
                </button>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;