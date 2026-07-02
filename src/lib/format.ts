/**
 * Date/time helpers ported 1:1 from the hefest-frontend web app
 * (event-draft.tsx, event-confirmation.tsx, student-events.tsx, event-manager.tsx).
 */

export const ddmmyyyyToYYYYmmdd = (ddmmyyyy: string): string => {
  if (!ddmmyyyy || ddmmyyyy.length < 10) return '';
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  return `${yyyy}-${mm}-${dd}`;
};

export const yyyymmddToDdmmyyyy = (yyyymmdd: string): string => {
  if (!yyyymmdd) return '';
  const [yyyy, mm, dd] = yyyymmdd.split('-');
  return `${dd}/${mm}/${yyyy}`;
};

/** Progressively formats raw digits into a dd/mm/yyyy string as the user types. */
export const formatDateInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return numbers;

  if (numbers.length === 4) {
    const month = parseInt(numbers.slice(2, 4), 10);
    if (month > 12) {
      return `${numbers.slice(0, 2)}/`;
    }
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }

  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
};

/** Formats time digits into HH:MM as the user types. */
export const formatTimeInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 4);
  if (numbers.length <= 2) return numbers;
  return `${numbers.slice(0, 2)}:${numbers.slice(2)}`;
};

/** "YYYY-MM-DDTHH:mm[:ss]" -> "dd/mm/yyyy HH:mm" */
export const formatDateTimeDisplay = (isoString: string): string => {
  if (!isoString) return '';

  const match = isoString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return '';

  const [, year, month, day, hours, minutes] = match;
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const calculateDuration = (startISO: string, endISO?: string): string => {
  if (!endISO) return 'Не е зададено';

  try {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

    if (diffMinutes < 60) {
      return `${diffMinutes} мин.`;
    }

    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return mins > 0 ? `${hours}ч ${mins}мин.` : `${hours}ч`;
  } catch {
    return 'Невалидни дати';
  }
};

/** Localized display date, mirrors event-manager.tsx `formatDisplayDate`. */
export const formatDisplayDate = (isoString: string): string => {
  try {
    return new Date(isoString).toLocaleString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};
