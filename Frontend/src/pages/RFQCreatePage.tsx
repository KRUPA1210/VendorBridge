import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ERPLayout from '../components/ERPLayout';
import StepIndicator from '../components/StepIndicator';
import { getFromStorage, saveToStorage, RFQ, RFQItem, ActivityLog } from '../data/mockData';
import { Plus, Trash2, ArrowLeft, ArrowRight, CheckCircle, FileText, UploadCloud, Info, AlertTriangle, FileUp } from 'lucide-react';

export default function RFQCreatePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ['General Info', 'Line Items', 'Review & Submit'];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IT Hardware');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [deadline, setDeadline] = useState('2026-06-30');
  const [deliveryDate, setDeliveryDate] = useState('2026-07-15');
  const [instructions, setInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Drag and Drop simulated attachments list
  const [files, setFiles] = useState<{ name: string; size: string }[]>([
    { name: 'technical_specifications_rev1.pdf', size: '2.4 MB' }
  ]);
  const [tempFileName, setTempFileName] = useState('');

  // Line items state (start with 1 blank row)
  const [items, setItems] = useState<RFQItem[]>([
    { id: '1', description: 'Enterprise SSD Drives (2TB NVMe PCIe 4.0)', qty: 50, unit: 'units', estPrice: 12500 }
  ]);

  const handleAddRow = () => {
    const nextId = String(items.length + 1);
    setItems([...items, { id: nextId, description: '', qty: 1, unit: 'units', estPrice: 0 }]);
  };

  const handleRemoveRow = (idx: number) => {
    if (items.length === 1) return;
    const copied = [...items];
    copied.splice(idx, 1);
    setItems(copied);
  };

  const handleUpdateItem = (idx: number, field: keyof RFQItem, val: string | number) => {
    const copied = [...items];
    let parsedVal: string | number = val;

    if (field === 'qty') {
      parsedVal = parseInt(val as string, 10) || 1;
    } else if (field === 'estPrice') {
      parsedVal = parseFloat(val as string) || 0;
    }

    copied[idx] = {
      ...copied[idx],
      [field]: parsedVal
    };
    setItems(copied);
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'RFQ Specification Title is required.';
    if (!instructions.trim()) newErrors.instructions = 'Standard procurement description guidelines are required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    const hasEmptyDesc = items.some(i => !i.description.trim());
    if (hasEmptyDesc) {
      newErrors.items = 'All line items must contain a valid description.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempFileName.trim()) return;
    setFiles([...files, { name: tempFileName.endsWith('.pdf') ? tempFileName : `${tempFileName}.pdf`, size: '850 KB' }]);
    setTempFileName('');
  };

  const handleRemoveFile = (idx: number) => {
    const copied = [...files];
    copied.splice(idx, 1);
    setFiles(copied);
  };

  // Dispatch fully defined RFQ specifications to ERP partners
  const handleSubmitRFQ = () => {
    const currentRfqs = getFromStorage<RFQ>('rfqs');
    const newRFQId = `RFQ-0${currentRfqs.length + 1}`;

    const newRFQ: RFQ = {
      id: newRFQId,
      title,
      category,
      priority,
      status: 'Active',
      closeDate: new Date(deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      deadline,
      expectedDelivery: new Date(deliveryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: instructions,
      items,
      assignedVendorsCount: 4
    };

    const updated = [newRFQ, ...currentRfqs];
    saveToStorage('rfqs', updated);

    // Dynamic Auditing trail save
    const logs = getFromStorage<ActivityLog>('activityLogs');
    saveToStorage('activityLogs', [{
      id: Date.now(),
      action: 'RFQ created',
      timestamp: '06 Jun 2026 · 04:30 PM',
      user: 'Denish V. (Procurement Officer)',
      details: `Dispatched standard tender specifications for RFQ ${newRFQId} ("${title}") to verified suppliers.`,
      type: 'rfq',
      color: 'blue',
      icon: 'FileSearch'
    }, ...logs]);

    alert(`RFQ tender specifications ${newRFQId} successfully broadcasted! Redirecting to Dashboard.`);
    navigate('/dashboard');
  };

  // Compute total estimate
  const totalEstimatedCost = items.reduce((sum, item) => sum + (item.qty * item.estPrice), 0);

  return (
    <ERPLayout title="RFQ Management" subtitle="Draft technical bids and broadcast procurement specifications to supplier network">
      
      {/* Top Header Row with Back navigation & Steps tracker */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] flex items-center justify-center text-[#64748B] hover:text-[#0f172a] transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-[15px] font-bold text-[#0F172A] uppercase tracking-tight">RFQ Proposal Specification Builder</h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-sans">Submit standard procurement specifications for bidding runs.</p>
          </div>
        </div>

        {/* Modular StepIndicator */}
        <StepIndicator currentStep={currentStep} steps={steps} />
      </div>

      {/* Main 2-Column Responsive Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive form layout column */}
        <div className="lg:col-span-8 bg-white border border-[#F1F5F9] rounded-xl p-6 shadow-sm space-y-6 hover:border-[#E2E8F0] transition-all">
          
          {/* STEP 1: General Info details */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="border-b border-[#F1F5F9] pb-3">
                <span className="text-xs font-bold text-[#6366F1] uppercase tracking-wider block">Step 01 of 03</span>
                <h3 className="text-base font-bold text-[#0F172A] mt-0.5">Define RFQ Specifications</h3>
              </div>

              {errors.title && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-xs rounded-r-lg font-medium flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>{errors.title}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#374151]">Specification Title</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Server Tower Cluster Procurement Q3"
                  className={`w-full bg-white border ${errors.title ? 'border-red-500' : 'border-[#E2E8F0]'} rounded-lg py-2.5 px-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1] font-sans`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151]">Operations Segment Category</label>
                  <select
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-sm text-[#0F172A] outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="IT Hardware">IT Hardware</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Professional Services">Professional Services</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151]">Tender Priority Weight</label>
                  <select
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-sm text-[#0F172A] outline-none"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="Low">Low (Strategic Only)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="High">High (Adhoc Clearance)</option>
                    <option value="Urgent">Urgent (Express Action)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151]">Bidding Close Date</label>
                  <input
                    type="date"
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1]"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151]">Target Cargo Delivery Date</label>
                  <input
                    type="date"
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1]"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#374151]">Detailed Specifications / Tender Instructions</label>
                <textarea
                  rows={4}
                  placeholder="Provide precise compliance statements, manufacturer lockups, packaging specs, delivery terms, cargo restrictions..."
                  className={`w-full bg-white border ${errors.instructions ? 'border-red-500' : 'border-[#E2E8F0]'} rounded-lg p-3 text-sm text-[#0F172A] outline-none resize-none`}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Line Items specification */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="border-b border-[#F1F5F9] pb-3">
                <span className="text-xs font-bold text-[#6366F1] uppercase tracking-wider block">Step 02 of 03</span>
                <h3 className="text-base font-bold text-[#0F172A] mt-0.5">Requisition Line Items</h3>
              </div>

              {errors.items && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-xs rounded-r-lg font-medium">
                  {errors.items}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[#64748B] uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Item Desc</th>
                      <th className="py-2.5 px-3 w-20">Qty</th>
                      <th className="py-2.5 px-3 w-24">Unit</th>
                      <th className="py-2.5 px-3 w-32">Est. Price (₹)</th>
                      <th className="py-2.5 px-3 text-right w-16">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-1">
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dell PowerEdge Server R760"
                            className="w-full bg-transparent border-b border-transparent focus:border-[#6366F1] hover:border-slate-300 py-1 px-1 transition-all outline-none font-medium text-[#0F172A]"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-1">
                          <input
                            type="number"
                            min={1}
                            className="w-full bg-transparent border-b border-transparent focus:border-[#6366F1] hover:border-slate-300 py-1 px-1 transition-all outline-none font-mono text-center font-bold text-[#0F172A]"
                            value={item.qty === 0 ? '' : item.qty}
                            onChange={(e) => handleUpdateItem(idx, 'qty', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-1">
                          <input
                            type="text"
                            className="w-full bg-transparent border-b border-transparent focus:border-[#6366F1] hover:border-slate-300 py-1 px-1 transition-all outline-none text-[#0F172A]"
                            value={item.unit || 'units'}
                            onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                            placeholder="units"
                          />
                        </td>
                        <td className="py-2 px-1">
                          <input
                            type="number"
                            min={0}
                            placeholder="Estimate price"
                            className="w-full bg-transparent border-b border-transparent focus:border-[#6366F1] hover:border-slate-300 py-1 px-1 transition-all outline-none font-mono text-[#0F172A] font-medium"
                            value={item.estPrice === 0 ? '' : item.estPrice}
                            onChange={(e) => handleUpdateItem(idx, 'estPrice', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-1 text-right">
                          <button
                            type="button"
                            disabled={items.length === 1}
                            onClick={() => handleRemoveRow(idx)}
                            className="text-red-500 hover:text-red-700 py-1 px-2 disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add row */}
              <button
                type="button"
                onClick={handleAddRow}
                className="w-full py-2.5 border border-dashed border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#6366F1] hover:bg-[#F5F3FF] hover:border-[#6366F1] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Item Line Specification</span>
              </button>
            </div>
          )}

          {/* STEP 3: Review and Broadcast */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#F1F5F9] pb-3">
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider block inline-block mb-1.5">Step 03 of 03</span>
                <h3 className="text-base font-bold text-[#0F172A]">Technical specifications Review Sheets</h3>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-5 relative overflow-hidden shadow-sm">
                {/* Print watermark mockup */}
                <div className="absolute right-3 top-3 text-[10px] font-mono text-[#94A3B8] font-bold border border-[#E2E8F0] px-2 py-0.5 rounded bg-white">PRINT SYSTEM DRAFT</div>

                <div className="border-b border-[#E2E8F0] pb-3">
                  <h4 className="text-sm font-bold text-[#0F172A] tracking-tight">{title}</h4>
                  <span className="text-[10px] font-semibold uppercase font-mono px-2 py-0.5 bg-indigo-100 text-[#4338CA] rounded mt-1.5 inline-block">Category: {category}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#64748B] font-medium block">Priority Weight</span>
                    <span className="text-sm font-bold text-[#EF4444] mt-0.5 block">{priority}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] font-medium block">Tender Cut-off (Close Date)</span>
                    <span className="text-sm font-semibold text-[#0F172A] mt-0.5 block">{new Date(deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Scope */}
                <div className="text-xs">
                  <span className="text-[#64748B] font-semibold block uppercase tracking-wider text-[10px]">Technical Scope Brief</span>
                  <p className="text-[#475569] mt-1 leading-relaxed bg-white border border-[#E2E8F0] rounded-lg p-3 whitespace-pre-line">{instructions}</p>
                </div>

                {/* Line Items ledger */}
                <div className="text-xs">
                  <span className="text-[#64748B] font-semibold block uppercase tracking-wider text-[10px] mb-2">Detailed Line Specifications</span>
                  <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3 text-center">Unit Qty</th>
                          <th className="py-2.5 px-3 text-right">Est Direct (₹)</th>
                          <th className="py-2.5 px-3 text-right">Tender Sum (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-medium text-[#0F172A]">{it.description}</td>
                            <td className="py-2 px-3 text-center font-semibold text-[#475569]">{it.qty} {it.unit}</td>
                            <td className="py-2 px-3 text-right font-mono text-[#475569]">₹{it.estPrice.toLocaleString('en-IN')}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#0F172A]">₹{(it.qty * it.estPrice).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        <tr className="bg-[#F8FAFC] font-bold text-[#0F172A]">
                          <td colSpan={3} className="py-3 px-3 text-right">Cumulative Estimate:</td>
                          <td className="py-3 px-3 text-right font-mono text-purple-700 text-sm">₹{totalEstimatedCost.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Files attached indicator */}
                {files.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[#64748B] font-semibold block uppercase tracking-wider text-[10px]">Attached Specifications Files</span>
                    <div className="flex flex-wrap gap-2">
                      {files.map((f, i) => (
                        <div key={i} className="bg-indigo-50 border border-indigo-100 text-[#4338CA] px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-sm">
                          <CheckCircle size={10} />
                          <span>{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Stepper Control Footer */}
          <div className="pt-4 border-t border-[#F1F5F9] flex justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className={`h-9 px-4 border border-[#E2E8F0] text-[#475569] rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-1 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="h-9 px-4 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white rounded-lg text-xs font-semibold hover:opacity-92 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitRFQ}
                className="h-10 px-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-xs font-bold hover:opacity-92 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
              >
                <span>Broadcast Bidding specifications</span>
                <CheckCircle size={14} />
              </button>
            )}
          </div>

        </div>

        {/* Right validation rules & file locker sidebar column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Validation Checklist / Instructions Info Card */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#E2E8F0] transition-all">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#0F172A] border-b pb-2 flex items-center gap-1.5">
              <Info size={14} className="text-[#6366F1]" />
              <span>Broadcast validation tips</span>
            </h4>
            <ul className="space-y-3 text-xs text-[#475569] font-sans">
              <li className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-1.5 shrink-0" />
                <span>Specify exact dimensions, manufacturer lockups, and tolerance rules to bypass redundant supplier queries.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-1.5 shrink-0" />
                <span>Line estimation costs are encrypted and only matching quotes are prioritized.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-1.5 shrink-0" />
                <span>Define specific logistics rules (e.g., Door Delivery at Plant-4 Warehouse, Nashik).</span>
              </li>
            </ul>
          </div>

          {/* Draggable Attachment Uploader Locker */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#E2E8F0] transition-all">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#0F172A] border-b pb-2 flex items-center gap-1.5">
              <FileUp size={14} className="text-[#6366F1]" />
              <span>Attached spec sheets</span>
            </h4>

            {/* Draggable area placeholder mock */}
            <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-5 text-center flex flex-col items-center justify-center hover:bg-indigo-50/20 hover:border-[#6366F1] transition-all select-none">
              <UploadCloud size={28} className="text-[#94A3B8] mb-2" />
              <p className="text-[11px] font-bold text-[#0F172A]">Drag & drop CAD drawings, specification PDF sheets</p>
              <span className="text-[9px] text-[#94A3B8] block mt-1">Accepts PDF, XLS, ZIP, DOCX formats up to 15MB</span>
            </div>

            {/* Form attachment input code */}
            <form onSubmit={handleAddFile} className="flex gap-1.5">
              <input
                type="text"
                placeholder="e.g. server_schematics.pdf"
                className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-1 px-2.5 text-xs text-[#0F172A] outline-none placeholder-[#94A3B8]"
                value={tempFileName}
                onChange={(e) => setTempFileName(e.target.value)}
              />
              <button type="submit" className="px-2.5 bg-[#6366F1] text-white rounded-lg text-[11px] font-semibold hover:bg-[#4F46E5] cursor-pointer">
                Attach
              </button>
            </form>

            {/* Render items and let user delete */}
            {files.length > 0 ? (
              <div className="space-y-2 pt-1 border-t border-[#F1F5F9]">
                {files.map((fl, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50 border border-[#F1F5F9] p-2 rounded-lg text-xs">
                    <div className="flex items-center gap-2 truncate pr-4">
                      <FileText size={14} className="text-indigo-500" />
                      <div className="truncate">
                        <p className="font-semibold text-[#0F172A] truncate text-[11px]">{fl.name}</p>
                        <span className="text-[9px] text-[#94A3B8] font-mono leading-none">{fl.size}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemoveFile(i)} className="text-red-500 hover:text-red-700 cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-center text-[#94A3B8] italic font-sans py-2">No custom CAD schematics or tender files have been uploaded yet.</p>
            )}

          </div>

        </div>

      </div>

    </ERPLayout>
  );
}
