import { BadRequestException } from '@nestjs/common';

export function isSegmentOverlapping(
  aFromOrder: number,
  aToOrder: number,
  bFromOrder: number,
  bToOrder: number,
): boolean {
  return aFromOrder < bToOrder && bFromOrder < aToOrder;
}

export function assertSegmentOrders(fromOrder: number, toOrder: number): void {
  if (fromOrder >= toOrder) {
    throw new BadRequestException('Invalid segment: origin must be before destination');
  }
}
