import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface ConversionData {
  id: string;
  source_table: string;
  original_format: string;
  original_size: number | null;
  converted_size: number | null;
  savings_percentage: number | null;
  status: string | null;
  converted_at: string | null;
  created_at: string | null;
}

export interface StorageMetricData {
  id: string;
  recorded_at: string;
  total_images: number;
  webp_images: number;
  other_images: number;
  total_storage_bytes: number | null;
  webp_storage_bytes: number | null;
  other_storage_bytes: number | null;
  conversions_count: number | null;
  savings_bytes: number | null;
  average_savings_percentage: number | null;
}

export interface ExportSummary {
  totalImages: number;
  convertedImages: number;
  totalOriginalSize: number;
  totalConvertedSize: number;
  totalSavings: number;
  averageSavingsPercentage: number;
  webpCount: number;
  jpegCount: number;
  pngCount: number;
  otherCount: number;
}

// Format bytes to human readable
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date for display
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Export conversions to CSV
export const exportConversionsToCSV = (conversions: ConversionData[], filename?: string): void => {
  const headers = [
    'ID',
    'Tabela Origem',
    'Formato Original',
    'Tamanho Original',
    'Tamanho WEBP',
    'Poupança (%)',
    'Estado',
    'Data Conversão'
  ];

  const rows = conversions.map(conv => [
    conv.id,
    conv.source_table,
    conv.original_format.toUpperCase(),
    conv.original_size ? formatBytes(conv.original_size) : '-',
    conv.converted_size ? formatBytes(conv.converted_size) : '-',
    conv.savings_percentage ? `${conv.savings_percentage.toFixed(1)}%` : '-',
    conv.status || 'pending',
    formatDate(conv.converted_at || conv.created_at)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, filename || `conversoes_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

// Export storage metrics to CSV
export const exportMetricsToCSV = (metrics: StorageMetricData[], filename?: string): void => {
  const headers = [
    'Data',
    'Total Imagens',
    'Imagens WEBP',
    'Outras Imagens',
    'Storage Total',
    'Storage WEBP',
    'Storage Outros',
    'Conversões',
    'Poupança Total',
    'Poupança Média (%)'
  ];

  const rows = metrics.map(metric => [
    formatDate(metric.recorded_at),
    metric.total_images,
    metric.webp_images,
    metric.other_images,
    metric.total_storage_bytes ? formatBytes(metric.total_storage_bytes) : '-',
    metric.webp_storage_bytes ? formatBytes(metric.webp_storage_bytes) : '-',
    metric.other_storage_bytes ? formatBytes(metric.other_storage_bytes) : '-',
    metric.conversions_count || 0,
    metric.savings_bytes ? formatBytes(metric.savings_bytes) : '-',
    metric.average_savings_percentage ? `${metric.average_savings_percentage.toFixed(1)}%` : '-'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, filename || `metricas_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

// Export summary to CSV
export const exportSummaryToCSV = (summary: ExportSummary, filename?: string): void => {
  const rows = [
    ['Métrica', 'Valor'],
    ['Total de Imagens', summary.totalImages],
    ['Imagens Convertidas', summary.convertedImages],
    ['Taxa de Conversão', `${((summary.convertedImages / summary.totalImages) * 100).toFixed(1)}%`],
    ['Tamanho Original Total', formatBytes(summary.totalOriginalSize)],
    ['Tamanho Convertido Total', formatBytes(summary.totalConvertedSize)],
    ['Poupança Total', formatBytes(summary.totalSavings)],
    ['Poupança Média', `${summary.averageSavingsPercentage.toFixed(1)}%`],
    ['Imagens WEBP', summary.webpCount],
    ['Imagens JPEG', summary.jpegCount],
    ['Imagens PNG', summary.pngCount],
    ['Outros Formatos', summary.otherCount]
  ];

  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

  downloadFile(csvContent, filename || `resumo_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

// Generate PDF report
export const exportToPDF = async (
  summary: ExportSummary,
  conversions: ConversionData[],
  chartElement?: HTMLElement | null
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Header
  pdf.setFillColor(30, 41, 59); // slate-800
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório de Conversão de Imagens', margin, 25);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Genuíno Investments - ${new Date().toLocaleDateString('pt-PT')}`, margin, 35);

  yPos = 55;
  pdf.setTextColor(30, 41, 59);

  // Executive Summary
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resumo Executivo', margin, yPos);
  yPos += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['Total de Imagens:', summary.totalImages.toString()],
    ['Convertidas para WEBP:', `${summary.convertedImages} (${((summary.convertedImages / summary.totalImages) * 100).toFixed(1)}%)`],
    ['Tamanho Original Total:', formatBytes(summary.totalOriginalSize)],
    ['Tamanho Após Conversão:', formatBytes(summary.totalConvertedSize)],
    ['Poupança Total:', `${formatBytes(summary.totalSavings)} (${summary.averageSavingsPercentage.toFixed(1)}%)`]
  ];

  summaryData.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, margin, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, margin + 55, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Format Distribution
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Distribuição de Formatos', margin, yPos);
  yPos += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const formatData = [
    ['WEBP:', summary.webpCount.toString()],
    ['JPEG:', summary.jpegCount.toString()],
    ['PNG:', summary.pngCount.toString()],
    ['Outros:', summary.otherCount.toString()]
  ];

  formatData.forEach(([label, value]) => {
    pdf.text(`${label} ${value}`, margin, yPos);
    yPos += 5;
  });

  yPos += 10;

  // Capture chart if provided
  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, { 
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (yPos + imgHeight > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, Math.min(imgHeight, 80));
      yPos += Math.min(imgHeight, 80) + 10;
    } catch (error) {
      console.error('Erro ao capturar gráfico:', error);
    }
  }

  // Conversions Table
  if (conversions.length > 0) {
    if (yPos > pdf.internal.pageSize.getHeight() - 60) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Últimas Conversões', margin, yPos);
    yPos += 10;

    // Table header
    pdf.setFillColor(241, 245, 249); // slate-100
    pdf.rect(margin, yPos - 4, pageWidth - (margin * 2), 8, 'F');
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    const colWidths = [30, 25, 25, 25, 20, 30];
    const headers = ['Tabela', 'Formato', 'Original', 'WEBP', 'Poupança', 'Data'];
    let xPos = margin;
    
    headers.forEach((header, i) => {
      pdf.text(header, xPos, yPos);
      xPos += colWidths[i];
    });
    yPos += 8;

    // Table rows (limit to 15 rows per page)
    pdf.setFont('helvetica', 'normal');
    const displayConversions = conversions.slice(0, 30);
    
    displayConversions.forEach((conv, index) => {
      if (yPos > pdf.internal.pageSize.getHeight() - 15) {
        pdf.addPage();
        yPos = 20;
      }

      xPos = margin;
      const rowData = [
        conv.source_table.substring(0, 12),
        conv.original_format.toUpperCase(),
        conv.original_size ? formatBytes(conv.original_size) : '-',
        conv.converted_size ? formatBytes(conv.converted_size) : '-',
        conv.savings_percentage ? `${conv.savings_percentage.toFixed(0)}%` : '-',
        formatDate(conv.converted_at || conv.created_at).split(' ')[0]
      ];

      rowData.forEach((cell, i) => {
        pdf.text(cell, xPos, yPos);
        xPos += colWidths[i];
      });
      yPos += 5;
    });
  }

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.text(
      `Página ${i} de ${pageCount} | Genuíno Investments © ${new Date().getFullYear()}`,
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  pdf.save(`relatorio_conversao_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Helper function to download files
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Calculate summary from conversions
export const calculateSummary = (
  conversions: ConversionData[],
  allImages: { format: string }[]
): ExportSummary => {
  const convertedImages = conversions.filter(c => c.status === 'converted').length;
  const totalOriginalSize = conversions.reduce((acc, c) => acc + (c.original_size || 0), 0);
  const totalConvertedSize = conversions.reduce((acc, c) => acc + (c.converted_size || 0), 0);
  
  const savingsPercentages = conversions
    .filter(c => c.savings_percentage !== null)
    .map(c => c.savings_percentage as number);
  
  const averageSavingsPercentage = savingsPercentages.length > 0
    ? savingsPercentages.reduce((a, b) => a + b, 0) / savingsPercentages.length
    : 0;

  const formatCounts = allImages.reduce((acc, img) => {
    const format = img.format.toLowerCase();
    if (format === 'webp') acc.webp++;
    else if (format === 'jpeg' || format === 'jpg') acc.jpeg++;
    else if (format === 'png') acc.png++;
    else acc.other++;
    return acc;
  }, { webp: 0, jpeg: 0, png: 0, other: 0 });

  return {
    totalImages: allImages.length,
    convertedImages,
    totalOriginalSize,
    totalConvertedSize,
    totalSavings: totalOriginalSize - totalConvertedSize,
    averageSavingsPercentage,
    webpCount: formatCounts.webp,
    jpegCount: formatCounts.jpeg,
    pngCount: formatCounts.png,
    otherCount: formatCounts.other
  };
};
