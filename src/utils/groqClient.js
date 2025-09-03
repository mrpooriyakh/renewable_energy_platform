import Groq from 'groq-sdk'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || 'your-groq-api-key-here'

const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true
})

export const sendMessageToGroq = async (messages) => {
  try {
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant specializing in renewable energy education. You help university students learn about:

1. Solar PV (Photovoltaic Systems)
2. Wind Power (Wind Turbines & Energy Generation)
3. Hydropower (Water-based Energy Systems)
4. Geothermal (Earth's Heat Energy Systems)
5. Solar Thermal (Heat Collection & Storage Systems)

Guidelines:
- Provide clear, educational explanations suitable for university-level students
- Use practical examples and real-world applications
- Include relevant technical details but keep them accessible
- Encourage deeper learning by suggesting related topics
- Be encouraging and supportive of student learning
- If asked about topics outside renewable energy, politely redirect to renewable energy topics
- Keep responses concise but comprehensive (2-4 paragraphs maximum)
- Use emojis occasionally to make responses more engaging

Current learning context: The student is using a renewable energy learning platform with modules for each technology type.`
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...messages],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1000,
    })

    return chatCompletion.choices[0]?.message?.content || 'I apologize, but I couldn\'t process your request. Please try again.'
  } catch (error) {
    console.error('Groq API Error:', error)
    
    // Fallback responses for common renewable energy questions
    const fallbackResponses = {
      'solar': '🌞 Solar energy harnesses sunlight through photovoltaic (PV) panels or solar thermal collectors. PV panels convert sunlight directly into electricity using semiconductor materials, while solar thermal systems capture heat for water heating or power generation. Solar energy is abundant, clean, and increasingly cost-effective!',
      'wind': '💨 Wind power uses turbines to convert kinetic energy from moving air into electricity. Modern wind turbines can be 80-120 meters tall with three-blade designs optimized for efficiency. Wind energy is one of the fastest-growing renewable sources globally!',
      'hydro': '💧 Hydropower generates electricity using flowing water to turn turbines. It can range from large dams to small run-of-river systems. Hydropower provides consistent, reliable energy and can also offer energy storage through pumped hydro systems.',
      'geothermal': '🌋 Geothermal energy taps into Earth\'s internal heat for electricity generation and direct heating. Heat pumps can extract ground heat for buildings, while geothermal power plants use hot water or steam from deep underground.',
      'thermal': '🔥 Solar thermal systems collect and store heat from sunlight. They\'re commonly used for water heating, space heating, and even electricity generation in concentrated solar power plants. These systems are highly efficient for heating applications.'
    }
    
    const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''
    
    for (const [keyword, response] of Object.entries(fallbackResponses)) {
      if (userMessage.includes(keyword)) {
        return response
      }
    }
    
    return '🤖 I\'m having trouble connecting right now, but I\'d love to help you learn about renewable energy! Try asking about solar panels, wind turbines, hydropower, geothermal systems, or solar thermal technology.'
  }
}