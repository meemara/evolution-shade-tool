import { useState, useEffect } from 'react';
import {
  createBlankShade, calculateSqFt, getRecommendedOperator,
  getAvailableHembars, getAvailableTopTreatments,
  MOUNTINGS, TECHNOLOGIES, OPERATORS, OPERATOR_SIDES,
  BRACKETS, HEMBAR_COLORS, FABRIC_FACES, FABRIC_DROPS,
  YES_NO_AUTO, YES_NO, LIGHT_GAPS, WIDTH_TYPES, TUBES,
  SIDE_CHANNELS, SILL_ANGLES, FABRIC_FAMILIES, CONSTRAINTS
} from '../data/rollerShadeData';

const STEPS = [
  { id: 'basics', title: 'Basics', desc: 'Name, size & mounting' },
  { id: 'fabric', title: 'Fabric', desc: 'Select fabric family' },
  { id: 'system', title: 'System', desc: 'Technology & operator' },
  { id: 'treatments', title: 'Treatments', desc: 'Top, hembar & brackets' },
  { id: 'options', title: 'Options', desc: 'Additional settings' },
  { id: 'review', title: 'Review', desc: 'Confirm & save' },
];

export default function ShadeWizard({ shade, shadeCount, onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(shade || createBlankShade(shadeCount + 1));
  const [fabricSearch, setFabricSearch] = useState('');
  const [warnings, setWarnings] = useState([]);

  const sqFt = calculateSqFt(form.width, form.height);
  const recommended = getRecommendedOperator(sqFt);

  // Update operator when dimensions change
  useEffect(() => {
    if (sqFt > 0 && recommended && !shade) {
      setForm(prev => ({ ...prev, operator: recommended }));
    }
  }, [sqFt, recommended]);

  // Check constraints whenever operator changes
  useEffect(() => {
    const w = [];
    const availTopTreatments = getAvailableTopTreatments(form.operator);
    if (!availTopTreatments.includes(form.topTreatment)) {
      w.push(`"${form.topTreatment}" is not available for ${form.operator}. It will be reset to "None".`);
      setForm(prev => ({ ...prev, topTreatment: 'None' }));
    }
    const availHembars = getAvailableHembars(form.operator);
    if (!availHembars.includes(form.hembar)) {
      w.push(`"${form.hembar}" is not available for ${form.operator}. It will be reset to "Pick Automatically".`);
      setForm(prev => ({ ...prev, hembar: 'Pick Automatically' }));
    }
    if (sqFt > 0) {
      const op = OPERATORS.find(o => o.value === form.operator);
      if (op && op.maxSqFt && sqFt > op.maxSqFt) {
        w.push(`Square footage (${sqFt.toFixed(1)} sq ft) exceeds ${form.operator} maximum of ${op.maxSqFt} sq ft. Consider a larger operator.`);
      }
    }
    setWarnings(w);
  }, [form.operator, form.topTreatment, form.hembar, sqFt]);

  const updateField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    updateField(name, type === 'number' ? (value === '' ? '' : Number(value)) : value);
  };

  const canProceed = () => {
    if (step === 0) return form.name.trim() !== '';
    return true;
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSave = () => {
    onComplete(form);
  };

  const filteredFabrics = FABRIC_FAMILIES.filter(f =>
    f.toLowerCase().includes(fabricSearch.toLowerCase())
  );

  const renderStepContent = () => {
    switch (step) {
      case 0: return renderBasics();
      case 1: return renderFabric();
      case 2: return renderSystem();
      case 3: return renderTreatments();
      case 4: return renderOptions();
      case 5: return renderReview();
      default: return null;
    }
  };

  const renderBasics = () => (
    <div className="wizard-step">
      <div className="form-row">
        <div className="form-group flex-2">
          <label>Shade Name *</label>
          <input name="name" value={form.name} onChange={handleInputChange} autoFocus />
        </div>
        <div className="form-group flex-1">
          <label>Quantity</label>
          <input name="qty" type="number" min="1" value={form.qty} onChange={handleInputChange} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group flex-1">
          <label>Opening Width (inches)</label>
          <input name="width" type="number" min="0" step="0.125" value={form.width} onChange={handleInputChange} placeholder="e.g. 72" />
        </div>
        <div className="form-group flex-1">
          <label>Opening Height (inches)</label>
          <input name="height" type="number" min="0" step="0.125" value={form.height} onChange={handleInputChange} placeholder="e.g. 96" />
        </div>
        <div className="form-group flex-1">
          <label>Square Footage</label>
          <div className="calculated-value">
            {sqFt > 0 ? (
              <>
                <span className="sqft-value">{sqFt.toFixed(1)}</span>
                <span className="sqft-label"> sq ft</span>
                {recommended && (
                  <span className="sqft-rec"> &rarr; {recommended}</span>
                )}
              </>
            ) : (
              <span className="sqft-placeholder">Enter dimensions</span>
            )}
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group flex-1">
          <label>Mounting</label>
          <div className="visual-select">
            {MOUNTINGS.map(m => (
              <button
                key={m}
                type="button"
                className={`visual-option ${form.mounting === m ? 'active' : ''}`}
                onClick={() => updateField('mounting', m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      {sqFt > 0 && (
        <div className="info-box">
          <strong>Auto-selected operator:</strong> {recommended} (max {OPERATORS.find(o => o.value === recommended)?.maxSqFt} sq ft)
          <br />
          <small>You can override this in the System step.</small>
        </div>
      )}
    </div>
  );

  const renderFabric = () => (
    <div className="wizard-step">
      <div className="form-group">
        <label>Search Fabrics ({FABRIC_FAMILIES.length} families available)</label>
        <input
          type="text"
          value={fabricSearch}
          onChange={(e) => setFabricSearch(e.target.value)}
          placeholder="Type to filter... e.g. 'blackout', 'screen', '5%'"
          autoFocus
        />
      </div>
      {form.fabric && (
        <div className="selected-fabric">
          <span>Selected: <strong>{form.fabric}</strong></span>
          <button className="btn btn-sm btn-text" onClick={() => updateField('fabric', '')}>Clear</button>
        </div>
      )}
      <div className="fabric-grid">
        {filteredFabrics.map(f => {
          const openness = f.match(/(\d+)%/);
          const isBlackout = f.includes('0%');
          return (
            <button
              key={f}
              type="button"
              className={`fabric-option ${form.fabric === f ? 'active' : ''} ${isBlackout ? 'blackout' : ''}`}
              onClick={() => updateField('fabric', f)}
            >
              <span className="fabric-name">{f.replace(/ - \d+%$/, '')}</span>
              {openness && <span className={`fabric-openness ${isBlackout ? 'bo' : ''}`}>{openness[1]}%</span>}
            </button>
          );
        })}
        {filteredFabrics.length === 0 && (
          <p className="no-results">No fabrics match "{fabricSearch}"</p>
        )}
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="wizard-step">
      <div className="form-row">
        <div className="form-group flex-1">
          <label>Technology</label>
          <select name="technology" value={form.technology} onChange={handleInputChange}>
            {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group flex-1">
          <label>Operator Side</label>
          <select name="operatorSide" value={form.operatorSide} onChange={handleInputChange}>
            {OPERATOR_SIDES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Operator (Roller Size)</label>
        <div className="operator-grid">
          {OPERATORS.map(op => {
            const isRecommended = op.value === recommended;
            const isTooSmall = op.maxSqFt && sqFt > op.maxSqFt;
            return (
              <button
                key={op.value}
                type="button"
                className={`operator-option ${form.operator === op.value ? 'active' : ''} ${isTooSmall ? 'too-small' : ''} ${isRecommended ? 'recommended' : ''}`}
                onClick={() => updateField('operator', op.value)}
              >
                <span className="op-name">{op.label}</span>
                {op.maxSqFt && <span className="op-sqft">{op.maxSqFt} sq ft max</span>}
                {isRecommended && <span className="op-badge">Recommended</span>}
                {isTooSmall && <span className="op-warning">Too small</span>}
              </button>
            );
          })}
        </div>
      </div>
      {warnings.length > 0 && (
        <div className="warning-box">
          {warnings.map((w, i) => <p key={i}>{w}</p>)}
        </div>
      )}
      <div className="info-box">
        <strong>Operator details for {form.operator}:</strong>
        <ul>
          <li>Cable guided hembar: {CONSTRAINTS.cableGuidedHembar[form.operator] ? 'Available' : 'Not available'}</li>
          <li>Coupled panels: {CONSTRAINTS.coupling[form.operator] ? 'Available' : 'Not available'}</li>
          <li>Top treatments: {getAvailableTopTreatments(form.operator).join(', ')}</li>
        </ul>
      </div>
    </div>
  );

  const renderTreatments = () => {
    const availTopTreatments = getAvailableTopTreatments(form.operator);
    const availHembars = getAvailableHembars(form.operator);

    return (
      <div className="wizard-step">
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Top Treatment</label>
            <select name="topTreatment" value={form.topTreatment} onChange={handleInputChange}>
              {availTopTreatments.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {CONSTRAINTS.topTreatments[form.operator]?.fasciaSize && form.topTreatment.includes('Fascia') && (
              <small className="field-note">Fascia size: {CONSTRAINTS.topTreatments[form.operator].fasciaSize}</small>
            )}
          </div>
          <div className="form-group flex-1">
            <label>Bracket</label>
            <select name="bracket" value={form.bracket} onChange={handleInputChange}>
              {BRACKETS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Hembar</label>
            <select name="hembar" value={form.hembar} onChange={handleInputChange}>
              {availHembars.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="form-group flex-1">
            <label>Hembar Color</label>
            <select name="hembarColor" value={form.hembarColor} onChange={handleInputChange}>
              {HEMBAR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {form.hembarColor === 'Custom' && (
          <div className="form-group">
            <label>Custom Hembar Color</label>
            <input name="customHembarColor" value={form.customHembarColor} onChange={handleInputChange} placeholder="Enter custom color" />
          </div>
        )}
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Side Channel</label>
            <select name="sideChannel" value={form.sideChannel} onChange={handleInputChange}>
              {SIDE_CHANNELS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group flex-1">
            <label>Sill Angle</label>
            <select name="sillAngle" value={form.sillAngle} onChange={handleInputChange}>
              {SILL_ANGLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderOptions = () => (
    <div className="wizard-step">
      <div className="form-row">
        <div className="form-group flex-1">
          <label>Fabric Face</label>
          <select name="fabricFace" value={form.fabricFace} onChange={handleInputChange}>
            {FABRIC_FACES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-group flex-1">
          <label>Fabric Drop</label>
          <div className="visual-select">
            {FABRIC_DROPS.map(d => (
              <button key={d} type="button" className={`visual-option ${form.fabricDrop === d ? 'active' : ''}`}
                onClick={() => updateField('fabricDrop', d)}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group flex-1">
          <label>Railroading</label>
          <select name="railroading" value={form.railroading} onChange={handleInputChange}>
            {YES_NO_AUTO.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="form-group flex-1">
          <label>Custom Seams</label>
          <select name="customSeams" value={form.customSeams} onChange={handleInputChange}>
            {YES_NO.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="form-group flex-1">
          <label>Battens</label>
          <select name="battens" value={form.battens} onChange={handleInputChange}>
            {YES_NO_AUTO.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group flex-1">
          <label>Reduce Sag</label>
          <select name="reduceSag" value={form.reduceSag} onChange={handleInputChange}>
            {YES_NO.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="form-group flex-1">
          <label>Light Gaps</label>
          <select name="lightGaps" value={form.lightGaps} onChange={handleInputChange}>
            {LIGHT_GAPS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="form-group flex-1">
          <label>Width Type</label>
          <select name="widthType" value={form.widthType} onChange={handleInputChange}>
            {WIDTH_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group flex-1">
          <label>Tube</label>
          <select name="tube" value={form.tube} onChange={handleInputChange}>
            {TUBES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="form-group flex-1">
          <label>Angle (degrees)</label>
          <input name="angle" type="number" value={form.angle} onChange={handleInputChange} placeholder="Optional" />
        </div>
        <div className="form-group flex-1">
          <label>Tube & Fabric Replacement</label>
          <select name="tubeFabricReplacement" value={form.tubeFabricReplacement} onChange={handleInputChange}>
            {YES_NO.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="wizard-step">
      <div className="review-grid">
        <ReviewSection title="Basics">
          <ReviewRow label="Name" value={form.name} />
          <ReviewRow label="Quantity" value={form.qty} />
          <ReviewRow label="Width" value={form.width ? `${form.width}"` : 'TBD'} />
          <ReviewRow label="Height" value={form.height ? `${form.height}"` : 'TBD'} />
          <ReviewRow label="Sq Ft" value={sqFt > 0 ? `${sqFt.toFixed(1)} sq ft` : '-'} />
          <ReviewRow label="Mounting" value={form.mounting} />
        </ReviewSection>
        <ReviewSection title="Fabric">
          <ReviewRow label="Fabric" value={form.fabric || 'TBD'} />
          <ReviewRow label="Fabric Face" value={form.fabricFace} />
          <ReviewRow label="Fabric Drop" value={form.fabricDrop} />
        </ReviewSection>
        <ReviewSection title="System">
          <ReviewRow label="Technology" value={form.technology} />
          <ReviewRow label="Operator" value={form.operator} />
          <ReviewRow label="Operator Side" value={form.operatorSide} />
        </ReviewSection>
        <ReviewSection title="Treatments">
          <ReviewRow label="Top Treatment" value={form.topTreatment} />
          <ReviewRow label="Bracket" value={form.bracket} />
          <ReviewRow label="Hembar" value={form.hembar} />
          <ReviewRow label="Hembar Color" value={form.hembarColor === 'Custom' ? form.customHembarColor : form.hembarColor} />
          <ReviewRow label="Side Channel" value={form.sideChannel} />
          <ReviewRow label="Sill Angle" value={form.sillAngle} />
        </ReviewSection>
        <ReviewSection title="Options">
          <ReviewRow label="Railroading" value={form.railroading} />
          <ReviewRow label="Custom Seams" value={form.customSeams} />
          <ReviewRow label="Battens" value={form.battens} />
          <ReviewRow label="Reduce Sag" value={form.reduceSag} />
          <ReviewRow label="Light Gaps" value={form.lightGaps} />
          <ReviewRow label="Width Type" value={form.widthType} />
          <ReviewRow label="Tube" value={form.tube} />
        </ReviewSection>
      </div>
      {warnings.length > 0 && (
        <div className="warning-box">
          <strong>Warnings:</strong>
          {warnings.map((w, i) => <p key={i}>{w}</p>)}
        </div>
      )}
    </div>
  );

  return (
    <div className="card card-wide">
      <div className="wizard-header">
        <button className="btn btn-text" onClick={onCancel}>&larr; Back to List</button>
        <h2>{shade ? 'Edit Shade' : 'Add New Shade'}</h2>
      </div>

      <div className="stepper">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            className={`step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            onClick={() => i <= step && setStep(i)}
            disabled={i > step}
          >
            <span className="step-number">{i < step ? '✓' : i + 1}</span>
            <span className="step-title">{s.title}</span>
            <span className="step-desc">{s.desc}</span>
          </button>
        ))}
      </div>

      <div className="wizard-content">
        {renderStepContent()}
      </div>

      <div className="wizard-footer">
        <button className="btn btn-secondary" onClick={step === 0 ? onCancel : prevStep}>
          {step === 0 ? 'Cancel' : '← Previous'}
        </button>
        <div className="wizard-footer-right">
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={nextStep} disabled={!canProceed()}>
              Next: {STEPS[step + 1].title} →
            </button>
          ) : (
            <button className="btn btn-primary btn-save" onClick={handleSave}>
              {shade ? 'Save Changes' : 'Add Shade'} ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, children }) {
  return (
    <div className="review-section">
      <h4>{title}</h4>
      <div className="review-rows">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <span className="review-value">{value}</span>
    </div>
  );
}
