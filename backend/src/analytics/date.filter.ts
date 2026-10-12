export interface DateRangeFilter {
  type: 'lifetime' | 'custom' | 'preset';
  startDate?: string; // ISO or YYYY-MM-DD
  endDate?: string; // ISO or YYYY-MM-DD
  label: string;
}

export const DATE_PRESETS: Record<string, { label: string; startDate: string; endDate: string }> = {
  'last_7_days': {
    label: 'Last 7 Days',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  'last_14_days': {
    label: 'Last 14 Days',
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  'last_30_days': {
    label: 'Last 30 Days',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  'last_60_days': {
    label: 'Last 60 Days',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  'last_90_days': {
    label: 'Last 90 Days',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  'last_180_days': {
    label: 'Last 180 Days',
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  'last_365_days': {
    label: 'Last 365 Days',
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  'last_1_year': {
    label: 'Past 12 Months',
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  'year_2026': {
    label: 'Calendar Year 2026',
    startDate: '2026-01-01',
    endDate: '2026-12-31'
  },
  'year_2025': {
    label: 'Calendar Year 2025',
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  },
  'year_2024': {
    label: 'Calendar Year 2024',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  'wikimania_scholarship': {
    label: 'Wikimania Scholarship Window (Past 12 Months)',
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  }
};

/**
 * Parses and returns a standardized DateRangeFilter from raw query params.
 */
export function resolveDateRange(
  preset?: string,
  startDate?: string,
  endDate?: string
): DateRangeFilter {
  if (preset && DATE_PRESETS[preset]) {
    const p = DATE_PRESETS[preset];
    return {
      type: 'preset',
      startDate: p.startDate,
      endDate: p.endDate,
      label: p.label
    };
  }

  if (startDate || endDate) {
    return {
      type: 'custom',
      startDate: startDate ? startDate.split('T')[0] : undefined,
      endDate: endDate ? endDate.split('T')[0] : undefined,
      label: `Custom Period: ${startDate || 'Beginning'} to ${endDate || 'Present'}`
    };
  }

  return {
    type: 'lifetime',
    label: 'Lifetime Contributions'
  };
}

/**
 * Checks whether a given timestamp string falls within the startDate and endDate bounds.
 */
export function isTimestampInRange(
  rawTimestamp: string | undefined,
  startDate?: string,
  endDate?: string
): boolean {
  if (!rawTimestamp) return false;
  if (!startDate && !endDate) return true;

  // Gerrit timestamps look like: "2026-05-21 05:11:49.000000000" or ISO
  const ts = new Date(rawTimestamp.replace(' ', 'T')).getTime();
  if (isNaN(ts)) return false;

  if (startDate) {
    const startMs = new Date(startDate).getTime();
    if (ts < startMs) return false;
  }

  if (endDate) {
    // End date inclusive to end of day
    const endMs = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
    if (ts > endMs) return false;
  }

  return true;
}
