import { HttpAgent } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

let cachedClient: StorageClient | null = null;

export function useStorageClient() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [client, setClient] = useState<StorageClient | null>(cachedClient);

  useEffect(() => {
    if (!identity || !actor) return;
    let cancelled = false;

    loadConfig()
      .then(async (config) => {
        if (cancelled) return;
        const agent = await HttpAgent.create({
          host: config.backend_host,
          identity,
        });
        const storageClient = new StorageClient(
          "screenshots",
          config.storage_gateway_url ?? "",
          config.backend_canister_id ?? "",
          config.project_id ?? "",
          agent,
        );
        cachedClient = storageClient;
        if (!cancelled) setClient(storageClient);
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [identity, actor]);

  async function uploadFile(
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string | null> {
    if (!client) return null;
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await client.putFile(bytes, onProgress);
      return hash;
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    }
  }

  function getUrl(hash: string): string {
    if (!client) return "";
    // Use getDirectURL which is async, but we need sync here — build URL manually from config
    // We'll use the cached client's method pattern
    return `${(client as any).storageGatewayClient?.getStorageGatewayUrl?.() ?? ""}/v1/blob/?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent((client as any).backendCanisterId ?? "")}&project_id=${encodeURIComponent((client as any).projectId ?? "")}`;
  }

  return { client, uploadFile, getUrl };
}
