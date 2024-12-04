import React from "react";
import styles from './style/Card.module.css'

export default function Card(props) {
    const { children, size = "large", className } = props;

    const sizeClassMap = {
        large: "card-lg",
        small: "card-sm",
    };

    const sizeClass = sizeClassMap[size] || "";
    return <div className={`${styles.card} ${styles[sizeClass]} ${className || ""}`}>{children}</div>;
}