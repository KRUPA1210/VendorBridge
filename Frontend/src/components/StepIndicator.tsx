import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div
      id="step-indicator-wrapper"
      className="flex items-center gap-1.5 sm:gap-2.5 bg-white border border-[#F1F5F9] rounded-full px-4 py-1.5 shadow-sm select-none"
    >
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;

        return (
          <React.Fragment key={step}>
            {idx > 0 && (
              <span className="text-xs text-[#94A3B8] font-semibold">→</span>
            )}
            <div className="flex items-center gap-1.5">
              {isDone ? (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#D1FAE5] text-[#065F46] text-[10px] font-bold">
                  <Check size={10} strokeWidth={3} />
                </span>
              ) : isActive ? (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#6366F1] text-white text-[11px] font-bold">
                  {stepNum}
                </span>
              ) : (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F1F5F9] text-[#94A3B8] text-[11px] font-bold border border-[#E2E8F0]">
                  {stepNum}
                </span>
              )}
              <span
                className={`text-xs font-semibold ${
                  isActive
                    ? 'text-[#6366F1]'
                    : isDone
                    ? 'text-[#065F46]'
                    : 'text-[#94A3B8]'
                }`}
              >
                {step.split(' ')[0]} {/* Grab first word or prefix */}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
