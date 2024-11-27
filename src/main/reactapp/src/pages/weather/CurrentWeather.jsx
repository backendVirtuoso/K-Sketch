import React from "react";
import styles from "./style/CurrentWeather.module.css";
import Card from "./Card";
import { getDate } from "../../util";
import { IoCalendarClearOutline, IoLocationOutline } from "react-icons/io5";

export default function CurrentWeather({ currentWeather, city }) {
    const {
        weather,
        dt: dataUnix,
        sys: { country },
        main: { temp },
    } = currentWeather;

    const [{ icon, description }] = weather;
    const iconUrl = require(`../../../public/assets/images/${icon}.png`);

    return (
        <section className={styles.section}>
            <Card size="large">
                <h2 className={styles.title}>현재</h2>
                <div className={styles.wrapper}>
                    <p className={styles.heading}>
                        {`${Math.round(temp)}°`}<sup>c</sup>
                    </p>
                    <img
                        src={iconUrl}
                        width="80"
                        height="80"
                        alt="clouds"
                        className={styles.img}
                    />
                </div>
                <p className={styles.desc}>{description}</p>
                <ul className={styles.list}>
                    <li className={styles.item}>
                        <span className={styles.icon}>
                            <IoCalendarClearOutline />
                        </span>
                        <p className={styles.text}>
                            {getDate(dataUnix)}
                        </p>
                    </li>
                    <li className={styles.item}>
                        <span className={styles.icon}>
                            <IoLocationOutline />
                        </span>
                        <p className={styles.text}>{city}, {country}</p>
                    </li>
                </ul>
            </Card>
        </section>
    );
}