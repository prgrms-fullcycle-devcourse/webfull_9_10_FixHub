export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 자주 쓰는 에러
export const Errors = {
  VALIDATION_ERROR: new AppError(
    'VALIDATION_ERROR',
    '입력값이 올바르지 않습니다.',
    400,
  ),
  UNAUTHORIZED: new AppError('UNAUTHORIZED', '인증이 필요합니다.', 401),
  FORBIDDEN: new AppError('FORBIDDEN', '권한이 없습니다.', 403),
  NOT_FOUND: new AppError('NOT_FOUND', '리소스를 찾을 수 없습니다.', 404),
} as const;
