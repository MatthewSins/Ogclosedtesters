import { Suspense } from "react";
import { ResetPasswordClient } from "./reset-password-client";

function LoadingState(): JSX.Element {
  return <div className="grid min-h-screen place-items-center text-slate-300">Loading reset form...</div>;
}

export default function ResetPasswordPage(): JSX.Element {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
