import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-white/90 backdrop-blur-sm border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="font-bold text-xl text-slate-900">Vote<span className="text-indigo-600">Poll</span></span>
      </Link>
      <div className="flex gap-8">
        <Link to="/" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Trang chủ</Link>
        <Link to="/host" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Tổ chức</Link>
        <Link to="/participant" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Tham gia</Link>
      </div>
    </nav>
  );
}
