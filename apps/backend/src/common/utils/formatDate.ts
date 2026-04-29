const KOREAN_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function padTwoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatKoreanDate(date: Date | string): string {
  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('유효한 날짜가 아닙니다.');
  }

  const year = parsedDate.getFullYear();
  const month = padTwoDigits(parsedDate.getMonth() + 1);
  const day = padTwoDigits(parsedDate.getDate());
  const weekday = KOREAN_WEEKDAYS[parsedDate.getDay()];

  return `${year}-${month}-${day}(${weekday})`;
}
