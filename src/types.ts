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

export interface ApplyFontMessage {
  type: 'apply-font';
  payload: FontclusterFontPayload;
  sequence: number;
}

export interface ApplyResultMessage {
  type: 'apply-result';
  sequence: number;
  ok: boolean;
  message: string;
}

export type PluginMessage = ApplyFontMessage | ApplyResultMessage;
