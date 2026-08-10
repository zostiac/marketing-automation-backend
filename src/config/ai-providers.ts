import { OpenAI } from 'openai';
import { config } from './env';

export const openai = new OpenAI({
  apiKey: config.openai_api_key,
});