'use client';

import React, { useState } from 'react';
import { Dialog, DialogFooter } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  requireMatchString?: string;
  matchPrompt?: string;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  requireMatchString,
  matchPrompt,
  isLoading = false,
}) => {
  const [matchValue, setMatchValue] = useState('');

  const isConfirmedDisabled =
    isLoading || (requireMatchString ? matchValue.trim() !== requireMatchString : false);

  const handleConfirm = () => {
    if (!isConfirmedDisabled) {
      onConfirm();
    }
  };

  const IconComponent = variant === 'danger' ? AlertTriangle : AlertCircle;
  const iconColor =
    variant === 'danger'
      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60'
      : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full shrink-0 ${iconColor}`}>
            <IconComponent className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
            {message}
          </p>
        </div>

        {requireMatchString && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              {matchPrompt ?? (
                <>
                  Type <span className="font-mono font-bold">{requireMatchString}</span> to confirm:
                </>
              )}
            </p>
            <Input
              value={matchValue}
              onChange={(e) => setMatchValue(e.target.value)}
              placeholder={requireMatchString}
              disabled={isLoading}
              autoFocus
            />
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            size="sm"
            onClick={handleConfirm}
            disabled={isConfirmedDisabled}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};
