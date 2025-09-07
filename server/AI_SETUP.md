# 🤖 Configuración de IA para Rafflio

Este documento explica cómo configurar la integración con IA para generar descripciones automáticas de bonos de contribución.

## 🆓 API Gratuita - Hugging Face

Hemos configurado la integración con **Hugging Face**, que ofrece modelos de IA gratuitos con límites generosos.

### 📋 Pasos para Configurar

1. **Crear cuenta en Hugging Face**
   - Ve a [https://huggingface.co/](https://huggingface.co/)
   - Crea una cuenta gratuita
   - Verifica tu email

2. **Generar API Token**
   - Ve a [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Haz clic en "New token"
   - Selecciona "Read" como scope
   - Copia el token generado

3. **Configurar en tu proyecto**
   - Agrega la variable de entorno en tu archivo `.env`:
   ```bash
   HUGGINGFACE_API_KEY=tu_token_aqui
   ```

### 🔧 Modelo Utilizado

- **Modelo**: `microsoft/DialoGPT-medium`
- **Tipo**: Generación de texto conversacional
- **Idioma**: Español (con fallback a inglés)
- **Límite**: 1000 requests/mes (gratuito)

### 🚀 Funcionalidades

- ✅ Generación automática de descripciones persuasivas
- ✅ Análisis contextual de premios y precios
- ✅ Fallback a respuestas simuladas si no hay API key
- ✅ Manejo de errores robusto
- ✅ Respuestas en español optimizadas para marketing

### 🔄 Alternativas de IA

Si quieres usar otras APIs de IA, puedes modificar `server/ai.service.ts`:

#### OpenAI GPT
```typescript
// Cambiar en ai.service.ts
private baseUrl = 'https://api.openai.com/v1';
private model = 'gpt-3.5-turbo';
```

#### Google Gemini
```typescript
// Cambiar en ai.service.ts
private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
private model = 'gemini-pro';
```

#### Claude (Anthropic)
```typescript
// Cambiar en ai.service.ts
private baseUrl = 'https://api.anthropic.com/v1';
private model = 'claude-3-sonnet-20240229';
```

### 🧪 Probar la Integración

1. **Con API Key configurada**:
   - Las descripciones se generarán usando IA real
   - Respuestas más variadas y contextuales

2. **Sin API Key**:
   - Se usan respuestas simuladas predefinidas
   - Funcionalidad completa sin dependencias externas

### 📊 Monitoreo

El servicio incluye logging detallado:
- ✅ Requests exitosos
- ⚠️ Errores de API
- 🔄 Fallbacks a respuestas simuladas
- 📈 Métricas de uso

### 🛠️ Desarrollo

Para desarrollo local:
```bash
# Instalar dependencias del servidor
cd server
npm install

# Configurar variables de entorno
cp ../env.example .env
# Editar .env con tu HUGGINGFACE_API_KEY

# Ejecutar servidor
npm run dev
```

### 🔒 Seguridad

- ✅ API keys se almacenan en variables de entorno
- ✅ No se exponen en el código fuente
- ✅ Validación de entrada en todos los endpoints
- ✅ Rate limiting implícito por Hugging Face

### 📝 Ejemplo de Uso

```typescript
// En el frontend
const result = await aiService.generateRaffleDescription({
  title: "Gran Sorteo Navideño",
  prizes: [{ name: "iPhone 15", description: "Último modelo" }],
  priceTiers: [{ amount: 1000, ticketCount: 5 }]
});

console.log(result.description);
// "¡Tu oportunidad de oro está aquí! 🎯 Participa en este sorteo único..."
```

### 🆘 Solución de Problemas

**Error: "HUGGINGFACE_API_KEY no configurada"**
- ✅ Verifica que la variable esté en tu archivo `.env`
- ✅ Reinicia el servidor después de agregar la variable

**Error: "Rate limit exceeded"**
- ✅ Hugging Face tiene límites gratuitos
- ✅ El sistema automáticamente usa respuestas simuladas

**Error: "Model not found"**
- ✅ Verifica que el modelo esté disponible
- ✅ Puedes cambiar el modelo en `ai.service.ts`

### 🎯 Próximas Mejoras

- [ ] Integración con OpenAI GPT-4
- [ ] Cache de respuestas para optimizar costos
- [ ] Múltiples modelos de IA como fallback
- [ ] Análisis de sentimiento de las descripciones
- [ ] A/B testing de diferentes estilos de descripción
