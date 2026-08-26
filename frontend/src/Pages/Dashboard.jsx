import React from "react";
import {ChevronRight,MessageSquare,Users,Bell,Search,User,ShieldCheck,} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";


const scrollToFeatures = () => {
    document
      .getElementById("features")
      ?.scrollIntoView({ behavior: "smooth" });
  };

export default function Home() {
  const navigate=useNavigate();
  return (
    <div className="min-h-screen bg-white text-[#12151C] font-[Inter]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

        .font-display {
          font-family: 'Sora', sans-serif;
        }

        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      <nav className="border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <img
            src={Logo}
            alt="Wavelength"
            className="h-12 cursor-pointer"
            onClick={() => navigate("/")}
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-[16px] cursor-pointer text-[#6B7280] hover:text-[#12151C] transition-colors px-3 py-2"
            >
              Sign in
            </button>

            <button
              onClick={() => navigate("/register")}
              className="text-[16px] cursor-pointer font-medium bg-[#12151C] text-white px-4 py-2 rounded-lg hover:bg-[#2A2E38] transition-colors"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
          

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
              onClick={() => navigate("/login")}
              className="group bg-[#12151C] text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#2A2E38] transition-colors cursor-pointer"
            >
              Start a conversation
              <ChevronRight
                size={18}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>

            <button
              onClick={scrollToFeatures}
              className="border border-[#E5E7EB] px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#F5F6F8] transition-colors cursor-pointer"
            >
              Learn more
            </button>
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-[#9CA3AF]">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Real-time messaging
            </span>

            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Friend connections
            </span>

            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Instant notifications
            </span>
          </div>
        </section>

        <section
          id="features"
          className="max-w-7xl mx-auto px-6 py-20 border-t border-[#E5E7EB]"
        >
          <div className="max-w-xl mb-14">
            <p className="text-sm font-semibold text-teal-600 mb-3">
              EVERYTHING IN ONE PLACE
            </p>

            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Built for the moment a message is sent
            </h2>

            <p className="text-[#6B7280] mt-4 leading-relaxed">
              Every layer of Wavelength exists to close the gap between typing
              and being heard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="group rounded-2xl border border-[#E5E7EB] bg-white p-6 hover:border-teal-200 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                <MessageSquare className="w-5 h-5" />
              </div>

              <h3 className="font-display text-lg font-semibold">
                Real-time messaging
              </h3>

              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Send and receive messages instantly with Socket.IO-powered
                real-time communication.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#E5E7EB] bg-white p-6 hover:border-teal-200 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                <Users className="w-5 h-5" />
              </div>

              <h3 className="font-display text-lg font-semibold">
                Connect with people
              </h3>

              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Find people by name or username and build your own circle
                with simple friend requests.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#E5E7EB] bg-white p-6 hover:border-teal-200 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                <Bell className="w-5 h-5" />
              </div>

              <h3 className="font-display text-lg font-semibold">
                Instant notifications
              </h3>

              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Stay updated with friend requests, activity, and other
                important events as they happen.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#E5E7EB] bg-white p-6 hover:border-teal-200 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                <Search className="w-5 h-5" />
              </div>

              <h3 className="font-display text-lg font-semibold">
                Quick user search
              </h3>

              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Search for users by name or username and instantly see their
                connection status.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#E5E7EB] bg-white p-6 hover:border-teal-200 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                <User className="w-5 h-5" />
              </div>

              <h3 className="font-display text-lg font-semibold">
                Your profile, your way
              </h3>

              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Personalize your profile with your name, bio, gender, and
                profile picture.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#E5E7EB] bg-white p-6 hover:border-teal-200 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <h3 className="font-display text-lg font-semibold">
                Built with security in mind
              </h3>

              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Authentication, protected routes, and server-side validation
                help keep your account and conversations secure.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="rounded-3xl bg-[#F8FAFC] border border-[#E5E7EB] px-6 py-14 md:px-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-sm font-semibold text-teal-600 mb-3">
                  MADE TO FEEL INSTANT
                </p>

                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                  Less waiting.
                  <br />
                  More talking.
                </h2>

                <p className="text-[#6B7280] mt-5 leading-relaxed max-w-lg">
                  Wavelength keeps communication simple. Find someone, send a
                  request, connect, and start talking without unnecessary
                  friction.
                </p>

                <button
                  onClick={() => navigate("/register")}
                  className="mt-7 bg-[#12151C] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#2A2E38] transition-colors cursor-pointer"
                >
                  Create your account
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <MessageSquare className="w-5 h-5 text-teal-600 mb-4" />
                  <h3 className="font-semibold text-sm">
                    Instant conversations
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                    Communication designed around real-time interaction.
                  </p>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <Users className="w-5 h-5 text-teal-600 mb-4" />
                  <h3 className="font-semibold text-sm">
                    Meaningful connections
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                    Build your network with simple friend management.
                  </p>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <Bell className="w-5 h-5 text-teal-600 mb-4" />
                  <h3 className="font-semibold text-sm">
                    Stay informed
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                    Important activity appears when it happens.
                  </p>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <Search className="w-5 h-5 text-teal-600 mb-4" />
                  <h3 className="font-semibold text-sm">
                    Find people quickly
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                    Search by name or username in seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-24 text-center border-t border-[#E5E7EB]">
          <p className="text-sm font-semibold text-teal-600 mb-3">
            YOUR CONVERSATION STARTS HERE
          </p>

          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Find your frequency
          </h2>

          <p className="text-[#6B7280] mt-4 max-w-md mx-auto leading-relaxed">
            Create your account, connect with people, and experience
            conversations that happen in real time.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="bg-[#12151C] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#2A2E38] transition-colors cursor-pointer"
            >
              Create account
            </button>

            <button
              onClick={() => navigate("/login")}
              className="border border-[#E5E7EB] px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#F5F6F8] transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E5E7EB] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B7280]">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Wavelength" className="h-12" />
          </div>

          <span>
            Built with MongoDB, Express, React, Node and Socket.IO
          </span>
        </div>
      </footer>
    </div>
  );
}