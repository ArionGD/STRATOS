/**
 * Stratos METIS AI Core Service
 * Supports secure fetch calls to both Google Gemini Pro and Local Ollama servers.
 * Relies on lightweight standard fetches to prevent Tauri bundling inflation.
 */

export const AiService = {
  /**
   * Generates a response using the selected provider.
   * @param {string} prompt - The compiled context prompt.
   * @param {Object} config - AI config object containing provider, key, model details.
   */
  async generateResponse(prompt, config) {
    const { provider, apiKey, ollamaModel = 'gemma2' } = config

    if (provider === 'gemini') {
      if (!apiKey) {
        throw new Error('Gemini API key is required. Please add it to the METIS settings config.')
      }
      return this.callGemini(prompt, apiKey)
    } else if (provider === 'ollama') {
      return this.callOllama(prompt, ollamaModel)
    } else {
      throw new Error('Invalid AI provider selected.')
    }
  },

  /**
   * Direct secure fetch to Gemini API
   */
  async callGemini(prompt, apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ]
          }),
        }
      )

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `Gemini request failed: Status ${response.status}`)
      }

      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw new Error('Received empty content from Gemini.')
      
      return text
    } catch (err) {
      console.error('Gemini API error:', err)
      throw err
    }
  },

  /**
   * Secure local fetch to Ollama server
   */
  async callOllama(prompt, model) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama request failed: Status ${response.status}. Verify Ollama is running locally.`)
      }

      const data = await response.json()
      return data?.response || 'Empty response from Ollama.'
    } catch (err) {
      console.error('Ollama API error:', err)
      throw new Error('Failed to connect to local Ollama server. Ensure Ollama is running and command `ollama run ' + model + '` has been executed.')
    }
  }
}
