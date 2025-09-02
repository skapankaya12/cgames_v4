import React, { useState, useRef, useEffect } from 'react';

interface LikertSliderProps {
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  leftLabel?: string;
  rightLabel?: string;
  showValue?: boolean;
}

export const LikertSlider: React.FC<LikertSliderProps> = ({
  value,
  onChange,
  disabled = false,
  leftLabel = "Kesinlikle Katılmıyorum",
  rightLabel = "Kesinlikle Katılıyorum",
  showValue = true
}) => {
  const [currentValue, setCurrentValue] = useState(value || 5);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: number) => {
    const clampedValue = Math.max(1, Math.min(10, newValue));
    setCurrentValue(clampedValue);
    onChange(clampedValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValueFromEvent(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return;
    updateValueFromEvent(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateValueFromEvent = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newValue = Math.round(1 + (percentage * 9)); // Map 0-1 to 1-10
    
    handleValueChange(newValue);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const getValueLabel = (val: number) => {
    const labels = [
      '', // 0 - not used
      'Kesinlikle Katılmıyorum',
      'Katılmıyorum', 
      'Çoğunlukla Katılmıyorum',
      'Kısmen Katılmıyorum',
      'Kararsızım',
      'Kısmen Katılıyorum',
      'Çoğunlukla Katılıyorum',
      'Katılıyorum',
      'Büyük Ölçüde Katılıyorum',
      'Kesinlikle Katılıyorum'
    ];
    return labels[val] || '';
  };

  const percentage = ((currentValue - 1) / 9) * 100;

  return (
    <div className="likert-slider-container">
      <div className="slider-labels">
        <span className="label-left">{leftLabel}</span>
        <span className="label-right">{rightLabel}</span>
      </div>
      
      <div 
        ref={sliderRef}
        className={`slider-track ${disabled ? 'disabled' : ''} ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="slider-fill" style={{ width: `${percentage}%` }} />
        <div 
          className="slider-thumb" 
          style={{ left: `${percentage}%` }}
        />
        
        {/* Scale markers */}
        <div className="scale-markers">
          {Array.from({ length: 10 }, (_, i) => (
            <div 
              key={i + 1}
              className={`scale-marker ${currentValue === i + 1 ? 'active' : ''}`}
              style={{ left: `${(i / 9) * 100}%` }}
              onClick={() => !disabled && handleValueChange(i + 1)}
            >
              <span className="marker-number">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {showValue && (
        <div className="value-display">
          <div className="current-value">
            <span className="value-number">{currentValue}</span>
            <span className="value-label">{getValueLabel(currentValue)}</span>
          </div>
        </div>
      )}

      <style>{`
        .likert-slider-container {
          width: 100%;
          max-width: 600px;
          margin: 2rem auto;
          padding: 1rem;
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .slider-track {
          position: relative;
          height: 12px;
          background: linear-gradient(90deg, #fee2e2 0%, #fef3c7 50%, #dcfce7 100%);
          border-radius: 6px;
          cursor: pointer;
          margin: 2rem 0;
          border: 2px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .slider-track:hover:not(.disabled) {
          border-color: #6B8E23;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .slider-track.dragging {
          border-color: #6B8E23;
          box-shadow: 0 4px 16px rgba(107, 142, 35, 0.3);
        }

        .slider-track.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .slider-fill {
          height: 100%;
          background: linear-gradient(90deg, #6B8E23, #8FBC8F);
          border-radius: 4px;
          transition: width 0.2s ease;
        }

        .slider-thumb {
          position: absolute;
          top: 50%;
          width: 24px;
          height: 24px;
          background: #6B8E23;
          border: 3px solid white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          cursor: grab;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb:hover {
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .slider-track.dragging .slider-thumb {
          cursor: grabbing;
          transform: translate(-50%, -50%) scale(1.2);
        }

        .scale-markers {
          position: absolute;
          top: -8px;
          left: 0;
          right: 0;
          height: 100%;
        }

        .scale-marker {
          position: absolute;
          top: -12px;
          transform: translateX(-50%);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .scale-marker:hover .marker-number {
          background: #6B8E23;
          color: white;
          transform: scale(1.2);
        }

        .scale-marker.active .marker-number {
          background: #6B8E23;
          color: white;
          transform: scale(1.3);
          font-weight: bold;
        }

        .marker-number {
          display: inline-block;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #d1d5db;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .value-display {
          margin-top: 1.5rem;
          text-align: center;
        }

        .current-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .value-number {
          font-size: 2rem;
          font-weight: bold;
          color: #6B8E23;
          background: rgba(107, 142, 35, 0.1);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #6B8E23;
        }

        .value-label {
          font-size: 1rem;
          color: #333;
          font-weight: 500;
          text-align: center;
          max-width: 200px;
        }

        @media (max-width: 768px) {
          .likert-slider-container {
            padding: 0.5rem;
          }
          
          .slider-labels {
            font-size: 0.8rem;
            text-align: center;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .slider-track {
            margin: 3rem 0;
          }
          
          .value-number {
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
          }
          
          .value-label {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};
