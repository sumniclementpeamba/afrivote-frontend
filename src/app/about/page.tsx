'use client';
import { Mail, Globe, ExternalLink, School, Trophy, Bot, Lightbulb, Cpu, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 py-24 px-6 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] opacity-80 animate-pulse" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-bounce duration-[10000ms]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse duration-[8000ms]" />

        <div className="relative z-10 max-w-4xl mx-auto transition-all duration-700 ease-out transform">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight animate-fade-in hover:scale-105 transition-transform duration-300 cursor-default">
            The Story Behind AfriVote
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            From a robotics lab in Kumasi to a full‑fledged digital election platform used across Africa – the journey of two Prempeh College engineers.
          </p>
        </div>
      </section>

      {/* Founders Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-center mb-12 flex items-center justify-center gap-2 group cursor-default">
          <Bot className="w-7 h-7 text-indigo-500 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
          <span>Meet the Engineers</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Clement Peamba Sumni*/}
          <div className="group bg-white dark:bg-slate-900 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 p-8 text-center transition-all duration-500 hover:-translate-y-2">
            <div className="w-32 h-32 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner overflow-hidden">
              <img
                src="/images/umat.png"
                alt="Clement Peamba Sumni"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.png';
                  e.currentTarget.onerror = null;
                }}
              />
            </div>
            <h3 className="text-2xl font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
              Clement Peamba Sumni
            </h3>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Founder & Lead Developer</p>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Full‑stack engineer with a passion for secure systems and user‑centric design.
              Clement architected the backend infrastructure and ensured the platform meets
              enterprise‑grade security standards. He previously built fintech solutions and
              led the software team in several robotics competitions.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <a href="mailto:sumniclementpeamba1955@gmail.com" className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all duration-200">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/in/sumniclementpeamba" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all duration-200">
                <ExternalLink className="w-5 h-5" />
              </a>
              <a href="https://github.com/sumniclementpeamba" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all duration-200">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Caleb Evans Larbi */}
          <div className="group bg-white dark:bg-slate-900 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 p-8 text-center transition-all duration-500 hover:-translate-y-2">
            <div className="w-32 h-32 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-inner overflow-hidden">
              <img
                src="/images/evans.jpg"
                alt="Caleb Evans Larbi"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.png';
                  e.currentTarget.onerror = null;
                }}
              />
            </div>
            <h3 className="text-2xl font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              Caleb Evans Larbi
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Founder & Product Designer</p>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              UI/UX specialist and frontend visionary. Caleb designed the entire AfriVote
              interface, focusing on simplicity and accessibility. His background in ed‑tech
              and robotics shaped the platform’s intuitive workflows, and he was the hardware
              lead for several award‑winning robotics projects.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <a href="mailto:caleblarbi22@yahoo.com" className="p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-500 hover:scale-110 active:scale-95 transition-all duration-200">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/in/calebevanslarbi" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-500 hover:scale-110 active:scale-95 transition-all duration-200">
                <ExternalLink className="w-5 h-5" />
              </a>
              <a href="https://github.com/calebevanslarbi" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-500 hover:scale-110 active:scale-95 transition-all duration-200">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It All Started – Expanded Story */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10 flex items-center justify-center gap-2 group cursor-default">
            <Lightbulb className="w-7 h-7 text-amber-500 group-hover:animate-bounce transition-transform" />
            <span>How It All Started</span>
          </h2>

          <div className="space-y-12 text-slate-600 dark:text-slate-400 leading-relaxed">
            {/* Prempeh College & Robotics */}
            <div className="group p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <School className="w-5 h-5 text-amber-500 group-hover:scale-125 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  The Prempeh College Days
                </h3>
              </div>
              <p className="text-sm sm:text-base">
                Clement and Caleb met at Prempeh College in Kumasi, Ghana – a school known for
                producing some of the brightest minds in West Africa. Both were passionate about
                technology from an early age, spending countless hours in the school’s robotics lab
                after classes. They quickly realised that they shared a common vision: using
                technology to solve real‑world problems.
              </p>
            </div>

            {/* Robotics Competitions & Awards */}
            <div className="group p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500 group-hover:rotate-12 group-hover:scale-125 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-yellow-500 transition-colors">
                  Robotics Excellence & Competition Wins
                </h3>
              </div>
              <p className="text-sm sm:text-base">
                Together, they formed a robotics team that represented Prempeh College in several
                national and international competitions. Their innovative designs and rigorous
                engineering earned them multiple awards, including first place in the Ghana Robotics
                Challenge (2020) and a special recognition at the Pan‑African Robotics Competition.
                These experiences taught them how to build reliable systems under pressure and
                reinforced their belief in teamwork and creativity.
              </p>
            </div>

            {/* Early Projects */}
            <div className="group p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-indigo-500 group-hover:rotate-45 group-hover:scale-125 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  Laying the Foundation – Smart Attendance & Water Flow Systems
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 transition-transform duration-300 hover:scale-125" /> Smart Attendance System
                  </h4>
                  <p className="text-sm mt-2">
                    An IoT‑based attendance tracker that used RFID cards and facial recognition to
                    automatically record student attendance and notify parents via SMS. Deployed
                    across three schools in Kumasi, it eliminated paper registers and reduced
                    truancy by 40%.
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 transition-transform duration-300 hover:scale-125" /> Water Flow System
                  </h4>
                  <p className="text-sm mt-2">
                    A smart water management solution that monitored flow rates and detected
                    leaks in real time, sending alerts to maintenance teams. The project won
                    the Best Innovation award at the Ashanti Regional STEM Fair and was
                    later adopted by a local water utility company.
                  </p>
                </div>
              </div>
            </div>

            {/* Birth of AfriVote */}
            <div className="group p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-purple-500 group-hover:scale-125 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                  From Robotics to Digital Democracy
                </h3>
              </div>
              <p className="text-sm sm:text-base">
                After their robotics successes, Clement and Caleb turned their attention to a
                problem they had experienced first‑hand: the chaotic, paper‑based elections at
                their school. They witnessed long queues, spoiled ballots, and results that were
                often disputed for days. They knew there had to be a better way.
              </p>
              <p className="text-sm sm:text-base mt-3">
                Combining Clement’s backend expertise with Caleb’s design skills, they built the
                first version of AfriVote in just three weeks – a simple web app that allowed
                students to vote using their phones. The trial was a massive success, and word
                spread to neighbouring schools and churches. The duo quickly added more features:
                candidate profiles, real‑time results, and downloadable PDF reports.
              </p>
              <p className="text-sm sm:text-base mt-3">
                What started as a weekend project has now evolved into a full‑featured platform
                used by organisations across Ghana. AfriVote now supports three pricing tiers
                (Free, Standard, Enterprise), advanced analytics, document extraction, and even
                public live‑sharing of results. Clement and Caleb continue to improve the system,
                driven by the same passion that once powered their award‑winning robots.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="py-16 px-6 text-center relative overflow-hidden">
        <h2 className="text-2xl font-black hover:scale-105 transition-transform duration-300 inline-block">
          Get in Touch
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Have questions or want a demo? Reach out to us – we’d love to hear from you.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <a
            href="mailto:sumniclementpeamba1955@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Mail className="w-4 h-4 animate-pulse" /> sumniclementpeamba1955@gmail.com
          </a>
          <a
            href="tel:+233531496803"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-sm hover:shadow transition-all duration-300 hover:-translate-y-0.5"
          >
            📞 +233 531 496803
          </a>
        </div>
      </section>
    </div>
  );
}