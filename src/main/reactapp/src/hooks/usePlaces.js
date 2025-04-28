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
                const response = await axios.get(`https://port-0-backend-m8uaask821ad767f.sel4.cloudtype.app/api/${apiType}`, {
                    params: { keyword, contentTypeId },
                });

                if (Array.isArray(response.data)) {
                    setPlaces(response.data);
                } else if (response.data.response?.body?.items) {
                    setPlaces(response.data.response.body.items.item);
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