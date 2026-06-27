export interface FontclusterFontMetadata {
  safe_name: string;
  font_name: string;
  family_name: string;
  family_names: Record<string, string>;
  preferred_family_names: Record<string, string>;
  style_name: string;
  style_names: Record<string, string>;
  preferred_style_names: Record<string, string>;
  publishers: Record<string, string>;
  designers: Record<string, string>;
  sample_text?: string | null;
  weight: number;
  weights: string[];
}

export interface FontclusterBridgeData {
  font?: FontclusterFontMetadata | null;
  modified_date?: string | null;
  list_preview_text?: string | null;
}

export interface FontApplyRequest {
  type: 'apply-font';
  payload: FontclusterFontMetadata;
  list_preview_text: string | null;
  modified_date: string;
}

export interface FontApplyResult {
  type: 'apply-result';
  modified_date: string;
  ok: boolean;
}
