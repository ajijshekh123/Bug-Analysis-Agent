/**
 * Bug Generator Service
 * Generates structured bug specifications from a high-level "Bug Objective"
 * Powered by Ollama Local AI with dynamic semantic inference
 */

import { aiGenerateBugFromObjective, DEFAULT_AI_CONFIG } from './aiService.js';

export async function generateBugFromObjective(objective, logs = "", aiConfig = DEFAULT_AI_CONFIG) {
  return await aiGenerateBugFromObjective(objective, logs, aiConfig);
}
