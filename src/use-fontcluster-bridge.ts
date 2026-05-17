import { createEffect, createSignal, onCleanup } from 'solid-js';
import type { Accessor } from 'solid-js';

import type {
  FontApplyRequest,
  FontApplyResult,
  FontclusterFontPayload,
  FontclusterBridgeState,
} from './types';

const BRIDGE_URL = 'http://localhost:38653/latest';

export interface FontclusterBridge {
  isConnected: Accessor<boolean>;
  isReceived: Accessor<boolean>;
  isApplying: Accessor<boolean>;
  isApplied: Accessor<boolean>;
  hasError: Accessor<boolean>;
  font: Accessor<FontclusterFontPayload | null>;
}

function postPluginMessage(message: FontApplyRequest) {
  parent.postMessage({ pluginMessage: message }, '*');
}

export function useFontclusterBridge(): FontclusterBridge {
  const [isConnected, setIsConnected] = createSignal(false);
  const [isReceived, setIsReceived] = createSignal(false);
  const [isApplying, setIsApplying] = createSignal(false);
  const [isApplied, setIsApplied] = createSignal(false);
  const [hasError, setHasError] = createSignal(false);
  const [font, setFont] = createSignal<FontclusterFontPayload | null>(null);
  const [lastSequence, setLastSequence] = createSignal(0);

  createEffect(() => {
    let disposed = false;

    async function pollBridge() {
      try {
        const response = await fetch(BRIDGE_URL, { cache: 'no-store' });

        if (!response.ok) {
          setIsConnected(false);
          setHasError(true);
          setIsApplying(false);
          return;
        }

        const bridgeState = (await response.json()) as FontclusterBridgeState;
        setIsConnected(true);

        if (!bridgeState.font || bridgeState.sequence <= lastSequence()) {
          return;
        }

        setLastSequence(bridgeState.sequence);
        setIsReceived(true);
        setIsApplying(true);
        setIsApplied(false);
        setHasError(false);
        setFont(bridgeState.font);
        postPluginMessage({
          type: 'apply-font',
          payload: bridgeState.font,
          sequence: bridgeState.sequence,
        });
      } catch {
        setIsConnected(false);
        setHasError(true);
        setIsApplying(false);
      }
    }

    function handleMessage(event: MessageEvent) {
      const message = event.data?.pluginMessage as FontApplyResult | undefined;

      if (!message || message.type !== 'apply-result') {
        return;
      }

      if (message.sequence !== lastSequence()) {
        return;
      }

      setIsApplying(false);
      setIsApplied(message.ok);
      setHasError(!message.ok);
    }

    window.addEventListener('message', handleMessage);
    pollBridge();

    const intervalId = window.setInterval(() => {
      if (!disposed) {
        pollBridge();
      }
    }, 500);

    onCleanup(() => {
      disposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener('message', handleMessage);
    });
  });

  return {
    isConnected,
    isReceived,
    isApplying,
    isApplied,
    hasError,
    font,
  };
}
