const API_CALL_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 60000;

export function createRateLimiter() {
    let callCount = 0;
    let firstCallTime: number | null = null;

    return async function <T extends (...args: any[]) => Promise<any>>(func: T, ...args: Parameters<T>): Promise<ReturnType<T>> {
        const now = Date.now();

        if (firstCallTime === null || now - firstCallTime > RATE_LIMIT_WINDOW_MS) {
            firstCallTime = now;
            callCount = 1;
        } else if (callCount >= API_CALL_LIMIT) {
            throw new Error('Rate limit exceeded');
        } else {
            callCount++;
        }

        return func(...args);
    };
}
