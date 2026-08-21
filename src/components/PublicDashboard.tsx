import React, { useState } from 'react';
import { sportsStore } from '../services/store';
import { SchoolMedalSummary, Result, Event, Sport, School, Certificate } from '../types';
import { DashboardCharts } from './DashboardCharts';
import { CertificateModal } from './CertificateModal';
import {
  Trophy,
  Medal,
  Users,
  School as SchoolIcon,
  Search,
  ChevronRight,
  Sparkles,
  Calendar,
  MapPin,
  Flame,
  Award,
  Filter,
  Eye,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface PublicDashboardProps {
  onNavigateTab?: (tab: string) => void;
  onSelectSchool?: (schoolId: string) => void;
}

export const PublicDashboard: React.FC<PublicDashboardProps> = ({
  onNavigateTab,
  onSelectSchool
}) => {
  const comp = sportsStore.getCurrentCompetition();
  const schools = sportsStore.getSchools();
  const sports = sportsStore.getSports();
  const events = sportsStore.getEvents();
  const students = sportsStore.getStudents();
  const coaches = sportsStore.getCoaches();
  const results = sportsStore.getResults();
  const certificates = sportsStore.getCertificates();
  const medalSummaries = sportsStore.getSchoolMedalSummary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('ALL');
  const [activeResultDetail, setActiveResultDetail] = useState<{
    event: Event;
    results: Result[];
  } | null>(null);
  const [viewCert, setViewCert] = useState<Certificate | null>(null);

  // Aggregates
  const totalGold = medalSummaries.reduce((s, m) => s + m.gold, 0);
  const totalSilver = medalSummaries.reduce((s, m) => s + m.silver, 0);
  const totalBronze = medalSummaries.reduce((s, m) => s + m.bronze, 0);

  // Filtered Results for Live stream
  const completedEvents = events.filter((e) => e.status === 'COMPLETED');

  // Filter for Search Box
  const filteredEvents = completedEvents.filter((ev) => {
    const sp = sports.find((s) => s.id === ev.sport_id);
    const evResults = results.filter((r) => r.event_id === ev.id);
    const schoolNames = evResults
      .map((r) => schools.find((s) => s.id === r.school_id)?.school_name || '')
      .join(' ');

    const matchQuery =
      !searchQuery ||
      ev.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp?.sport_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schoolNames.toLowerCase().includes(searchQuery.toLowerCase());

    const matchSport = selectedSportFilter === 'ALL' || ev.sport_id === selectedSportFilter;

    return matchQuery && matchSport;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl p-6 md:p-10 border border-blue-800/60">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-400/30">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            การแข่งขันกีฬากลุ่มโรงเรียน ประจำปีการศึกษา ๒๕๖๙
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold font-['Kanit'] tracking-tight text-white leading-tight">
            {comp.competition_name}
          </h1>

          <p className="text-slate-300 text-sm md:text-base mt-2 font-['Prompt']">
            {comp.host_org}
          </p>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-5 pt-4 border-t border-slate-700/60 text-xs md:text-sm text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>
                15 - 20 พฤศจิกายน 2569 (ประจำปี ๒๕๖๙)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{comp.venue}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-medium">กำลังดำเนินการแข่งขัน (LIVE)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {/* Card 1: Schools */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">โรงเรียนเข้าร่วม</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <SchoolIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-['Kanit'] text-slate-900">{schools.length}</span>
            <span className="text-xs text-slate-500 ml-1">แห่ง</span>
          </div>
        </div>

        {/* Card 2: Events */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">รายการแข่งขัน</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-['Kanit'] text-slate-900">{events.length}</span>
            <span className="text-xs text-slate-500 ml-1">รายการ</span>
          </div>
        </div>

        {/* Card 3: Athletes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">นักกีฬาลงทะเบียน</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-['Kanit'] text-slate-900">{students.length}</span>
            <span className="text-xs text-slate-500 ml-1">คน</span>
          </div>
        </div>

        {/* Card 4: Gold */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-100">
            <span className="text-xs font-semibold">เหรียญทอง 🥇</span>
            <span className="text-xl">🥇</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold font-['Kanit']">{totalGold}</span>
            <span className="text-xs text-amber-100 ml-1">เหรียญ</span>
          </div>
        </div>

        {/* Card 5: Silver */}
        <div className="bg-gradient-to-br from-slate-500 to-slate-600 text-white rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-200">
            <span className="text-xs font-semibold">เหรียญเงิน 🥈</span>
            <span className="text-xl">🥈</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold font-['Kanit']">{totalSilver}</span>
            <span className="text-xs text-slate-200 ml-1">เหรียญ</span>
          </div>
        </div>

        {/* Card 6: Bronze */}
        <div className="bg-gradient-to-br from-amber-700 to-amber-800 text-white rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-200">
            <span className="text-xs font-semibold">เหรียญทองแดง 🥉</span>
            <span className="text-xl">🥉</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold font-['Kanit']">{totalBronze}</span>
            <span className="text-xs text-amber-200 ml-1">เหรียญ</span>
          </div>
        </div>
      </div>

      {/* Medal Table Ranking */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-600" />
              ตารางสรุปเหรียญรางวัลรวม (Medal Standings)
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              จัดอันดับตามเกณฑ์เหรียญทอง ➔ เหรียญเงิน ➔ เหรียญทองแดง ➔ เหรียญรวม
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
            อัปเดตแบบเรียลไทม์จากระบบ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4 text-center w-16">อันดับ</th>
                <th className="py-3.5 px-4">โรงเรียน / สถานศึกษา</th>
                <th className="py-3.5 px-3 text-center bg-amber-50/70 text-amber-900 w-24">
                  🥇 ทอง
                </th>
                <th className="py-3.5 px-3 text-center bg-slate-100/70 text-slate-800 w-24">
                  🥈 เงิน
                </th>
                <th className="py-3.5 px-3 text-center bg-amber-100/50 text-amber-950 w-24">
                  🥉 ทองแดง
                </th>
                <th className="py-3.5 px-4 text-center font-bold text-slate-900 w-24">
                  รวม
                </th>
                <th className="py-3.5 px-4 text-center w-28">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {medalSummaries.map((item, index) => {
                const isTop3 = index < 3;
                const badgeColor =
                  index === 0
                    ? 'bg-amber-400 text-amber-950'
                    : index === 1
                    ? 'bg-slate-300 text-slate-900'
                    : index === 2
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-700';

                return (
                  <tr
                    key={item.school_id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      index === 0 ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${badgeColor}`}
                      >
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.logo}
                          alt={item.school_name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 font-['Prompt']">
                            {item.school_name}
                          </p>
                          <span className="text-xs text-slate-500">
                            {item.short_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-amber-700 bg-amber-50/30 font-['Kanit'] text-base">
                      {item.gold}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-700 bg-slate-100/30 font-['Kanit'] text-base">
                      {item.silver}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-amber-900 bg-amber-100/20 font-['Kanit'] text-base">
                      {item.bronze}
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-blue-900 font-['Kanit'] text-lg">
                      {item.total}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectSchool && onSelectSchool(item.school_id)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        ดูผล <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Real-time Chart.js Dashboard Charts */}
      <DashboardCharts
        medalSummaries={medalSummaries}
        results={results}
        sports={sports}
        events={events}
      />

      {/* Latest Match Results & Filter Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              ผลการแข่งขันล่าสุด (Latest Match Results)
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              ผลการแข่งขันที่ได้รับการยืนยันและออกเหรียญรางวัลแล้ว
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อรายการ, โรงเรียน..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <select
              value={selectedSportFilter}
              onChange={(e) => setSelectedSportFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">กีฬา: ทั้งหมด</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sport_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((ev) => {
            const evResults = results.filter((r) => r.event_id === ev.id);
            const sport = sports.find((s) => s.id === ev.sport_id);

            const goldRes = evResults.find((r) => r.medal === 'GOLD' || r.rank === 1);
            const silverRes = evResults.find((r) => r.medal === 'SILVER' || r.rank === 2);
            const bronzeRes = evResults.find((r) => r.medal === 'BRONZE' || r.rank === 3);

            const goldSchool = schools.find((s) => s.id === goldRes?.school_id);
            const silverSchool = schools.find((s) => s.id === silverRes?.school_id);
            const bronzeSchool = schools.find((s) => s.id === bronzeRes?.school_id);

            return (
              <div
                key={ev.id}
                className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                      {sport?.sport_icon} {sport?.sport_name}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> จบการแข่งขัน
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm md:text-base font-['Kanit'] line-clamp-1">
                    {ev.event_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    รุ่น: {ev.age_group} ({ev.grade}) | ประเภท: {ev.competition_type === 'TEAM' ? 'ทีม' : 'เดี่ยว'}
                  </p>

                  {/* Placements */}
                  <div className="space-y-2 mt-4 pt-3 border-t border-slate-200/60">
                    {goldSchool && (
                      <div className="flex items-center justify-between text-xs bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                        <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                          <span>🥇 ชนะเลิศ</span>
                        </span>
                        <strong className="text-amber-950 font-['Prompt'] font-semibold">
                          {goldSchool.short_name || goldSchool.school_name}
                        </strong>
                      </div>
                    )}

                    {silverSchool && (
                      <div className="flex items-center justify-between text-xs bg-slate-100 p-2 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-700 flex items-center gap-1.5">
                          <span>🥈 รองชนะเลิศ 1</span>
                        </span>
                        <span className="text-slate-900 font-['Prompt'] font-medium">
                          {silverSchool.short_name || silverSchool.school_name}
                        </span>
                      </div>
                    )}

                    {bronzeSchool && (
                      <div className="flex items-center justify-between text-xs bg-amber-100/40 p-2 rounded-lg border border-amber-200/40">
                        <span className="font-medium text-amber-900 flex items-center gap-1.5">
                          <span>🥉 รองชนะเลิศ 2</span>
                        </span>
                        <span className="text-slate-900 font-['Prompt'] font-medium">
                          {bronzeSchool.short_name || bronzeSchool.school_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {evResults[0]?.score ? `ผลคะแนน: ${evResults[0].score}` : 'ยืนยันผลแล้ว'}
                  </span>
                  <button
                    onClick={() => setActiveResultDetail({ event: ev, results: evResults })}
                    className="px-3 py-1.5 bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> รายชื่อนักกีฬา/ครู
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <p>ไม่พบรายการแข่งขันที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}
      </div>

      {/* Roster & Detail Modal */}
      {activeResultDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                  {sports.find((s) => s.id === activeResultDetail.event.sport_id)?.sport_name}
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-['Kanit'] mt-1">
                  {activeResultDetail.event.event_name}
                </h3>
                <p className="text-xs text-slate-500">
                  รุ่น {activeResultDetail.event.age_group} ({activeResultDetail.event.grade})
                </p>
              </div>
              <button
                onClick={() => setActiveResultDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Results by School */}
            <div className="space-y-4">
              {activeResultDetail.results.map((res) => {
                const school = schools.find((s) => s.id === res.school_id);
                const reg = sportsStore
                  .getRegistrations()
                  .find((r) => r.event_id === activeResultDetail.event.id && r.school_id === res.school_id);
                const regStudents = sportsStore.getRegistrationStudents();
                const allStudents = sportsStore.getStudents();
                const allCoaches = sportsStore.getCoaches();

                const teamStudents = reg
                  ? regStudents
                      .filter((rs) => rs.registration_id === reg.id)
                      .map((rs) => allStudents.find((s) => s.id === rs.student_id))
                      .filter(Boolean)
                  : [];

                const coach = allCoaches.find((c) => c.id === reg?.coach_id);

                // Find certificates generated for these students
                const certs = certificates.filter(
                  (c) => c.event_id === activeResultDetail.event.id && c.school_id === res.school_id
                );

                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {res.medal === 'GOLD' ? '🥇' : res.medal === 'SILVER' ? '🥈' : '🥉'}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 font-['Prompt']">
                            {res.award} : {school?.school_name}
                          </h4>
                          <p className="text-xs text-slate-500">{res.note || res.score}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-md border border-slate-200 shadow-2xs">
                        {res.medal === 'GOLD' ? 'เหรียญทอง' : res.medal === 'SILVER' ? 'เหรียญเงิน' : 'เหรียญทองแดง'}
                      </span>
                    </div>

                    {/* Student List */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> นักกีฬาผู้เข้าร่วม:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {teamStudents.map((st) => {
                          const studentCert = certs.find((c) => c.recipient_id === st?.id);
                          return (
                            <div
                              key={st?.id}
                              className="px-2.5 py-1 bg-slate-100 rounded-md flex items-center gap-1.5"
                            >
                              <span>
                                {st?.prefix} {st?.first_name} {st?.last_name}
                              </span>
                              {studentCert && (
                                <button
                                  onClick={() => setViewCert(studentCert)}
                                  className="text-blue-600 hover:text-blue-800 underline font-medium text-[11px] ml-1"
                                >
                                  เกียรติบัตร
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {coach && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600">
                          <span>
                            ครูผู้ฝึกสอน: <strong>{coach.prefix}{coach.first_name} {coach.last_name}</strong> ({coach.position})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveResultDetail(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-sm font-medium transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {viewCert && (
        <CertificateModal
          certificate={viewCert}
          onClose={() => setViewCert(null)}
        />
      )}
    </div>
  );
};
