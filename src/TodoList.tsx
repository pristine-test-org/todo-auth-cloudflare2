import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase, type Todo } from "./lib/supabase.ts";

type Status = "loading" | "ready" | "error";

/** The signed-in person's own list; row level security keeps everyone else's rows out. */
export default function TodoList({ email }: { email: string }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setStatus("loading");
    const { data, error } = await supabase
      .from("private_todos")
      .select("id, title, done, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setError("We couldn't load your list. Check your connection and try again.");
      setStatus("error");
      return;
    }
    setTodos(data ?? []);
    setError(null);
    setStatus("ready");
  }, []);

  useEffect(() => {
    // Fetching on mount is the point of this effect; load() sets state once the request settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function addTodo(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!supabase || !trimmed) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("private_todos")
      .insert({ title: trimmed })
      .select("id, title, done, created_at")
      .single();
    setSaving(false);
    if (error || !data) {
      setError("That one didn't save. Try again.");
      return;
    }
    setTodos((current) => [data, ...current]);
    setTitle("");
    setError(null);
  }

  async function toggleTodo(todo: Todo) {
    if (!supabase) return;
    setTodos((current) => current.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)));
    const { error } = await supabase.from("private_todos").update({ done: !todo.done }).eq("id", todo.id);
    if (error) {
      setTodos((current) => current.map((t) => (t.id === todo.id ? { ...t, done: todo.done } : t)));
      setError("We couldn't update that item. Try again.");
    }
  }

  async function deleteTodo(todo: Todo) {
    if (!supabase) return;
    const previous = todos;
    setTodos((current) => current.filter((t) => t.id !== todo.id));
    const { error } = await supabase.from("private_todos").delete().eq("id", todo.id);
    if (error) {
      setTodos(previous);
      setError("We couldn't remove that item. Try again.");
    }
  }

  async function signOut() {
    if (!supabase) return;
    setSigningOut(true);
    // Clears the stored session even when the network call fails; App then shows the sign-in page.
    await supabase.auth.signOut();
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="page">
      <div className="account">
        <span className="account-email">{email}</span>
        <button type="button" className="quiet" onClick={() => void signOut()} disabled={signingOut}>
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>

      <header className="masthead">
        <h1 className="wordmark">Tally Private 2</h1>
        {status === "ready" && todos.length > 0 && (
          <p className="count">
            <strong>{remaining}</strong> of {todos.length} left
          </p>
        )}
      </header>

      <form className="composer" onSubmit={addTodo}>
        <label className="sr-only" htmlFor="new-todo">
          New item
        </label>
        <input
          id="new-todo"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing?"
          maxLength={200}
          autoComplete="off"
          disabled={!supabase}
        />
        <button type="submit" disabled={!supabase || saving || !title.trim()}>
          {saving ? "Adding…" : "Add"}
        </button>
      </form>

      {error && (
        <div className="notice" role="alert" data-state="error">
          <p>{error}</p>
          {supabase && status === "error" && (
            <button type="button" className="quiet" onClick={() => void load()}>
              Try again
            </button>
          )}
        </div>
      )}

      {status === "loading" && (
        <p className="state" data-state="loading" aria-live="polite">
          Loading your list…
        </p>
      )}

      {status === "ready" && todos.length === 0 && (
        <div className="state" data-state="empty">
          <p className="state-title">Nothing on the list.</p>
          <p>Add the first thing above.</p>
        </div>
      )}

      {status === "ready" && todos.length > 0 && (
        <ul className="list">
          {todos.map((todo) => (
            <li key={todo.id} className="item" data-done={todo.done}>
              <label>
                <input type="checkbox" checked={todo.done} onChange={() => void toggleTodo(todo)} />
                <span>{todo.title}</span>
              </label>
              <button
                type="button"
                className="remove"
                onClick={() => void deleteTodo(todo)}
                aria-label={`Remove "${todo.title}"`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
