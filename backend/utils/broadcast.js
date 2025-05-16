let ioInstance = null;

function setSocketIO(io) {
  ioInstance = io;
}

function broadcastAttendanceUpdate(attendance) {
  if (ioInstance) {
    ioInstance.emit('attendanceUpdate', attendance);
  }
}

module.exports = { setSocketIO, broadcastAttendanceUpdate };
