"use client";

import dynamic from "next/dynamic";

const Workspace = dynamic(() => import("@/components/Workspace").then((m) => m.Workspace), {
  ssr: false,
});

export function WorkspaceLoader() {
  return <Workspace />;
}
