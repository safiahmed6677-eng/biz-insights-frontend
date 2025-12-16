import "../styles/dashboard.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

/* Helper: recommend numeric column */
const getRecommendedChartColumn = (columnTypes) => {
  const numericCols = Object.entries(columnTypes)
    .filter(([_, type]) => type === "numeric")
    .map(([col]) => col);

  return numericCols[0] || "";
};

function Dashboard() {
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [chartCol, setChartCol] = useState("");
  
  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDatasets();
  }, [navigate]);

  /* ================= API ================= */
  const fetchDatasets = async () => {
    try {
      const res = await api.get("/data");
      setDatasets(res.data);
    } catch {
      alert("Failed to load datasets");
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async (id) => {
    try {
      setInsightsLoading(true);
      const res = await api.get(`/data/${id}/insights`);
      setInsights(res.data);

      const recommended = getRecommendedChartColumn(res.data.columnTypes);
      setChartCol(recommended);
    } catch {
      alert("Failed to load insights");
    } finally {
      setInsightsLoading(false);
    }
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a CSV file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await api.post("/data/upload", formData);
      setFile(null);
      fetchDatasets();
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* ================= CHART ================= */
  const getNumericColumns = () =>
    insights
      ? Object.entries(insights.columnTypes)
          .filter(([_, type]) => type === "numeric")
          .map(([col]) => col)
      : [];

  const buildChartData = () => {
    if (!insights || !chartCol) return [];
    return insights.preview.map((row, i) => ({
      index: i + 1,
      value: Number(row[chartCol])
    }));
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading…</p>;

  return (
    <div className="page">
      {/* HEADER */}
      <header className="header">
        <h2>Biz Insights</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="container">
        {/* Upload */}
        <div className="card">
          <h3>Upload Dataset</h3>
          <form onSubmit={handleUpload} className="upload-row">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button disabled={uploading}>
              {uploading ? "Uploading…" : "Upload CSV"}
            </button>
          </form>
        </div>

        {/* Dataset list */}
        <div className="card">
          <h3>Your Datasets</h3>

          {datasets.length === 0 ? (
            <p>No datasets uploaded yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Rows</th>
                  <th>Columns</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((ds) => (
                  <tr
                    key={ds.id}
                    onClick={() => fetchInsights(ds.id)}
                  >
                    <td>{ds.name}</td>
                    <td>{ds.rows}</td>
                    <td>{ds.columns.join(", ")}</td>
                    <td>{new Date(ds.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Insights */}
        {insightsLoading && <p>Loading insights…</p>}

        {insights && (
          <div className="card">
            <h3>Dataset Insights</h3>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-box">
                <strong>{insights.rows}</strong>
                Rows
              </div>
              <div className="stat-box">
                <strong>{insights.columns}</strong>
                Columns
              </div>
            </div>

            {/* Dropdown */}
            {getNumericColumns().length > 0 && (
              <div style={{ margin: "1rem 0" }}>
                <label style={{ marginRight: "0.5rem" }}>
                  Chart column:
                </label>
                <select
                  value={chartCol}
                  onChange={(e) => setChartCol(e.target.value)}
                >
                  {getNumericColumns().map((col) => (
                    <option key={col}>{col}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Chart */}
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={buildChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
