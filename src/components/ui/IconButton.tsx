import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type IconButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
};

export function IconButton({ icon: Icon, label, onClick, className = '' }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-full transition-colors hoverable ${className}`}
      aria-label={label}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}
