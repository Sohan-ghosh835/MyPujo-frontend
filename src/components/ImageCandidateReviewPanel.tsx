import { useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, ImageOff, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { imageReviewPresentation } from "../../../shared/imageReviewPresentation";

const statusOptions = [
  { value: "review_required", label: "Review required" },
  { value: "needs_review", label: "Legacy review" },
  { value: "approved", label: "Approved evidence" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "unreachable", label: "Unreachable" },
  { value: "duplicate", label: "Duplicate" },
  { value: "no_match", label: "No match" },
  { value: "removed", label: "Removed" },
] as const;
type QueueStatus = (typeof statusOptions)[number]["value"];

export function ImageCandidateReviewPanel() {
  const [status, setStatus] = useState<QueueStatus>("review_required");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const candidates = trpc.imageCandidates.adminList.useQuery({ status });
  const coverage = trpc.imageCandidates.coverage.useQuery();
  const selected = useMemo(() => candidates.data?.find(candidate => candidate.candidateId === selectedId) ?? candidates.data?.[0] ?? null, [candidates.data, selectedId]);
  const presentation = selected ? imageReviewPresentation(selected) : null;

  const choose = (candidateId: string) => {
    setSelectedId(candidateId);
  };

  if (candidates.isLoading || coverage.isLoading) return <p className="rounded-xl bg-[#f7eee0] p-4 text-sm text-[#765e53]">Loading protected image review queue…</p>;
  if (candidates.error || coverage.error) return <p className="rounded-xl bg-[#fff0db] p-4 text-sm text-[#704a3a]">Image review is restricted to authorised administrators.</p>;

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Public image records" value={`${coverage.data?.publicImageRecords ?? 0}/${coverage.data?.totalRecords ?? 0}`} note={`${coverage.data?.publicImageCoveragePercent ?? 0}% catalogue coverage`} />
      <Metric label="Review required" value={coverage.data?.lifecycle.needsReview ?? 0} note="Identity evidence pending" />
      <Metric label="Managed approvals" value={coverage.data?.lifecycle.managedApproved ?? 0} note={`${coverage.data?.lifecycle.approved ?? 0} automatic approvals retained`} />
      <Metric label="No-image queue" value={coverage.data?.noImageQueue.length ?? 0} note="Prioritise sourced discovery" />
    </div>
    <div className="rounded-2xl border border-[#ead9c0] bg-[#fffaf0] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Protected image lifecycle</p><p className="mt-1 text-xs text-[#765e53]">Every candidate has already received an automatic evidence outcome. Recorded source metadata is locked to prevent accidental manual overrides.</p></div><label className="text-xs font-bold text-[#765e53]">Queue state <select value={status} onChange={event => { setStatus(event.target.value as QueueStatus); setSelectedId(null); }} className="ml-2 rounded-lg border border-[#d6bd97] bg-white px-2 py-2 text-[#4a2520]">{statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>
    </div>
    {!selected ? <div className="rounded-2xl border border-dashed border-[#ddc8a6] bg-[#fffaf0] p-6 text-sm text-[#765e53]"><CheckCircle2 className="mb-2 text-[#3e766b]"/>No candidates in this lifecycle state. Public imagery remains unchanged unless an approved candidate also receives a managed asset and is rebuilt into the manifest.</div> : <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <aside className="rounded-2xl border border-[#ead9c0] bg-[#fffaf0] p-4"><p className="eyebrow">Dataset candidate queue</p><div className="mt-3 max-h-80 space-y-2 overflow-auto pr-1">{candidates.data?.map(candidate => <button key={candidate.candidateId} onClick={() => choose(candidate.candidateId)} className={`w-full rounded-xl border p-3 text-left text-sm ${candidate.candidateId === selected.candidateId ? "border-[#a42224] bg-[#fff0dc]" : "border-[#ead9c0] bg-white"}`}><strong className="block text-[#4a2520]">{candidate.recordId}</strong><span className="mt-1 block truncate text-xs text-[#765e53]">{candidate.originalFilename}</span><span className="mt-1 block text-[11px] font-bold text-[#8c1e21]">{candidate.matchConfidence}% · {candidate.matchMethod}</span></button>)}</div></aside>
      <section className="rounded-2xl border border-[#ead9c0] bg-[#fffaf0] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">Evidence-first image review</p><h2 className="mt-1 font-display text-2xl font-bold text-[#4a2520]">{selected.recordId}</h2><p className="mt-1 break-words text-xs leading-relaxed text-[#765e53]">Filename evidence: {selected.inferredName}</p></div><a href={selected.sourcePage} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[#d6bd97] px-3 py-2 text-xs font-bold text-[#8c1e21]"><ExternalLink size={14}/>Open source page</a></div>
        <div className="mt-4 rounded-xl border border-[#edd8b3] bg-[#fff3df] p-4 text-sm text-[#765e53]"><div className="flex gap-2"><ImageOff className="mt-0.5 shrink-0 text-[#9d3328]" size={18}/><p>Candidate files are not embedded here. Inspect the source page and image before recording a review decision.</p></div><dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2"><Evidence label="Lifecycle" value={`${selected.status} · ${selected.usageStatus}`} /><Evidence label="Match" value={`${selected.matchMethod} · ${selected.matchConfidence}%`} /><Evidence label="Licence" value={selected.license ?? "Not verified"} /><Evidence label="Attribution" value={selected.attribution ?? "Not verified"} /><Evidence label="Image metadata" value={selected.width && selected.height ? `${selected.width}×${selected.height} · ${selected.contentType ?? "unknown"} · score ${selected.technicalQualityScore ?? "—"}` : "No dimensions retained"} /><Evidence label="Validation" value={selected.validationNote ?? "No validation note"} wide /></dl></div>
        <label className="mt-4 block text-xs font-bold text-[#765e53]">Verified licence <span className="font-normal">(source-confirmed and locked)</span><Input value={selected.license ?? "No verified licence retained"} readOnly className="mt-1 bg-[#f7eee0]"/></label>
        <label className="mt-3 block text-xs font-bold text-[#765e53]">Licence URL <span className="font-normal">(source-confirmed and locked)</span><Input value={selected.licenseUrl ?? "No verified licence URL retained"} readOnly className="mt-1 bg-[#f7eee0]"/></label>
        <label className="mt-3 block text-xs font-bold text-[#765e53]">Required attribution <span className="font-normal">(source-confirmed and locked)</span><Input value={selected.attribution ?? "No verified attribution retained"} readOnly className="mt-1 bg-[#f7eee0]"/></label>
        <div className={`mt-4 rounded-xl border p-4 text-sm ${presentation?.tone === "approved" ? "border-[#8bb3aa] bg-[#eaf5f1] text-[#285d54]" : presentation?.tone === "rejected" ? "border-[#d7a08a] bg-[#fff1ea] text-[#813928]" : "border-[#edd8b3] bg-[#fff3df] text-[#765e53]"}`}><div className="flex gap-2"><ShieldAlert className="mt-0.5 shrink-0" size={18}/><div><p className="font-bold">{presentation?.title}</p><p className="mt-1 text-xs leading-relaxed">{presentation?.detail}</p></div></div></div>
        <p className="mt-3 flex gap-1 text-[11px] leading-relaxed text-[#765e53]"><CheckCircle2 size={13} className="mt-0.5 shrink-0"/>No manual licence, attribution, note, or approval action is required. Public use remains controlled by the existing managed-asset and manifest gates.</p>
      </section>
    </div>}
  </div>;
}

function Metric({ label, value, note }: { label: string; value: string | number; note: string }) { return <div className="rounded-xl border border-[#ead9c0] bg-[#fffaf0] p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#8c1e21]">{label}</p><strong className="mt-1 block font-display text-2xl text-[#4a2520]">{value}</strong><p className="mt-1 text-xs text-[#765e53]">{note}</p></div>; }
function Evidence({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) { return <div className={wide ? "sm:col-span-2" : ""}><dt className="font-bold text-[#4a2520]">{label}</dt><dd className="break-words">{value}</dd></div>; }
