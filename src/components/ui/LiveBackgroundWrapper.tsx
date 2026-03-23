"use client";

import dynamic from "next/dynamic";

const LiveBackground = dynamic(() => import("@/components/ui/LiveBackground"), {
  ssr: false,
});

export default function LiveBackgroundWrapper() {
  return <LiveBackground />;
}
