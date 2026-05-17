import { Show } from 'solid-js';
import type { Component } from 'solid-js';

import { useFontclusterBridge } from './use-fontcluster-bridge';

const App: Component = () => {
  const { font, hasError, isApplied, isApplying, isConnected, isReceived } =
    useFontclusterBridge();

  return (
    <main class="p-4 text-xs size-full text-gray-500" role="status" aria-live="polite">
      <Show
        when={isConnected()}
        fallback={
          <div class='size-full flex flex-col items-center justify-center gap-0.5'>
            <p>No FontCluster connection detected.</p>
            <a href='https://fontcluster.mugisus.me/' class='underline text-sky-600' target='_blank' rel='noopener noreferrer'>
              What's FontCluster?
            </a>
          </div>
        }
      >
        <div class="font-semibold text-neutral-900 mb-1">Fontcluster</div>
        <Show when={font()} fallback="Click an item on the List panel.">
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
    </main>
  );
};

export default App;
