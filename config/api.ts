export const API_CONFIG = {
 API_PATH: 'https://kaitdev-api-model-ai.hf.space',
 ENDPOINTS: {
 MODELS: '/models',
 FACE2COMIC: {
 STATUS: '/api/face2comic/status',
 SETUP: '/api/face2comic/setup',
 GENERATE: '/api/face2comic/generate'
 },
 COMIC2FACE: {
 STATUS: '/api/comic2face/status',
 SETUP: '/api/comic2face/setup',
 GENERATE: '/api/comic2face/generate'
 }
 }
} as const;
