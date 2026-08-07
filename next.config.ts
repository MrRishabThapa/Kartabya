import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this app when it is launched from the workspace.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
