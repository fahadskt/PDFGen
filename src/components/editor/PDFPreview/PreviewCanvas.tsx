import React from 'react';
import { useTemplateStore } from '../../../store/templateStore';
import { TemplateElement } from '../../../types';

interface ElementStyle extends React.CSSProperties {
  [key: string]: any;
}

export const PreviewCanvas: React.FC = () => {
  const { activeTemplate } = useTemplateStore();

  if (!activeTemplate) {
    return (
      <div className="w-[794px] h-[1123px] bg-white mx-auto flex items-center justify-center border border-gray-200">
        <p className="text-gray-400">No template selected</p>
      </div>
    );
  }

  const renderElement = (element: TemplateElement) => {
    const baseStyle: ElementStyle = {
      position: 'absolute',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.size.width}px`,
      height: `${element.size.height}px`,
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      ...element.style,
    };

    switch (element.type) {
      case 'text':
        return (
          <div 
            style={baseStyle}
            className="break-words"
          >
            {element.content}
          </div>
        );
      case 'image':
        return (
          <img 
            src={element.content} 
            alt={element.alt || ''} 
            style={{ ...baseStyle, objectFit: 'contain' }}
            className="select-none"
          />
        );
      case 'shape':
        if (element.shape === 'circle') {
          return (
            <div 
              style={{
                ...baseStyle,
                backgroundColor: element.backgroundColor || '#e2e8f0',
                border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#64748b'}` : undefined,
                borderRadius: '50%',
              }}
              className="select-none"
            />
          );
        } else if (element.shape === 'triangle') {
          return (
            <div 
              style={{
                position: 'absolute',
                left: `${element.position.x}px`,
                top: `${element.position.y}px`,
                width: '0',
                height: '0',
                borderLeft: `${element.size.width / 2}px solid transparent`,
                borderRight: `${element.size.width / 2}px solid transparent`,
                borderBottom: `${element.size.height}px solid ${element.backgroundColor || '#e2e8f0'}`,
                transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
              }}
              className="select-none"
            />
          );
        }
        
        return (
          <div 
            style={{
              ...baseStyle,
              backgroundColor: element.backgroundColor || '#e2e8f0',
              border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#64748b'}` : undefined,
              borderRadius: '4px',
            }}
            className="select-none"
          />
        );
      default:
        return null;
    }
  };

  console.log('Rendering template:', activeTemplate.name, 'with elements:', activeTemplate.elements.length);

  return (
    <div 
      id="pdf-canvas"
      className="relative bg-white mx-auto shadow-lg"
      style={{ 
        width: '794px',  // A4 width in pixels at 96 DPI
        height: '1123px', // A4 height in pixels at 96 DPI
        transform: 'scale(0.5)',
        transformOrigin: 'top center',
      }}
    >
      {activeTemplate.elements.map((element) => (
        <div key={element.id} className="absolute" style={{ zIndex: element.zIndex || 0 }}>
          {renderElement(element)}
        </div>
      ))}
    </div>
  );
};