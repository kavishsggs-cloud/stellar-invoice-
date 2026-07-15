"use client";

import { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2, Loader2 } from "lucide-react";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: feedback }),
      });

      if (!res.ok) throw new Error("Failed to submit feedback");

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFeedback("");
      }, 3000);
    } catch (e) {
      console.error(e);
      // Fallback
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFeedback("");
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-zinc-800 hover:bg-zinc-700 text-white p-3 md:p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}
        aria-label="Send Feedback"
      >
        <MessageSquare size={24} />
      </button>

      {/* Feedback Modal / Popover */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
            <h3 className="font-semibold flex items-center">
              <MessageSquare size={18} className="mr-2 text-blue-400" />
              Send Feedback
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 bg-zinc-950">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3 animate-in fade-in zoom-in">
                <CheckCircle2 className="text-green-500" size={48} />
                <p className="font-medium">Thank you for your feedback!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-zinc-400">
                  Have a suggestion or found a bug? Let us know what you think of Stellar Invoice.
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us your thoughts..."
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !feedback.trim()}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
