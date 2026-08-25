import React from "react";
import { Zap, ShieldCheck, Users, Image as ImageIcon, Hash, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";




export default function Home() {
  const navigate=useNavigate();
  return (
    <div className="min-h-screen bg-white text-[#12151C] font-[Inter]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
        .font-display { font-family: 'Sora', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <nav className="border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <img src={Logo} alt="logo" className="h-12"/>  
          

          <div className="flex items-center gap-3">
            <button
            onClick={()=>{
              navigate('/login')
            }}
             className="text-[16px] cursor-pointer text-[#6B7280] hover:text-[#12151C] transition-colors px-3 py-2">
              Sign in
            </button>
            <button
             onClick={()=>{
              navigate('/register')
            }}
             className="text-[16px] cursor-pointer font-medium bg-[#12151C] text-white px-4 py-2 rounded-lg hover:bg-[#2A2E38] transition-colors">
              Get started
            </button>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-24 pb-24 text-center">
        
          

        <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
          Two people,
          <br />
          <span className="text-teal-600">one frequency.</span>
        </h1>

        <p className="mt-6 text-[#6B7280] text-lg leading-relaxed max-w-lg mx-auto">
          Wavelength is a real-time messaging platform built on Socket.IO,
          so every message, status change, and shared file arrives the
          instant it happens, not a moment later.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <button
           onClick={()=>{
              navigate('/login')
            }}
          className="group bg-[#12151C] text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#2A2E38] transition-colors cursor-pointer">
            Start a conversation
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="border border-[#E5E7EB] px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#F5F6F8] transition-colors cursor-pointer">
            Learn more
          </button>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-[#E5E7EB]">
        <div className="max-w-xl mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Built for the moment a message is sent
          </h2>
          <p className="text-[#6B7280] mt-4 leading-relaxed">
            Every layer of Wavelength exists to close the gap between typing
            and being heard.
          </p>
        </div>

        
      </section>

     

      <section className="max-w-4xl mx-auto px-6 py-24 text-center border-t border-[#E5E7EB]">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Find your frequency
        </h2>
        <p className="text-[#6B7280] mt-4 max-w-md mx-auto">
          Create an account and start a conversation that actually feels
          instant.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          
          <button className="bg-[#12151C] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#2A2E38] transition-colors whitespace-nowrap cursor-pointer">
            Create account
          </button>
        </div>
      </section>

      <footer className="border-t border-[#E5E7EB] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B7280]">
          <div className="flex items-center gap-2 ">
            <img src={Logo} alt="logo" className="h-12"/>  
          </div>
          <span>Built with MongoDB, Express, React, Node and Socket.IO</span>
        </div>
      </footer>
    </div>
  );
}