import type { FontclusterFontPayload } from './types';

export interface CandidateFontName {
  family: string;
  style: string;
}

export function createFamilyCandidates(
  payload: FontclusterFontPayload,
): Set<string> {
  return new Set([
    payload.familyName,
    payload.fontName,
    ...Object.values(payload.preferredFamilyNames),
    ...Object.values(payload.familyNames),
  ]);
}

export function createStyleCandidates(
  payload: FontclusterFontPayload,
): Set<string> {
  return new Set([
    payload.styleName,
    ...Object.values(payload.preferredStyleNames),
    ...Object.values(payload.styleNames),
  ]);
}

export function findMatchingFontName<T extends CandidateFontName>(
  availableFontNames: T[],
  payload: FontclusterFontPayload,
): T | null {
  const familyCandidates = createFamilyCandidates(payload);
  const styleCandidates = createStyleCandidates(payload);

  return (
    availableFontNames.find(
      (fontName) =>
        familyCandidates.has(fontName.family) &&
        styleCandidates.has(fontName.style),
    ) ?? null
  );
}

export function createTextCharacters(payload: FontclusterFontPayload): string {
  return payload.previewText.trim() || payload.fontName || payload.familyName;
}
