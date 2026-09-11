// AI Service Architecture with Pluggable Providers & Context Management

export interface AIContextAttachment {
  id: string;
  name: string;
  type: 'data' | 'image' | 'text' | 'spectrum' | 'calculation';
  sizeBytes?: number;
  content: string;
}

export interface AIContextSnapshot {
  selectedElement?: {
    symbol: string;
    name: string;
    atomicNumber: number;
    category?: string;
    electronConfig?: string;
  };
  selectedMaterial?: {
    designation: string;
    name: string;
    category: string;
    yieldStrength?: number;
    hardness?: string;
    crystalStructure?: string;
  };
  currentCalculation?: {
    tool: string;
    formula?: string;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
  };
  researchProject?: {
    id: string;
    title: string;
    category?: string;
  };
  attachments: AIContextAttachment[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  contextSummary?: string;
  citations?: string[];
}

export interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AIMessage[];
  activeContext?: AIContextSnapshot;
}

export interface AIRequest {
  message: string;
  conversationHistory: AIMessage[];
  context?: AIContextSnapshot;
  systemPrompt?: string;
}

export interface AIResponse {
  reply: string;
  providerId: string;
  citations?: string[];
  latencyMs?: number;
  tokensUsed?: number;
}

/**
 * Pluggable AI Service Provider Interface
 * Allows integrating Gemini, OpenAI, Claude, Ollama, or proprietary enterprise endpoints
 */
export interface AIServiceProvider {
  id: string;
  name: string;
  description: string;
  isConfigurable: boolean;
  generateResponse(request: AIRequest): Promise<AIResponse>;
}

// 1. Gemini Server API Provider
export class GeminiServiceProvider implements AIServiceProvider {
  id = 'provider-gemini';
  name = 'Google Gemini (Server-side API)';
  description = 'Direct integration via backend proxy utilizing Gemini Flash.';
  isConfigurable = false;

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const contextPrompt = buildContextPrompt(request.context);

    const response = await fetch('/api/gemini/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: request.message,
        prompt: request.message,
        context: contextPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini server returned ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply || data.response || 'Analysis generated.',
      providerId: this.id,
      latencyMs: Date.now() - startTime,
    };
  }
}

// 2. Custom REST Endpoint Provider (e.g. Local Ollama, vLLM, or Custom Academic Server)
export class CustomEndpointProvider implements AIServiceProvider {
  id = 'provider-custom';
  name = 'Custom AI Endpoint (Ollama / REST)';
  description = 'Configurable URL endpoint for external or local self-hosted models.';
  isConfigurable = true;
  endpointUrl = 'http://localhost:11434/api/generate';

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const contextPrompt = buildContextPrompt(request.context);

