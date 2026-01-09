"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link"; // Ganti import Navbar dengan Link
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  Code, 
  Heart, 
  Sprout, 
  Coffee, 
  Palette, 
  ArrowDownRight,
  Terminal,
  ArrowLeft 
} from "lucide-react";

const TEAM = [
  {
    id: 1,
    name: "Keyla Namira Johan",
    role: "Frontend Magician",
    favFlower: "White Lily",
    quote: "Turning coffee into clean code & beautiful petals.",
    image: "/assets/dev1.jpg", 
    color: "bg-[#E8F1EE]" 
  },
  {
    id: 2,
    name: "Revaldo Joe Atkins Bukit",
    role: "Backend Wizard",
    favFlower: "Sunflowers",
    quote: "Designing experiences that bloom in your heart.",
    image: "/assets/dev2.jpg",
    color: "bg-[#F5E6D3]" 
  },
  {
    id: 3,
    name: "Masefal Anjesa Loja",
    role: "UI Artisan",
    favFlower: "White Lily",
    quote: "Turning coffee into clean code & beautiful petals.",
    image: "/assets/dev1.jpg", 
    color: "bg-[#E8F1EE]" 
  },
  {
    id: 4,
    name: "Joan Orlando Purba",
    role: "UX Wanderer",
    favFlower: "Sunflowers",
    quote: "Designing experiences that bloom in your heart.",
    image: "/assets/dev2.jpg",
    color: "bg-[#F5E6D3]" 
  }
];

