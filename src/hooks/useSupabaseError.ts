import { useState, useCallback } from 'react';

export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
}

export const useSupabaseError = () => {
  const [error, setError] = useState<SupabaseError | null>(null);

  const handleError = useCallback((err: unknown): SupabaseError => {
    let errorMessage = 'Ha ocurrido un error inesperado';
    let errorCode: string | undefined;
    let errorDetails: string | undefined;

    if (err && typeof err === 'object' && 'message' in err) {
      errorMessage = String(err.message);
    } else if (err && typeof err === 'object' && 'error_description' in err) {
      errorMessage = String(err.error_description);
    } else if (typeof err === 'string') {
      errorMessage = err;
    }

    if (err && typeof err === 'object' && 'code' in err) {
      errorCode = String(err.code);
    }

    if (err && typeof err === 'object' && 'details' in err) {
      errorDetails = String(err.details);
    }

    const supabaseError: SupabaseError = {
      message: errorMessage,
      code: errorCode,
      details: errorDetails
    };

    setError(supabaseError);
    console.error('Supabase Error:', supabaseError);

    return supabaseError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
}; 