import React, {useEffect, useState} from 'react';
import "../styles/Home_screen_style.css"
import Dropdown from "./dropown";

function Table({ tableVisible, setTableVisible, showTableOnMobile, setShowTableOnMobile, find_cookie, workSessions}) {

    const handleTableExit = () => {
        setTableVisible(false);
        // setShowTableOnMobile(false);
    };

    const current_date = new Date();
    const current_year = current_date.getFullYear();
    const current_month = current_date.getMonth() + 1; // Month is zero-based, so add 1

    const days_in_month = new Date(current_year, current_month, 0).getDate();

    const year = current_date.getFullYear();
    // const month = current_date.getMonth() + 1;


    const worksessions_by_day = {};

    let session_id = find_cookie("session_id=").split("=")[1];

    workSessions.forEach(session => {
        const day = session.day;
        if (!worksessions_by_day[day])
            worksessions_by_day[day] = [];

        if ( !(session_id === session._id))
            worksessions_by_day[day].push(session);
    })

    const renderDropdownOptions = (day) => {
        if (worksessions_by_day[day])
            return worksessions_by_day[day].map(session => `${session.clockIn} - ${session.clockOut}  total: ${session.duration}`);
        else
            return ["nothing for today"];
    };

    const calculateTotalDuration = (day) => {
        if (worksessions_by_day[day]) {
            const shiftData = worksessions_by_day[day];
            if (shiftData.length > 0) {
                const totalDuration = shiftData.reduce((acc, session) => {
                    const [hours, minutes, seconds] = session.duration.split(':');

                    return acc + (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds));
                }, 0);
                const hours = Math.floor(totalDuration / 3600);
                const minutes = Math.floor((totalDuration % 3600) / 60);
                const seconds = totalDuration % 60;
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
        return "00:00:00";
    };

    const calculateTotalHours = () => {
        let totalSeconds = 0;
        Object.values(worksessions_by_day).forEach(shiftData => {

            // console.log("shift data: " + shiftData)
            shiftData.forEach(session => {
                const [hours, minutes, seconds] = session.duration.split(':');
                totalSeconds += parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
            });
        });

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const totalHours = calculateTotalHours();

    return (
        tableVisible && (
            <div className="attendance_table">
    <button id="table_exit_button" onClick={handleTableExit}>Exit</button>Ç

                <div id="header_div">
                    <table id="table">
                        <thead>
                        <tr>
                            <th className="date">Date</th>
                            <th className="times">Shifts</th>
                            <th >Total</th>
                        </tr>
                        </thead>
                    </table>
                </div>
                <div id="table_div">
                    <table id="table">
                        <tbody>
                        {Array.from({ length: days_in_month}, (_, index) => index + 1).map(day => {
                            const formattedDate = `${day.toString().padStart(2, '0')}.${current_month}.${year}`;
                            return (
                                <tr key={day}>
                                    <td className="date">{formattedDate}</td>
                                    <td className="times">
                                        <Dropdown options={renderDropdownOptions(day)} />
                                    </td>
                                    <td className="table_buttons">
                                        {calculateTotalDuration(day)}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    <h4>
                        Total for this month: {totalHours}
                    </h4>
                </div>
            </div>
        )
    );
}

export default Table;