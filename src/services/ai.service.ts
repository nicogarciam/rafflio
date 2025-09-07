interface AIDescriptionRequest {
  title: string;
  currentDescription?: string;
  prizes?: Array<{ name: string; description: string }>;
  priceTiers?: Array<{ amount: number; ticketCount: number }>;
}

interface AIDescriptionResponse {
  success: boolean;
  description?: string;
  error?: string;
}

class AIService {
  async generateRaffleDescription(request: AIDescriptionRequest): Promise<AIDescriptionResponse> {
    try {
      // Enviar datos estructurados al backend
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: request.title,
          currentDescription: request.currentDescription,
          prizes: request.prizes,
          priceTiers: request.priceTiers
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar descripción con IA');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al generar descripción');
      }

      return {
        success: true,
        description: result.description
      };
    } catch (error: any) {
      console.error('Error en AI service:', error);
      return {
        success: false,
        error: error.message || 'Error al generar descripción con IA'
      };
    }
  }

}

export const aiService = new AIService();
