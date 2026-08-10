export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function assertFound<T>(value: T | null, message: string): T {
  if (!value) throw new AppError(404, message);
  return value;
}
