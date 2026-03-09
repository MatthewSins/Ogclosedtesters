import { Suspense } from "react";
import { VerifyEmailClient } from "./verify-email-client";

function LoadingState(): JSX.Element {
  return <div className="grid min-h-screen place-items-center text-slate-300">Loading verification...</div>;
}

export default function VerifyEmailPage(): JSX.Element {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
