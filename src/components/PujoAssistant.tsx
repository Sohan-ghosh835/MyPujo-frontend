import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Bot, Loader2, SendHorizonal, Sparkles } from "lucide-react";
import { useState } from "react";

export function PujoAssistant() {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const [question, setQuestion] = useState("I have 4 hours and want famous artistic South Kolkata pandals.");
  const ask = trpc.assistant.ask.useMutation();
  const submit = () => {
    if (question.trim().length >= 4) ask.mutate({ question });
  };

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/10 text-[#f8edd8] shadow-2xl backdrop-blur-xl" aria-labelledby="assistant-title">
      <div className="relative p-6">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full border border-[#f5c85b]/25" />
        <div className="absolute -right-1 top-7 h-20 w-20 rounded-full border border-[#f5c85b]/20" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[#f5c85b]">
            <Sparkles size={15} />
            <span className="text-[10px] font-bold uppercase tracking-[.18em]">
              {bengali ? "ক্যাটালগ-ভিত্তিক সহায়ক" : "Grounded discovery helper"}
            </span>
          </div>
          <h2 id="assistant-title" className="font-display mt-2 text-2xl font-bold text-[#f8edd8]">
            {bengali ? "PujoParikroma-কে জিজ্ঞাসা করুন" : "Ask PujoParikroma"}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[#f8edd8]/80">
            {bengali
              ? "কোনও এলাকা বা পুজোর ধরন নিয়ে জিজ্ঞাসা করুন। এটি কেবল ক্যাটালগের ফল ব্যবহার করে; লাইভ রুট, ট্র্যাফিক, কিউ বা সময় বানিয়ে বলে না।"
              : "Ask for an area or a type of Puja. It uses only catalogue results; it will not invent a live route, traffic state, queue, or timing."}
          </p>
        </div>
        <div className="relative mt-5 flex gap-2">
          <Input
            value={question}
            onChange={event => setQuestion(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Enter") submit();
            }}
            className="h-11 border-white/20 bg-white/10 text-sm text-[#f8edd8] placeholder:text-[#f8edd8]/60 focus-visible:ring-[#f5c85b]"
            aria-label={bengali ? "PujoParikroma-কে একটি খোঁজার প্রশ্ন করুন" : "Ask PujoParikroma a discovery question"}
          />
          <Button
            onClick={submit}
            disabled={ask.isPending}
            className="h-11 w-11 shrink-0 rounded-xl bg-[#f5c85b] p-0 font-bold text-[#241f1a] hover:bg-[#ffe09a]"
            aria-label={bengali ? "ক্যাটালগ সহায়ককে জিজ্ঞাসা করুন" : "Ask discovery assistant"}
          >
            {ask.isPending ? <Loader2 className="animate-spin" size={18} /> : <SendHorizonal size={18} />}
          </Button>
        </div>
        {ask.data && (
          <div className="relative mt-4 rounded-xl border border-[#f5c85b]/30 bg-white/10 p-4 text-sm leading-relaxed text-[#f8edd8]">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#f5c85b]">
              <Bot size={14} />
              {bengali ? "উৎস-ভিত্তিক উত্তর" : "Service-grounded answer"}
            </div>
            {ask.data.answer}
          </div>
        )}
        {ask.error && (
          <p className="relative mt-3 text-xs text-[#f5c85b]">
            {bengali ? "এই মুহূর্তে সহায়কটি পাওয়া যাচ্ছে না। বদলে রুট প্ল্যানার ব্যবহার করুন।" : "The assistant is unavailable right now. Use the route planner instead."}
          </p>
        )}
      </div>
    </section>
  );
}
