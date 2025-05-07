import React, {useEffect, useRef, useState} from 'react';
import "../styles/Home_screen_style.css"

function Clock({start_time, set_start_time, end_time, set_end_time, offset_from_start, set_circle_offset}) {

    const [center_label, set_center_label] = useState("Start");
    const [timer_started, set_timer_state] = useState(false);

    const [circle_radius, set_circle_radius] = useState(145); // less than the center points because of the stroke
    const [circle_circumference, set_circle_circumference] = useState(circle_radius * 2 * Math.PI);
    // const [timer_interval, set_timer_interval] = useState( circle_circumference / (12 * 60 * 60));
    const secondsInTwelveHours = 12 * 60 * 60; // Total number of seconds in 12 hours


    // set the svg property states
    const [circle_fill_color, set_circle_fill_color] = useState("#FF4D4D76");

    const [timeFill, set_time_fill] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    function find_cookie(cookie_header){
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.startsWith(cookie_header)) {
                return cookie
            }
        }
        return ""
    }

    function remove_cookie(cookie_header){
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.startsWith(cookie_header)) {
                document.cookie = cookie + "; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        }
    }

    const timerID = useRef();


    // use this to start timer from button
    function handle_click_start_timer(){
        if (timer_started){
            stop_timer();
            return
        }
        start_timer();
    }

    const upload_new_time = async () => {
        let time = new Date()
        let hours = time.getHours()
        let minutes = time.getMinutes()
        let seconds = time.getSeconds()
        let year = time.getFullYear()
        let month    = time.getMonth() + 1
        let day = time.getDate()
        if (hours < 10)
            hours = "0" + hours;
        if (minutes < 10)
            minutes = "0" + minutes;
        if (seconds < 10)
            seconds = "0" + seconds;
        if (month < 10)
            month = "0" + month
        if (day < 10)
            day = "0" + day

        set_start_time("Clock-in " + hours + ":" + minutes + ":" + seconds);

        let user_id = find_cookie("user_id=").split("=")[1];
        if (!user_id)
            console.error("user_id cookie not found in upload time!");
        try {
            const payload = {user_id: user_id, clockIn: hours + ":" + minutes + ":" + seconds, yearMonth: year + "-" + month, day: day};
            const response = await fetch('https://solid-clock-api.onrender.com/api/home_screen/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok){
                document.cookie = "start_time=" + data.workSession.clockIn + "; path=/;";
                document.cookie = "session_id=" + data.workSession._id + "; path=/;";
                console.log(data.workSession._id)

            }
            else {
                console.log(data.error)
            }
        } catch (error) {
            console.log('Error occurred:', error);
        }
    }

    const start_timer = async => {
        set_timer_state(true);
        set_center_label("Stop")


        timerID.current = setInterval(() => {
            let time = new Date()
            let hours = time.getHours()
            let minutes = time.getMinutes()
            let seconds = time.getSeconds()

            if (hours < 10)
                hours = "0" + hours;
            if (minutes < 10)
                minutes = "0" + minutes;
            if (seconds < 10)
                seconds = "0" + seconds;

            if( !find_cookie("start_time=")){
                console.log("creating new session")
                upload_new_time();
                document.cookie = `start_time=${hours}:${minutes}:${seconds}; path=/`;
            }

            const startTimeCookie = find_cookie("start_time=");

            const startTimeValue = startTimeCookie ? startTimeCookie.split("=")[1] : null;
            if (!startTimeValue) {
                console.error("start_time cookie value not found.");
                return;
            }
            const secondsPassed = calculateSecondsPassed(startTimeValue, `${hours}:${minutes}:${seconds}`);

            setElapsedTime(secondsPassed);
            set_circle_offset((secondsPassed / secondsInTwelveHours) * circle_circumference);
        }, 1000);

    }

    // re render for the timers hiding
    const [, forceUpdate] = useState();

    const stop_timer = async ()=> { // TODO: add a popup with "are you sure" to stop the user from spamming the circle and trashing the database.
        clearInterval(timerID.current);
        timerID.current = 0;
        set_timer_state(false);
        let time = new Date();
        let hours = time.getHours()
        let minutes = time.getMinutes()
        let seconds = time.getSeconds()
        let year = time.getFullYear()
        let month    = time.getMonth() + 1
        let day = time.getDate()

        if (hours < 10)
            hours = "0" + hours;
        if (minutes < 10)
            minutes = "0" + minutes;
        if (seconds < 10)
            seconds = "0" + seconds;
        if (month < 10)
            month = "0" + month
        if (day < 10)
            day = "0" + day
        set_end_time("Clock-out " + hours + ":" + minutes + ":" + seconds);
        set_center_label("Start");

        set_time_fill(null);
        set_circle_offset(0);
        setElapsedTime(0);

        let user_id = find_cookie("user_id=").split("=")[1];
        if (!user_id)
            console.error("user_id cookie not found in stop timer!");

        let session_id = find_cookie("session_id=").split("=")[1];
        if (!session_id)
            console.error("session_id cookie not found in stop timer!");
        let clock_out = hours + ":" + minutes + ":" + seconds;
        let duration = calculateDuration(find_cookie("start_time=").split("=")[1], clock_out);

        remove_cookie("start_time=");
        remove_cookie("session_id="); // experimental

        try {
            const payload = {user_id: user_id, clockOut: clock_out, duration: duration};
            const response = await fetch(`https://solid-clock-api.onrender.com/api/home_screen/${session_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok)
                console.log(data)
            else
                console.log(data.error)
        } catch (error) {
            console.log('Error occurred:', error);
        }

        setTimeout(() => {
            set_start_time("");
            set_end_time("");
            forceUpdate(Math.random()); // This will cause a re-render
        }, 4000);
    }


    useEffect(() => {
        let ignore = false;

        if (!ignore){
            const fetchWorkSession = async () => {
                try {
                    await fetch_active_work_session();

                    const start_time = find_cookie("start_time=");
                    if (!start_time){
                        console.error("start_time cookie not found in start timer on load!");
                        return;
                    }
                    set_timer_state(true);
                    set_center_label("Stop");
                    set_start_time("Clock-in " + start_time.split("=")[1]);
                    start_timer();
                } catch (error) {
                    console.log("error starting ")
                }
            };
            fetchWorkSession();
        }
        return () => { ignore = true; }
    },[]);

    const fetch_active_work_session = async ()=> {
        let user_id = find_cookie("user_id=").split("=")[1];
        if (!user_id)
            console.error("user_id cookie not found in fetch active work sessions!");

        try {
            const response = await fetch(`https://solid-clock-api.onrender.com/api/home_screen/not_closed/${user_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();
            console.log(data.error)
            if (response.ok){
                // TODO: add usage of: `` and ${} below
                document.cookie = "session_id=" + data.workSession._id + "; path=/;";
                document.cookie = "start_time=" + data.workSession.clockIn + "; path=/;";
            }
            else {
                console.log(data.error)
            }
        } catch (error) {
            console.log('Error occurred:', error);
        }
    }

    function calculateDuration(startTime, endTime) {
        // Split the time strings into hours, minutes, and seconds
        const startParts = startTime.split(":");
        const endParts = endTime.split(":");

        // Create Date objects with arbitrary date (January 1, 1970) and specified times
        const startDate = new Date(1970, 0, 1, startParts[0], startParts[1], startParts[2]);
        const endDate = new Date(1970, 0, 1, endParts[0], endParts[1], endParts[2]);

        // Calculate the duration in milliseconds
        const durationMs = endDate - startDate;

        // Convert the duration to hours, minutes, and seconds
        const hours = Math.floor(durationMs / 3600000);
        const minutes = Math.floor((durationMs % 3600000) / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);

        // Format the duration as "hh:mm:ss"
        const formattedDuration = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        return formattedDuration;
    }

    function calculateSecondsPassed(startTime, endTime) {
        // Convert time stamps to seconds
        const startSeconds = convertToSeconds(startTime);
        const endSeconds = convertToSeconds(endTime);

        // Calculate the difference
        let secondsPassed = endSeconds - startSeconds;

        // Handle crossing midnight
        if (secondsPassed < 0) {
            secondsPassed += 24 * 60 * 60; // Add 24 hours in seconds
        }

        return secondsPassed;
    }

    function convertToSeconds(timeStamp) {
        const [hours, minutes, seconds] = timeStamp.split(':');
        return (parseInt(hours, 10) * 60 * 60) + (parseInt(minutes, 10) * 60) + parseInt(seconds, 10);
    }

    return (
        <div id="container">
            <svg
                className="progress_ring"
                width="300"
                height="300">

                <circle
                    onClick={handle_click_start_timer}
                    className="svg_circle"
                    stroke="white"
                    strokeWidth="5"

                    fill={circle_fill_color}
                    r={circle_radius}
                    cx="150"
                    cy="150"
                    style={{
                        strokeDasharray: `${circle_circumference} ${circle_circumference}`,
                        strokeDashoffset: `${circle_circumference - offset_from_start }`,
                    }}
                />

                {[...Array(12)].map((_, index) => (
                    <line
                        key={index}
                        x1="150"
                        y1="20"
                        x2="150"
                        y2="30"
                        stroke="black"
                        strokeWidth="2"
                        transform={`rotate(${index * 30}, 150, 150)`}
                    />
                ))}
            </svg>
            <a id="circle_label">{center_label}</a>
            <p id="elapsed_time">{Math.floor(elapsedTime / 3600)}:
                {(Math.floor(elapsedTime / 60) % 60 < 10 ? '0' : '') + Math.floor(elapsedTime / 60) % 60}:
                {(elapsedTime % 60 < 10 ? '0' : '') + elapsedTime % 60}
            </p>
        </div>
    );
}

