import { Show } from 'solid-js';
import type { Component } from 'solid-js';

import { useFontclusterBridge } from './use-fontcluster-bridge';

const App: Component = () => {
  const { font, hasError, isApplied, isApplying, isConnected, isReceived } =
    useFontclusterBridge();

  return (
    <main class="p-4 text-xs text-neutral-900">
      <div class="mb-1.5 font-semibold">FontCluster</div>
      <div class="text-gray-500" role="status" aria-live="polite">
        <Show
          when={isConnected()}
          fallback="Start Fontcluster, then click an item on the List."
        >
          <Show when={isReceived()} fallback="Waiting for Fontcluster...">
            <Show when={font()}>
              {(font) => (
                <>
                  <Show when={isApplying()}>
                    Applying {font().fontName}...
                  </Show>
                  <Show when={isApplied()}>
                    Applied {font().fontName}
                  </Show>
                  <Show when={hasError()}>
                    Font not available: {font().familyName}
                  </Show>
                </>
              )}
            </Show>
          </Show>
        </Show>
      </div>
    </main>
  );
};

export default App;
