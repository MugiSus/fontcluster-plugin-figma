import { createEffect, createSignal, onCleanup } from 'solid-js';
import type { Component } from 'solid-js';

import type {
  ApplyFontMessage,
  ApplyResultMessage,
  FontclusterBridgeState,
} from './types';

const BRIDGE_URL = 'http://localhost:38653/latest';

function postPluginMessage(message: ApplyFontMessage): void {
  parent.postMessage({ pluginMessage: message }, '*');
}

const App: Component = () => {
  const [status, setStatus] = createSignal('Waiting for Fontcluster...');
  const [lastSequence, setLastSequence] = createSignal(0);

  createEffect(() => {
    let disposed = false;

    async function pollBridge(): Promise<void> {
      try {
        const response = await fetch(BRIDGE_URL, { cache: 'no-store' });

        if (!response.ok) {
          setStatus('Fontcluster bridge is not responding.');
          return;
        }

        const bridgeState = (await response.json()) as FontclusterBridgeState;

        if (!bridgeState.font || bridgeState.sequence <= lastSequence()) {
          return;
        }

        setLastSequence(bridgeState.sequence);
        setStatus(`Applying ${bridgeState.font.fontName}...`);
        postPluginMessage({
          type: 'apply-font',
          payload: bridgeState.font,
          sequence: bridgeState.sequence,
        });
      } catch {
        setStatus('Start Fontcluster, then click an item on the List.');
      }
    }

    function handleMessage(event: MessageEvent): void {
      const message = event.data?.pluginMessage as ApplyResultMessage | undefined;

      if (!message || message.type !== 'apply-result') {
        return;
      }

      setStatus(message.message);
    }

    window.addEventListener('message', handleMessage);
    void pollBridge();

    const intervalId = window.setInterval(() => {
      if (!disposed) {
        void pollBridge();
      }
    }, 500);

    onCleanup(() => {
      disposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener('message', handleMessage);
    });
  });

  return (
    <main class="plugin-shell">
      <div class="title">Fontcluster</div>
      <div class="status" role="status" aria-live="polite">
        {status()}
      </div>
    </main>
  );
};

export default App;
