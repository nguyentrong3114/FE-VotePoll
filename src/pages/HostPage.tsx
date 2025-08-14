import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HostPoll from "./HostPoll";

export default function HostPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Tạo cuộc bình chọn mới</h1>
            <p className="text-lg text-slate-600">Tạo câu hỏi, thêm lựa chọn và theo dõi kết quả realtime</p>
          </div>
          <HostPoll />
        </div>
      </main>
      <Footer />
    </div>
  );
}
