import { X } from 'lucide-react';
import { StripePayment } from './StripePayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export function PaymentModal({ isOpen, onClose, organizationId }: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#111120] rounded-lg shadow-2xl border border-blue-500/30 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#111120] border-b border-blue-500/30">
          <div>
            <h2 className="text-lg text-blue-200">Complete Your Payment</h2>
            <p className="text-xs text-gray-400">Activate subscription and unlock features</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <StripePayment 
            organizationId={organizationId}
            onPaymentSuccess={() => {
              // Close modal and refresh page
              onClose();
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }}
          />
        </div>
      </div>
    </div>
  );
}