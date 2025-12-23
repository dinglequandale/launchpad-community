import { useState, useRef, useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { BiZoomIn, BiZoomOut, BiMove } from 'react-icons/bi';
import './ProfilePictureCropModal.css';

export default function ProfilePictureCropModal({ imageFile, onClose, onCropComplete, cropShape = 'circle', visibility = true }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [minZoom, setMinZoom] = useState(0.5);
  const [maxZoom, setMaxZoom] = useState(3);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const modalRef = useRef(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (visibility) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [visibility, onClose]);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setImageSrc(result);

        // Calculate dynamic zoom range based on image size
        const img = new Image();
        img.onload = () => {
          const canvasSize = 300;
          const imageAspect = img.width / img.height;
          const maxDimension = Math.max(img.width, img.height);

          // Calculate minimum zoom needed to fit entire image in canvas
          let calculatedMinZoom;
          if (img.width > img.height) {
            calculatedMinZoom = canvasSize / img.width;
          } else {
            calculatedMinZoom = canvasSize / img.height;
          }

          // Set min zoom to allow seeing whole image (with some buffer)
          const finalMinZoom = Math.max(0.1, calculatedMinZoom * 0.9);
          setMinZoom(finalMinZoom);

          // Set max zoom based on image size (larger images can zoom in more)
          const finalMaxZoom = Math.max(3, maxDimension / canvasSize);
          setMaxZoom(finalMaxZoom);

          // Set initial zoom to fit image nicely
          setZoom(Math.max(finalMinZoom, 1));
        };
        img.src = result;
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      drawImage();
    }
  }, [imageSrc, zoom, position]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      // Set canvas size
      const size = 300;
      canvas.width = size;
      canvas.height = size;

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Calculate scaled dimensions
      const scale = zoom;
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      // Calculate position
      const x = (size - scaledWidth) / 2 + position.x;
      const y = (size - scaledHeight) / 2 + position.y;

      // Draw clip path based on shape
      ctx.save();
      ctx.beginPath();

      if (cropShape === 'circle') {
        // Draw circular clip for profile pictures
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else if (cropShape === 'rounded-rectangle') {
        // Draw rounded rectangle for opportunity logos (14px border radius to match OrganizationProfile)
        const radius = 14;
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
      }

      ctx.closePath();
      ctx.clip();

      // Draw image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      ctx.restore();

      // Draw border based on shape
      ctx.beginPath();
      if (cropShape === 'circle') {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else if (cropShape === 'rounded-rectangle') {
        const radius = 14;
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
      }
      ctx.strokeStyle = '#1976d2';
      ctx.lineWidth = 3;
      ctx.stroke();
    };
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (delta) => {
    setZoom(prev => Math.max(minZoom, Math.min(maxZoom, prev + delta)));
  };

  const handleCropConfirm = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      const croppedFile = new File([blob], imageFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      onCropComplete(croppedFile);
    }, 'image/jpeg', 0.95);
  };

  if (!visibility) return null;

  return (
    <div className="v0-modal-overlay" onClick={onClose}>
      <div className="v0-modal-container crop-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className="crop-modal-header">
          <h3>Adjust Your Profile Picture</h3>
          <button className="crop-modal-close-btn" onClick={onClose}>
            <IoCloseOutline size={24} />
          </button>
        </div>

        <div className="crop-modal-content">
          <div className="crop-instructions">
            <BiMove size={16} />
            <span>Drag to reposition • Use slider to zoom</span>
          </div>

          <div
            className="crop-canvas-container"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <canvas ref={canvasRef} className="crop-canvas" />
          </div>

          <div className="crop-controls">
            <button
              type="button"
              className="crop-zoom-btn"
              onClick={() => handleZoomChange(-0.1)}
              disabled={zoom <= minZoom}
            >
              <BiZoomOut size={20} />
            </button>
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="crop-zoom-slider"
            />
            <button
              type="button"
              className="crop-zoom-btn"
              onClick={() => handleZoomChange(0.1)}
              disabled={zoom >= maxZoom}
            >
              <BiZoomIn size={20} />
            </button>
          </div>
        </div>

        <div className="crop-modal-footer">
          <button type="button" onClick={onClose} className="crop-btn-cancel">
            Cancel
          </button>
          <button type="button" onClick={handleCropConfirm} className="crop-btn-confirm">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
