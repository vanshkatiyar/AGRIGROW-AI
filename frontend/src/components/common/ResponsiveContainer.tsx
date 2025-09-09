import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'full',
  padding = 'md'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div className={cn(
      'w-full mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = 1,
  gap = 'md'
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
  };

  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8'
  };

  return (
    <div className={cn(
      'grid',
      colClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'col' | 'row' | 'col-reverse' | 'row-reverse';
  breakpoint?: 'sm' | 'md' | 'lg';
  gap?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  className,
  direction = 'col',
  breakpoint = 'sm',
  gap = 'md',
  align = 'start',
  justify = 'start'
}) => {
  const directionClasses = {
    col: `flex-col ${breakpoint}:flex-row`,
    row: `flex-row ${breakpoint}:flex-col`,
    'col-reverse': `flex-col-reverse ${breakpoint}:flex-row-reverse`,
    'row-reverse': `flex-row-reverse ${breakpoint}:flex-col-reverse`
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  return (
    <div className={cn(
      'flex',
      directionClasses[direction],
      gapClasses[gap],
      alignClasses[align],
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  breakpoint?: 'sm' | 'md' | 'lg';
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  size = 'base',
  weight = 'normal',
  align = 'left',
  breakpoint = 'sm'
}) => {
  const sizeClasses = {
    xs: `text-xs ${breakpoint}:text-sm`,
    sm: `text-sm ${breakpoint}:text-base`,
    base: `text-base ${breakpoint}:text-lg`,
    lg: `text-lg ${breakpoint}:text-xl`,
    xl: `text-xl ${breakpoint}:text-2xl`,
    '2xl': `text-2xl ${breakpoint}:text-3xl`,
    '3xl': `text-3xl ${breakpoint}:text-4xl`
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className={cn(
      sizeClasses[size],
      weightClasses[weight],
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
};