# Fontcluster Apply Figma Plugin

This plugin applies the latest Fontcluster FontItem selection to the selected
Figma text nodes. If no text node is selected, it creates a text node and
applies the font there.

## Development

1. Start Fontcluster.
2. Download `fontcluster-apply-figma.zip` and extract
3. In Figma Desktop, import `manifest.json`:
   `Plugins > Development > Import plugin from manifest...`
4. Run `Fontcluster Apply`.
5. Open 'List' panel and click an item in Fontcluster.

The plugin polls the local Fontcluster bridge at `http://localhost:38653/data`
while it is open.
