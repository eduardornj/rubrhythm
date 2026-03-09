"use client";

import { useState, useEffect, useCallback } from "react";

export default function BlockListPage() {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [type, setType] = useState("phone");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");

  const fetchBlocked = useCallback(async () => {
    try {
      const res = await fetch("/api/blocklist");
      const data = await res.json();
      if (res.ok) {
        setBlocked(data.blocked || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    clearMessages();

    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please enter a phone number or email to block.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/blocklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value: trimmed, note: note.trim() || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add blocked contact.");
        return;
      }

      setBlocked((prev) => [data.blocked, ...prev]);
      setValue("");
      setNote("");
      setSuccess("Contact blocked successfully.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    clearMessages();
    setDeletingId(id);
    try {
      const res = await fetch("/api/blocklist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setBlocked((prev) => prev.filter((b) => b.id !== id));
        setSuccess("Contact unblocked.");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to remove.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 rounded-2xl bg-white/5" />
        <div className="h-48 rounded-2xl bg-white/5" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Block List</h1>
        <p className="text-text-muted mt-1">
          Block phone numbers or emails so those contacts cannot message you.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-300 text-sm">
          {success}
        </div>
      )}

      {/* Add Form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Block a Contact</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm text-text-muted mb-1.5">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 appearance-none"
              >
                <option value="phone" className="bg-gray-900">Phone</option>
                <option value="email" className="bg-gray-900">Email</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm text-text-muted mb-1.5">
                {type === "phone" ? "Phone Number" : "Email Address"}
              </label>
              <input
                type={type === "email" ? "email" : "text"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "phone" ? "(555) 123-4567" : "spam@example.com"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for blocking..."
              maxLength={200}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !value.trim()}
            className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-95"
          >
            {submitting ? "Blocking..." : "Block Contact"}
          </button>
        </form>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-text-muted text-sm">
          {blocked.length} / 100 blocked contacts
        </p>
      </div>

      {/* List */}
      {blocked.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">
            <svg className="w-12 h-12 mx-auto text-white/20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <p className="text-white/60 font-medium">No blocked contacts</p>
          <p className="text-white/30 text-sm mt-1">
            Add a phone number or email above to start blocking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocked.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4"
            >
              {/* Type Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                {item.type === "phone" ? (
                  <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium truncate">{item.value}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50 uppercase tracking-wide">
                    {item.type}
                  </span>
                </div>
                {item.note && (
                  <p className="text-text-muted text-sm mt-0.5 truncate">{item.note}</p>
                )}
                <p className="text-white/30 text-xs mt-0.5">{formatDate(item.createdAt)}</p>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="flex-shrink-0 p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                title="Unblock"
              >
                {deletingId === item.id ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
