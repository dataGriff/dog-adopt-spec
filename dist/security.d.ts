/** Constant-time comparison of two strings as UTF-8 bytes. */
export declare function timingSafeEqual(a: string, b: string): boolean;
/** True when `header` is `Bearer <token>` and the token matches `expected` in constant time. */
export declare function bearerMatches(header: string | null | undefined, expected: string | undefined): boolean;
/** Stable JSON (sorted object keys) so the same body always hashes the same. */
export declare function canonicalJson(value: unknown): string;
export declare function sha256Hex(text: string): Promise<string>;
