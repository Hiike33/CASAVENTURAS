import { defineCloudflareConfig } from '@opennextjs/cloudflare'

export default defineCloudflareConfig({
  // No KV cache — keep default in-memory per isolate.
  // Static assets are served by Cloudflare's native asset worker.
})
