"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passMatch, setPassMatch] = useState(false);


  useEffect(() => {
    if (formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError("Password tidak cocok");
        setPassMatch(false);
      } else {
        setError("");
        setPassMatch(true);
      }
    } else {
      setError("");
      setPassMatch(false);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok!");
      return;
    }

    setIsLoading(true);

    const success = await register(
      formData.name,
      formData.email,
      formData.password
    );

    if (!success) {
      setError("Registrasi gagal");
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F3F4F6] relative flex items-center justify-center p-6 font-sans">
      
    
      <div className="absolute inset-0 opacity-40 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#1A2F24 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative z-10"
      >
        
        <div className="bg-[#1A2F24] p-8 text-center relative">
            <Link href="/" className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-serif font-bold text-white tracking-wide mb-1">
                Join the <span className="italic text-[#8FA89B]">Craft.</span>
            </h1>
            <p className="text-white/60 text-xs uppercase tracking-widest">Create your floral identity</p>
        </div>

        <div className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
                
      
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A2F24] transition-colors" size={18} />
                        <input 
                            type="text" 
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1A2F24] focus:ring-1 focus:ring-[#1A2F24] transition-all"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                </div>

                
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A2F24] transition-colors" size={18} />
                        <input 
                            type="email" 
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1A2F24] focus:ring-1 focus:ring-[#1A2F24] transition-all"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>

               
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A2F24] transition-colors" size={18} />
                            <input 
                                type="password" 
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1A2F24] focus:ring-1 focus:ring-[#1A2F24] transition-all"
                                placeholder="••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A2F24] transition-colors" size={18} />
                            <input 
                                type="password" 
                                required
                                className={`w-full bg-gray-50 border rounded-lg pl-11 pr-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-all
                                    ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-[#1A2F24] focus:ring-[#1A2F24]"}
                                `}
                                placeholder="••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            />
                            {/* Validation Icon */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {passMatch && <CheckCircle2 size={16} className="text-green-600" />}
                                {error && <AlertCircle size={16} className="text-red-500" />}
                            </div>
                        </div>
                    </div>
                </div>

                
                {error && (
                    <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-red-500 text-xs font-medium mt-1">
                        * {error}
                    </motion.p>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading || error || !formData.password || !formData.confirmPassword}
                    className="w-full bg-[#1A2F24] text-white py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#254132] transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {isLoading ? "Creating Account..." : "Register"}
                </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <p className="text-gray-500 text-sm">
                    Already have an account? 
                    <Link href="/login" className="text-[#1A2F24] font-bold hover:underline ml-1">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}