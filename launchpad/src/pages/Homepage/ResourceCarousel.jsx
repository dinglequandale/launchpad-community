import React, { useRef, useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function ResourceCarousel({ title, resources, sectionRef, onSectionRef }) {
  const localRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    if (onSectionRef && localRef.current) onSectionRef(title, localRef.current);
  }, [title, onSectionRef]);

  // Responsive slides to show
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) setSlidesToShow(1);
      else if (window.innerWidth < 1200) setSlidesToShow(2);
      else setSlidesToShow(3);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = resources.length;
  const maxIndex = Math.max(0, totalSlides - slidesToShow);

  const handlePrev = () => {
    setCurrent(current === 0 ? maxIndex : current - 1);
  };

  const handleNext = () => {
    setCurrent(current >= maxIndex ? 0 : current + 1);
  };

  const handleDot = (idx) => setCurrent(idx);

  // If we have fewer slides than can be shown, just display them statically
  if (totalSlides <= slidesToShow) {
    return (
      <div className="v0-resource-carousel" ref={localRef}>
        <div className="v0-resource-grid-static">
          {resources.map((resource, idx) => (
            <ResourceCard key={idx} {...resource} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="v0-resource-carousel" ref={localRef}>
      <div className="v0-carousel-container">
        <button
          className="v0-carousel-arrow v0-carousel-arrow-left"
          onClick={handlePrev}
          aria-label="Previous"
        >
          <LuChevronLeft size={20} />
        </button>
        
        <div className="v0-carousel-track">
          <div 
            className="v0-carousel-slides"
            style={{
              transform: `translateX(-${current * (100 / slidesToShow)}%)`,
            }}
          >
            {resources.map((resource, idx) => (
              <div key={idx} className="v0-carousel-slide">
                <ResourceCard {...resource} />
              </div>
            ))}
          </div>
        </div>

        <button
          className="v0-carousel-arrow v0-carousel-arrow-right"
          onClick={handleNext}
          aria-label="Next"
        >
          <LuChevronRight size={20} />
        </button>
      </div>

      {/* Dots indicator */}
      {totalSlides > slidesToShow && (
        <div className="v0-carousel-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              className={`v0-carousel-dot ${idx === current ? 'v0-carousel-dot-active' : ''}`}
              onClick={() => handleDot(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceCard({ title, link, description, recommendedBanner, time, userType }) {
  return (
    <div className="v0-resource-card">
      {recommendedBanner === "yes (highly recommended)" && (
        <div className="v0-resource-banner">Highly Recommended</div>
      )}
      <div className="v0-resource-card-content">
        <h3 className="v0-resource-card-title">{title}</h3>
        <p className="v0-resource-card-description">{description}</p>
        <div className="v0-resource-card-meta">
          {time && <span className="v0-resource-card-time">⏱ {time}</span>}
          <span className="v0-resource-card-user-type">👥 {userType}</span>
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="v0-resource-card-link"
        >
          Access Resource
        </a>
      </div>
    </div>
  );
} 