import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(event) {
  if (event.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const body = await event.request.json()
  const { imageBase64, prompt } = body

  if (!imageBase64) {
    return new Response(JSON.stringify({ error: 'No image provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const imagePart = { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
    const result = await model.generateContent([
      prompt || 'Analyze this image of a pantry/fridge and list all visible ingredients. Return them as a comma-separated list. Be specific about food items.',
      imagePart,
    ])
    const response = await result.response
    const text = response.text()
    return new Response(JSON.stringify({ ingredients: text, success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Gemini API error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
