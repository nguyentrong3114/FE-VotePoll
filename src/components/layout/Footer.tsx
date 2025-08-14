import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-white py-12 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="font-bold text-xl">Vote<span className="text-indigo-400">Poll</span></span>
            </div>
            <p className="text-slate-400 mb-4">
              Hệ thống bình chọn thời gian thực hiện đại, được xây dựng với React và ASP.NET Core SignalR.
            </p>
            <p className="text-sm text-slate-500">
              © 2025 VotePoll. Realtime polling made simple.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Tính năng</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Bình chọn realtime</li>
              <li>Giao diện thân thiện</li>
              <li>Bảo mật cao</li>
              <li>Dễ sử dụng</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Công nghệ</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>React + TypeScript</li>
              <li>ASP.NET Core</li>
              <li>SignalR</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            Được phát triển với ❤️ sử dụng công nghệ hiện đại
          </p>
        </div>
      </div>
    </footer>
  );
}
