import { createEffect, createSignal, onCleanup } from 'solid-js';
import type { Accessor } from 'solid-js';
import { v7 as uuidv7 } from 'uuid';

import type {
  FontApplyResult,
  FontclusterBridgeData,
  FontclusterFontMetadata,
} from './types';

const BRIDGE_DATA_URL = 'http://localhost:38653/data';
const BRIDGE_HEARTBEAT_URL = 'http://localhost:38653/heartbeat';
const HEARTBEAT_INTERVAL_MS = 1000;

export interface FontclusterBridge {
  isConnected: Accessor<boolean>;
  isReceived: Accessor<boolean>;
  isApplying: Accessor<boolean>;
  isApplied: Accessor<boolean>;
  hasError: Accessor<boolean>;
  font: Accessor<FontclusterFontMetadata | null>;
}

export function useFontclusterBridge(): FontclusterBridge {
  const [isConnected, setIsConnected] = createSignal(false);
  const [isReceived, setIsReceived] = createSignal(false);
  const [isApplying, setIsApplying] = createSignal(false);
  const [isApplied, setIsApplied] = createSignal(false);
  const [hasError, setHasError] = createSignal(false);
  const [font, setFont] = createSignal<FontclusterFontMetadata | null>(null);
  const [modifiedDate, setModifiedDate] = createSignal<string | null>(null);
  const [documentName, setDocumentName] = createSignal<string | null>(null);
  const pluginId = uuidv7();

  createEffect(() => {
    let disposed = false;

    async function pollBridge() {
      try {
        const response = await fetch(BRIDGE_DATA_URL, { cache: 'no-store' });

        if (!response.ok) {
          setIsConnected(false);
          setIsApplying(false);
          setHasError(true);
          return;
        }

        const bridgeState = (await response.json()) as FontclusterBridgeData;
        setIsConnected(true);

        if (
          !bridgeState.font ||
          !bridgeState.modified_date ||
          bridgeState.modified_date === modifiedDate()
        ) {
          return;
        }

        setModifiedDate(bridgeState.modified_date);
        setFont(bridgeState.font);
        setIsReceived(true);
        setIsApplying(true);
        setIsApplied(false);
        setHasError(false);

        parent.postMessage(
          {
            pluginMessage: {
              type: 'apply-font',
              font: bridgeState.font,
              list_preview_text: bridgeState.list_preview_text ?? null,
              modified_date: bridgeState.modified_date,
            },
          },
          '*',
        );
      } catch {
        setIsConnected(false);
        setIsApplying(false);
        setHasError(true);
      }
    }

    async function sendHeartbeat() {
      try {
        await fetch(BRIDGE_HEARTBEAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plugin_id: pluginId,
            plugin_name: 'Fontcluster Apply',
            host: 'figma',
            document_name: documentName(),
          }),
        });
      } catch {
        return;
      }
    }

    function handleMessage(event: MessageEvent) {
      const message = event.data?.pluginMessage as
        | FontApplyResult
        | { type: 'plugin-metadata'; document_name?: string }
        | undefined;

      if (message?.type === 'plugin-metadata') {
        setDocumentName(message.document_name || null);
        return;
      }

      if (
        !message ||
        message.type !== 'apply-result' ||
        message.modified_date !== modifiedDate()
      ) {
        return;
      }

      setIsApplying(false);
      setIsApplied(message.ok);
      setHasError(!message.ok);
    }

    window.addEventListener('message', handleMessage);
    parent.postMessage(
      { pluginMessage: { type: 'get-plugin-metadata' } },
      '*',
    );
    pollBridge();
    void sendHeartbeat();

    const intervalId = window.setInterval(() => {
      if (!disposed) {
        pollBridge();
      }
    }, 500);
    const heartbeatIntervalId = window.setInterval(() => {
      if (!disposed) {
        void sendHeartbeat();
      }
    }, HEARTBEAT_INTERVAL_MS);

    onCleanup(() => {
      disposed = true;
      window.clearInterval(intervalId);
      window.clearInterval(heartbeatIntervalId);
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
