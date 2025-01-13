import { useState, useEffect } from 'react';
import axios from 'axios';

const usePlaces = (apiType, keyword, contentTypeId) => {
    const [places, setPlaces] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                setIsLoading(true);
                let response;
                
                // DB에서 데이터를 가져오는 경우
                if (apiType === 'search') {
                    response = await axios.get(`http://localhost:8080/api/db/search`, {
                        params: {
                            keyword,
                            contentTypeId,
                            page: 1,
                            size: 51771
                        }
                    });
                    setPlaces(response.data.items || []);
                } else {
                    // 기존 API 호출
                    response = await axios.get(`http://localhost:8080/api/${apiType}`, {
                        params: { keyword, contentTypeId },
                    });

                    if (Array.isArray(response.data)) {
                        setPlaces(response.data);
                    } else if (response.data.response?.body?.items) {
                        setPlaces(response.data.response.body.items.item);
                    }
                }
            } catch (error) {
                console.error('Error fetching place data: ', error);
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaces();
    }, [apiType, keyword, contentTypeId]);

    return { places, error, isLoading };
};

export default usePlaces;