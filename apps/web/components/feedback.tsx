"use client";

import { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

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
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-surface/80 hover:bg-surface border border-white/10 text-white p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all ${
          isOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'
        }`}
        aria-label="Send Feedback"
      >
        <MessageSquare size={20} className="text-stellar-blue" />
      </motion.button>

      {/* Glassmorphic Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm glass-panel bg-[#132238]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-sm text-white flex items-center">
                <MessageSquare size={16} className="mr-2 text-stellar-blue" />
                Product Feedback
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-white transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <CheckCircle2 className="text-success animate-bounce" size={40} />
                  <p className="font-bold text-white text-sm">Thank you for your feedback!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-text-secondary font-light">
                    Have a suggestion or feature request? Share your feedback directly with our Stellar development team.
                  </p>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us your thoughts..."
                    rows={4}
                    className="w-full bg-surface/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-text-muted outline-none focus:ring-2 focus:ring-stellar-blue/30 resize-none transition-all"
                    required
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting || !feedback.trim()}
                      className="shadow-[var(--shadow-premium-button)] text-xs"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin mr-1.5" size={14} /> : <Send size={14} className="mr-1.5" />}
                      <span>{isSubmitting ? 'Sending...' : 'Submit Feedback'}</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
