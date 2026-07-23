"use client";

import { useState } from "react";
import {
  MapPin, Users, Briefcase, Clock, Check, Sparkles,
  MessageSquare, ChevronDown, Star, BadgeCheck, Flame, Rocket, CircleDollarSign,
  Video, CircleUserRound,
} from "lucide-react";
import type { Pro } from "@/lib/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="h-4 w-4"
          fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
          stroke="#f59e0b"
        />
      ))}
    </span>
  );
}

export function ProCard({ pro }: { pro: Pro }) {
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);

  const viewProfile = (
    <button className="text-[#2d7af1] text-sm font-medium">View profile</button>
  );
  const sendMessage = (
    // per Figma: text-only button, no background fill (only Request quote gets the light bg)
    <button className="w-full text-[#2d7af1] text-sm font-medium rounded-lg py-2 flex items-center justify-center gap-1.5">
      <MessageSquare className="h-4 w-4" fill="currentColor" stroke="white" strokeWidth={1.5} /> Send message
    </button>
  );
  const requestQuote = (
    <button className="w-full bg-[#2d7af1]/10 text-[#2d7af1] text-sm font-medium rounded-lg py-2 flex items-center justify-center gap-1.5">
      <CircleDollarSign className="h-4 w-4" fill="currentColor" stroke="white" strokeWidth={1.5} /> Request quote
    </button>
  );

  // Layout 2 (per Figma card components): name + rating on line 1, location on line 2,
  // status badges on line 3. Rating wraps under the name on narrow (mobile) widths.
  const showBadgeRow = pro.state !== "reviewed" || pro.topMatch;
  const header = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {/* line 1: name (+ verified) with the rating inline for reviewed pros */}
        <div className="flex items-center gap-x-2 gap-y-1 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="font-medium text-[#111637] text-[17px]">{pro.name}</span>
            {pro.verified && <BadgeCheck className="h-[18px] w-[18px] text-[#2d7af1] shrink-0" fill="#2d7af1" stroke="white" />}
          </span>
          {pro.state === "reviewed" && pro.rating !== null && (
            <span className="flex items-center gap-1">
              <Stars rating={pro.rating} />
              <span className="font-semibold text-[#111637] text-sm">{pro.rating.toFixed(1)}</span>
              <span className="text-slate-500 text-sm">({pro.reviews})</span>
            </span>
          )}
        </div>
        {/* line 2: location (pin hidden on mobile per Figma; navy on desktop) */}
        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
          <MapPin className="hidden sm:block h-4 w-4 text-[#1d234f] shrink-0" /> {pro.location} · {pro.distance} km
        </div>
        {/* line 3: status badges */}
        {showBadgeRow && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {pro.state === "new" ? (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#f8fbd1] text-[#3b416d]">
                <Rocket className="h-3.5 w-3.5" fill="currentColor" strokeWidth={1.5} /> New on Bark
              </span>
            ) : pro.state !== "reviewed" ? (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#f3f4fb] text-[#3b416d]">
                <Star className="h-3.5 w-3.5" fill="currentColor" strokeWidth={1.5} /> No reviews yet
              </span>
            ) : null}
            {pro.topMatch && (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#eff6ff] text-[#3b416d]">
                <Flame className="h-3.5 w-3.5" fill="currentColor" strokeWidth={1.5} /> Top Match
              </span>
            )}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        {pro.priceVal !== null ? (
          <>
            <span className="text-xl font-medium text-[#111637]">${pro.priceVal}</span>
            <span className="text-slate-500 text-sm">/{pro.priceUnit}</span>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-[#3b416d] font-medium">
            <CircleDollarSign className="h-5 w-5 shrink-0" fill="currentColor" stroke="white" strokeWidth={1.5} /> On demand
          </span>
        )}
      </div>
    </div>
  );

  // trust signals / specialties / bio / why-match — full width below the header on mobile
  const content = (
    <>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-[#111637]">
        {pro.hires > 0 && (
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-[#2d7af1]" />{pro.hires} hires on Bark</span>
        )}
        <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-[#2d7af1]" />{pro.years} years in business</span>
        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#2d7af1]" />{pro.responseMins} min response time</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-[#1d234f] mt-2">
        <span>{pro.specialties.slice(0, 3).join(" · ")}</span>
        {pro.specialties.length > 3 && (
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">+{pro.specialties.length - 3} more</span>
        )}
      </div>

      <p className="text-slate-500 text-sm mt-3 leading-relaxed">
        {more
          ? pro.bio + " We keep it flexible around your schedule and check in on progress regularly. "
          : pro.bio + " "}
        <button onClick={() => setMore((m) => !m)} className="text-[#2d7af1] underline font-medium">
          {more ? "See less" : "See more"}
        </button>
      </p>

      {/* the AI summary justifies why this pro was picked, so it only appears on Top Match */}
      {pro.topMatch && (
      <div className="mt-4 rounded-xl border border-violet-200 bg-[#eef0fc] overflow-hidden">
        <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3">
          <span className="font-medium text-[#6b47d9]">Why this match</span>
          <span className="flex items-center gap-2 text-slate-500 text-sm">
            <Sparkles className="h-4 w-4 text-[#6b47d9]" /> AI Summary
            <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
          </span>
        </button>
        {open && (
          <div className="px-4 pb-4">
            <div className="text-slate-500 text-[13px] mb-2.5">Matched to what you asked for</div>
            <div className="space-y-2">
              {pro.why.map((r, i) => {
                const isRating = /rated|across \d+ review/i.test(r);
                return (
                  <div key={i} className="flex items-center gap-2.5 text-[#111637] text-sm">
                    <Check className="h-4 w-4 text-[#6b47d9] shrink-0" />
                    <span className="flex items-center gap-1.5">
                      {isRating && <Star className="h-3.5 w-3.5 shrink-0" fill="#111637" stroke="#111637" />}
                      {r}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}
    </>
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex gap-4 sm:gap-5">
        {/* avatar rail — carries the CTAs on desktop only */}
        <div className="w-16 sm:w-[132px] shrink-0 flex flex-col items-center">
          <div className="relative h-16 w-16 sm:h-[104px] sm:w-[104px]">
            {pro.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pro.photo} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              <div className="h-full w-full rounded-xl bg-slate-200 flex items-center justify-center">
                <CircleUserRound className="h-9 w-9 sm:h-14 sm:w-14 text-[#3b416d]" strokeWidth={1.5} />
              </div>
            )}
            {pro.online && (
              /* the icon replaced the old "Available Online" badge, so it explains itself on hover */
              <span className="group absolute bottom-1 right-1">
                <span className="rounded-md sm:rounded-lg bg-white/90 p-1 sm:p-1.5 flex items-center justify-center shadow-sm cursor-default">
                  <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="#1d234f" stroke="#1d234f" strokeWidth={1.5} />
                </span>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1d234f] px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
                >
                  Available online
                </span>
              </span>
            )}
          </div>
          <div className="hidden sm:flex sm:flex-col sm:items-center w-full">
            <div className="mt-3">{viewProfile}</div>
            <div className="mt-4 w-full flex flex-col gap-2.5">
              {sendMessage}
              {requestQuote}
            </div>
          </div>
        </div>

        {/* header beside the avatar; on desktop the rest of the content lives here too */}
        <div className="flex-1 min-w-0">
          {header}
          <div className="hidden sm:block">{content}</div>
        </div>
      </div>

      {/* mobile: full-width content + CTAs below the header row */}
      <div className="sm:hidden">
        {content}
        <div className="mt-4 flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {sendMessage}
            {requestQuote}
          </div>
          <div className="text-center">{viewProfile}</div>
        </div>
      </div>
    </div>
  );
}
