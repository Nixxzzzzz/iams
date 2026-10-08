import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface MainContentProps extends React.HTMLAttributes<HTMLElement> {
  maxWidth?: 'full' | 'standard';
}

export const MainContent: React.FC<MainContentProps> = ({
  maxWidth = 'standard',
  className,
  children,
  ...props
}) => {
  return (
    <main
      role="main"
      className={cn(
        'flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6',
        maxWidth === 'standard' && 'max-w-[1600px] w-full mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
};
