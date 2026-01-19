"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Terjadi Kesalahan</h1>
          <p className="text-muted-foreground">
            Maaf, sistem mengalami kendala saat memproses permintaan Anda.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground bg-muted p-1 rounded">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()} size="lg">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.href = "/"}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
