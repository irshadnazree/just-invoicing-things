// Preloaded by `bun test` (see bunfig.toml): gives tests a browser-like DOM
// and unmounts React Testing Library renders between tests.
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

const { afterEach } = await import("bun:test");
const { cleanup } = await import("@testing-library/react");

afterEach(() => {
  cleanup();
});
