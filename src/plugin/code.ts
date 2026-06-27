import { applyFont } from './apply-font';
import { notify } from './notify';
import type { FontApplyRequest } from '../types';

figma.showUI(__html__, { width: 280, height: 96 });

figma.ui.onmessage = (message: unknown) => {
  if ((message as { type?: string } | undefined)?.type === 'get-plugin-metadata') {
    figma.ui.postMessage({
      type: 'plugin-metadata',
      document_name: figma.root.name,
    });
    return;
  }

  const request = message as FontApplyRequest | undefined;
  if (!request || request.type !== 'apply-font') return;

  applyFont(
    request.font,
    request.preview_text,
    request.modified_date,
  ).catch(
    (error: unknown) => {
      console.error(error);
      notify(`Failed to apply ${request.font.font_name}`, {
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