export default Clock;





// const stop_timer = async () => {
//     set_timer_state(false);
//     let time = new Date();
//     let hours = time.getHours()
//     let minutes = time.getMinutes()
//     let seconds = time.getSeconds()
//     let year = time.getFullYear()
//     let month    = time.getMonth() + 1
//     let day = time.getDate()
//
//     if (hours < 10)
//         hours = "0" + hours;
//     if (minutes < 10)
//         minutes = "0" + minutes;
//     if (seconds < 10)
//         seconds = "0" + seconds;
//     if (month < 10)
//         month = "0" + month
//     if (day < 10)
//         day = "0" + day
//     set_end_time("Clock-out " + hours + ":" + minutes + ":" + seconds);
//     set_center_label("Start")
//
//     clearInterval(timeFill);
//     set_time_fill(null);
//     set_circle_offset(0);
//     setElapsedTime(0);
//
//     let user_id = find_cookie("user_id=").split("=")[1];
//     let session_id = find_cookie("session_id=").split("=")[1];
//     let clock_out = hours + ":" + minutes + ":" + seconds;
//     let duration = calculateDuration(find_cookie("start_time=").split("=")[1], clock_out);
//     remove_cookie("start_time=");
//     try {
//         const payload = {user_id: user_id, clockOut: clock_out, duration: duration};
//         const response = await fetch(`https://solid-clock-api.onrender.com/api/home_screen/${session_id}`, {
//             method: 'PATCH',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(payload),
//         });
//
//         const data = await response.json();
//         if (response.ok)
//             console.log(data)
//         else
//             console.log(data.error)
//     } catch (error) {
//         console.log('Error occurred:', error);
//     }
//     window.location.reload();
// }
