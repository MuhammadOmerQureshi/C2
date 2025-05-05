import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AttendanceDashboard = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        fetchAttendanceData();
    }, [currentPage, filters]);

    const fetchAttendanceData = async () => {
        try {
            const response = await axios.get('/api/auth/attendance/dashboard', {
                params: {
                    page: currentPage,
                    limit: 10,
                    ...filters,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Add JWT token
                },
            });

            setAttendanceData(response.data.attendanceRecords);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div>
            <h1>Attendance Dashboard</h1>
            <div>
                <label>
                    User ID:
                    <input type="text" name="userId" onChange={handleFilterChange} />
                </label>
                <label>
                    Start Date:
                    <input type="date" name="startDate" onChange={handleFilterChange} />
                </label>
                <label>
                    End Date:
                    <input type="date" name="endDate" onChange={handleFilterChange} />
                </label>
                <label>
                    Department:
                    <input type="text" name="department" onChange={handleFilterChange} />
                </label>
                <button onClick={fetchAttendanceData}>Apply Filters</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Clock-In</th>
                        <th>Clock-Out</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceData.map((record) => (
                        <tr key={record._id}>
                            <td>{record.user.name}</td>
                            <td>{record.user.email}</td>
                            <td>{record.user.department}</td>
                            <td>{new Date(record.clockIn).toLocaleTimeString()}</td>
                            <td>{record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : 'N/A'}</td>
                            <td>{new Date(record.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default AttendanceDashboard;