import type {
  FontclusterFontMetadata,
  FontclusterSessionConfig,
} from '../types';

export async function applyFont(
  payload: FontclusterFontMetadata,
  session: FontclusterSessionConfig | null,
  modifiedDate: string,
) {
  const availableFonts = await figma.listAvailableFontsAsync();
  const selectedTextNodes = figma.currentPage.selection.filter(
    (node): node is TextNode => node.type === 'TEXT',
  );
  const familyCandidates = new Set([
    payload.family_name,
    payload.font_name,
    ...Object.values(payload.preferred_family_names),
    ...Object.values(payload.family_names),
  ]);
  const styleCandidates = new Set([
    payload.style_name,
    ...Object.values(payload.preferred_style_names),
    ...Object.values(payload.style_names),
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
    figma.notify(`Font not available in Figma: ${payload.family_name}`);
    figma.ui.postMessage({
      type: 'apply-result',
      modified_date: modifiedDate,
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
        session?.preview_text.trim() ||
        payload.font_name ||
        payload.family_name;
    }
  }

  const resultMessage = `Applied ${fontName.family} ${fontName.style}`;

  figma.currentPage.selection = targets;
  figma.viewport.scrollAndZoomIntoView(targets);
  figma.commitUndo();
  figma.notify(resultMessage);
  figma.ui.postMessage({
    type: 'apply-result',
    modified_date: modifiedDate,
    ok: true,
  });
}
