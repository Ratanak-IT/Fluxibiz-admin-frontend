
"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  businessName: string;
  requestedPlan: string;
  onConfirm: (action: "ACCEPT" | "REJECT", reason?: string) => void;
}

export default function ApprovalModal({
  isOpen,
  onClose,
  title,
  businessName,
  requestedPlan,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAction = async (action: "ACCEPT" | "REJECT") => {
    setIsSubmitting(true);
    await onConfirm(action, reason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">
          Review subscription request for <span className="font-semibold text-gray-900">{businessName}</span>.
        </p>

        <div className="my-4 rounded-xl bg-gray-50 p-4 border border-gray-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Requested Plan:</span>
            <span className="font-bold text-emerald-600">{requestedPlan}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Note / Rejection Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Add comments for the business owner..."
            className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-emerald-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => handleAction("REJECT")}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => handleAction("ACCEPT")}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
          >
            {isSubmitting ? "Processing..." : "Accept Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}