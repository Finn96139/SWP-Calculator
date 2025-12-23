import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Download, FileText, User, TrendingUp, 
  Wallet, ArrowUpRight, AlertCircle, Info, Landmark, Settings2 
} from 'lucide-react';

const App = () => {
  // State Management
  const [clientName, setClientName] = useState('');
  const [investment, setInvestment] = useState(10000000);
  const [monthlyWd, setMonthlyWd] = useState(60000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(25);
  const [deferYears, setDeferYears] = useState(0);
  const [stepUp, setStepUp] = useState(5);
  const [schedule, setSchedule] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  const reportRef = useRef();

  // Finnovators Branding
  const logoUrl = "https://www.finnovators.in/assets/images/logo.svg";
  const fallbackLogo = "https://placehold.co/240x80/f97316/ffffff?text=FINNOVATORS";

  // Calculate SWP Schedule whenever inputs change
  useEffect(() => {
    let balance = investment;
    let currentMonthlyWD = monthlyWd;
    let totalWithdrawn = 0;
    const newSchedule = [];

    for (let y = 1; y <= years; y++) {
      let opening = balance;
      let yearInterest = 0;
      let yearWD = 0;

      for (let m = 1; m <= 12; m++) {
        let mInterest = balance * (rate / 100 / 12);
        balance += mInterest;
        yearInterest += mInterest;

        // Apply withdrawals only after deferment period
        if (y > deferYears) {
          let wd = Math.min(balance, currentMonthlyWD);
          balance -= wd;
          yearWD += wd;
        }
      }

      totalWithdrawn += yearWD;
      newSchedule.push({
        year: y,
        opening: Math.round(opening),
        withdrawal: Math.round(yearWD),
        interest: Math.round(yearInterest),
        closing: Math.round(balance > 0 ? balance : 0),
      });

      // Apply annual step-up after deferment starts
      if (y > deferYears) {
        currentMonthlyWD *= (1 + stepUp / 100);
      }
      if (balance <= 0) balance = 0;
    }
    setSchedule(newSchedule);
  }, [investment, monthlyWd, rate, years, deferYears, stepUp]);

  // Formatting Helper
  const formatInr = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  // PDF Export Logic
  const handleDownloadPDF = () => {
    setIsExporting(true);
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => {
      setTimeout(() => {
        const element = reportRef.current;
        const opt = {
          margin: [10, 10, 10, 10],
          filename: `${clientName || 'Client'}_SWP_Report.pdf`,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        window.html2pdf().set(opt).from(element).save().then(() => setIsExporting(false));
      }, 500);
    };
    document.head.appendChild(script);
  };

  const totalWithdrawn = schedule.reduce((acc, curr) => acc + curr.withdrawal, 0);
  const finalBalance = schedule.length > 0 ? schedule[schedule.length - 1].closing : 0;
  const wealthGains = finalBalance + totalWithdrawn - investment;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 pb-12">
      {/* Top Navigation / Controls */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-orange-100 p-2 rounded-xl">
            <User className="text-orange-600" size={20} />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Prospect</label>
            <input
              type="text"
              placeholder="Full Name..."
              className="text-lg font-bold outline-none border-b-2 border-transparent focus:border-orange-500 w-full bg-transparent placeholder:text-slate-300"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-orange-200 active:scale-95"
        >
          <Download size={19} />
          Generate Report
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Input Controls */}
        {!isExporting && (
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 sticky top-32">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Settings2 className="text-orange-500" size={16} />
                Parameters
              </h2>

              <div className="space-y-8">
                {/* Investment Slider */}
                <div>
                  <div className="flex justify-between mb-3 items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase">Lump Sum</label>
                    <span className="text-lg font-black text-orange-600">{formatInr(investment)}</span>
                  </div>
                  <input
                    type="range" min="100000" max="100000000" step="100000"
                    value={investment} onChange={(e) => setInvestment(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>

                {/* SWP Slider */}
                <div>
                  <div className="flex justify-between mb-3 items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase">Initial Monthly SWP</label>
                    <span className="text-lg font-black text-orange-600">{formatInr(monthlyWd)}</span>
                  </div>
                  <input
                    type="range" min="1000" max="1000000" step="1000"
                    value={monthlyWd} onChange={(e) => setMonthlyWd(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Return Rate (%)</label>
                    <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold focus:ring-2 ring-orange-100 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Tenure (Years)</label>
                    <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold focus:ring-2 ring-orange-100 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Defer Period</label>
                    <input type="number" value={deferYears} onChange={(e) => setDeferYears(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold focus:ring-2 ring-orange-100 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Step-up (%)</label>
                    <input type="number" value={stepUp} onChange={(e) => setStepUp(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold focus:ring-2 ring-orange-100 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Report Canvas */}
        <div ref={reportRef} className={`${isExporting ? 'lg:col-span-12 p-10 bg-white' : 'lg:col-span-8'} space-y-8`}>
          
          {/* Visual Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-[6px] border-orange-500 pb-8 gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">SWP PROJECTION</h1>
              <div className="flex items-center gap-2">
                <div className="h-2 w-12 bg-orange-500 rounded-full" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm italic">
                  Curated for: <span className="text-slate-900 not-italic">{clientName || "Our Valued Investor"}</span>
                </p>
              </div>
            </div>
            <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain" onError={(e) => { e.target.src = fallbackLogo; }} />
          </div>

          {/* Statement Format Section */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Landmark size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Executive Summary</span>
              </div>
              <p className="text-xl md:text-2xl leading-[1.6] font-medium text-slate-100">
                This personalized financial projection outlines a lump sum investment of <span className="text-orange-400 font-bold underline decoration-slate-700 underline-offset-8">{formatInr(investment)}</span>, 
                strategically positioned at an expected rate of return of <span className="text-orange-400 font-bold">{rate}% per annum</span>. 
                {deferYears > 0 ? (
                  <> After a planned deferment period of <span className="text-orange-400 font-bold">{deferYears} years</span>, </>
                ) : " "}
                the portfolio is scheduled to provide a monthly Systematic Withdrawal (SWP) starting at <span className="text-orange-400 font-bold">{formatInr(monthlyWd)}</span>. 
                {stepUp > 0 ? (
                  <> To counter inflation, the withdrawal amount is modeled to increase by <span className="text-orange-400 font-bold">{stepUp}% annually</span> </>
                ) : " "}
                over a total duration of <span className="text-orange-400 font-bold">{years} years</span>.
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Amount Withdrawn', value: formatInr(totalWithdrawn), icon: Wallet, color: 'blue' },
              { label: 'Projected End Corpus', value: formatInr(finalBalance), icon: TrendingUp, color: 'orange' },
              { label: 'Total Wealth Growth', value: formatInr(wealthGains), icon: ArrowUpRight, color: 'emerald' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm transition-transform hover:-translate-y-1">
                <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl w-fit mb-6`}>
                  <stat.icon size={28} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-2xl font-black text-slate-900`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm break-inside-avoid">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                Capital Growth Trajectory
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={schedule}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/10000000).toFixed(1)}Cr`} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} formatter={(v) => formatInr(v)} />
                    <Area type="monotone" dataKey="closing" stroke="#f97316" strokeWidth={5} fill="url(#chartGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm break-inside-avoid">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                Cashflow Distribution
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={schedule}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} formatter={(v) => formatInr(v)} />
                    <Bar dataKey="withdrawal" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden break-before-page">
            <div className="p-8 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Yearly Performance Audit</h3>
              <FileText size={20} className="text-slate-300" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Year</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Opening Corpus</th>
                    <th className="px-8 py-5 text-[10px] font-black text-rose-500 uppercase tracking-widest text-right">Withdrawal</th>
                    <th className="px-8 py-5 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-right">Projected Yield</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Closing Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5 text-sm font-bold text-slate-400">Yr {row.year}</td>
                      <td className="px-8 py-5 text-sm font-semibold text-slate-600 text-right">{formatInr(row.opening)}</td>
                      <td className="px-8 py-5 text-sm font-bold text-rose-600 text-right">{row.withdrawal > 0 ? `-${formatInr(row.withdrawal)}` : '—'}</td>
                      <td className="px-8 py-5 text-sm font-semibold text-emerald-600 text-right">+{formatInr(row.interest)}</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900 text-right">{formatInr(row.closing)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 break-inside-avoid">
            <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
              <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <AlertCircle size={16} /> Market Disclosure
              </h4>
              <p className="text-[11px] leading-relaxed text-amber-800/70 font-medium">
                Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. 
                This projection is a mathematical model based on assumed rates and does not guarantee actual returns.
              </p>
            </div>
            <div className="bg-slate-100 rounded-3xl p-8 border border-slate-200">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Info size={16} /> Technical Notes
              </h4>
              <ul className="text-[11px] leading-relaxed text-slate-500 space-y-2 list-disc pl-4 font-medium">
                <li>Annual step-up increment: <strong>{stepUp}%</strong></li>
                <li>Strategic Deferment period: <strong>{deferYears} Year(s)</strong></li>
                <li>Compounding is calculated on a monthly basis.</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 mt-12 border-t border-slate-200 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Finnovators Solutions Pvt Ltd</p>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">AMFI Registered Mutual Fund Distributor</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
