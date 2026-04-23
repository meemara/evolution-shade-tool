import { calculateSqFt } from '../data/rollerShadeData';
import { exportToExcel } from '../utils/excelExport';

export default function ShadeList({ project, shades, onAdd, onEdit, onDelete, onDuplicate }) {
  const handleExport = () => {
    if (shades.length === 0) {
      alert('Add at least one shade before exporting.');
      return;
    }
    exportToExcel(project, shades);
  };

  return (
    <div className="card card-wide">
      <div className="card-header">
        <div className="card-header-row">
          <div>
            <h2>{project.name}</h2>
            {project.client && <p className="subtitle">{project.client}</p>}
            {project.address && <p className="subtitle">{project.address}</p>}
          </div>
          <div className="card-header-actions">
            <button className="btn btn-secondary" onClick={handleExport} disabled={shades.length === 0}>
              Export to Excel
            </button>
            <button className="btn btn-primary" onClick={onAdd}>
              + Add Shade
            </button>
          </div>
        </div>
      </div>

      {shades.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#6D6E71" strokeWidth="2">
              <rect x="8" y="4" width="48" height="56" rx="4" />
              <line x1="20" y1="20" x2="44" y2="20" />
              <line x1="20" y1="32" x2="44" y2="32" />
              <line x1="20" y1="44" x2="36" y2="44" />
            </svg>
          </div>
          <h3>No shades configured yet</h3>
          <p>Click "Add Shade" to start configuring roller shades for this project.</p>
          <button className="btn btn-primary" onClick={onAdd}>+ Add Your First Shade</button>
        </div>
      ) : (
        <div className="shade-table-wrap">
          <table className="shade-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Qty</th>
                <th>Size (W x H)</th>
                <th>Sq Ft</th>
                <th>Operator</th>
                <th>Fabric</th>
                <th>Mounting</th>
                <th>Top Treatment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shades.map((shade, index) => {
                const sqFt = calculateSqFt(shade.width, shade.height);
                return (
                  <tr key={shade.id}>
                    <td>{index + 1}</td>
                    <td className="shade-name">{shade.name}</td>
                    <td>{shade.qty}</td>
                    <td>{shade.width && shade.height ? `${shade.width}" x ${shade.height}"` : 'TBD'}</td>
                    <td>{sqFt > 0 ? sqFt.toFixed(1) : '-'}</td>
                    <td>{shade.operator}</td>
                    <td className="shade-fabric">{shade.fabric || 'TBD'}</td>
                    <td>{shade.mounting}</td>
                    <td>{shade.topTreatment}</td>
                    <td className="shade-actions">
                      <button className="btn btn-sm btn-icon" onClick={() => onEdit(index)} title="Edit">
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button className="btn btn-sm btn-icon" onClick={() => onDuplicate(index)} title="Duplicate">
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                          <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                          <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                        </svg>
                      </button>
                      <button className="btn btn-sm btn-icon btn-danger" onClick={() => onDelete(index)} title="Delete">
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {shades.length > 0 && (
        <div className="card-footer">
          <span className="shade-count">{shades.length} shade{shades.length !== 1 ? 's' : ''} configured</span>
          <div className="card-header-actions">
            <button className="btn btn-secondary" onClick={handleExport}>
              Export to Excel
            </button>
            <button className="btn btn-primary" onClick={onAdd}>
              + Add Another Shade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
