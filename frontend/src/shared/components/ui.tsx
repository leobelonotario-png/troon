import type { ReactNode } from 'react';
import { Button as ShadcnButton, type ButtonProps } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select } from '../ui/select';

export function Button({
  variant = 'primary',
  ...props
}: Omit<ButtonProps, 'variant'> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  const shadcnVariant =
    variant === 'primary' ? 'default' : variant === 'danger' ? 'destructive' : 'secondary';
  return <ShadcnButton variant={shadcnVariant} {...props} />;
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">{label}</span>
      {children}
      {error && (
        <small className="text-destructive" role="alert">
          {error}
        </small>
      )}
    </label>
  );
}

export { Input, Select };

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose(): void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogTitle className="mb-5 block text-xl font-bold text-foreground">{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-7 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
