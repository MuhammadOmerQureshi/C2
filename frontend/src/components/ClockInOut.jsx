import React, { useState, useEffect } from "react";
import api from "../api/api";

const ClockInOut = () => {
  const [status, setStatus] = useState("loading");
  const [activeLog, setActiveLog] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await api.get("/attendance/history");
      const logs = res.data;

      // Check if there's an active clock-in (no clock-out time)
      const active = logs.find((log) => !log.clockOutTime);

      if (active) {
        setActiveLog(active);
        setStatus("clocked-in");
      } else {
        setStatus("clocked-out");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to check status");
      setStatus("error");
    }
  };

  const clockIn = async () => {
    try {
      setStatus("loading");
      setError("");

      const res = await api.post("/attendance/clock-in");
      setMessage("Successfully clocked in!");
      setActiveLog(res.data.attendanceLog);
      setStatus("clocked-in");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clock in");
      setStatus("error");
    }
  };

  const clockOut = async () => {
    try {
      setStatus("loading");
      setError("");

      await api.post("/attendance/clock-out");
      setMessage("Successfully clocked out!");
      setActiveLog(null);
      setStatus("clocked-out");
    } catch (err) {
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
                {new Date(activeLog.clockInTime).toLocaleString()}
              </p>
              <p>IP Address: {activeLog.ipAddress}</p>
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
