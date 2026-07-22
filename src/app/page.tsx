"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import data from "@/data/professionals.json";
import type { Data, Pro } from "@/lib/types";
import { ProCard } from "@/components/pro-card";

const DB = data as Data;

const LOCATIONS = ["All of Sydney", ...Array.from(new Set(DB.professionals.map((p) => p.location)))];

const PRICE = [
  { k: "u40", l: "Under $40", t: (p: Pro) => p.priceVal !== null && p.priceVal < 40 },
  { k: "40-60", l: "$40–60", t: (p: Pro) => p.priceVal !== null && p.priceVal >= 40 && p.priceVal <= 60 },
  { k: "60-100", l: "$60–100", t: (p: Pro) => p.priceVal !== null && p.priceVal > 60 && p.priceVal <= 100 },
  { k: "100", l: "$100+", t: (p: Pro) => p.priceVal !== null && p.priceVal > 100 },
];
const RATING = [
  { k: "any", l: "Any", v: 0 },
  { k: "4", l: "4+", v: 4 },
  { k: "4.5", l: "4.5+", v: 4.5 },
];
const RESP = [
  { k: "any", l: "Any", v: 999999 },
  { k: "1h", l: "Within 1 hour", v: 60 },
  { k: "1d", l: "Within 1 day", v: 1440 },
];
const DIST = [
  { k: "5", l: "5 km", v: 5 },
  { k: "10", l: "10 km", v: 10 },
  { k: "25", l: "25 km", v: 25 },
  { k: "50", l: "50 km", v: 50 },
];
const SORTS = [
  { k: "best", l: "Best match" },
  { k: "rating", l: "Rating" },
  { k: "resp", l: "Response time" },
  { k: "dist", l: "Distance" },
];

