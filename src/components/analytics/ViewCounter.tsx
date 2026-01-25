"use client";

import { incrementPostView } from "@/server/actions/analytics.actions";
import { useEffect, useRef } from "react";

export function ViewCounter({ postId }: { postId: string }) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (!hasIncremented.current) {
      incrementPostView(postId);
      hasIncremented.current = true;
    }
  }, [postId]);

  return null;
}
