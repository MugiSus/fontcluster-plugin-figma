# Fontcluster Apply Figma Plugin

This plugin applies the latest Fontcluster FontItem selection to the selected
Figma text nodes. If no text node is selected, it creates a text node and
applies the font there.

## Development

1. Start Fontcluster.
2. Run `pnpm build`.
3. In Figma Desktop, import `manifest.json`:
   `Plugins > Development > Import plugin from manifest...`
4. Run `Fontcluster Apply`.
5. Click a FontItem in Fontcluster.

The plugin polls the local Fontcluster bridge at `http://localhost:38653/data`
while it is open.

`src/App.tsx` contains the Solid UI bridge polling implementation.
`src/plugin/code.ts` contains the Figma main-thread implementation.
`src/types.ts` contains the message and payload schema.
