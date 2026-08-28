import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { RoutePlanner } from "@/components/RoutePlanner";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function Routes() {
  const { language } = useLanguage();
  const bengali = language === "bn";

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-10 lg:py-14">
        {/* Page Hero Header with High-Contrast Light Colors */}
        <div className="max-w-3xl">
          <p className="font-bengali text-xs font-bold uppercase tracking-[0.18em] text-[#f5c85b]">
            {bengali ? "পরিক্রমার কর্মক্ষেত্র" : "Parikrama workspace"}
          </p>
          <h1 className="font-bengali mt-2 text-4xl font-bold leading-tight text-[#f8edd8] sm:text-5xl">
            {bengali ? "সৎ ও কাজের পরিকল্পনা বানান।" : "Make a plan that is honest and useful."}
          </h1>
          <p className="mt-4 font-bengali text-base leading-relaxed text-[#f8edd8]/80">
            {bengali
              ? "কলকাতার একটি অংশের জন্য র‌্যাঙ্ক করা, ঠিকানা-ভিত্তিক তালিকা বানান। আমার পুজোয় রাখুন বা বার্তায় কপি করুন। লাইভ ট্র্যাফিক, প্রবেশ, কিউ বা যাতায়াতের তথ্য যাচাই করা হয়নি বলে সঠিক রুট দেখানো হয় না।"
              : "Build a ranked, address-led shortlist for one part of Kolkata. Save it to Amar Pujo or copy it to a message. Exact trip routing is deliberately not simulated because live traffic, entry, queue, and travel data have not been verified."}
          </p>
        </div>

        {/* Content Layout */}
        <div className="mt-9 grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <RoutePlanner compact />
          </div>
          <aside className="space-y-5">
            <section className="rounded-[1.5rem] border border-white/20 bg-white/10 p-6 text-[#f8edd8] shadow-2xl backdrop-blur-xl">
              <Sparkles className="text-[#f5c85b]" size={23} />
              <h2 className="font-display mt-5 text-2xl font-bold text-[#f8edd8]">
                {bengali ? "এই প্ল্যানার কী করে" : "What this planner does"}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#f8edd8]/80">
                <li>
                  <CheckCircle2 className="mr-2 inline text-[#f5c85b]" size={15} />
                  {bengali ? "এলাকা অনুযায়ী সরবরাহ করা ক্যাটালগ ফিল্টার করে।" : "Filters the supplied catalogue by neighbourhood."}
                </li>
                <li>
                  <CheckCircle2 className="mr-2 inline text-[#f5c85b]" size={15} />
                  {bengali ? "র‌্যাঙ্ক ও উদ্ধৃত গাইড লেন্স দিয়ে ছোট তালিকা প্রস্তাব করে।" : "Uses ranked records and cited guide lenses to propose a compact visit list."}
                </li>
                <li>
                  <CheckCircle2 className="mr-2 inline text-[#f5c85b]" size={15} />
                  {bengali ? "নিজের ফোনে ব্যবহারের জন্য তালিকা সংরক্ষণ ও কপি করে।" : "Saves and copies a list you can use on your own phone."}
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
