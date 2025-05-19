import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";

const ClockInOut = ({ shiftId }) => {
  const [status, setStatus] = useState("loading");
  const [activeLog, setActiveLog] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ip, setIp] = useState("");

  useEffect(() => {
    // Get user's IP address
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(err => console.error("Failed to get IP:", err));

    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await api.get("/attendance/my-history");
      const logs = res.data;

      // Check if there's an active clock-in (no clockOut time)
      const active = logs.find((log) => !log.clockOut);

      if (active) {
        setActiveLog(active);
        setStatus("clocked-in");
      } else {
        setStatus("clocked-out");
      }
    } catch (err) {
      console.error("Error checking status:", err);
      setError("Failed to check status");
      setStatus("error");
    }
  };

  const clockIn = async () => {
    try {
      setStatus("loading");
      setError("");

      // Make sure we have a shiftId and IP to send
      if (!shiftId) {
        setError("No shift selected for clock-in");
        setStatus("error");
        return;
      }

      const res = await api.post("/attendance/clock-in", { shiftId, ip });
      setMessage("Successfully clocked in!");
      setActiveLog(res.data.attendance);
      setStatus("clocked-in");
    } catch (err) {
      console.error("Clock-in error:", err);
      setError(err.response?.data?.message || "Failed to clock in");
      setStatus("error");
    }
  };

  const clockOut = async () => {
    try {
      setStatus("loading");
      setError("");

      if (!activeLog || !activeLog._id) {
        setError("No active attendance record found");
        setStatus("error");
        return;
      }

      await api.post("/attendance/clock-out", { attendanceId: activeLog._id });
      setMessage("Successfully clocked out!");
      setActiveLog(null);
      setStatus("clocked-out");
    } catch (err) {
      console.error("Clock-out error:", err);
      setError(err.response?.data?.message || "Failed to clock out");
      setStatus("error");
    }
  };

  return (
    <div className="clock-in-out">
      <h2>Attendance</h2>

      {message && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="card">
        <div className="card-body text-center">
          <h3 className="card-title">
            {status === "loading" && "Checking status..."}
            {status === "clocked-in" && "Currently Clocked In"}
            {status === "clocked-out" && "Currently Clocked Out"}
            {status === "error" && "Error Checking Status"}
          </h3>

          {status === "clocked-in" && activeLog && (
            <div className="mb-4">
              <p>
                Clocked in at:{" "}
                {new Date(activeLog.clockIn).toLocaleString()}
              </p>
              <p>IP Address: {activeLog.ip}</p>
            </div>
          )}

          <div className="d-grid gap-2 col-6 mx-auto">
            {status === "clocked-out" && (
              <button
                className="btn btn-lg btn-success"
                onClick={clockIn}
                disabled={status === "loading"}
              >
                Clock In
              </button>
            )}

            {status === "clocked-in" && (
              <button
                className="btn btn-lg btn-danger"
                onClick={clockOut}
                disabled={status === "loading"}
              >
                Clock Out
              </button>
            )}

            {status === "error" && (
              <button
                className="btn btn-lg btn-primary"
                onClick={checkStatus}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockInOut;