export default function Home() {
  const [categoryId, setCategoryId] = useState(DB.categories[0].id);
  const [draftCategory, setDraftCategory] = useState(DB.categories[0].id);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [draftLocation, setDraftLocation] = useState(LOCATIONS[0]);
  const [banner, setBanner] = useState(true);
  const [price, setPrice] = useState<string | null>(null);
  const [rating, setRating] = useState("any");
  const [resp, setResp] = useState("any");
  const [dist, setDist] = useState<string | null>(null);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [specs, setSpecs] = useState<string[]>([]);
  const [sort, setSort] = useState("best");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  // zero state: nothing is shown until the user actually runs a search
  const [searched, setSearched] = useState(false);
  const toggleSection = (k: string) =>
    setCollapsed((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });

  // lock background scroll while the mobile filter sheet is open
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  const category = DB.categories.find((c) => c.id === categoryId)!;
  const pool = DB.professionals.filter(
    (p) => p.category === categoryId && (location === LOCATIONS[0] || p.location === location)
  );

  const runSearch = () => {
    setCategoryId(draftCategory);
    setLocation(draftLocation);
    setSpecs([]); setPrice(null); setRating("any"); setResp("any"); setDist(null); setOnlineOnly(false);
    setSearched(true);
  };
  // quick-start from the zero state: pick a category and search it directly
  const searchFor = (catId: string) => {
    setDraftCategory(catId);
    setDraftLocation(LOCATIONS[0]);
    setCategoryId(catId);
    setLocation(LOCATIONS[0]);
    setSpecs([]); setPrice(null); setRating("any"); setResp("any"); setDist(null); setOnlineOnly(false);
    setSearched(true);
  };
  // back to the zero state with the search bar reset. deliberately does NOT
  // execute a search — auto-running one here looks like the app searched by
  // itself, which is misleading in a demo.
  const tryNewSearch = () => {
    setDraftCategory(DB.categories[0].id);
    setDraftLocation(LOCATIONS[0]);
    setSearched(false);
    window.scrollTo(0, 0);
  };
  const clearFilters = () => {
    setPrice(null); setRating("any"); setResp("any"); setDist(null); setSpecs([]); setOnlineOnly(false);
  };
  const toggleSpec = (s: string) =>
    setSpecs((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]));

  const results = useMemo(
    () =>
      pool.filter((p) => {
        if (price) { if (p.priceVal === null) return false; const b = PRICE.find((x) => x.k === price); if (b && !b.t(p)) return false; }
        if (rating !== "any") { const v = RATING.find((x) => x.k === rating)!.v; if (p.rating === null || p.rating < v) return false; }
        if (resp !== "any") { const v = RESP.find((x) => x.k === resp)!.v; if (p.responseMins > v) return false; }
        if (dist) { const v = DIST.find((x) => x.k === dist)!.v; if (p.distance > v) return false; }
        if (onlineOnly && !p.online) return false;
        if (specs.length && !specs.some((s) => p.specialties.includes(s))) return false;
        return true;
      }),
    [pool, price, rating, resp, dist, onlineOnly, specs]
  );

  const sorted = useMemo(() => {
    const arr = [...results];
    arr.sort((a, b) => {
      if (sort === "rating") return (b.rating ?? -1) - (a.rating ?? -1);
      if (sort === "resp") return a.responseMins - b.responseMins;
      if (sort === "dist") return a.distance - b.distance;
      if (a.topMatch !== b.topMatch) return a.topMatch ? -1 : 1;
      return (b.rating ?? -1) - (a.rating ?? -1);
    });
    return arr;
  }, [results, sort]);

  // closest matches for the empty state: always the SAME category, nearest first,
  // ignoring filters/location. never suggest another category (no gardeners for a
  // plumber search) — an empty category simply has no closest matches to show.
  const closest = useMemo(
    () =>
      DB.professionals
        .filter((p) => p.category === categoryId)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3),
    [categoryId]
  );

  const chips: { id: string; l: string; clr: () => void }[] = [];
  if (price) chips.push({ id: "p", l: PRICE.find((x) => x.k === price)!.l, clr: () => setPrice(null) });
  if (rating !== "any") chips.push({ id: "r", l: RATING.find((x) => x.k === rating)!.l + " rating", clr: () => setRating("any") });
  if (resp !== "any") chips.push({ id: "rt", l: RESP.find((x) => x.k === resp)!.l, clr: () => setResp("any") });
  if (dist) chips.push({ id: "d", l: "Within " + DIST.find((x) => x.k === dist)!.l, clr: () => setDist(null) });
  if (onlineOnly) chips.push({ id: "on", l: "Online sessions", clr: () => setOnlineOnly(false) });
  specs.forEach((s) => chips.push({ id: "s" + s, l: s, clr: () => toggleSpec(s) }));

  const Pill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={
        "px-3.5 py-1.5 rounded-full text-sm border transition " +
        (active
          ? "border-[#2d7af1] bg-[#2d7af1]/10 text-[#2d7af1] font-medium"
          : "border-slate-200 bg-white text-[#111637] hover:border-slate-300")
      }
    >
      {children}
    </button>
  );

  const FilterSection = ({ id, title, value, children }: { id: string; title: string; value: string; children: React.ReactNode }) => {
    const open = !collapsed.has(id);
    return (
      <div className="border-b border-slate-100 py-4">
        <button onClick={() => toggleSection(id)} className="w-full flex items-center justify-between">
          <span className="font-semibold text-[#111637] text-[15px]">{title}</span>
          <span className="flex items-center gap-2">
            <span className="text-[#2d7af1] text-sm font-medium">{value}</span>
            <ChevronDown className={"h-4 w-4 text-slate-400 transition " + (open ? "" : "-rotate-90")} />
          </span>
        </button>
        {open && <div className="mt-3">{children}</div>}
      </div>
    );
  };

  // shared filter controls, rendered in both the desktop sidebar and the mobile sheet
  const filterBody = (
    <>
      <FilterSection id="price" title="Price" value={price ? PRICE.find((x) => x.k === price)!.l : "Any"}>
        <div className="flex flex-wrap gap-2">{PRICE.map((p) => <Pill key={p.k} active={price === p.k} onClick={() => setPrice(price === p.k ? null : p.k)}>{p.l}</Pill>)}</div>
      </FilterSection>
      <FilterSection id="rating" title="Rating" value={rating !== "any" ? RATING.find((x) => x.k === rating)!.l : "Any"}>
        <div className="flex flex-wrap gap-2">{RATING.map((r) => <Pill key={r.k} active={rating === r.k} onClick={() => setRating(r.k)}>{r.l}</Pill>)}</div>
      </FilterSection>
      <FilterSection id="resp" title="Response time" value={resp !== "any" ? RESP.find((x) => x.k === resp)!.l : "Any"}>
        <div className="flex flex-wrap gap-2">{RESP.map((r) => <Pill key={r.k} active={resp === r.k} onClick={() => setResp(r.k)}>{r.l}</Pill>)}</div>
      </FilterSection>
      <FilterSection id="dist" title="Distance" value={dist ? DIST.find((x) => x.k === dist)!.l : "Any"}>
        <div className="flex flex-wrap gap-2">{DIST.map((d) => <Pill key={d.k} active={dist === d.k} onClick={() => setDist(dist === d.k ? null : d.k)}>{d.l}</Pill>)}</div>
      </FilterSection>
      <FilterSection id="online" title="Online sessions" value={onlineOnly ? "Online" : "Any"}>
        <div className="flex flex-wrap gap-2">
          <Pill active={!onlineOnly} onClick={() => setOnlineOnly(false)}>Any</Pill>
          <Pill active={onlineOnly} onClick={() => setOnlineOnly(true)}>Online available</Pill>
        </div>
      </FilterSection>

      {/* clear divider between universal and category-specific filters */}
      <div className="-mx-5 h-2.5 bg-slate-100 mt-1" />

      <div className="pt-4">
        <div className="text-[12px] font-bold tracking-wider text-slate-500 mb-1">{category.label.toUpperCase()} FILTERS</div>
        <div className="py-4">
          <button onClick={() => toggleSection("spec")} className="w-full flex items-center justify-between">
            <span className="font-semibold text-[#111637] text-[15px]">
              {category.specialtyLabel}
              {specs.length > 0 && <span className="text-[#2d7af1] font-medium"> · {specs.length}</span>}
            </span>
            <ChevronDown className={"h-4 w-4 text-slate-400 transition " + (!collapsed.has("spec") ? "" : "-rotate-90")} />
          </button>
          {!collapsed.has("spec") && (
            <div className="space-y-1 mt-3">
              {category.specialties.map((s) => (
                <label key={s} className="flex items-center gap-2.5 py-1 cursor-pointer text-[15px] text-[#111637]">
                  <span className={"h-5 w-5 rounded border flex items-center justify-center shrink-0 " + (specs.includes(s) ? "bg-[#2d7af1] border-[#2d7af1]" : "border-slate-300 bg-white")}>
                    {specs.includes(s) && <span className="text-white text-xs">✓</span>}
                  </span>
                  <input type="checkbox" className="hidden" checked={specs.includes(s)} onChange={() => toggleSpec(s)} />
                  {s}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const locationLabel = location === LOCATIONS[0] ? "Sydney, NSW" : location;

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* top bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="text-2xl font-bold text-[#111637] tracking-tight">bark</span>
          <span className="text-sm text-slate-500">Log in</span>
        </div>
      </div>

      {/* hero */}
      <div style={{ background: "#8891a8" }}>
        <div className="max-w-6xl mx-auto px-5 py-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Find top-rated {searched ? category.label : "professionals"} near you
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex-1 bg-white rounded-lg px-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <select value={draftCategory} onChange={(e) => setDraftCategory(e.target.value)} className="flex-1 py-2.5 text-sm bg-transparent outline-none text-[#111637]">
                {DB.categories.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
              </select>
            </div>
            <div className="flex-1 bg-white rounded-lg px-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <select value={draftLocation} onChange={(e) => setDraftLocation(e.target.value)} className="flex-1 py-2.5 text-sm bg-transparent outline-none text-[#111637]">
                {LOCATIONS.map((l) => (<option key={l} value={l}>{l}</option>))}
              </select>
            </div>
            <button onClick={runSearch} className="bg-[#2d7af1] text-white rounded-lg px-5 py-2.5 text-sm font-medium">Search</button>
          </div>
        </div>
      </div>

      {/* zero state: no search has run yet */}
      {!searched && (
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div className="bg-white rounded-2xl border border-slate-100 px-8 py-14 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[#2d7af1]/10 flex items-center justify-center">
              <Search className="h-5 w-5 text-[#2d7af1]" />
            </div>
            <div className="text-lg font-semibold text-[#111637] mb-1">Start your search</div>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Choose a service and a location above, then hit Search to see professionals near you.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-slate-500 text-sm">Popular:</span>
              {DB.categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => searchFor(c.id)}
                  className="px-3.5 py-1.5 rounded-full text-sm border border-slate-200 bg-white text-[#111637] hover:border-slate-300 transition"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* body */}
      {searched && (
      <div className="max-w-6xl mx-auto px-5 py-6 flex gap-6 items-start">
        {/* sidebar — desktop only */}
        <aside className="hidden lg:block w-[300px] shrink-0 bg-white rounded-2xl border border-slate-100 px-5 pb-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto thin-scrollbar">
          <div className="flex items-center justify-between pt-4 pb-1">
            <span className="text-[13px] font-bold tracking-wider text-slate-500">FILTERS</span>
            <button onClick={clearFilters} className="text-[#2d7af1] text-sm font-medium">Clear all</button>
          </div>
          {filterBody}
        </aside>

        {/* results */}
        <main className="flex-1 min-w-0">
          {banner && (
            <div className="relative rounded-2xl p-5 mb-5 flex flex-col sm:flex-row sm:items-center gap-4 overflow-hidden"
              style={{ background: "linear-gradient(110deg,#0e122e,#312e81 60%,#2d5fd4)" }}>
              <div className="flex items-start sm:items-center gap-4 flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/banner.png" alt="" className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 object-contain" />
                <div className="pr-6 sm:pr-0">
                  <div className="text-[11px] font-bold tracking-wider text-indigo-200">RECOMMENDED</div>
                  <div className="text-white font-semibold">Answer a few questions, get up to 5 tailored quotes</div>
                  <div className="text-indigo-200 text-sm">Matched to exactly what you need</div>
                </div>
              </div>
              <button className="bg-white text-[#2d7af1] font-semibold px-4 py-2.5 rounded-xl text-sm w-full sm:w-auto shrink-0">Get tailored quotes</button>
              <button onClick={() => setBanner(false)} className="absolute top-3 right-3 sm:static sm:ml-6 sm:self-start text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#111637]">
                {results.length === 0
                  ? "0 results for your search"
                  : results.length === pool.length
                  ? `${results.length} ${category.label.toLowerCase()} matching your search`
                  : `${results.length} of ${pool.length} match your filters`}
              </h2>
              <p className="text-slate-500 text-sm">
                {results.length === 0
                  ? `${category.label} in ${locationLabel}`
                  : "Top matches are selected by AI based on your request and their expertise"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSheetOpen(true)}
                className="lg:hidden flex items-center gap-1.5 text-sm text-[#111637] border border-slate-200 rounded-lg px-3.5 py-2 bg-white"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters{chips.length > 0 && ` (${chips.length})`}
              </button>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none text-sm text-[#111637] border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 bg-white outline-none cursor-pointer"
                >
                  {SORTS.map((s) => (<option key={s.k} value={s.k}>Sort by: {s.l}</option>))}
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {chips.map((c) => (
                <button key={c.id} onClick={c.clr} className="flex items-center gap-1.5 pl-3.5 pr-2.5 py-1.5 rounded-full bg-[#2d7af1]/10 border border-[#2d7af1] text-[#2d7af1] text-[13px] font-medium">
                  {c.l}<X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <div>
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center mb-6">
                <div className="text-lg font-semibold text-[#111637] mb-1">No exact matches for your search</div>
                <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">
                  We couldn&apos;t find {category.label.toLowerCase()} that match all your criteria in this area. Try adjusting your filters or search location.
                </p>
                {pool.length === 0 ? (
                  <button onClick={tryNewSearch} className="bg-[#2d7af1] text-white font-medium px-6 py-2.5 rounded-xl">Try new search</button>
                ) : (
                  <button onClick={clearFilters} className="bg-[#2d7af1] text-white font-medium px-6 py-2.5 rounded-xl">Clear filters</button>
                )}
              </div>

              {closest.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-[#111637]">Closest matches</h3>
                  <p className="text-slate-500 text-sm mb-3">These professionals are nearby but may not match all your criteria</p>
                  <div className="space-y-4">{closest.map((p) => <ProCard key={p.id} pro={p} />)}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">{sorted.map((p) => <ProCard key={p.id} pro={p} />)}</div>
          )}
        </main>
      </div>
      )}

      {/* mobile filter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] bg-white rounded-t-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="text-base font-bold text-[#111637]">Filters</span>
              <div className="flex items-center gap-4">
                <button onClick={clearFilters} className="text-[#2d7af1] text-sm font-medium">Clear all</button>
                <button onClick={() => setSheetOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="overflow-y-auto px-5 flex-1 thin-scrollbar">
              {filterBody}
            </div>
            <div className="px-5 py-4 border-t border-slate-100">
              <button onClick={() => setSheetOpen(false)} className="w-full bg-[#2d7af1] text-white font-medium py-3 rounded-xl">
                Show {results.length} {results.length === 1 ? "result" : "results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
