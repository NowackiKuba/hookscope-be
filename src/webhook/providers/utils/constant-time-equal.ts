import { timingSafeEqual } from 'crypto';

export const constantTimeEqual = (
  left: string,
  right: string,
  encoding: BufferEncoding = 'utf8',
): boolean => {
  const leftBuffer = Buffer.from(left, encoding);
  const rightBuffer = Buffer.from(right, encoding);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};
