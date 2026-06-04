import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder_api_key');

export const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
export const proModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

type GeminiModelKey = 'flash' | 'pro';
type GeminiRequest = Parameters<typeof flashModel.generateContent>[0];

type GenerateGeminiTextOptions = {
  request: GeminiRequest;
  modelOrder?: GeminiModelKey[];
  timeoutMs?: number;
  maxAttemptsPerModel?: number;
};

type GeminiErrorLike = {
  message?: string;
  status?: number;
  statusText?: string;
};

export class GeminiTemporaryUnavailableError extends Error {
  status: number;

  constructor(message: string, status = 503) {
    super(message);
    this.name = 'GeminiTemporaryUnavailableError';
    this.status = status;
  }
}

const DEFAULT_MODEL_ORDER: GeminiModelKey[] = ['flash', 'pro'];
const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_MAX_ATTEMPTS = 2;
const GEMINI_BACKOFF_DELAYS_MS = [700, 1600];

function getModelByKey(key: GeminiModelKey) {
  return key === 'pro' ? proModel : flashModel;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getGeminiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error as GeminiErrorLike;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return 'Unknown Gemini error';
}

export function getGeminiErrorStatus(error: unknown): number | null {
  if (error instanceof GeminiTemporaryUnavailableError) {
    return error.status;
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const { status } = error as GeminiErrorLike;
    if (typeof status === 'number' && Number.isFinite(status)) {
      return status;
    }
  }

  return null;
}

export function isGeminiRetriableError(error: unknown): boolean {
  const status = getGeminiErrorStatus(error);
  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }

  const message = getGeminiErrorMessage(error).toLowerCase();
  return (
    message.includes('service unavailable') ||
    message.includes('high demand') ||
    message.includes('temporarily unavailable') ||
    message.includes('timed out') ||
    message.includes('deadline exceeded') ||
    message.includes('overloaded')
  );
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new GeminiTemporaryUnavailableError(message, 504));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

export async function generateGeminiText({
  request,
  modelOrder = DEFAULT_MODEL_ORDER,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxAttemptsPerModel = DEFAULT_MAX_ATTEMPTS,
}: GenerateGeminiTextOptions): Promise<string> {
  let lastError: unknown = null;

  for (const modelKey of modelOrder) {
    const model = getModelByKey(modelKey);

    for (let attempt = 0; attempt < maxAttemptsPerModel; attempt += 1) {
      try {
        const result = await withTimeout(
          model.generateContent(request),
          timeoutMs,
          `Gemini ${modelKey} request timed out.`,
        );
        return result.response.text();
      } catch (error) {
        lastError = error;
        const retryable = isGeminiRetriableError(error);
        const hasRemainingAttempt = attempt < maxAttemptsPerModel - 1;

        if (!retryable) {
          throw error;
        }

        console.warn(
          `Gemini ${modelKey} attempt ${attempt + 1} failed: ${getGeminiErrorMessage(error)}`,
        );

        if (hasRemainingAttempt) {
          const waitMs = GEMINI_BACKOFF_DELAYS_MS[Math.min(attempt, GEMINI_BACKOFF_DELAYS_MS.length - 1)];
          await delay(waitMs);
        }
      }
    }
  }

  throw new GeminiTemporaryUnavailableError(
    getGeminiErrorMessage(lastError) || 'Gemini service is temporarily unavailable.',
    getGeminiErrorStatus(lastError) ?? 503,
  );
}

export function mapGeminiErrorToResponse(
  error: unknown,
  fallbackMessage: string,
): { status: number; code?: string; message: string } {
  if (isGeminiRetriableError(error)) {
    return {
      status: getGeminiErrorStatus(error) ?? 503,
      code: 'AI_TEMPORARILY_UNAVAILABLE',
      message: 'AI service is temporarily busy. Please try again in a minute.',
    };
  }

  return {
    status: 500,
    message: fallbackMessage,
  };
}
