import type { FontclusterFontPayload } from '../types';

export async function applyFont(
  payload: FontclusterFontPayload,
  sequence: number,
) {
  const availableFonts = await figma.listAvailableFontsAsync();
  const selectedTextNodes = figma.currentPage.selection.filter(
    (node): node is TextNode => node.type === 'TEXT',
  );
  const familyCandidates = new Set([
    payload.familyName,
    payload.fontName,
    ...Object.values(payload.preferredFamilyNames),
    ...Object.values(payload.familyNames),
  ]);
  const styleCandidates = new Set([
    payload.styleName,
    ...Object.values(payload.preferredStyleNames),
    ...Object.values(payload.styleNames),
  ]);
  const fontName =
    availableFonts
      .map((font) => font.fontName)
      .find(
        (fontName) =>
          familyCandidates.has(fontName.family) &&
          styleCandidates.has(fontName.style),
      ) ?? null;

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
      node.characters =
        payload.previewText.trim() || payload.fontName || payload.familyName;
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
