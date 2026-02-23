import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface AnalysisPayload {
  job_id: string;
  video_url: string;
  video_id: string;
  match_id: string | null;
  analysis_type: string;
  sport: string;
  model_config: Record<string, unknown>;
  webhook_url: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: string;
  progress?: number;
  message?: string;
}

class VisionClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.VISION_SERVER_URL,
      timeout: 30_000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': env.VISION_API_KEY,
      },
    });

    this.client.interceptors.response.use(undefined, async (error) => {
      const config = error.config;
      if (!config || config._retryCount >= 3) {
        return Promise.reject(error);
      }
      config._retryCount = (config._retryCount || 0) + 1;
      const delay = Math.pow(2, config._retryCount) * 1000;
      logger.warn(`Vision client retry #${config._retryCount}`, {
        url: config.url,
        delay,
      });
      await new Promise((r) => setTimeout(r, delay));
      return this.client(config);
    });
  }

  async startAnalysis(payload: AnalysisPayload): Promise<{ accepted: boolean }> {
    const response = await this.client.post('/analyze', payload);
    return { accepted: response.status === 202 };
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await this.client.get(`/jobs/${jobId}`);
    return response.data;
  }

  async cancelJob(jobId: string): Promise<void> {
    await this.client.delete(`/jobs/${jobId}`);
  }
}

export const visionClient = new VisionClient();
