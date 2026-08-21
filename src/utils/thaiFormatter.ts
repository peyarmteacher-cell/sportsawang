export function toThaiNumerals(numStr: string | number): string {
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return String(numStr).replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit, 10)]);
}

export function formatThaiDate(dateStr: string, useThaiNumerals = false): string {
  if (!dateStr) return '';
  const months = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม'
  ];

  try {
    const match = String(dateStr).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const year = parseInt(match[1], 10) + 543;
      const monthIndex = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const month = months[monthIndex] || '';
      const formatted = `${day} ${month} ${year}`;
      return useThaiNumerals ? toThaiNumerals(formatted) : formatted;
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543;

    const formatted = `${day} ${month} ${year}`;
    return useThaiNumerals ? toThaiNumerals(formatted) : formatted;
  } catch {
    return dateStr;
  }
}

export function formatThaiDateRange(startDateStr?: string, endDateStr?: string, useThaiNumerals = false): string {
  if (!startDateStr && !endDateStr) return '';
  if (startDateStr && !endDateStr) return formatThaiDate(startDateStr, useThaiNumerals);
  if (!startDateStr && endDateStr) return formatThaiDate(endDateStr, useThaiNumerals);

  const start = formatThaiDate(startDateStr!, useThaiNumerals);
  const end = formatThaiDate(endDateStr!, useThaiNumerals);
  return `${start} ถึง ${end}`;
}
