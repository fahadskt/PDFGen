import React, { useState, useCallback } from 'react';
import { useTemplateStore } from '../../store/templateStore';
import { EyeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { PreviewCanvas } from './PDFPreview/PreviewCanvas';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const PDFPreview: React.FC = () => {
  const { activeTemplate } = useTemplateStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = useCallback(async (forDownload = false) => {
    if (!activeTemplate) return null;
    
    try {
      const element = document.getElementById('pdf-canvas');
      if (!element) {
        console.error('Canvas element not found');
        throw new Error('Preview canvas not found');
      }

      console.log('Starting PDF generation...');
      console.log('Canvas dimensions:', element.offsetWidth, 'x', element.offsetHeight);

      // Remove scale transform temporarily
      const originalTransform = element.style.transform;
      const originalTransformOrigin = element.style.transformOrigin;
      element.style.transform = 'none';
      element.style.transformOrigin = 'top left';

      // Wait for any potential reflows
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
      });

      console.log('Canvas generated:', canvas.width, 'x', canvas.height);

      // Restore original transform
      element.style.transform = originalTransform;
      element.style.transformOrigin = originalTransformOrigin;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = 297; // A4 height in mm
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      if (forDownload) {
        return pdf;
      } else {
        const dataUrl = pdf.output('dataurlstring');
        console.log('PDF generated successfully');
        return dataUrl;
      }
    } catch (error) {
      console.error('Error in PDF generation:', error);
      throw error;
    }
  }, [activeTemplate]);

  const handlePreview = async () => {
    if (!activeTemplate) return;
    
    try {
      setError(null);
      setIsGenerating(true);
      setPreviewUrl(null); // Clear existing preview
      
      console.log('Starting preview generation...');
      const result = await generatePDF(false);
      
      if (typeof result === 'string') {
        console.log('Setting preview URL...');
        setPreviewUrl(result);
      } else {
        throw new Error('Invalid preview generation result');
      }
    } catch (error) {
      console.error('Preview error:', error);
      setError('Failed to generate preview. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!activeTemplate) return;
    
    try {
      setError(null);
      setIsGenerating(true);
      
      console.log('Starting PDF download...');
      const result = await generatePDF(true);
      
      if (result instanceof jsPDF) {
        console.log('Saving PDF...');
        result.save(`${activeTemplate.name || 'document'}.pdf`);
      } else {
        throw new Error('Invalid PDF generation result');
      }
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-md flex items-center justify-center overflow-hidden p-4">
        {isGenerating ? (
          <div className="py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {previewUrl ? (
              <iframe 
                src={previewUrl}
                className="w-full h-[600px] border-0"
                title="PDF Preview"
              />
            ) : (
              <div className="overflow-auto">
                <PreviewCanvas />
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={handlePreview}
          disabled={isGenerating || !activeTemplate}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Preview'}
        </button>
        <button
          onClick={handleDownload}
          disabled={isGenerating || !activeTemplate}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
};