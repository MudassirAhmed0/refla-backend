export function sanitizeUser<T extends { passwordHash?: string | null }>(user: T) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
  