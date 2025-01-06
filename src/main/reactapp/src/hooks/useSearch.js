import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../utils/Api";
import { fetchSearchData2 } from "../utils/SearchApi";

// Search keyword를 기준으로 데이터 요청
const fetchTravelSearchData = async ({ keyword }) => {
    console.log("Searching with keyword:", keyword); // keyword가 제대로 전달되는지 확인
    try {
        if (keyword) {
            return await fetchSearchData2(keyword);
        } else {
            return await fetchData("/KorService1/areaBasedList1");
        }
    } catch (error) {
        console.error("검색 데이터 로딩 실패:", error);
        throw new Error("데이터를 불러오는 데 실패했습니다.");
    }
};

export const useSearch = ({ keyword }) => {
    return useQuery({
        queryKey: ["travel-search", keyword], // keyword가 바뀌면 자동으로 refetch
        queryFn: () => fetchTravelSearchData({ keyword }),
        select: (result) => result.data?.response?.body?.items?.item,
    });
};