    try {
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: `${contextPrompt}\n\nUser: ${request.message}\nAssistant:`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Custom endpoint responded with status: ${response.status}`);
      }

      const data = await response.json();
      return {
        reply: data.response || data.reply || 'Custom endpoint response received.',
        providerId: this.id,
        latencyMs: Date.now() - startTime,
      };
    } catch (err: any) {
      throw new Error(`Custom endpoint error: ${err.message}. Ensure your local server is running.`);
    }
  }
}

// 3. Offline Scientific Heuristic Provider (Guaranteed Zero-Network Fallback)
export class ScientificHeuristicProvider implements AIServiceProvider {
  id = 'provider-heuristic';
  name = 'Scientific Heuristic Expert Engine';
  description = 'Offline metallurgical & chemical algorithmic knowledge base.';
  isConfigurable = false;

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const q = request.message.toLowerCase();
    const ctx = request.context;

    let reply = '';

    if (q.includes('pren') || q.includes('pitting') || q.includes('chloride')) {
      reply = `**Corrosion Engineering Assessment:**
- **Pitting Resistance Equivalent Number (PREN)** is governed by:
  $$\\text{PREN} = \\%\\text{Cr} + 3.3\\,(\\%\\text{Mo} + 0.5\\,\\%\\text{W}) + 16\\,\\%\\text{N}$$
- Standard austenitic 316L (17% Cr, 12% Ni, 2.5% Mo) provides PREN ≈ 25.
- For seawater heat exchangers, critical pitting temperature (CPT) exceeds 35°C only in super duplex alloys (e.g. 2507) with $\\text{PREN} \\ge 40$.`;
    } else if (q.includes('bragg') || q.includes('xrd') || q.includes('peak') || q.includes('diffraction')) {
      reply = `**X-Ray Diffractometry (XRD) Physics:**
- **Bragg's Law:** $\\lambda = 2\\,d_{hkl}\\,\\sin(\\theta)$
- Using standard $\\text{Cu-K}\\alpha$ radiation ($\\lambda = 1.5406\\,\\text{Å}$), the interplanar spacing is derived directly from the observed scattering peak angle $2\\theta$.
- In cubic crystals: $d_{hkl} = \\frac{a}{\\sqrt{h^2 + k^2 + l^2}}$.
- Peak broadening ($\text{FWHM}$) can be decoupled into crystallite size via the Scherrer formula ($D = \\frac{K\\lambda}{\\beta\\cos\\theta}$) and lattice micro-strain.`;
    } else if (q.includes('ti-6al-4v') || q.includes('titanium') || q.includes('alpha') || q.includes('beta')) {
      reply = `**Metallurgical Phase Analysis (Ti-6Al-4V Grade 5):**
- Aluminum (6 wt%) is an $\\alpha$-stabilizer that expands the hexagonal close-packed (HCP) field.
- Vanadium (4 wt%) is an isomorphous $\\beta$-stabilizer that retains body-centered cubic (BCC) phase at room temperature.
- The duplex $\\alpha+\\beta$ microstructure provides an exceptional strength-to-weight ratio (Tensile Yield > 830 MPa) with high fracture toughness for aerospace structural spars.`;
    } else if (ctx?.selectedMaterial) {
      reply = `**Contextual Analysis for ${ctx.selectedMaterial.designation} (${ctx.selectedMaterial.name}):**
- **Classification:** ${ctx.selectedMaterial.category}
- **Yield Strength:** ${ctx.selectedMaterial.yieldStrength || 'N/A'} MPa
- **Hardness:** ${ctx.selectedMaterial.hardness || 'N/A'}
- **Engineered Microstructure:** Subject to thermal processing and grain refinement to balance dislocation mobility against yield strength.`;
    } else if (ctx?.selectedElement) {
      reply = `**Element Profile: ${ctx.selectedElement.name} (${ctx.selectedElement.symbol}, Z = ${ctx.selectedElement.atomicNumber}):**
- **Electron Configuration:** ${ctx.selectedElement.electronConfig || 'Evaluated'}
- **Primary Industrial Uses:** High-performance structural alloy additions, catalytic surface synthesis, and electronic substrates.`;
    } else {
      reply = `**Alaa Chem Lab Scientific Copilot:**
I have evaluated your inquiry regarding **${request.message}**.
Our laboratory calculation engines are active for:
- Crystallographic indexing and Scherrer crystallite sizing
- Electrochemical Faraday wall loss and PREN pitting calculations
- Ultrasonic velocity ($v_L = \\sqrt{\\frac{E(1-\\nu)}{\\rho(1+\\nu)(1-2\\nu)}}$) and radiographic attenuation ($I = I_0 e^{-\\mu x}$)
- Chemical reaction stoichiometry, enthalpy ($\Delta H^\\circ$), and Gibbs free energy ($\Delta G^\\circ$).`;
    }

    return {
      reply,
      providerId: this.id,
      latencyMs: Date.now() - startTime,
    };
  }
}

function buildContextPrompt(context?: AIContextSnapshot): string {
  if (!context) return 'No external context attached.';

  const parts: string[] = ['Active Laboratory Context:'];

  if (context.selectedElement) {
    parts.push(
      `- Selected Chemical Element: ${context.selectedElement.name} (${context.selectedElement.symbol}, Z=${context.selectedElement.atomicNumber})`
    );
  }

  if (context.selectedMaterial) {
    parts.push(
      `- Selected Engineering Material: ${context.selectedMaterial.designation} (${context.selectedMaterial.name}, Category: ${context.selectedMaterial.category})`
    );
  }

  if (context.currentCalculation) {
    parts.push(
      `- Active Calculation [${context.currentCalculation.tool}]: ${JSON.stringify(
        context.currentCalculation.inputs
      )} -> ${JSON.stringify(context.currentCalculation.outputs)}`
    );
  }

  if (context.researchProject) {
    parts.push(
      `- Active Research Project: "${context.researchProject.title}" (${context.researchProject.category || 'General'})`
    );
  }

  if (context.attachments && context.attachments.length > 0) {
    parts.push(
      `- Attachments (${context.attachments.length}): ${context.attachments
        .map((a) => `${a.name} [${a.type}]`)
        .join(', ')}`
    );
  }

  return parts.join('\n');
}

const CONVERSATIONS_STORAGE_KEY = 'alaa_chem_lab_ai_conversations_v1';
const ACTIVE_PROVIDER_STORAGE_KEY = 'alaa_chem_lab_ai_active_provider_v1';

export class AIServiceManager {
  private static providers: Map<string, AIServiceProvider> = new Map([
    ['provider-gemini', new GeminiServiceProvider()],
    ['provider-heuristic', new ScientificHeuristicProvider()],
    ['provider-custom', new CustomEndpointProvider()],
  ]);

  static getProviders(): AIServiceProvider[] {
    return Array.from(this.providers.values());
  }

  static getActiveProviderId(): string {
    return localStorage.getItem(ACTIVE_PROVIDER_STORAGE_KEY) || 'provider-gemini';
  }

  static setActiveProviderId(id: string): void {
    if (this.providers.has(id)) {
      localStorage.setItem(ACTIVE_PROVIDER_STORAGE_KEY, id);
    }
  }

  static getActiveProvider(): AIServiceProvider {
    const id = this.getActiveProviderId();
    return this.providers.get(id) || this.providers.get('provider-gemini')!;
  }

  static registerProvider(provider: AIServiceProvider): void {
    this.providers.set(provider.id, provider);
  }

  static getConversations(): AIConversation[] {
    try {
      const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read AI conversations from storage', e);
    }

    // Default seed conversation
    const defaultConv: AIConversation = {
      id: 'conv-default',
      title: 'Metallurgy & XRD Inquiries',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-seed',
          role: 'assistant',
          content:
            'Welcome, Engineer. I am your **AI Science & Metallurgy Copilot** with pluggable providers.\n\nI can analyze active materials, calculate XRD reflections, predict pitting corrosion susceptibility, or parse experimental data.',
          timestamp: '10:40 AM',
        },
      ],
      activeContext: {
        attachments: [],
      },
    };

    return [defaultConv];
  }

  static saveConversations(convs: AIConversation[]): void {
    try {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(convs));
    } catch (e) {
      console.warn('Failed to save AI conversations to storage', e);
    }
  }

  static createConversation(title = 'New Research Chat', context?: AIContextSnapshot): AIConversation {
    const newConv: AIConversation = {
      id: `conv-${Date.now()}`,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `New session started with active laboratory context: ${
            context?.selectedMaterial?.designation ||
            context?.selectedElement?.name ||
            'General Workspace'
          }. How can I assist?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      activeContext: context || { attachments: [] },
    };

