import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Flag, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const issueTypes = [
  ["name", "Wrong name or alias"],
  ["address", "Wrong address"],
  ["location", "Wrong map location"],
  ["image", "Wrong or unclear image"],
  ["source", "Source or attribution issue"],
  ["season2026", "2026 information update"],
  ["other", "Other correction"],
] as const;

export default function ReportCorrection() {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const params = new URLSearchParams(window.location.search);
  const [recordId, setRecordId] = useState(params.get("record") ?? "");
  const [issueType, setIssueType] = useState<(typeof issueTypes)[number][0]>("other");
  const [details, setDetails] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const submit = trpc.corrections.submit.useMutation({
    onSuccess: () => {
      toast.success(bengali ? "ধন্যবাদ। আপনার সংশোধন রিপোর্টটি পর্যালোচনার জন্য পাঠানো হয়েছে।" : "Thank you. Your correction report is queued for review.");
      setDetails("");
      setReporterContact("");
    },
    onError: () => toast.error(bengali ? "এই মুহূর্তে রিপোর্ট পাঠানো যায়নি। পরে আবার চেষ্টা করুন।" : "The report could not be submitted right now. Please try again later."),
  });

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    submit.mutate({ recordId: recordId || undefined, issueType, details, reporterContact: reporterContact || undefined, pageUrl: window.location.href });
  };

  const issueLabel = (value: string, label: string) =>
    bengali
      ? ({
          name: "ভুল নাম বা বিকল্প নাম",
          address: "ভুল ঠিকানা",
          location: "ভুল ম্যাপ লোকেশন",
          image: "ভুল বা অস্পষ্ট ছবি",
          source: "উৎস বা স্বীকৃতির সমস্যা",
          season2026: "২০২৬ তথ্য আপডেট",
          other: "অন্য সংশোধন",
        }[value] ?? label)
      : label;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <section>
            <p className="font-bengali text-xs font-bold uppercase tracking-[0.18em] text-[#f5c85b]">
              {bengali ? "তথ্য সংশোধন" : "Data correction"}
            </p>
            <h1 className="font-bengali mt-2 text-4xl font-bold leading-tight text-[#f8edd8] sm:text-5xl">
              {bengali ? "গাইডকে নির্ভুল রাখতে সাহায্য করুন।" : "Help keep the guide accurate."}
            </h1>
            <p className="mt-4 font-bengali text-base leading-relaxed text-[#f8edd8]/80">
              {bengali
                ? "PujoParikroma একটি স্বাধীন ভিজিটর গাইড। ভুল নাম, ঠিকানা, ম্যাপ লোকেশন, ছবি, উৎস বা ২০২৬ তথ্য জানান। জনসমক্ষে ক্যাটালগ বদলানোর আগে সব রিপোর্ট পর্যালোচনা করা হয়।"
                : "PujoParikroma is an independent visitor guide. Report a wrong name, address, map location, image, source, or 2026 update. Reports are reviewed before any public catalogue change."}
            </p>
            <div className="mt-7 space-y-4 rounded-[1.4rem] border border-white/20 bg-white/10 p-6 text-[#f8edd8] shadow-2xl backdrop-blur-xl">
              <div className="flex gap-3">
                <ShieldCheck className="shrink-0 text-[#f5c85b]" size={20} />
                <p className="text-sm font-medium text-[#f8edd8]/80">
                  {bengali ? "পাসওয়ার্ড, পেমেন্টের তথ্য বা সংবেদনশীল ব্যক্তিগত তথ্য দেবেন না।" : "Do not include passwords, payment details, or sensitive personal information."}
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="shrink-0 text-[#f5c85b]" size={20} />
                <p className="text-sm font-medium text-[#f8edd8]/80">
                  {bengali ? "রিপোর্টটি রিভিউ, রেটিং, ভিড় আপডেট বা লাইভ অপারেশনাল দাবি হিসেবে প্রকাশিত হয় না।" : "A report is not published as a review, rating, crowd update, or live operational claim."}
                </p>
              </div>
            </div>
          </section>

          <form onSubmit={send} className="rounded-[1.5rem] border border-white/20 bg-white/10 p-6 text-[#f8edd8] shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="flex items-center gap-2 text-[#f5c85b]">
              <Flag size={19} />
              <p className="font-bengali text-xs font-bold uppercase tracking-[0.18em] text-[#f5c85b]">
                {bengali ? "ভুল তথ্য জানান" : "Report incorrect information"}
              </p>
            </div>
            <label className="mt-6 block text-sm font-bold text-[#f5c85b]">
              {bengali ? "রেকর্ড ID বা গাইড লিঙ্ক" : "Record ID or guide link"}{" "}
              <span className="font-normal text-[#f8edd8]/70">({bengali ? "ঐচ্ছিক" : "optional"})</span>
              <Input
                value={recordId}
                onChange={event => setRecordId(event.target.value)}
                className="mt-2 h-11 border-white/20 bg-white/10 text-sm text-[#f8edd8] placeholder:text-[#f8edd8]/60 focus-visible:ring-[#f5c85b]"
                placeholder={bengali ? "উদাহরণ: address-bagbazar-sarbojanin-700003" : "Example: address-bagbazar-sarbojanin-700003"}
              />
            </label>
            <label className="mt-5 block text-sm font-bold text-[#f5c85b]">
              {bengali ? "কী সংশোধন দরকার" : "What needs correction"}
              <select
                value={issueType}
                onChange={event => setIssueType(event.target.value as typeof issueType)}
                className="mt-2 h-11 w-full rounded-xl border border-white/20 bg-[#2b1717]/90 px-3 text-sm font-normal text-[#f8edd8] focus:outline-none focus:ring-2 focus:ring-[#f5c85b]"
              >
                {issueTypes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {issueLabel(value, label)}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-5 block text-sm font-bold text-[#f5c85b]">
              {bengali ? "কী সংশোধন করা উচিত?" : "What should be corrected?"}
              <Textarea
                rows={4}
                required
                minLength={12}
                maxLength={1400}
                value={details}
                onChange={event => setDetails(event.target.value)}
                className="mt-2 min-h-36 border-white/20 bg-white/10 text-sm text-[#f8edd8] placeholder:text-[#f8edd8]/60 focus-visible:ring-[#f5c85b]"
                placeholder={bengali ? "সমস্যাটি লিখুন এবং সম্ভব হলে একটি জনসাধারণের উৎস URL যোগ করুন।" : "Please describe the issue and, if possible, include a public source URL."}
              />
            </label>
            <label className="mt-5 block text-sm font-bold text-[#f5c85b]">
              {bengali ? "ফলো-আপের জন্য যোগাযোগ" : "Contact for follow-up"}{" "}
              <span className="font-normal text-[#f8edd8]/70">({bengali ? "ঐচ্ছিক" : "optional"})</span>
              <Input
                value={reporterContact}
                onChange={event => setReporterContact(event.target.value)}
                className="mt-2 h-11 border-white/20 bg-white/10 text-sm text-[#f8edd8] placeholder:text-[#f8edd8]/60 focus-visible:ring-[#f5c85b]"
                placeholder={bengali ? "ইমেল বা অন্য অসংবেদনশীল যোগাযোগ" : "Email or another non-sensitive contact"}
              />
            </label>
            <Button type="submit" disabled={submit.isPending || details.trim().length < 12} className="mt-6 h-12 w-full rounded-xl bg-[#9d2529] font-bold text-white hover:bg-[#7e1d21]">
              {submit.isPending ? (bengali ? "রিপোর্ট পাঠানো হচ্ছে…" : "Submitting report…") : (bengali ? "সংশোধন রিপোর্ট পাঠান" : "Submit correction report")}
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
