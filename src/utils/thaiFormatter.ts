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
