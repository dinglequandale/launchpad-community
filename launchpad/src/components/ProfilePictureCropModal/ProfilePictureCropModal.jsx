import { useState, useRef, useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { BiZoomIn, BiZoomOut, BiMove } from 'react-icons/bi';
import './ProfilePictureCropModal.css';

export default function ProfilePictureCropModal({ imageFile, onClose, onCropComplete }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
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

      // Draw circular clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      ctx.restore();

      // Draw circle border
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
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
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
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

  return (
    <div className="crop-modal-overlay" onClick={onClose}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
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
              disabled={zoom <= 0.5}
            >
              <BiZoomOut size={20} />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="crop-zoom-slider"
            />
            <button
              type="button"
              className="crop-zoom-btn"
              onClick={() => handleZoomChange(0.1)}
              disabled={zoom >= 3}
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
