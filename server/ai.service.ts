import { callGroq } from "./aiModels";

require('dotenv').config();

interface AIGenerationRequest {
  prompt: string;
  maxLength?: number;
  temperature?: number;
}

interface AIGenerationResponse {
  success: boolean;
  text?: string;
  error?: string;
}


class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Usar Hugging Face API (gratuita con límites)
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
    this.baseUrl = 'https://api-inference.huggingface.co/models';

    // Modelo de texto generativo en español
    this.model = 'microsoft/DialoGPT-medium';
  }

  private model: string;

  async generateText(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {

      const result = await callGroq(request.prompt);

      if (!result) {
        return {
          success: false,
          error: 'No se pudo generar texto'
        };
      }

      return {
        success: true,
        text: result
      };
    } catch (error: any) {
      console.error('Error en AI service:', error);

      // En caso de error, usar respuesta simulada
      return this.generateMockResponse(request.prompt);
    }
  }


  private generateMockResponse(prompt: string): AIGenerationResponse {
    // Respuesta simulada cuando no hay API key o hay errores
    const mockDescriptions = [
      "¡Tu oportunidad de oro está aquí! 🎯 Participa en este sorteo único donde cada número puede ser tu billete hacia una vida completamente nueva. Con premios que superan todas las expectativas, este sorteo promete emociones y recompensas que recordarás para siempre. Elige tu nivel de participación y maximiza tus posibilidades de ganar. ¡Más números = más oportunidades de victoria! ¡Los números se agotan rápidamente! No esperes más y asegura tu participación ahora mismo.",

      "¡No dejes pasar esta oportunidad única! ⭐ Cada número que compres te acerca más a premios que cambiarán tu vida para siempre. Únete a miles de personas que ya están compitiendo por estos premios increíbles. Con múltiples opciones de participación, puedes elegir cuántos números quieres para maximizar tus posibilidades de ganar. ¡Tiempo limitado! Cada minuto que pasa es una oportunidad perdida de cambiar tu vida.",

      "¡El momento que estabas esperando llegó! 🚀 Participa en este emocionante sorteo y descubre por qué miles de personas ya eligieron sus números. Con premios espectaculares que te dejarán sin aliento, este sorteo promete emociones únicas. ¡Más números = más oportunidades de victoria! ¡Acción inmediata requerida! Los números más populares ya están siendo seleccionados.",

      "¡Tu suerte puede cambiar hoy mismo! 💎 Cada número que compres te acerca más a la victoria en este sorteo único. Con premios que superan todas las expectativas, este sorteo promete emociones y recompensas que recordarás para siempre. Elige tu nivel de participación y maximiza tus posibilidades de ganar. ¡No te quedes fuera! Únete ahora y forma parte de esta experiencia única."
    ];

    const randomDescription = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];

    return {
      success: true,
      text: randomDescription
    };
  }

  // Método específico para generar descripciones de rifas
  async generateRaffleDescription(data: {
    title: string;
    currentDescription?: string;
    prizes?: Array<{ name: string; description: string }>;
    priceTiers?: Array<{ amount: number; ticketCount: number }>;
  }): Promise<AIGenerationResponse> {
    const prompt = this.buildRafflePrompt(data);
    return this.generateText({ prompt, maxLength: 250, temperature: 0.8 });
  }

  private buildRafflePrompt(data: {
    title: string;
    currentDescription?: string;
    prizes?: Array<{ name: string; description: string }>;
    priceTiers?: Array<{ amount: number; ticketCount: number }>;
  }): string {
    const { title, currentDescription, prizes, priceTiers } = data;

    let prompt = `Genera una descripción atractiva y persuasiva para un bono de contribución/rifa en español sin incluir los premios ni los precios. 

TÍTULO: "${title}"

${currentDescription ? `DESCRIPCIÓN ACTUAL: "${currentDescription}"` : ''}

${prizes && prizes.length > 0 ? `
PREMIOS DISPONIBLES:
${prizes.map((prize, index) => `${index + 1}. ${prize.name}: ${prize.description}`).join('\n')}
` : ''}

${priceTiers && priceTiers.length > 0 ? `
OPCIONES DE PARTICIPACIÓN:
${priceTiers.map((tier, index) => `${index + 1}. ${tier.ticketCount} números por $${tier.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`).join('\n')}
` : ''}

INSTRUCCIONES:
- Genera una descripción corta (máximo 200 palabras)
- Usa un tono emocionante y persuasivo
- Destaca los beneficios de participar
- Crea urgencia y deseo de comprar números
- Usa palabras que generen emoción y expectativa
- Incluye elementos que hagan que la gente quiera participar inmediatamente
- Mantén un lenguaje claro y fácil de leer
- Enfócate en la experiencia y los premios
- Usa emojis para mayor impacto

La descripción debe ser irresistible y hacer que la gente quiera comprar muchos números.`;

    return prompt;
  }
}

export const aiService = new AIService();
