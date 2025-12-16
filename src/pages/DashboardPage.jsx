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

/* Helper: recommend chart column */
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

  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [chartCol, setChartCol] = useState("");
  const [chartData, setChartData] = useState([]);

  /* =========================
     AUTH CHECK
  ========================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDatasets();
  }, [navigate]);

  /* =========================
     API CALLS
  ========================= */
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
      setSelectedDatasetId(id);

      const recommended = getRecommendedChartColumn(res.data.columnTypes);
      setChartCol(recommended);

      if (recommended) {
        fetchChartData(id, recommended);
      }
    } catch {
      alert("Failed to load insights");
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchChartData = async (datasetId, column) => {
    try {
      const res = await api.get(
        `/data/${datasetId}/chart?column=${column}`
      );
      setChartData(res.data.points);
    } catch {
      alert("Failed to load chart data");
    }
  };

  /* =========================
     UPLOAD
  ========================= */
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

  const getNumericColumns = () =>
    insights
      ? Object.entries(insights.columnTypes)
          .filter(([_, type]) => type === "numeric")
          .map(([col]) => col)
      : [];

  if (loading) return <p style={{ padding: "2rem" }}>Loading…</p>;

  return (
    <div>
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "1rem 2rem",
          borderBottom: "1px solid #ddd"
        }}
      >
        <h2>Biz Insights</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div style={{ padding: "2rem" }}>
        {/* Upload */}
        <form onSubmit={handleUpload} style={{ marginBottom: "2rem" }}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button disabled={uploading} style={{ marginLeft: "1rem" }}>
            {uploading ? "Uploading CSV…" : "Upload CSV"}
          </button>
        </form>

        {/* Dataset List */}
        {datasets.length === 0 ? (
          <p>No datasets yet — upload a CSV to get started.</p>
        ) : (
          <table border="1" cellPadding="8">
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

        {/* Insights */}
        {insightsLoading && <p>Loading insights…</p>}

        {insights && (
          <>
            <h3>Dataset Insights</h3>

            {/* Dropdown */}
            {getNumericColumns().length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ marginRight: "0.5rem" }}>Chart column:</label>
                <select
                  value={chartCol}
                  onChange={(e) => {
                    setChartCol(e.target.value);
                    fetchChartData(selectedDatasetId, e.target.value);
                  }}
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
                <LineChart data={chartData}>
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

            {/* Stats */}
            {insights.numericStats &&
              chartCol &&
              insights.numericStats[chartCol] && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    maxWidth: "400px"
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>
                    Statistics ({chartCol})
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                    <li>
                      <strong>Min:</strong>{" "}
                      {insights.numericStats[chartCol].min}
                    </li>
                    <li>
                      <strong>Max:</strong>{" "}
                      {insights.numericStats[chartCol].max}
                    </li>
                    <li>
                      <strong>Average:</strong>{" "}
                      {insights.numericStats[chartCol].average}
                    </li>
                  </ul>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
