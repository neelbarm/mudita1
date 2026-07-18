#!/usr/bin/env node
// Sarga Studio CLI entry: registers tsx so the TypeScript sources run
// directly, then hands off to the real main.
import { register } from "tsx/esm/api";
register();
await import("../src/cli/main.ts");
