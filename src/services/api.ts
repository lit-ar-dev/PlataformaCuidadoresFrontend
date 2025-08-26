import axios from "axios";
import Constants from "expo-constants";

type ExpoExtra = { API_BASE?: string };
const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
const API_BASE = extra.API_BASE;

console.log(API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export default api;
