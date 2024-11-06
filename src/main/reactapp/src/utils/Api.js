import axios from "axios";

const API_KEY = process.env.REACT_APP_API_KEY;

const api = axios.create({
  baseURL: "http://apis.data.go.kr/B551011", // Base URL without specific endpoint
  headers: {
    Accept: "*/*",
  },
});

// Function to fetch data from a specific endpoint
const fetchData = (endpoint) => {
  return api.get(`${endpoint}?serviceKey=${API_KEY}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=TestApp&_type=json`);
};

export { fetchData };
