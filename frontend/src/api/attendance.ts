import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Attendance APIs
export const checkIn = async () => {
    return API.post("/attendance/checkin");
};

export const checkOut = async () => {
    return API.post("/attendance/checkout");
};

export const getMyAttendance = async () => {
    return API.get("/attendance/me");
};