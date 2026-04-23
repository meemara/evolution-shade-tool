import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { calculateSqFt } from '../data/rollerShadeData';

export function exportToExcel(project, shades) {
  const wb = XLSX.utils.book_new();

  // Project info sheet
  const projectData = [
    ['Evolution Audio • Video • Automation'],
    ['Shade Configuration Export'],
    [''],
    ['Project Name', project.name],
    ['Client', project.client],
    ['Address', project.address],
    ['Notes', project.notes],
    ['Export Date', new Date().toLocaleDateString()],
    ['Total Shades', shades.length],
  ];
  const wsProject = XLSX.utils.aoa_to_sheet(projectData);
  wsProject['!cols'] = [{ wch: 20 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsProject, 'Project Info');

  // Shade details sheet
  const headers = [
    '#', 'Name', 'Qty', 'Width (in)', 'Height (in)', 'Sq Ft',
    'Mounting', 'Fabric', 'Technology', 'Operator', 'Operator Side',
    'Top Treatment', 'Bracket', 'Hembar', 'Hembar Color',
    'Fabric Face', 'Fabric Drop', 'Railroading', 'Custom Seams',
    'Battens', 'Reduce Sag', 'Side Channel', 'Sill Angle',
    'Light Gaps', 'Width Type', 'Tube', 'Angle',
    'Tube & Fabric Replacement'
  ];

  const rows = shades.map((s, i) => [
    i + 1,
    s.name,
    s.qty,
    s.width || '',
    s.height || '',
    calculateSqFt(s.width, s.height).toFixed(1),
    s.mounting,
    s.fabric || 'TBD',
    s.technology,
    s.operator,
    s.operatorSide,
    s.topTreatment,
    s.bracket,
    s.hembar,
    s.hembarColor === 'Custom' ? s.customHembarColor : s.hembarColor,
    s.fabricFace,
    s.fabricDrop,
    s.railroading,
    s.customSeams,
    s.battens,
    s.reduceSag,
    s.sideChannel,
    s.sillAngle,
    s.lightGaps,
    s.widthType,
    s.tube,
    s.angle || '',
    s.tubeFabricReplacement,
  ]);

  const wsShades = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  wsShades['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 2, 14) }));
  XLSX.utils.book_append_sheet(wb, wsShades, 'Shade Details');

  // Generate and download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_Shades_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, filename);
}
