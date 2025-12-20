import { useEffect } from "react";
import "./PageLoading.css";

export default function PageLoading() {
    useEffect(() => {
        // Generate stars
        const scene = document.querySelector('.rocket-scene');
        if (!scene) return;

        const count = 50;
        for (let i = 0; i < count; i++) {
            const star = document.createElement('i');
            const x = Math.floor(Math.random() * window.innerWidth);
            const duration = Math.random() * 2 + 1; // 1-3 seconds
            const h = Math.random() * 100;

            star.style.left = x + 'px';
            star.style.width = '1px';
            star.style.height = h + 'px';
            star.style.animationDuration = duration + 's';

            scene.appendChild(star);
        }

        // Cleanup
        return () => {
            if (scene) {
                scene.querySelectorAll('i').forEach(star => star.remove());
            }
        };
    }, []);

    return (
        <div className="rocket-scene">
            <div className="rocket-container">
                <svg className="rocket" width="72" height="99" viewBox="0 0 72 99" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Rocket Body */}
                    <path d="M36 0L50 25H22L36 0Z" fill="var(--secondary)"/>
                    <rect x="22" y="25" width="28" height="45" fill="var(--secondary)" rx="2"/>

                    {/* Window */}
                    <circle cx="36" cy="40" r="8" fill="#1565c0" stroke="white" strokeWidth="2"/>
                    <circle cx="36" cy="40" r="5" fill="#64b5f6" opacity="0.5"/>

                    {/* Wings */}
                    <path d="M22 50L10 70L22 70Z" fill="var(--accent)"/>
                    <path d="M50 50L62 70L50 70Z" fill="var(--accent)"/>

                    {/* Thrusters */}
                    <rect x="26" y="70" width="8" height="10" fill="#424242" rx="1"/>
                    <rect x="38" y="70" width="8" height="10" fill="#424242" rx="1"/>

                    {/* Details */}
                    <rect x="32" y="55" width="8" height="2" fill="white" opacity="0.3"/>
                    <rect x="32" y="60" width="8" height="2" fill="white" opacity="0.3"/>
                </svg>
            </div>

            <div className="logo-container">
                <img src="/assets/launchpad_logo_raw.png" alt="Launchpad" className="loading-logo-icon"/>
                <span className="loading-logo-text">Launchpad</span>
            </div>
        </div>
    );
}