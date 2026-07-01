import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Briefcase, Sparkles, Car, Users, 
  FileText, CheckCircle2, ChevronRight, Award
} from 'lucide-react';

export default function AboutV2() {
  const { t } = useTranslation();

  const credibility = t('about.credibility', { returnObjects: true }) as string[];
  const stats = t('about.stats', { returnObjects: true }) as Array<{ label: string; value: string }>;

  const team = [
    {
      role: "Chief Underwriting Advisor",
      icon: ShieldCheck,
      dept: "Credit & Risk Assessment",
      experience: "15+ Years Experience",
      bio: "Former senior retail loan underwriter. Evaluates applicant files against bank credit policies and guides on repairing profile metrics to secure approval.",
      color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400"
    },
    {
      role: "SME & Commercial Finance Lead",
      icon: Briefcase,
      dept: "Business Lending Desk",
      experience: "12+ Years Experience",
      bio: "Expert in SME balance sheet analysis, cash-flow assessment, and structuring working capital limits or unsecured enterprise financing.",
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400"
    },
    {
      role: "Digital Journey Architect",
      icon: Sparkles,
      dept: "Lending Infrastructure",
      experience: "10+ Years Experience",
      bio: "Builds our secure consent-driven document routing pipelines, rules engines, and privacy filters protecting applicant credentials.",
      color: "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-400"
    },
    {
      role: "Retail Portfolio Coordinator",
      icon: Car,
      dept: "Vehicle & Asset Finance",
      experience: "14+ Years Experience",
      bio: "Specializes in retail auto, commercial fleet, and asset-backed credit evaluations. Direct coordinator with dealer networks and NBFC underwriters.",
      color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400"
    }
  ];

  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Award size={12} /> Reimagining Loan Advisory
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              About <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Click India Capital</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
              "We believe every financial decision deserves expert attention, and every borrower deserves a trusted partner."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Horizontal Credibility Tagline Strip */}
      <div className="bg-slate-950 text-slate-400 py-6 border-b border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-y-3 gap-x-8 text-xs sm:text-sm font-bold tracking-wider uppercase">
            {credibility.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Philosophy Details Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl font-extrabold text-white">Our Foundations</h2>
            <div className="space-y-4 text-slate-400 text-sm md:text-base leading-relaxed">
              <p className="text-slate-200 font-semibold text-lg">{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
              <p>{t('about.p3')}</p>
              <p>{t('about.p4')}</p>
              <p>{t('about.p5')}</p>
            </div>
            
            <div className="text-slate-300 italic border-l-4 border-blue-500 pl-6 py-2 bg-white/[0.01] rounded-r-xl border-t border-b border-r border-white/[0.02] p-4">
              "{t('about.p6')}"
            </div>
          </div>

          {/* Stats Bento Blocks */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {stats && stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex flex-col justify-center hover:border-slate-800 transition-all"
              >
                <div className="text-3xl md:text-4xl font-black text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">{stat.label}</div>
              </div>
            ))}
            
            {/* Added Extra Cred Block to make it 2x2 Bento grid if count is odd, or just to reinforce */}
            <div className="col-span-2 p-6 rounded-2xl bg-gradient-to-br from-blue-950/20 to-indigo-950/20 border border-blue-500/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Looking for a Loan Diagnosis?</h4>
                <p className="text-xs text-slate-400">Evaluate profile readiness instantly.</p>
              </div>
              <a 
                href="/v2/eligibility" 
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <ChevronRight size={18} />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Advisory Team Grid Section */}
      <section className="py-24 border-t border-slate-900 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Users size={12} /> Advisory Desk
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Our Expert Advisory Team</h2>
            <p className="text-slate-400 text-sm md:text-base">
              Backed by industry veterans. Click India Capital connects you directly with credit, policy, and underwriting specialists, bypassing call-center clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {team.map((member, index) => {
              const Icon = member.icon;
              return (
                <motion.div 
                  key={index}
                  whileHover={{ y: -4 }}
                  className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.04] flex flex-col justify-between hover:border-slate-800 transition-all relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                  
                  <div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center mb-6 border`}>
                      <Icon size={22} />
                    </div>
                    
                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-1">
                      {member.dept}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {member.role}
                    </h3>
                    
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-900 mt-8 pt-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Advisory Desk</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      {member.experience}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA section inside layout covers the footer */}
    </div>
  );
}
