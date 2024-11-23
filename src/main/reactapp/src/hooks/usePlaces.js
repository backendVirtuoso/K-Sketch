/*
import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePlaces = (apiType, keyword, contentTypeId) => {
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

export const usePagination = (items, itemsPerPage = 12) => {
    const [currentPage, setCurrentPage] = useState(0);

    const pageCount = Math.ceil(items.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = items.slice(offset, offset + itemsPerPage);

    const handlePageClick = (data) => setCurrentPage(data.selected);

    return { currentItems, pageCount, handlePageClick };
};

export const useSelectedPlace = () => {
    const [selectedPlace, setSelectedPlace] = useState(null);

    const handlePlaceClick = (place) => setSelectedPlace(place);
    const closePopup = () => setSelectedPlace(null);

    const savePlaceToDB = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/savePlace', {
                title: selectedPlace.title,
                addr1: selectedPlace.addr1,
                tel: selectedPlace.tel,
                mapx: selectedPlace.mapx,
                mapy: selectedPlace.mapy,
                firstimage: selectedPlace.firstimage,
                overview: selectedPlace.overview,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            console.log('Place saved:', response.data);
            closePopup();
        } catch (error) {
            console.error('Error saving place:', error);
        }
    };

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                closePopup();
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    return {
        selectedPlace,
        handlePlaceClick,
        closePopup,
        savePlaceToDB
    };
};*/
