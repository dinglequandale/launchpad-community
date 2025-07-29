import React, { useRef, useEffect, useState } from "react";
import styles from "./ResourceCarousel.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function useSlidesToShow() {
  const [slidesToShow, setSlidesToShow] = useState(3);
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 700) setSlidesToShow(1);
      else if (window.innerWidth < 1200) setSlidesToShow(2);
      else setSlidesToShow(3);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return slidesToShow;
}

export default function ResourceCarousel({ title, resources, sectionRef, onSectionRef }) {
  const localRef = useRef(null);
  const trackRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const slidesToShow = useSlidesToShow();
  const totalSlides = resources.length;
  const isStatic = totalSlides <= slidesToShow;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (onSectionRef && localRef.current) onSectionRef(title, localRef.current);
  }, [title, onSectionRef]);

  // Track container width for precise centering
  useEffect(() => {
    function updateWidth() {
      if (localRef.current) {
        setContainerWidth(localRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Clamp current index if slidesToShow changes
  useEffect(() => {
    if (current > totalSlides - slidesToShow) setCurrent(Math.max(0, totalSlides - slidesToShow));
  }, [slidesToShow, totalSlides]);

  // Infinite/circular slider logic
  const handlePrev = () => {
    if (current === 0) {
      setCurrent(totalSlides - slidesToShow);
    } else {
      setCurrent((c) => c - 1);
    }
  };
  const handleNext = () => {
    if (current >= totalSlides - slidesToShow) {
      setCurrent(0);
    } else {
      setCurrent((c) => c + 1);
    }
  };
  const handleDot = (idx) => setCurrent(idx);

  // If static (3 or fewer cards), just center them
  if (isStatic) {
    return (
      <div className={styles.carouselContainer} ref={localRef}>
        <div style={{ position: "absolute", left: 0, top: "-80px", width: 5, height: 1 }} />
        <div className={styles.titleBar}>
          <span className={styles.titleText}>{title}</span>
        </div>
        <div className={styles.cardRow}>
          {resources.map((resource, idx) => (
            <ResourceCard key={idx} {...resource} />
          ))}
        </div>
      </div>
    );
  }

  // Calculate card width in px (using container width)
  const gap = 24; // px, matches .slick-slide padding (12px each side)
  const cardWidth = containerWidth
    ? (containerWidth - gap * (slidesToShow - 1)) / slidesToShow
    : 300;

  // Calculate offset to center the visible cards
  const totalTrackWidth = totalSlides * cardWidth + gap * (totalSlides - 1);
  const visibleTrackWidth = slidesToShow * cardWidth + gap * (slidesToShow - 1);
  const leftOffset = (containerWidth - visibleTrackWidth) / 2;
  const translateX = leftOffset - current * (cardWidth + gap);

  return (
    <div className={styles.carouselContainer} ref={localRef}>
      <div style={{ position: "absolute", left: 0, top: "-80px", width: 5, height: 1 }} />
      <div className={styles.titleBar}>
        <span className={styles.titleText}>{title}</span>
      </div>
      <div style={{ position: "relative", width: "100%" }}>
        <button
          className={`${styles.arrow} ${styles.left}`}
          onClick={handlePrev}
          aria-label="Previous"
          tabIndex={0}
          style={{ zIndex: 2 }}
        >
          <FaChevronLeft />
        </button>
        <button
          className={`${styles.arrow} ${styles.right}`}
          onClick={handleNext}
          aria-label="Next"
          tabIndex={0}
          style={{ zIndex: 2 }}
        >
          <FaChevronRight />
        </button>
        <div
          className={styles.slickList}
          style={{ overflowX: "hidden", width: "100%", position: "relative" }}
        >
          <div
            className={styles.slickTrack}
            ref={trackRef}
            style={{
              display: "flex",
              transition: "transform 0.5s cubic-bezier(.77,0,.18,1)",
              transform: `translateX(${translateX}px)`,
              width: totalTrackWidth,
              overflowY: "visible", 
            }}
          >
            {resources.map((resource, idx) => (
              <div
                className={styles.slickSlide}
                key={idx}
                style={{
                  width: cardWidth,
                  minWidth: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "stretch",
                //   marginRight: idx !== totalSlides - 1 ? gap : 0,
                }}
              >
                <ResourceCard {...resource} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        {Array.from({ length: totalSlides - slidesToShow + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDot(idx)}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: idx === current ? "#1976d2" : "#b3c6e0",
              border: "none",
              margin: 4,
              cursor: "pointer",
              outline: idx === current ? "2px solid #1976d2" : "none",
              transition: "background 0.2s",
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ResourceCard({ title, link, description, recommendedBanner, time, userType }) {
  return (
    <div className={styles.card}>
      {recommendedBanner === "yes (highly recommended)" && (
        <div className={styles.banner}>Highly Recommended!</div>
      )}
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{description}</p>
      {time && <span className={styles.cardTime}>Time: {time}</span>}
      <p className={styles.cardUserType}>For: {userType}</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cardBtn}
      >
        Access Resource
      </a>
    </div>
  );
} 