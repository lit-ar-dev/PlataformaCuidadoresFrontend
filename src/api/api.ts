import axios from "axios";
import Constants from "expo-constants";

type ExpoExtra = { API_BASE?: string };
const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
const API_BASE =
  extra.API_BASE ?? "https://cuidadoresbackend.alejokinder.com.ar:443";

console.log("API_BASE:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": 1,
  },
});

// helper para setear token cuando el usuario hace login / se restaura sesión
export function setAuthToken(token?: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export default api;
