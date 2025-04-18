// Import the MessageChannel polyfill first
import "./polyfills.js";

// Re-export the handler from the Astro Worker entry point
export { default, routeMap } from "../dist/_worker.js";
