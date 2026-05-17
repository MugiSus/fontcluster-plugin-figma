import { createTextCharacters, findMatchingFontName } from './lib';
import type { FontApplyRequest, FontclusterFontPayload } from './types';

figma.showUI(__html__, { width: 280, height: 112 });

function isTextNode(node: SceneNode): node is TextNode {
  return node.type === 'TEXT';
}

function parseApplyFontMessage(message: unknown): FontApplyRequest | null {
  const applyMessage = message as FontApplyRequest | undefined;

  if (!applyMessage || applyMessage.type !== 'apply-font') {
    return null;
  }

  return applyMessage;
}

async function applyFont(
  payload: FontclusterFontPayload,
  sequence: number,
) {
  const availableFonts = await figma.listAvailableFontsAsync();
  const selectedTextNodes = figma.currentPage.selection.filter(isTextNode);
  const fontName = findMatchingFontName(
    availableFonts.map((font) => font.fontName),
    payload,
  );

  if (!fontName) {
    figma.notify(`Font not available in Figma: ${payload.familyName}`);
    figma.ui.postMessage({
      type: 'apply-result',
      sequence,
      ok: false,
    });
    return;
  }

  let createdTextNode: TextNode | null = null;
  const targets =
    selectedTextNodes.length > 0
      ? selectedTextNodes
      : [(createdTextNode = figma.createText())];

  await figma.loadFontAsync(fontName);

  for (const node of targets) {
    if (!node.parent) {
      figma.currentPage.appendChild(node);
      node.x = figma.viewport.center.x;
      node.y = figma.viewport.center.y;
    }

    node.fontName = fontName;

    if (node === createdTextNode) {
      node.fontSize = 16;
      node.characters = createTextCharacters(payload);
    }
  }

  const resultMessage = `Applied ${fontName.family} ${fontName.style}`;

  figma.currentPage.selection = targets;
  figma.viewport.scrollAndZoomIntoView(targets);
  figma.commitUndo();
  figma.notify(resultMessage);
  figma.ui.postMessage({
    type: 'apply-result',
    sequence,
    ok: true,
  });
}

figma.ui.onmessage = (message: unknown) => {
  const applyMessage = parseApplyFontMessage(message);

  if (!applyMessage) {
    return;
  }

  applyFont(applyMessage.payload, applyMessage.sequence).catch(
    (error: unknown) => {
      console.error(error);
      figma.notify('Failed to apply Fontcluster font');
      figma.ui.postMessage({
        type: 'apply-result',
        sequence: applyMessage.sequence,
        ok: false,
      });
    },
  );
};
