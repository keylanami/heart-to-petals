"use client";
import Link from "next/link";
import { Mail, Phone, MapPin, Users } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-dark-green border-t border-gray-200 pt-12 md:pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 mb-12">
          
          <div className="space-y-4 w-full md:max-w-lg">
            <h2 className="text-2xl font-serif font-bold text-cream-bg">HeartToPetals.</h2>
            <p className="text-gray-100/60 text-sm leading-relaxed text-justify w-full">
              Platform florist marketplace pertama di Indonesia yang memungkinkan kamu merancang buket impianmu sendiri secara digital. Kami menghubungkan perasaanmu dengan karya terbaik dari florist lokal terpercaya. 
              <br/><br/>
              <em>Curating Happiness, One Petal at a Time.</em>
            </p>

            <Link href="/about" className="inline-block w-full md:w-auto">
              <div className="group flex items-center gap-3 rounded-xl px-5 py-3 border border-cream-bg/30 text-cream-bg/80 hover:bg-cream-bg hover:text-dark-green transition-all duration-300 cursor-pointer">
                <div className="p-1 bg-cream-bg/10 rounded-full group-hover:bg-dark-green/10 transition-colors">
                    <Users size={16} />
                </div>
                <span className="text-sm font-medium">About Us & Developer Team</span>
              </div>
            </Link>
          </div>

          <div className="space-y-4 w-full md:w-auto">
            <h3 className="font-bold text-cream-bg uppercase tracking-widest text-xs">Help Center</h3>
            <div className="space-y-3">
              <p className="text-gray-100/60 text-sm">Butuh bantuan mendesak atau ingin bermitra?</p>
              <ul className="space-y-3 md:space-y-2">
                <li className="flex items-center gap-3 text-gray-100 text-sm">
                    <div className="w-8 h-8 rounded-full bg-cream-bg/10 flex items-center justify-center text-cream-bg/70 flex-shrink-0">
                        <Mail size={14} />
                    </div>
                    <span className="break-all">help@hearttopetals.com</span>
                </li>
                <li className="flex items-center gap-3 text-gray-100 text-sm">
                    <div className="w-8 h-8 rounded-full bg-cream-bg/10 flex items-center justify-center text-cream-bg/70 flex-shrink-0">
                        <Phone size={14} />
                    </div>
                    <span>+62 812-3456-7890 (Superadmin)</span>
                </li>
                <li className="flex items-center gap-3 text-gray-100 text-sm">
                    <div className="w-8 h-8 rounded-full bg-cream-bg/10 flex items-center justify-center text-cream-bg/70 flex-shrink-0">
                        <MapPin size={14} />
                    </div>
                    <span>Jakarta, Indonesia</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-50/40 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 text-center md:text-left">
          <p className="mb-4 md:mb-0">&copy; 2025 HeartToPetals. All rights reserved.</p>
          <div className="flex gap-6 md:gap-4">
            <a href="#" className="hover:text-sage-green">Privacy Policy</a>
            <a href="#" className="hover:text-sage-green">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;