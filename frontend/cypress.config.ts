import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 375, // iPhone SE width
    viewportHeight: 667, // iPhone SE height
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Handle mobile-specific behavior
    experimentalWebKitSupport: true,
    // Don't fail tests on uncaught exceptions since some mobile APIs might not be available during testing
    //uncaughtExceptionHandler: false,
  },
  // Add retries for more stable mobile testing
  retries: {
    runMode: 2,
    openMode: 0,
  },
});