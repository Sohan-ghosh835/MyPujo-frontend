import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() { return <AppShell><div className="container grid min-h-[65vh] place-items-center py-16 text-center"><div><p className="eyebrow">Wrong turn</p><h1 className="font-display mt-2 text-5xl font-bold text-[#4a2520]">This path isn’t on tonight’s parikrama.</h1><p className="mt-4 text-sm text-[#765e53]">Return to PujoParikroma and choose another way through the city.</p><Button asChild className="mt-7 rounded-xl bg-[#8c1e21] hover:bg-[#671214]"><Link href="/">Back home</Link></Button></div></div></AppShell>; }