const Marquee = ({ text }) => {
  return (
    <div className="relative flex overflow-x-hidden bg-dark-green py-6 -rotate-1 shadow-xl my-20 border-y border-white/10">
      <div className="animate-marquee whitespace-nowrap flex gap-8">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-4xl font-serif italic text-cream-bg/50 font-light tracking-widest uppercase">
            {text} <span className="mx-4 text-sage-green">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default function AboutPage() {
  const [hoveredMember, setHoveredMember] = useState(null);
  const [scrolled, setScrolled] = useState(false); 
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-cream-bg min-h-screen flex flex-col" ref={containerRef}>
      
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}
      />

      <div className={`fixed top-0 left-0 z-50 p-6 md:p-8 transition-all duration-500 ease-out`}>
        <Link href="/" className="group inline-flex items-center gap-3">
            <div 
                className={`
                    flex items-center gap-3 px-2 py-2 pr-6 rounded-full transition-all duration-300
                    ${scrolled 
                        ? "bg-white/90 backdrop-blur-md border border-dark-green/10 shadow-lg pl-2" 
                        : "bg-transparent pl-0"
                    }
                `}
            >
                <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:-translate-x-1
                    ${scrolled 
                        ? "bg-dark-green text-white border-transparent" 
                        : "bg-transparent border-dark-green/30 text-dark-green group-hover:bg-dark-green group-hover:text-white group-hover:border-transparent"
                    }
                `}>
                    <ArrowLeft size={18} />
                </div>

                <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5 ${scrolled ? "text-gray-400" : "text-sage-green"}`}>
                        Return to
                    </span>
                    <span className={`font-serif italic text-lg leading-none ${scrolled ? "text-dark-green" : "text-dark-green"}`}>
                        HeartToPetals
                    </span>
                </div>
            </div>
        </Link>
      </div>

      <main className="flex-1 relative z-10 overflow-x-hidden">
        <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-[70vh] flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sage-green font-bold tracking-[0.3em] text-sm uppercase mb-4 ml-2">The Story Behind</p>
            <h1 className="text-[12vw] md:text-[8vw] leading-[0.85] font-serif text-dark-green font-bold">
              More Than <br/>
              <span className="italic font-light ml-[10vw] text-sage-green/80">Just Flowers.</span>
            </h1>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mt-12 gap-8">
              <div className="max-w-md ml-2">
                <p className="text-gray-500 text-lg leading-relaxed">
                  Kami percaya bahwa setiap kelopak punya cerita. HeartToPetals lahir dari keinginan sederhana: menghubungkan perasaanmu dengan karya seni florist lokal.
                </p>
              </div>
              <motion.div 
                style={{ y }}
                className="hidden md:block"
              >
                <ArrowDownRight size={64} className="text-dark-green" strokeWidth={1} />
              </motion.div>
            </div>
          </motion.div>
        </section>

        <Marquee text="Curating Happiness" />

        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="md:col-span-2 bg-dark-green rounded-[3rem] p-10 flex flex-col justify-between text-cream-bg relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-sage-green/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
              <Heart size={48} className="text-sage-green mb-6" />
              <div>
                <h3 className="text-4xl font-serif mb-4">Bridging Emotions</h3>
                <p className="text-white/60 text-lg max-w-md">
                  Teknologi bukan penghalang rasa. Kami membangun jembatan digital agar ketulusanmu sampai ke tangan orang tersayang tanpa terhalang jarak.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-[#E8F1EE] rounded-[3rem] p-10 flex flex-col justify-center items-center text-center border border-sage-green/20"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Code size={32} className="text-dark-green" />
              </div>
              <h4 className="font-bold text-dark-green text-xl mb-2">Modern Tech</h4>
              <p className="text-gray-500 text-sm">Built with Next.js & Passion.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[3rem] p-10 flex flex-col justify-between border border-gray-100"
            >
              <Sprout size={48} className="text-sage-green" />
              <div>
                <h4 className="font-bold text-dark-green text-2xl mb-2">Local Growth</h4>
                <p className="text-gray-500">Memberdayakan UMKM Florist lokal untuk Go Digital.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-[#F5E6D3] rounded-[3rem] p-10 flex flex-row items-center justify-between overflow-hidden"
            >
              <div className="z-10">
                <h3 className="text-3xl font-serif text-dark-green mb-2">Artistry First</h3>
                <p className="text-dark-green/60">Setiap buket adalah kanvas, dan florist adalah senimannya.</p>
              </div>
              <Palette size={120} strokeWidth={0.5} className="text-dark-green/10 -mr-10 -mb-10 rotate-12" />
            </motion.div>

          </div>
        </section>

        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-6xl md:text-8xl font-serif text-dark-green font-bold tracking-tighter opacity-20">
              THE MINDS
            </h2>
            <h2 className="text-6xl md:text-8xl font-serif text-dark-green font-bold tracking-tighter -mt-10 md:-mt-16 ml-10 md:ml-20">
              BEHIND IT
            </h2>
          </div>

          <div className="space-y-4">
            {TEAM.map((member) => (
              <motion.div
                key={member.id}
                className="group relative border-t border-dark-green/20 py-12 md:py-16 cursor-pointer"
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 mix-blend-difference text-dark-green group-hover:translate-x-4 transition-transform duration-500">
                  <h3 className="text-4xl md:text-6xl font-serif font-bold group-hover:text-sage-green transition-colors">
                    {member.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <span className="text-sm font-bold uppercase tracking-widest border border-dark-green/30 px-4 py-1 rounded-full">
                      {member.role}
                    </span>
                    <ArrowDownRight className="opacity-0 group-hover:opacity-100 -rotate-90 group-hover:rotate-0 transition-all duration-500" />
                  </div>
                </div>

                <AnimatePresence>
                  {hoveredMember === member.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.95, rotate: 2 }}
                      transition={{ duration: 0.3 }}
                      className={`absolute top-[-50%] right-0 md:right-20 w-72 md:w-96 p-6 rounded-3xl shadow-2xl z-20 pointer-events-none ${member.color}`}
                    >
                      <div className="aspect-square bg-gray-200 rounded-2xl mb-4 overflow-hidden">
                        <div className="w-full h-full bg-dark-green/10 flex items-center justify-center text-dark-green/30">
                           <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-dark-green/50">
                           <Coffee size={14} /> Fav Flower: {member.favFlower}
                        </div>
                        <p className="font-serif text-2xl text-dark-green leading-tight italic">
                          "{member.quote}"
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            <div className="border-t border-dark-green/20"></div>
          </div>
        </section>

        <section className="bg-dark-green py-24 text-center px-6">
            <Terminal size={48} className="text-sage-green mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">
                Crafted with <span className="italic text-sage-green">Precision</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4 text-cream-bg/60 text-sm font-mono uppercase tracking-widest">
                <span>Next.js 16</span> • 
                <span>Tailwind CSS</span> • 
                <span>Framer Motion</span> • 
                <span>Lucide Icons</span> • 
                <span>Vercel</span> •
                <span>MapCn</span>
            </div>
        </section>

      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}