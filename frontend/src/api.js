import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("accessToken");

    // Gets JWT token from localStorage and adds it to the Authorization header
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
	return config;
});

export default api;
