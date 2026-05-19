import { applyFont } from './apply-font';
import type { FontApplyRequest } from '../types';

figma.showUI(__html__, { width: 280, height: 96 });

figma.ui.onmessage = (message: unknown) => {
  const request = message as FontApplyRequest | undefined;

  if (!request || request.type !== 'apply-font') return;

  applyFont(request.payload, request.session, request.modified_date).catch(
    (error: unknown) => {
      console.error(error);
      figma.notify(`Failed to apply ${request.payload.font_name}`, {
        error: true,
      });
      figma.ui.postMessage({
        type: 'apply-result',
        modified_date: request.modified_date,
        ok: false,
      });
    },
  );
};
