import React from "react";


export default function RobotMascot({variant = "robot", className = ""}) {
    if (variant === "robot") {
        return (
            <img className={className} src="/icons/icon-192.png" alt="logo-RobotMarket"/>
        );
    }

    if (variant === "logo-RobotMarket") {
        return (
            <img className={className} src="/images/logo-RobotMarket.png" alt="logo-RobotMarket"/>
        );

    }


    return (
        <svg viewBox="0 0 160 180" className={className} xmlns="http://www.w3.org/2000/svg">
            {}
            <circle cx="58" cy="18" r="5" fill="#00A693"/>
            <circle cx="102" cy="18" r="5" fill="#00A693"/>
            <rect x="55.5" y="20" width="5" height="16" rx="2.5" fill="#B9EDE4"/>
            <rect x="99.5" y="20" width="5" height="16" rx="2.5" fill="#B9EDE4"/>

            {}
            <rect x="35" y="34" width="90" height="70" rx="30" fill="#ffffff" stroke="#DFF7F2" strokeWidth="3"/>
            <rect x="50" y="54" width="60" height="34" rx="17" fill="#0F2A27"/>
            <circle cx="70" cy="71" r="7" fill="#00A693"/>
            <circle cx="90" cy="71" r="7" fill="#00A693"/>
            <circle cx="72.5" cy="68.5" r="2" fill="#ffffff"/>
            <circle cx="92.5" cy="68.5" r="2" fill="#ffffff"/>

            {}
            <rect x="24" y="58" width="11" height="22" rx="5.5" fill="#00A693"/>
            <rect x="125" y="58" width="11" height="22" rx="5.5" fill="#00A693"/>

            {}
            <rect x="45" y="108" width="70" height="58" rx="24" fill="#ffffff" stroke="#DFF7F2" strokeWidth="3"/>
            <rect x="63" y="122" width="34" height="10" rx="5" fill="#DFF7F2"/>
            <circle cx="80" cy="150" r="9" fill="#00A693"/>

            {}
            <rect x="20" y="118" width="14" height="34" rx="7" fill="#B9EDE4"/>
            <rect x="126" y="118" width="14" height="34" rx="7" fill="#B9EDE4"/>
        </svg>);

}
