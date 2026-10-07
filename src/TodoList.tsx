import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase, type Todo } from "./lib/supabase.ts";

type Status = "loading" | "ready" | "error";
type Filter = "open" | "done" | "all";

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

/** The signed-in person's own list; row level security keeps everyone else's rows out. */
export default function TodoList({ email }: { email: string }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [filter, setFilter] = useState<Filter>("open");

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
  const finished = todos.length - remaining;
  const progress = todos.length === 0 ? 0 : Math.round((finished / todos.length) * 100);
  const visible =
    filter === "done" ? todos.filter((t) => t.done) : filter === "all" ? todos : todos.filter((t) => !t.done);

  return (
    <main className="page board">
      <header className="board-top">
        <div>
          <p className="kicker">Private list</p>
          <h1 className="wordmark">Tally Private 2</h1>
        </div>
        <div className="account-card">
          <span className="account-email">{email}</span>
          <button type="button" className="signout" onClick={() => void signOut()} disabled={signingOut}>
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </header>

      <section className="stats" aria-label="List summary">
        <div className="stat">
          <strong>{status === "ready" ? remaining : "–"}</strong>
          <span>Open</span>
        </div>
        <div className="stat">
          <strong>{status === "ready" ? finished : "–"}</strong>
          <span>Done</span>
        </div>
        <div className="stat stat-wide">
          <div className="stat-row">
            <span>Finished</span>
            <strong>{status === "ready" ? `${progress}%` : "–"}</strong>
          </div>
          <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <form className="composer composer-card" onSubmit={addTodo}>
        <label className="composer-label" htmlFor="new-todo">
          Add an item
        </label>
        <div className="composer-row">
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
        </div>
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
          <p>Add the first thing above. It stays on this account only.</p>
        </div>
      )}

      {status === "ready" && todos.length > 0 && (
        <>
          <div className="filters" role="tablist" aria-label="Filter items">
            {(
              [
                ["open", `Open ${remaining}`],
                ["done", `Done ${finished}`],
                ["all", `All ${todos.length}`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                className="filter"
                data-active={filter === key}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="state" data-state="empty">
              <p className="state-title">{filter === "done" ? "Nothing finished yet." : "All clear."}</p>
              <p>{filter === "done" ? "Checked items will land here." : "Everything on the list is done."}</p>
            </div>
          ) : (
            <ul className="list cards">
              {visible.map((todo) => (
                <li key={todo.id} className="item" data-done={todo.done}>
                  <label>
                    <input type="checkbox" checked={todo.done} onChange={() => void toggleTodo(todo)} />
                    <span className="item-copy">
                      <span className="item-title">{todo.title}</span>
                      <span className="item-meta">{formatWhen(todo.created_at)}</span>
                    </span>
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
        </>
      )}
    </main>
  );
}
