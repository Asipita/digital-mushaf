import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_QURAN_API_URL,
});

export default axiosInstance;
