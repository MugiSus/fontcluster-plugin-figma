import { Show } from 'solid-js';
import type { Component } from 'solid-js';

import { useFontclusterBridge } from './use-fontcluster-bridge';

const App: Component = () => {
  const { font, hasError, isApplied, isApplying, isConnected, isReceived } =
    useFontclusterBridge();

  return (
    <main class="text-xs size-full text-gray-500 p-4" role="status" aria-live="polite">
      <Show
        when={isConnected()}
        fallback={
          <div class='size-full flex flex-col items-center justify-center'>
            <p>No FontCluster App detected.</p>
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
                Applying {font().font_name}...
              </Show>
              <Show when={isApplied()}>
                Applied {font().font_name}
              </Show>
              <Show when={hasError()}>
                Font not available: {font().family_name}
              </Show>
            </>
          )}
        </Show>
      </Show>
    </main>
  );
};

export default App;
