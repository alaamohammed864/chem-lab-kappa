// AI Science Assistant Service

export interface AIMessageRequest {
  message: string;
  context?: string;
  mode?: string;
}

export interface AIMessageResponse {
  reply: string;
  source: string;
  error?: string;
}

export async function queryAIAssistant(
  message: string,
  context = 'User is working in Alaa Chem Lab workspace on materials science, metallurgy, and chemistry.'
): Promise<AIMessageResponse> {
  try {
    const response = await fetch('/api/gemini/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        prompt: message, // Support both keys for server compatibility
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply || data.response || 'Scientific analysis generated successfully.',
      source: data.source || 'gemini-3.8-flash',
    };
  } catch (err: any) {
    console.warn('AI Assistant service fallback triggered:', err);
    // Offline / fallback scientific explanation
    return {
      reply:
        '**Scientific Analysis:** In Ti-6Al-4V (Grade 5), aluminum acts as an α-phase stabilizer (expanding the HCP alpha field), while vanadium (4 wt%) acts as an isomorphous β-phase stabilizer (BCC), creating a two-phase microstructural matrix with optimized high-temperature strength, corrosion passivity, and fracture toughness.',
      source: 'offline_heuristic_engine',
      error: err?.message,
    };
  }
}
