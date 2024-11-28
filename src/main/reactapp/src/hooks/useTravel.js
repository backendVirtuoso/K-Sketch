import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../utils/Api"; // Adjust path as necessary

const fetchTravelData = () => {
    return fetchData("/KorService1/areaBasedList1"); // Specify the endpoint you want to hit
};

export const useTravel = () => {
    return useQuery({
        queryKey: ["travel-data"],
        queryFn: fetchTravelData,
        select: (result) => result.data?.response?.body?.items?.item,
    });
};
