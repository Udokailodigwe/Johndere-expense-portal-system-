import axios from "axios";

const customFetch = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true, // enable cookies in requests
});

export default customFetch;
