import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { missingConfig, supabase } from "./lib/supabase.ts";
import SignIn from "./SignIn.tsx";
import TodoList from "./TodoList.tsx";

type Auth = { status: "checking" } | { status: "signed-out" } | { status: "signed-in"; session: Session };

export default function App() {
  const [auth, setAuth] = useState<Auth>(supabase ? { status: "checking" } : { status: "signed-out" });

  useEffect(() => {
    if (!supabase) return;
    // Fires once with the stored session (INITIAL_SESSION), then on every sign-in, sign-out and refresh.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session ? { status: "signed-in", session } : { status: "signed-out" });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (auth.status === "checking") {
    return (
      <main className="page">
        <header className="masthead">
          <h1 className="wordmark">Tally Private 2</h1>
        </header>
        <p className="state" data-state="loading" aria-live="polite">
          Checking your sign-in…
        </p>
      </main>
    );
  }

  if (auth.status === "signed-out") return <SignIn configError={missingConfig} />;

  const { user } = auth.session;
  return <TodoList key={user.id} email={user.email ?? ""} />;
}
