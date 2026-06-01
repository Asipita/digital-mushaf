import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_QURAN_API_URL ?? "https://api.quran.com/api/v4",
});

export default axiosInstance;
