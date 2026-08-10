export function parseDateTime(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date/time: ${value}`);
  }
  return date;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function overlaps(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA < endB && endA > startB;
}

export function formatTime(date: Date): string {
  return date.toISOString().slice(11, 16);
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function combineDateAndTime(date: string, time: string): Date {
  const result = new Date(`${date}T${time}:00.000Z`);
  if (Number.isNaN(result.getTime())) {
    throw new Error(`Invalid date/time: ${date} ${time}`);
  }
  return result;
}

export function getUtcDayOfWeek(date: Date): number {
  return date.getUTCDay();
}
