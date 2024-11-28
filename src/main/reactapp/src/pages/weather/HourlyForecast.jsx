import React from 'react';
import styles from './style/HourlyForecast.module.css'
import Card from './Card';
import { getHours } from '../../util';

export default function HourlyForecast({forecastData}) {
    const filteredData = forecastData.list.filter((_, index) => index < 8);
    const directionImg = 'assets/images/direction.png';

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>시간대별 날씨</h2>
            <div className={styles.container}>
                <ul className={styles.list}>
                    {filteredData.map((forecast) => {
                        const {
                            dt,
                            main: { temp },
                            weather,
                        } = forecast;
                        const [{ icon, description }] = weather;
                        const iconUrl = require(`../../../public/assets/images/${icon}.png`);
                        return (
                            <li key={dt} className={styles.item}>
                                <Card size="small" className={styles["forecast-card"]}>
                                    <p className={styles.text}>{getHours(dt)}</p>
                                    <img
                                        src={iconUrl}
                                        width="48"
                                        height="48"
                                        alt={description}
                                        className={styles.img}
                                        title={description}
                                    />
                                    <p className={styles.text}>{`${Math.round(temp)}°`}</p>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
                <ul className={styles.list}>
                    {filteredData.map((forecast) => {
                        const { 
                            dt,
                            weather,
                            wind: { deg, speed },
                        } = forecast;
                        const [{ description }] = weather
                        return (
                            <li key={dt} className={styles.item}>
                                <Card size="small" className={styles["forecast-card"]}>
                                    <p className={styles.text}>{getHours(dt)}</p>
                                    <img
                                        src={directionImg}
                                        width="48"
                                        height="48"
                                        alt={description}
                                        className={styles.img}
                                        title={description}
                                        style={{ transform: `rotate(${deg - 180}deg)` }}
                                    />
                                    <p className={styles.text}>{Math.round(speed * 3600 / 1000)} km/h</p>
                                </Card>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    );
}