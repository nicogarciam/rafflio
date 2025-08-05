import * as React from 'react';
import { Trash2 } from 'lucide-react';

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Trash2 className={className || 'w-5 h-5'} />
);
