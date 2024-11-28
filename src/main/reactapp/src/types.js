import PropTypes from 'prop-types';

export const WeatherShape = {
    icon: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
};

export const CurrentWeatherShape = {
    weather: PropTypes.arrayOf(PropTypes.shape(WeatherShape)).isRequired,
    dt: PropTypes.number.isRequired,
    dt_txt: PropTypes.string.isRequired,
    sys: PropTypes.shape({
        country: PropTypes.string.isRequired,
        sunrise: PropTypes.number.isRequired,
        sunset: PropTypes.number.isRequired
    }).isRequired,
    visibility: PropTypes.number.isRequired,
    timezone: PropTypes.number.isRequired,
    main: PropTypes.shape({
        temp: PropTypes.number.isRequired,
        temp_max: PropTypes.number.isRequired,
        temp_min: PropTypes.number.isRequired,
        humidity: PropTypes.number.isRequired,
        pressure: PropTypes.number.isRequired,
        feels_like: PropTypes.number.isRequired
    }).isRequired,
    wind: PropTypes.shape({
        speed: PropTypes.number.isRequired,
        deg: PropTypes.number.isRequired
    }).isRequired
};

export const ForecastShape = {
    list: PropTypes.arrayOf(PropTypes.shape(CurrentWeatherShape)).isRequired,
    city: PropTypes.shape({
        timezone: PropTypes.number.isRequired
    }).isRequired
};

export const AirPollutionShape = {
    list: PropTypes.arrayOf(PropTypes.shape({
        main: PropTypes.shape({
            aqi: PropTypes.number.isRequired
        }).isRequired,
        components: PropTypes.shape({
            pm2_5: PropTypes.number.isRequired,
            so2: PropTypes.number.isRequired,
            no2: PropTypes.number.isRequired,
            o3: PropTypes.number.isRequired
        }).isRequired
    })).isRequired
};