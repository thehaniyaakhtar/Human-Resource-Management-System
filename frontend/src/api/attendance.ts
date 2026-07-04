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

export const checkIn = () =>
    API.post("/attendance/checkin");

export const checkOut = () =>
    API.post("/attendance/checkout");

export const getAttendance = () =>
    API.get("/attendance/me");