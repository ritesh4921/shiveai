import React from 'react';

interface AdUnitProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  label?: string;
}

// Completely disabled ad component
export const AdUnit: React.FC<AdUnitProps> = () => {
  return null;
};