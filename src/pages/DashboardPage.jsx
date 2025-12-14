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

function Dashboard() {
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [chartCol, setChartCol] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDatasets();
  }, [navigate]);

  const fetchDatasets = async () => {
    try {
      const res = await api.get("/data");
      setDatasets(res.data);
    } catch (err) {
      setError("Failed to load datasets");
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async (id) => {
    try {
      setInsightsLoading(true);
      const res = await api.get(`/data/${id}/insights`);
      setInsights(res.data);
      setSelectedDatasetId(id);

      const nums = Object.entries(res.data.columnTypes)
        .filter(([_, type]) => type === "numeric")
        .map(([col]) => col);

      setChartCol(nums[0] || "");
    } catch (err) {
      alert("Failed to load insights");
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await api.post("/data/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setFile(null);
      await fetchDatasets();
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getNumericColumns = () => {
    if (!insights) return [];
    return Object.entries(insights.columnTypes)
      .filter(([_, type]) => type === "numeric")
      .map(([col]) => col);
  };

  const buildChartData = () => {
    if (!insights || !chartCol) return [];
    return insights.preview.map((row, index) => ({
      index: index + 1,
      value: Number(row[chartCol])
    }));
  };

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading datasets...</p>;
  }

  return (
    <div>
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          borderBottom: "1px solid #ddd"
        }}
      >
        <h2 style={{ margin: 0 }}>Biz Insights</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      {/* MAIN CONTENT */}
      <div style={{ padding: "2rem" }}>
        <h2>Dashboard</h2>

        {/* Upload CSV */}
        <form onSubmit={handleUpload} style={{ marginBottom: "2rem" }}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            type="submit"
            disabled={uploading}
            style={{ marginLeft: "1rem" }}
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>
        </form>

        {/* Dataset list */}
        {datasets.length === 0 ? (
          <p>No datasets uploaded yet.</p>
        ) : (
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
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
                  style={{ cursor: "pointer" }}
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

        {/* Insights panel */}
        {insightsLoading && <p>Loading insights...</p>}

        {insights && (
          <div style={{ marginTop: "2rem" }}>
            <h3>Dataset Insights</h3>

            <p><strong>Filename:</strong> {insights.filename}</p>
            <p><strong>Rows:</strong> {insights.rows}</p>
            <p><strong>Columns:</strong> {insights.columns}</p>

            <h4>Column Types</h4>
            <ul>
              {Object.entries(insights.columnTypes).map(([col, type]) => (
                <li key={col}>
                  {col}: {type}
                </li>
              ))}
            </ul>

            {/* PREVIEW TABLE */}
            <h4>Preview (first 5 rows)</h4>
            <table
              border="1"
              cellPadding="6"
              style={{
                borderCollapse: "collapse",
                width: "100%",
                marginBottom: "1.5rem"
              }}
            >
              <thead>
                <tr>
                  {Object.keys(insights.preview[0]).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {insights.preview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* DROPDOWN */}
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
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CHART */}
            <h4>Sample Chart</h4>
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
                    name={chartCol}
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
