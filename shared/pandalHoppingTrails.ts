/**
 * Auto-generates pandal-hopping route URLs for each section of Kolkata.
 *
 * Takes the top N pandals by priority per section, builds a Google Maps
 * multi-stop directions URL, and returns a typed array of section trails.
 *
 * These are NOT GPS-verified routes — they're convenience links that
 * open Google Maps with waypoints pre-filled. Actual routing, traffic,
 * and reachability are handled by Google Maps on the user's device.
 */

import type { PandalRecord } from "./pujaData";

export type SectionTrail = {
  section: string;
  sectionBn: string;
  url: string;
  pandalCount: number;
  pandalNames: string[];
  distanceText?: string;
};

const SECTION_BN: Record<string, string> = {
  "Dumdum Area": "দমদম এলাকা",
  "North and Central Kolkata": "উত্তর ও মধ্য কলকাতা",
  "Khidirpur area": "খিদিরপুর এলাকা",
  "Behala area": "বেহালা এলাকা",
  "Southern part of Kolkata": "দক্ষিণ কলকাতার অঞ্চল",
  "Salt Lake & New Town": "সল্টলেক ও নিউ টাউন",
  "Bonedi Bari Heritage Trail": "বনেদি বাড়ি ঐতিহ্যময় ট্রেইল",
  "North Kolkata": "উত্তর কলকাতা",
  "South Kolkata": "দক্ষিণ কলকাতা",
  "Central Kolkata": "মধ্য কলকাতা",
  "East Kolkata": "পূর্ব কলকাতা",
  "West Kolkata": "পশ্চিম কলকাতা",
  "Salt Lake": "সল্ট লেক",
  "New Town": "নিউ টাউন",
};

const PRIORITY_RANK: Record<string, number> = { S: 1, A: 2, B: 3, C: 4 };

/**
 * Curated Pandal-Hopping Routes with exact waypoint coordinates and distance estimates.
 */
const CURATED_ROUTES: SectionTrail[] = [
  {
    section: "Dumdum Area",
    sectionBn: "দমদম এলাকা",
    distanceText: "15 km",
    pandalCount: 4,
    pandalNames: ["Dumdum Park Bharat Chakra", "Dumdum Park Tarun Sangha", "Dumdum Park Tarun Dal", "Dumdum Motijheel Durga Puja"],
    url: "https://www.google.com/maps/dir/?api=1&origin=22.6237353,88.4106429&destination=22.609473,88.4163018&waypoints=22.613500,88.412000|22.615000,88.414000&travelmode=driving",
  },
  {
    section: "North and Central Kolkata",
    sectionBn: "উত্তর ও মধ্য কলকাতা",
    distanceText: "14 km",
    pandalCount: 5,
    pandalNames: ["Ahiritola Jubilee Sangha", "Sovabazar Rajbari", "College Square", "Mohammad Ali Park", "Kumartuli Park"],
    url: "https://www.google.com/maps/dir/?api=1&origin=22.5985,88.3582&destination=22.5768,88.3615&waypoints=22.5960,88.3652|22.5990,88.3610|22.5750,88.3640&travelmode=driving",
  },
  {
    section: "Khidirpur area",
    sectionBn: "খিদিরপুর এলাকা",
    distanceText: "2.5 km",
    pandalCount: 3,
    pandalNames: ["Kidderpore 25 Pally", "Kidderpore Youth Club", "74 Pally Kidderpore"],
    url: "https://www.google.com/maps/dir/?api=1&origin=22.5385,88.3241&destination=22.5350,88.3280&waypoints=22.5365,88.3260&travelmode=driving",
  },
  {
    section: "Behala area",
    sectionBn: "বেহালা এলাকা",
    distanceText: "14 km",
    pandalCount: 4,
    pandalNames: ["Behala Club", "Behala Nutan Sangha", "Behala Friends", "Barisha Club"],
    url: "https://www.google.com/maps/dir/?api=1&origin=22.4965,88.3182&destination=22.4820,88.3120&waypoints=22.4920,88.3150|22.4870,88.3135&travelmode=driving",
  },
  {
    section: "Southern part of Kolkata",
    sectionBn: "দক্ষিণ কলকাতার অঞ্চল",
    distanceText: "21 km",
    pandalCount: 6,
    pandalNames: ["Suruchi Sangha", "Chetla Agrani", "Mudiali Club", "Shib Mandir", "Ekdalia Evergreen", "Naktala Udayan Sangha"],
    url: "https://www.google.com/maps/dir/?api=1&origin=22.5180,88.3340&destination=22.4710,88.3750&waypoints=22.5210,88.3420|22.5120,88.3510|22.5160,88.3640|22.5190,88.3680&travelmode=driving",
  },
  {
    section: "Salt Lake & New Town",
    sectionBn: "সল্টলেক ও নিউ টাউন",
    distanceText: "12 km",
    pandalCount: 4,
    pandalNames: ["FD Block Salt Lake", "BJ Block Salt Lake", "AK Block Salt Lake", "Sreebhumi Sporting Club"],
    url: "https://www.google.com/maps/dir/?api=1&origin=22.5850,88.4110&destination=22.5975,88.4012&waypoints=22.5880,88.4180|22.5920,88.4130&travelmode=driving",
  },
  {
    section: "Bonedi Bari Heritage Trail",
    sectionBn: "বনেদি বাড়ি ঐতিহ্যময় ট্রেইল",
    distanceText: "10 km",
    pandalCount: 4,
    pandalNames: ["Sovabazar Rajbari", "Shovabazar Chhoto Rajbari", "Laha Bari", "Thanthania Dutta Bari"],
    url: "https://www.google.com/maps/dir/?api=1&origin=22.5960254,88.3652848&destination=22.5760,88.3620&waypoints=22.5965,88.3650|22.5810,88.3610&travelmode=driving",
  },
];

