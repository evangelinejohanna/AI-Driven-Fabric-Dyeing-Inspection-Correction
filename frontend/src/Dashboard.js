import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { FaChartLine, FaExclamationTriangle } from "react-icons/fa";

const Dashboard = () => {
  const [defectData, setDefectData] = useState([]);
  const [totalDefects, setTotalDefects] = useState(0);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/defects")
      .then(response => {
        setDefectData(response.data);
        const total = response.data.reduce((acc, item) => acc + item.defects_count, 0);
        setTotalDefects(total);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  // Styles
  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      backgroundColor: "#f4f6f9",
      fontFamily: "Arial, sans-serif",
    },
    sidebar: {
      width: "250px",
      backgroundColor: "#2c3e50",
      color: "white",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
    },
    sidebarHeader: {
      fontSize: "22px",
      marginBottom: "20px",
      textAlign: "center",
      borderBottom: "2px solid white",
      paddingBottom: "10px",
    },
    sidebarItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "18px",
      padding: "10px",
      cursor: "pointer",
      borderRadius: "5px",
    },
    sidebarItemHover: {
      backgroundColor: "#34495e",
    },
    content: {
      flex: "1",
      padding: "20px",
    },
    heading: {
      color: "#2c3e50",
      fontSize: "28px",
      marginBottom: "20px",
    },
    statsContainer: {
      display: "flex",
      gap: "20px",
    },
    statsCard: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      minWidth: "200px",
    },
    icon: {
      fontSize: "30px",
      color: "#ff7300",
    },
    chartContainer: {
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      marginTop: "20px",
    },
    chartHeading: {
      marginBottom: "10px",
      color: "#2c3e50",
    },
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarHeader}>Dashboard</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={styles.sidebarItem}>
            <FaChartLine />
            <span>Analytics</span>
          </li>
          <li style={{ ...styles.sidebarItem, ...styles.sidebarItemHover }}>
            <FaExclamationTriangle />
            <span>Alerts</span>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main style={styles.content}>
        <h1 style={styles.heading}>Fabric Defect Detection</h1>

        {/* Statistics Cards */}
        <div style={styles.statsContainer}>
          <div style={styles.statsCard}>
            <FaExclamationTriangle style={styles.icon} />
            <div>
              <h3>Total Defects</h3>
              <p>{totalDefects}</p>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div style={styles.chartContainer}>
          <h2 style={styles.chartHeading}>Defect Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={defectData}>
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <CartesianGrid stroke="#ddd" />
              <Line type="monotone" dataKey="defects_count" stroke="#ff7300" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
