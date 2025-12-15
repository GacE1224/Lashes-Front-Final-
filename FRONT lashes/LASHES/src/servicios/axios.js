import axios from "axios";

// Aquí definimos la URL:
// Si existe la variable de entorno (en Vercel), usa esa.
// Si no existe (en tu PC), usa localhost por defecto.
const baseURL =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

export const apiLashes = axios.create({
    baseURL: baseURL,
    headers: { "Content-Type": "application/json" },
});

export const setAuthToken = (token) => {
    if (token) {
        apiLashes.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete apiLashes.defaults.headers.common["Authorization"];
    }
};