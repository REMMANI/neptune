import React from 'react';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: 'white' | 'gray' | 'blue' | 'transparent';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const backgroundClasses = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  blue: 'bg-blue-50',
  transparent: 'bg-transparent',
};

const paddingClasses = {
  none: '',
  sm: 'py-8',
  md: 'py-16',
  lg: 'py-24',
  xl: 'py-32',
};

export default function SectionWrapper({
  children,
  className = '',
  id,
  background = 'white',
  padding = 'md',
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`
        ${backgroundClasses[background]}
        ${paddingClasses[padding]}
        ${className}
      `.trim()}
    >
      {children}
    </section>
  );
}