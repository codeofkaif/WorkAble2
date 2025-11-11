import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import TemplateRenderer from './TemplateRenderer';
import { ResumeData } from '../services/resumeAPI';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResumePreviewProps {
  resumeData: ResumeData;
  template: 'modern' | 'classic' | 'creative' | 'minimal';
}

export interface ResumePreviewHandle {
  exportPDF: () => void;
}

const ResumePreview = forwardRef<ResumePreviewHandle, ResumePreviewProps>(({ resumeData, template }, ref) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${resumeData.personalInfo?.fullName || 'Resume'}_${template}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  useImperativeHandle(ref, () => ({
    exportPDF: handleExportPDF
  }));

  const handlePrint = () => {
    if (!previewRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = previewRef.current.innerHTML;
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume - ${resumeData.personalInfo?.fullName || 'Resume'}</title>
          <style>${styles}</style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Resume Preview</CardTitle>
            <CardDescription>Real-time preview of your resume</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
              aria-label="Print resume"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button
              onClick={handleExportPDF}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center space-x-2"
              aria-label="Export resume as PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <motion.div
          key={`${template}-${JSON.stringify(resumeData)}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          ref={previewRef}
          className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto"
          style={{ minHeight: '800px' }}
        >
          <TemplateRenderer resumeData={resumeData} template={template} />
        </motion.div>
      </div>
    </Card>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;