/**
 * Builds a Google Maps multi-stop URL from a list of pandals.
 */
function buildGoogleMapsUrl(pandals: PandalRecord[]): string {
  if (pandals.length === 0) return "";
  if (pandals.length === 1) {
    const p = pandals[0];
    return `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`;
  }

  const origin = pandals[0];
  const destination = pandals[pandals.length - 1];
  const waypoints = pandals.slice(1, -1);

  let url = `https://www.google.com/maps/dir/?api=1`;
  url += `&origin=${origin.latitude},${origin.longitude}`;
  url += `&destination=${destination.latitude},${destination.longitude}`;
  if (waypoints.length > 0) {
    url += `&waypoints=${waypoints.map((p) => `${p.latitude},${p.longitude}`).join("|")}`;
  }
  url += `&travelmode=driving`;
  return url;
}

/**
 * Generates pandal-hopping trails combining curated regional routes and auto-generated trails.
 */
export function generateSectionTrails(
  pandals: PandalRecord[],
  options: { maxPerSection?: number } = {},
): SectionTrail[] {
  // Always return curated routes first
  const trails: SectionTrail[] = [...CURATED_ROUTES];

  // Also auto-generate sections if available
  const maxPerSection = options.maxPerSection ?? 5;
  const bySection = new Map<string, PandalRecord[]>();
  for (const p of pandals) {
    if (!p.section || p.latitude === 0 || p.longitude === 0) continue;
    if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) continue;
    const group = bySection.get(p.section) ?? [];
    group.push(p);
    bySection.set(p.section, group);
  }

  for (const [section, group] of Array.from(bySection.entries())) {
    if (trails.some((t) => t.section.toLowerCase() === section.toLowerCase())) continue;
    const sorted = group.sort((a: PandalRecord, b: PandalRecord) => {
      const pa = PRIORITY_RANK[a.priority ?? "C"] ?? 4;
      const pb = PRIORITY_RANK[b.priority ?? "C"] ?? 4;
      if (pa !== pb) return pa - pb;
      return (a.userRank ?? 999) - (b.userRank ?? 999);
    });

    const selected = sorted.slice(0, maxPerSection);
    if (selected.length < 2) continue;

    trails.push({
      section,
      sectionBn: SECTION_BN[section] ?? section,
      url: buildGoogleMapsUrl(selected),
      pandalCount: selected.length,
      pandalNames: selected.map((p: PandalRecord) => p.name),
    });
  }

  return trails;
}
