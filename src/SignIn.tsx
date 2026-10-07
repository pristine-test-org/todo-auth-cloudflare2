import { useState, type FormEvent } from "react";
import { supabase } from "./lib/supabase.ts";

export default function SignIn({ configError }: { configError: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(configError);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !email.trim() || !password) return;
    setSigningIn(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSigningIn(false);
    if (!error) return; // App switches to the list on the SIGNED_IN event.
    setError(
      error.status === 400
        ? "That email and password don't match. Check them and try again."
        : "We couldn't sign you in. Check your connection and try again.",
    );
  }

  return (
    <main className="page gate">
      <header className="gate-top">
        <p className="kicker">Private list</p>
        <h1 className="wordmark">Tally Private 2</h1>
        <p className="lede">Your own short list. Sign in to see it.</p>
      </header>

      <ul className="gate-notes">
        <li>
          <strong>One list</strong>
          <span>Only the rows that belong to this account.</span>
        </li>
        <li>
          <strong>Email and password</strong>
          <span>Nothing else gets you in.</span>
        </li>
        <li>
          <strong>No sign-up</strong>
          <span>The list's owner sets up each account.</span>
        </li>
      </ul>

      {error && (
        <div className="notice" role="alert" data-state="error">
          <p>{error}</p>
        </div>
      )}

      <form className="signin" onSubmit={signIn}>
        <div className="signin-head">
          <h2>Sign in</h2>
          <p>Use the email and password you were given.</p>
        </div>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
            disabled={!supabase}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={!supabase}
          />
        </label>
        <button type="submit" className="primary signin-submit" disabled={!supabase || signingIn || !email.trim() || !password}>
          {signingIn ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
