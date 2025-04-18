// This file will be used as the actual entry point for Cloudflare Workers
// to inject polyfills before loading the Astro-generated worker

// Add required polyfills missing in Cloudflare Workers
if (typeof MessageChannel === "undefined") {
  class MessagePort {
    postMessage() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
      return true;
    }
  }

  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = new MessagePort();
      this.port2 = new MessagePort();
    }
  };

  globalThis.MessagePort = MessagePort;
}

// Import the actual worker code
import workerScript from "./dist/_worker.js";

// Export the worker handlers
export default workerScript.default;
export const routeMap = workerScript.routeMap;
