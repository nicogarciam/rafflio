import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { SupabaseError } from '../../hooks/useSupabaseError';

interface ErrorDisplayProps {
  error: SupabaseError | string | null;
  onClose?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onClose, 
  className = '' 
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorCode = typeof error === 'string' ? undefined : error.code;
  const errorDetails = typeof error === 'string' ? undefined : error.details;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Error
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorMessage}</p>
            {errorCode && (
              <p className="mt-1 text-xs text-red-600">
                Código: {errorCode}
              </p>
            )}
            {errorDetails && (
              <p className="mt-1 text-xs text-red-600">
                Detalles: {errorDetails}
              </p>
            )}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 