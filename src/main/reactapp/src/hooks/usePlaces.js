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
                const response = await axios.get(`http://localhost:8080/api/${apiType}`, {
                    params: { keyword, contentTypeId },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
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