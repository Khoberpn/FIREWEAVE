/* FIREWEAVE INTELLIGENT ASSISTANT (FIA) - API Routes */

import { Router } from 'express';
import { fiaIntelligence, EL_NINO_CLIMATE_DATA, type FiaCitation } from '../services/fiaIntelligence.js';

const router = Router();

// In-memory conversations store for fast, reliable response
interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  citations?: FiaCitation[];
}

const conversations = new Map<string, { id: string; title: string; messages: StoredMessage[]; createdAt: string }>();

// GET /api/ai/health or /api/fia/health
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    assistant: 'FIA (Fireweave Intelligent Assistant)',
    model: 'FIREWEAVE-Wildfire-Intelligence-V2',
    provider: 'NASA FIRMS & Local Domain Engine',
    capabilities: [
      'nasa_firms_hotspot_telemetry',
      'frp_radiative_power_analysis',
      'el_nino_wind_vector_propagation',
      'peatland_smoldering_assessment',
      'tactical_evacuation_routing',
    ],
  });
});

// GET /api/ai/wind or /api/fia/wind - El Niño wind vector data
router.get('/wind', (_req, res) => {
  res.json({
    ok: true,
    data: EL_NINO_CLIMATE_DATA,
  });
});

// GET /api/ai/suggestions - Context-aware suggestions for FIA
router.get('/suggestions', (req, res) => {
  const moduleName = (req.query.module as string) || 'dashboard';

  const suggestions = [
    'How is El Niño wind direction affecting wildfire spread today?',
    'What is the current total Fire Radiative Power (FRP) across Indonesia?',
    'Which peatland sectors are in Extreme (Danger) category?',
    'Provide safe evacuation corridor coordinates for downwind areas',
    'Explain the NASA FIRMS 375m VIIRS vs 1km MODIS detection difference',
  ];

  res.json({
    module: moduleName,
    suggestions,
  });
});

// POST /api/ai/chat or /api/fia/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, messages, sessionId = 'default-session', stream = true, contextModule = 'dashboard' } = req.body;
    const prompt = message || (Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].content : '');

    if (!prompt) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    const convId = req.body.conversationId || sessionId || `fia-conv-${Date.now()}`;
    let conv = conversations.get(convId);
    if (!conv) {
      conv = {
        id: convId,
        title: prompt.slice(0, 40) + (prompt.length > 40 ? '...' : ''),
        messages: [],
        createdAt: new Date().toISOString(),
      };
      conversations.set(convId, conv);
    }

    // Save user message
    conv.messages.push({
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: prompt,
      createdAt: new Date().toISOString(),
    });

    // Generate FIA intelligence response
    const fiaResult = await fiaIntelligence.generateIntelligenceResponse(prompt, conv.messages, contextModule);

    // Save assistant message
    const assistantMsg: StoredMessage = {
      id: `msg-${Date.now()}-a`,
      role: 'assistant',
      content: fiaResult.content,
      createdAt: new Date().toISOString(),
      citations: fiaResult.citations,
    };
    conv.messages.push(assistantMsg);

    // If streaming SSE requested
    if (stream && req.headers.accept?.includes('text/event-stream')) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Meta event
      res.write(`data: ${JSON.stringify({ type: 'meta', conversationId: convId, mode: 'copilot', title: conv.title, model: 'FIA-Wildfire-V2' })}\n\n`);

      // Chunked text streaming
      const chunks = fiaResult.content.split('\n');
      for (const chunk of chunks) {
        res.write(`data: ${JSON.stringify({ type: 'delta', text: chunk + '\n' })}\n\n`);
      }

      // Citations event
      for (const citation of fiaResult.citations) {
        res.write(`data: ${JSON.stringify({ type: 'citation', citation })}\n\n`);
      }

      // Done event
      res.write(
        `data: ${JSON.stringify({
          type: 'done',
          conversationId: convId,
          usage: { promptTokens: 120, completionTokens: 450, totalTokens: 570 },
          citations: fiaResult.citations,
          dataSummary: fiaResult.dataSummary,
          windVector: fiaResult.windVector,
        })}\n\n`
      );

      res.end();
      return;
    }

    // Non-streaming JSON response
    res.json({
      conversationId: convId,
      message: assistantMsg,
      citations: fiaResult.citations,
      dataSummary: fiaResult.dataSummary,
      windVector: fiaResult.windVector,
    });
  } catch (err: any) {
    console.error('FIA Chat error:', err);
    res.status(500).json({ error: 'FIA engine error', message: String(err?.message ?? err) });
  }
});

// GET /api/ai/conversations
router.get('/conversations', (_req, res) => {
  const list = Array.from(conversations.values()).map((c) => ({
    id: c.id,
    title: c.title,
    messageCount: c.messages.length,
    createdAt: c.createdAt,
  }));
  res.json({ conversations: list });
});

export default router;
