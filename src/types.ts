export interface FontclusterFontPayload {
  source: 'fontcluster';
  version: 1;
  safeName: string;
  fontName: string;
  familyName: string;
  familyNames: Record<string, string>;
  preferredFamilyNames: Record<string, string>;
  styleName: string;
  styleNames: Record<string, string>;
  preferredStyleNames: Record<string, string>;
  previewText: string;
  weight: number;
  weights: string[];
}

export interface FontclusterBridgeState {
  sequence: number;
  font?: FontclusterFontPayload | null;
}

export interface FontApplyRequest {
  type: 'apply-font';
  payload: FontclusterFontPayload;
  sequence: number;
}

export interface FontApplyResult {
  type: 'apply-result';
  sequence: number;
  ok: boolean;
}
