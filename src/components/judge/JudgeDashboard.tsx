import React, { useState } from 'react';
import { sportsStore } from '../../services/store';
import { Event, Sport, School, Result } from '../../types';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  Clock,
  Save,
  AlertCircle,
  Sparkles,
  Smartphone,
  ChevronRight,
  Medal,
  Users
} from 'lucide-react';

export const JudgeDashboard: React.FC = () => {
  const sports = sportsStore.getSports();
  const events = sportsStore.getEvents();
  const schools = sportsStore.getSchools();
  const results = sportsStore.getResults();
  const registrations = sportsStore.getRegistrations();
  const regStudents = sportsStore.getRegistrationStudents();
  const allStudents = sportsStore.getStudents();
  const allCoaches = sportsStore.getCoaches();

  const [selectedSportId, setSelectedSportId] = useState(sports[0]?.id || '');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [rank1SchoolId, setRank1SchoolId] = useState('');
  const [rank2SchoolId, setRank2SchoolId] = useState('');
  const [rank3SchoolId, setRank3SchoolId] = useState('');
  const [scoreText, setScoreText] = useState('');
  const [matchNote, setMatchNote] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const currentSport = sports.find((s) => s.id === selectedSportId);
  const filteredEvents = events.filter((e) => e.sport_id === selectedSportId);
  const currentEvent = events.find((e) => e.id === selectedEventId);

  // Participating schools in this event
  const registeredSchoolIds = registrations
    .filter((r) => r.event_id === selectedEventId && r.registration_status === 'APPROVED')
    .map((r) => r.school_id);

  const candidateSchools = schools.filter((s) => registeredSchoolIds.includes(s.id));

  const handleSelectEvent = (ev: Event) => {
    setSelectedEventId(ev.id);
    setError('');
    setSaveSuccess(false);

    // If already has results, preload them
    const existing = results.filter((r) => r.event_id === ev.id);
    const r1 = existing.find((r) => r.rank === 1);
    const r2 = existing.find((r) => r.rank === 2);
    const r3 = existing.find((r) => r.rank === 3);

    setRank1SchoolId(r1?.school_id || '');
    setRank2SchoolId(r2?.school_id || '');
    setRank3SchoolId(r3?.school_id || '');
    setScoreText(r1?.score || '');
    setMatchNote(r1?.note || '');
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedEventId) {
      setError('กรุณาเลือกรายการแข่งขัน');
      return;
    }

    if (!rank1SchoolId) {
      setError('กรุณาเลือกโรงเรียนผู้ชนะเลิศ (เหรียญทอง 🥇)');
      return;
    }

    if (rank1SchoolId === rank2SchoolId || (rank3SchoolId && (rank1SchoolId === rank3SchoolId || rank2SchoolId === rank3SchoolId))) {
      setError('โรงเรียนที่ได้รับรางวัลแต่ละอันดับต้องไม่ซ้ำกัน');
      return;
    }

    const placements: Array<{
      school_id: string;
      rank: 1 | 2 | 3 | 4;
      award: string;
      medal: 'GOLD' | 'SILVER' | 'BRONZE' | 'NONE';
      score?: string;
      note?: string;
    }> = [
      {
        school_id: rank1SchoolId,
        rank: 1,
        award: 'ชนะเลิศ',
        medal: 'GOLD',
        score: scoreText,
        note: matchNote
      }
    ];

    if (rank2SchoolId) {
      placements.push({
        school_id: rank2SchoolId,
        rank: 2,
        award: 'รองชนะเลิศอันดับ 1',
        medal: 'SILVER',
        score: scoreText,
        note: matchNote
      });
    }

    if (rank3SchoolId) {
      placements.push({
        school_id: rank3SchoolId,
        rank: 3,
        award: 'รองชนะเลิศอันดับ 2',
        medal: 'BRONZE',
        score: scoreText,
        note: matchNote
      });
    }

    // Save to store
    sportsStore.recordEventResult(selectedEventId, placements);

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-400/30">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-['Kanit']">
              ระบบบันทึกผลการแข่งขันสำหรับกรรมการ (Referee & Judge Console)
            </h1>
            <p className="text-xs md:text-sm text-purple-200 mt-0.5">
              ออกแบบให้ใช้งานง่ายบนมือถือและแท็บเล็ต ดึงรายชื่อนักกีฬาและครูอัตโนมัติ ไม่ต้องกรอกซ้ำ
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Select Sport */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-base font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">1</span>
          เลือกชนิดกีฬา
        </h2>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {sports.map((sp) => (
            <button
              key={sp.id}
              onClick={() => {
                setSelectedSportId(sp.id);
                setSelectedEventId('');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 border ${
                selectedSportId === sp.id
                  ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>{sp.sport_icon}</span>
              <span>{sp.sport_name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Select Event */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-base font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">2</span>
          เลือกรายการแข่งขัน
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredEvents.map((ev) => {
            const isSelected = ev.id === selectedEventId;
            const isDone = ev.status === 'COMPLETED';
            return (
              <button
                key={ev.id}
                onClick={() => handleSelectEvent(ev)}
                className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/30'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-mono text-slate-500 font-semibold">{ev.event_code}</span>
                    {isDone ? (
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> มีผลแล้ว
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> รอดำเนินการ
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm font-['Prompt'] line-clamp-2">
                    {ev.event_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {ev.grade} ({ev.age_group})
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Record Placements & Scores */}
      {currentEvent && (
        <form onSubmit={handleSaveResults} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">3</span>
                บันทึกผลการแข่งขัน: {currentEvent.event_name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกโรงเรียนที่ชนะเลิศและรองชนะเลิศ ระบบจะคำนวณเหรียญและเตรียมรายชื่อเกียรติบัตรทันที
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-900 rounded-full">
              {currentSport?.sport_name}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-800 text-sm rounded-xl border border-emerald-300 font-medium flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">✅ บันทึกผลการแข่งขันเรียบร้อยแล้ว!</p>
                <p className="text-xs text-emerald-700">
                  ระบบได้อัปเดตตารางเหรียญรางวัลและผูกรายชื่อนักกีฬากับเกียรติบัตรอัตโนมัติแล้ว
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Rank 1: Gold */}
            <div className="p-4 rounded-xl bg-amber-50/80 border-2 border-amber-300 space-y-2">
              <label className="block text-xs font-bold text-amber-950 flex items-center gap-2">
                <span className="text-lg">🥇</span> ชนะเลิศ (เหรียญทอง) *
              </label>
              <select
                required
                value={rank1SchoolId}
                onChange={(e) => setRank1SchoolId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="">-- เลือกโรงเรียนชนะเลิศ --</option>
                {candidateSchools.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.school_name} ({sch.short_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Rank 2: Silver */}
            <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-300 space-y-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="text-lg">🥈</span> รองชนะเลิศอันดับ 1 (เหรียญเงิน)
              </label>
              <select
                value={rank2SchoolId}
                onChange={(e) => setRank2SchoolId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="">-- เลือกโรงเรียนรองชนะเลิศอันดับ 1 --</option>
                {candidateSchools.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.school_name} ({sch.short_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Rank 3: Bronze */}
            <div className="p-4 rounded-xl bg-amber-100/40 border-2 border-amber-400/50 space-y-2">
              <label className="block text-xs font-bold text-amber-900 flex items-center gap-2">
                <span className="text-lg">🥉</span> รองชนะเลิศอันดับ 2 (เหรียญทองแดง)
              </label>
              <select
                value={rank3SchoolId}
                onChange={(e) => setRank3SchoolId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-amber-300/80 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="">-- เลือกโรงเรียนรองชนะเลิศอันดับ 2 --</option>
                {candidateSchools.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.school_name} ({sch.short_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Score & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ผลคะแนน / เวลา / เซต (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={scoreText}
                  onChange={(e) => setScoreText(e.target.value)}
                  placeholder="เช่น 3 - 1, 12.45 วินาที, 2 - 0 เซต"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หมายเหตุ / บันทึกการแข่งขัน
                </label>
                <input
                  type="text"
                  value={matchNote}
                  onChange={(e) => setMatchNote(e.target.value)}
                  placeholder="เช่น รอบชิงชนะเลิศ, ทำลายสถิติกลุ่มโรงเรียน"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              * ข้อมูลจะถูกนำไปออกเกียรติบัตรและคำนวณเหรียญอัตโนมัติ
            </span>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              บันทึกผลการแข่งขัน
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
