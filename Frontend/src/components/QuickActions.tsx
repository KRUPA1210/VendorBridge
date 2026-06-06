import React from 'react';
import { Plus, UserPlus, ShoppingCart, Receipt, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  role: string;
  onNewRFQ: () => void;
  onAddVendor: () => void;
  onCreatePO: () => void;
  onGenerateInvoice: () => void;
}

export default function QuickActions({
  role,
  onNewRFQ,
  onAddVendor,
  onCreatePO,
  onGenerateInvoice,
}: QuickActionsProps) {
  const navigate = useNavigate();

  if (role === 'vendor') {
    return null; // NO quick action buttons for Vendor dashboard
  }

  if (role === 'manager') {
    return (
      <div id="quick-actions-container" className="flex items-center select-none">
        <button
          onClick={() => navigate('/approval')}
          className="btn-primary flex items-center gap-1.5"
        >
          <span>Review Approvals</span>
          <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  // Officer & Admin Actions
  return (
    <div id="quick-actions-container" className="flex flex-wrap gap-3 items-center select-none">
      <button
        id="btn-quick-new-rfq"
        onClick={onNewRFQ}
        className="btn-primary flex items-center gap-1.5"
      >
        <Plus size={15} />
        <span>New RFQ</span>
      </button>

      <button
        id="btn-quick-add-vendor"
        onClick={onAddVendor}
        className="btn-ghost flex items-center gap-1.5"
      >
        <UserPlus size={15} className="text-[#6366F1]" />
        <span>Add Vendor</span>
      </button>

      <button
        id="btn-quick-create-po"
        onClick={onCreatePO}
        className="btn-ghost flex items-center gap-1.5"
      >
        <ShoppingCart size={15} className="text-[#6366F1]" />
        <span>Create PO</span>
      </button>

      <button
        id="btn-quick-generate-invoice"
        onClick={onGenerateInvoice}
        className="btn-ghost flex items-center gap-1.5"
      >
        <Receipt size={15} className="text-[#6366F1]" />
        <span>Generate Invoice</span>
      </button>

      {role === 'admin' && (
        <button
          onClick={() => navigate('/admin/users')}
          className="btn-ghost flex items-center gap-1.5 border-[#CBD5E1]"
        >
          <Users size={15} className="text-[#6366F1]" />
          <span>Manage Users</span>
        </button>
      )}
    </div>
  );
}
