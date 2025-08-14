import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ParticipantPoll from "../components/ParticipantPoll";

export default function ParticipantPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Tham gia bình chọn</h1>
            <p className="text-lg text-slate-600">Nhập mã phòng để tham gia và bình chọn cho lựa chọn yêu thích</p>
          </div>
          <ParticipantPoll />
        </div>
      </main>
      <Footer />
    </div>
  );
}
