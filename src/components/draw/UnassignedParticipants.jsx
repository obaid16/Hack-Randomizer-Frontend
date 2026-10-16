'use client';

import { Users, Info, Shield, GraduationCap } from 'lucide-react';

/**
 * Displays any participants who could not be accommodated into a complete team.
 */
export default function UnassignedParticipants({ unassigned = {} }) {
  const { secondYears = [], firstYears = [], mentors = [] } = unassigned;
  const totalLeftover = secondYears.length + firstYears.length + mentors.length;

  if (totalLeftover === 0) return null;

  return (
    <div className="mt-12 bg-white rounded-xl border border-border p-5 shadow-clean no-print">
      <div className="flex items-center gap-2 mb-2 text-secondaryText">
        <Info size={16} className="text-secondaryText" />
        <h4 className="font-display font-bold text-sm text-primaryText">
          Unassigned Participants ({totalLeftover} Total Reserved)
        </h4>
      </div>
      <p className="text-xs text-secondaryText mb-4 leading-relaxed">
        To maintain strict team composition (exactly 1 Second-Year + 2 First-Years + 1 Unique Mentor), the following participants were not assigned to a core team. They remain eligible as alternates or floating contributors.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Second-Years */}
        {secondYears.length > 0 && (
          <div className="p-3.5 rounded-lg bg-canvas border border-border/80">
            <div className="flex items-center gap-1.5 font-bold text-primaryText mb-2 text-xs">
              <Shield size={13} className="text-accent" />
              <span>Second-Year Students ({secondYears.length})</span>
            </div>
            <ul className="space-y-1">
              {secondYears.map((name, i) => (
                <li key={i} className="text-secondaryText pl-2 border-l border-accent/40 font-medium">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* First-Years */}
        {firstYears.length > 0 && (
          <div className="p-3.5 rounded-lg bg-canvas border border-border/80">
            <div className="flex items-center gap-1.5 font-bold text-primaryText mb-2 text-xs">
              <Users size={13} className="text-secondaryText" />
              <span>First-Year Students ({firstYears.length})</span>
            </div>
            <ul className="space-y-1">
              {firstYears.map((name, i) => (
                <li key={i} className="text-secondaryText pl-2 border-l border-slate-300 font-medium">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mentors */}
        {mentors.length > 0 && (
          <div className="p-3.5 rounded-lg bg-canvas border border-border/80">
            <div className="flex items-center gap-1.5 font-bold text-primaryText mb-2 text-xs">
              <GraduationCap size={13} className="text-mentor-DEFAULT" />
              <span>Reserve Mentors ({mentors.length})</span>
            </div>
            <ul className="space-y-1">
              {mentors.map((name, i) => (
                <li key={i} className="text-mentor-DEFAULT pl-2 border-l border-mentor-DEFAULT/40 font-medium">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
