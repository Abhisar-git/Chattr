import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://chattr-itmd.onrender.com/api" ,
  withCredentials: true,
});
