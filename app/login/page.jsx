"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, AlertCircle } from "lucide-react"; 
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); 
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const success = await login(formData.email, formData.password);

    if (!success) {
      setError("Invalid credentials");
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
        className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative z-10"
      >
        <div className="bg-[#1A2F24] p-8 text-center relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 border border-white/10 rounded-full"></div>
            
            <Link href="/get-started" className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-serif font-bold text-white tracking-wide mb-1">
                Welcome <span className="italic text-[#8FA89B]">Back.</span>
            </h1>
            <p className="text-white/60 text-xs uppercase tracking-widest">Sign in to continue</p>
        </div>

        <div className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2"
                  >
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}

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

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                    </div>
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

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#1A2F24] text-white py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#254132] transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {isLoading ? "Signing In..." : "Login"}
                </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-100 flex flex-col gap-3">
                <p className="text-gray-500 text-sm">
                    Don't have an account? 
                    <Link href="/register" className="text-[#1A2F24] font-bold hover:underline ml-1">
                        Register
                    </Link>
                </p>
                <Link href="#" className="text-xs text-gray-400 hover:text-[#1A2F24] transition-colors">
                    Forgot Password?
                </Link>
            </div>
        </div>
      </motion.div>
    </div>
  );
}