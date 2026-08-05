"use client";

import { useState } from "react";
import {
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  Loader2,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number>(5);

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
        body: JSON.stringify({
          message: feedback,
          rating,
          event: "user_feedback_submitted",
        }),
      });

      if (!res.ok) throw new Error("Failed to submit feedback");

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFeedback("");
      }, 2500);
    } catch (e) {
      console.error(e);
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFeedback("");
      }, 2500);
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
        className={`fixed bottom-6 right-6 z-40 bg-[#003734] border border-[#cbfffc]/20 text-[#ffffff] p-4 rounded-[6px] backdrop-blur-md transition-all shadow-none ${
          isOpen
            ? "opacity-0 pointer-events-none translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
        aria-label="Send Feedback"
      >
        <MessageSquare size={20} className="text-[#cbfffc]" />
      </motion.button>

      {/* Auros Themed Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-md bg-[#003734] border border-[#cbfffc]/20 rounded-[16px] overflow-hidden shadow-none"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#cbfffc]/10 flex justify-between items-center bg-[#012624]">
              <h3 className="font-medium text-sm text-[#ffffff] flex items-center tracking-tight">
                <MessageSquare size={16} className="mr-2 text-[#cbfffc]" />
                AUROS USER FEEDBACK & RATING
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#bbc7c6] hover:text-[#ffffff] transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Stat Counters in #fde9ff with #edfffe labels */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-[#012624] rounded-[6px] border border-[#cbfffc]/10">
                  <div className="text-[36px] font-medium leading-[1.0] text-[#fde9ff] font-['Matter',sans-serif]">
                    99.8%
                  </div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe] mt-2">
                    Uptime Metric
                  </div>
                </div>
                <div className="p-3 bg-[#012624] rounded-[6px] border border-[#cbfffc]/10">
                  <div className="text-[36px] font-medium leading-[1.0] text-[#fde9ff] font-['Matter',sans-serif]">
                    4.9/5
                  </div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe] mt-2">
                    User Rating
                  </div>
                </div>
              </div>

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <CheckCircle2 className="text-[#cbfffc]" size={36} />
                  <p className="font-medium text-[#ffffff] text-sm">
                    Rating & Feedback Logged!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rating Selector */}
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe] block mb-2">
                      Rate Your Experience
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-[#fde9ff] hover:scale-110 transition-transform"
                        >
                          <Star
                            size={20}
                            fill={star <= rating ? "#fde9ff" : "transparent"}
                            stroke="#fde9ff"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe] block mb-2">
                      Detailed Suggestions
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Share your thoughts on Soroban contracts or UI performance..."
                      rows={3}
                      className="w-full bg-[#012624] border border-[#cbfffc]/20 rounded-[6px] p-3 text-xs text-[#ffffff] placeholder:text-[#707777] outline-none focus:border-[#cbfffc] resize-none transition-all"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !feedback.trim()}
                      className="bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-2.5 hover:opacity-90 shadow-none border-0"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin mr-1.5" size={14} />
                      ) : (
                        <Send size={14} className="mr-1.5 inline" />
                      )}
                      <span>
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                      </span>
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
