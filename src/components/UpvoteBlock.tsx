"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Store } from "@/lib/store";

interface VoteState {
  votes: number;
  voted: boolean;
  vote: () => void;
}

const VoteContext = createContext<VoteState | null>(null);

/** Wraps a business profile page so every upvote control on it (the action
 * button and the counts) shares one vote total and one already-voted flag,
 * even with server-rendered content between them. */
export function VoteProvider({
  businessId,
  initialVotes,
  children,
}: {
  businessId: string;
  initialVotes: number;
  children: ReactNode;
}) {
  const [votes, setVotes] = useState(initialVotes);
  // Whether *this browser* already voted is only knowable client-side
  // (localStorage) — starts false during SSR and syncs on mount, so
  // there's a brief flash of "enabled" if you'd already voted before.
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    // Syncing from localStorage (an external system) on mount - see the
    // same pattern, and why it's an acceptable use of an effect, in
    // Leaderboard.tsx.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoted(Store.hasVoted(businessId));
  }, [businessId]);

  async function vote() {
    const didVote = await Store.addVote(businessId);
    if (!didVote) return;
    setVotes((v) => v + 1);
    setVoted(true);
  }

  return <VoteContext.Provider value={{ votes, voted, vote }}>{children}</VoteContext.Provider>;
}

function useVote(): VoteState {
  const ctx = useContext(VoteContext);
  if (!ctx) throw new Error("Upvote buttons must be rendered inside a VoteProvider");
  return ctx;
}

/** The live upvote total, as plain text, so it moves when this page's
 * upvote buttons are used. */
export function VoteCount() {
  const { votes } = useVote();
  return <>{votes}</>;
}

/** The main upvote action on a business profile: the gradient button with
 * the running total, which turns into a "voted" state once this browser has
 * used its one vote. */
export function UpvoteActionButton() {
  const { votes, voted, vote } = useVote();
  return (
    <button type="button" className="btn btn-primary" disabled={voted} onClick={vote}>
      <span aria-hidden="true">▲</span>
      {voted ? "Upvoted" : "Upvote"} · {votes}
    </button>
  );
}
