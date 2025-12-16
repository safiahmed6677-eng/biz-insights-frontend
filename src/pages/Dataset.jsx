import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function Dataset() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartCol, setChartCol] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchInsights();
  }, [id]);

  const fetchInsights = async () => {
    try {
      const res = await api.get(`/data/${id}/insights`);
      setInsights(res.data);

      const numericCols = Object.entries(res.data.columnTypes)
        .filter(([_, type]) => type === "numeric")
        .map(([col]) => col);

      setChartCol(numericCols[0] || "");
    } catch (err) {
      alert("Failed to load dataset");
    } finally {
      setLoading(false);
    }
  };

  const buildChartData = () => {
    if (!insights || !chartCol) return [];

    return insights.preview.map((row, index) => ({
      index: index + 1,
      value: Number(row[chartCol])
    }));
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading dataset...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate("/dashboard")}>← Back</button>

      <h2 style={{ marginTop: "1rem" }}>{insights.filename}</h2>

      <p><strong>Rows:</strong> {insights.rows}</p>
      <p><strong>Columns:</strong> {insights.columns}</p>

      <h3>Column Types</h3>
      <ul>
        {Object.entries(insights.columnTypes).map(([col, type]) => (
          <li key={col}>{col}: {type}</li>
        ))}
      </ul>

      {/* Dropdown */}
      {chartCol && (
        <div style={{ margin: "1rem 0" }}>
          <label>Chart column: </label>
          <select
            value={chartCol}
            onChange={(e) => setChartCol(e.target.value)}
          >
            {Object.entries(insights.columnTypes)
              .filter(([_, type]) => type === "numeric")
              .map(([col]) => (
                <option key={col} value={col}>{col}</option>
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

      {/* Preview */}
      <h3 style={{ marginTop: "2rem" }}>Preview (first 5 rows)</h3>
      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {Object.keys(insights.preview[0]).map(col => (
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
    </div>
  );
}

export default Dataset;
