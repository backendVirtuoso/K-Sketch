import axios from "axios";

const API_KEY = process.env.REACT_APP_API_KEY;

const api = axios.create({
  baseURL: "https://apis.data.go.kr/B551011",
  headers: {
    Accept: "application/json",
  },
});

const fetchSearchData2 = (keyword) => {
  const encodedKeyword = encodeURIComponent(keyword);
  return api.get(
    `/KorService1/searchKeyword1?serviceKey=${API_KEY}&MobileApp=AppTest&MobileOS=ETC&pageNo=1&numOfRows=10&listYN=Y&arrange=A&contentTypeId=12&keyword=${encodedKeyword}&_type=json`
  );
};

export { fetchSearchData2 };
