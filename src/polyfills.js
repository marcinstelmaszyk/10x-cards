// Polyfill for MessageChannel in Cloudflare Workers
if (typeof MessageChannel === "undefined") {
  // Define MessagePort first
  globalThis.MessagePort = class MessagePort {
    // Empty methods needed to satisfy the React SSR requirements
    postMessage() {
      return null;
    }
    addEventListener() {
      return null;
    }
    removeEventListener() {
      return null;
    }
    dispatchEvent() {
      return true;
    }
  };

  // Then define MessageChannel using MessagePort
  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = new globalThis.MessagePort();
      this.port2 = new globalThis.MessagePort();
    }
  };
}

export {};
