import { applyFont } from './apply-font';
import type { FontApplyRequest } from '../types';

figma.showUI(__html__, { width: 280, height: 112 });

figma.ui.onmessage = (message: unknown) => {
  const request = message as FontApplyRequest | undefined;

  if (!request || request.type !== 'apply-font') return;

  applyFont(request.payload, request.sequence).catch((error: unknown) => {
    console.error(error);
    figma.notify(`Failed to apply ${request.payload.fontName}`, { error: true });
    figma.ui.postMessage({
      type: 'apply-result',
      sequence: request.sequence,
      ok: false,
    });
  });
};