    const all = [newConv, ...this.getConversations()];
    this.saveConversations(all);
    return newConv;
  }

  static async sendMessage(
    conversationId: string,
    userText: string,
    context?: AIContextSnapshot
  ): Promise<{ conversation: AIConversation; response: AIResponse }> {
    const convs = this.getConversations();
    const convIndex = convs.findIndex((c) => c.id === conversationId);
    let conv = convIndex >= 0 ? convs[convIndex] : convs[0];

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    conv.messages.push(userMessage);
    conv.updatedAt = new Date().toISOString();
    if (context) {
      conv.activeContext = context;
    }

    const provider = this.getActiveProvider();
    let response: AIResponse;

    try {
      response = await provider.generateResponse({
        message: userText,
        conversationHistory: conv.messages,
        context: conv.activeContext,
      });
    } catch (err: any) {
      console.warn(`Primary provider ${provider.id} failed, falling back to heuristic`, err);
      const fallbackProvider = new ScientificHeuristicProvider();
      response = await fallbackProvider.generateResponse({
        message: userText,
        conversationHistory: conv.messages,
        context: conv.activeContext,
      });
    }

    const assistantMessage: AIMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: response.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    conv.messages.push(assistantMessage);
    this.saveConversations(convs);

    return { conversation: conv, response };
  }
}

// Backward-compatibility wrapper for legacy imports
export async function queryAIAssistant(
  message: string,
  contextStr = 'Alaa Chem Lab'
): Promise<{ reply: string; source: string }> {
  const provider = AIServiceManager.getActiveProvider();
  try {
    const res = await provider.generateResponse({
      message,
      conversationHistory: [],
      context: { attachments: [] },
    });
    return { reply: res.reply, source: res.providerId };
  } catch {
    const fallback = new ScientificHeuristicProvider();
    const res = await fallback.generateResponse({
      message,
      conversationHistory: [],
    });
    return { reply: res.reply, source: 'offline_heuristic' };
  }
}
