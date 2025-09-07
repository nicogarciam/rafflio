export async function callGroq(prompt: string) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { "role": "system", "content": prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            stream: false
        })
    });
    const responseJson = await response.json();

    if (!response.ok) {
        return null;
    }
    let result = responseJson.choices[0].message.content;
    return result;
}


export async function callHuggingFace(prompt: string) {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
    });
    return response.json();
}