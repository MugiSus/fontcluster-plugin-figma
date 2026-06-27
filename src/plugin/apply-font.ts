import { notify } from './notify';
import type { FontclusterFontMetadata } from '../types';

export async function applyFont(
  font: FontclusterFontMetadata,
  listPreviewText: string | null,
  modifiedDate: string,
) {
  const availableFonts = await figma.listAvailableFontsAsync();
  const selectedTextNodes = figma.currentPage.selection.filter(
    (node): node is TextNode => node.type === 'TEXT',
  );
  const familyCandidates = new Set([
    font.family_name,
    font.font_name,
    ...Object.values(font.preferred_family_names),
    ...Object.values(font.family_names),
  ]);
  const styleCandidates = new Set([
    font.style_name,
    ...Object.values(font.preferred_style_names),
    ...Object.values(font.style_names),
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
    notify(`Font not available in Figma: ${font.family_name}`);
    figma.ui.postMessage({
      type: 'apply-result',
      modified_date: modifiedDate,
      ok: false,
    });
    return;
  }

  // A freshly created text node carries Figma's default font; that font must be
  // loaded before we can write any text property to it (including fontName).
  // Create it up front so its default font is part of the same load step.
  const createdNode = selectedTextNodes.length > 0 ? null : figma.createText();

  // Load every font we are about to touch *before* mutating any node. Loading
  // up front lets a load failure bail out cleanly (removing the stray node) and
  // avoids "unloaded font" errors when restyling existing or new nodes.
  try {
    await Promise.all([
      figma.loadFontAsync(fontName),
      ...(createdNode
        ? [figma.loadFontAsync(createdNode.fontName as FontName)]
        : []),
      ...selectedTextNodes.flatMap((node) => {
        const currentFonts =
          node.fontName === figma.mixed
            ? node.getRangeAllFontNames(0, node.characters.length)
            : [node.fontName];
        return currentFonts.map((font) => figma.loadFontAsync(font));
      }),
    ]);
  } catch (error) {
    console.error(error);
    createdNode?.remove();
    notify(`Failed to load ${fontName.family} ${fontName.style}`, {
      error: true,
    });
    figma.ui.postMessage({
      type: 'apply-result',
      modified_date: modifiedDate,
      ok: false,
    });
    return;
  }

  let targets: TextNode[];
  if (createdNode) {
    createdNode.fontName = fontName;
    createdNode.fontSize = 16;
    // The preview text comes from the bridge (the list preview field, or the
    // session's rendering text when that field is empty). We never fall back to
    // font-derived text like the family or sample name; if nothing is supplied,
    // show the product name rather than an empty node.
    createdNode.characters = listPreviewText?.trim() || 'FontCluster';
    createdNode.x = figma.viewport.center.x;
    createdNode.y = figma.viewport.center.y;
    targets = [createdNode];
  } else {
    for (const node of selectedTextNodes) {
      node.fontName = fontName;
    }
    targets = selectedTextNodes;
  }

  const resultMessage = `Applied ${fontName.family} ${fontName.style}`;

  figma.currentPage.selection = targets;
  figma.viewport.scrollAndZoomIntoView(targets);
  figma.commitUndo();
  notify(resultMessage);
  figma.ui.postMessage({
    type: 'apply-result',
    modified_date: modifiedDate,
    ok: true,
  });
}
