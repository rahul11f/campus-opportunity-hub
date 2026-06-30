import { Bot, Sparkles, Key, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AIToolsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API & AI Tools</h1>
          <p className="text-slate-500 text-sm mt-1">Manage Gemini API keys and automated OCR ingestion pipelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-card rounded-xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">API Configuration</h3>
              <p className="text-xs text-slate-500">Manage your Google Gemini API access</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Gemini API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value="************************"
                  readOnly
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-500 text-sm focus:outline-none"
                />
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200">Update</button>
              </div>
              <p className="text-xs text-green-700 mt-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-green-600" /> Connection active and verified.</p>
            </div>
          </div>
        </div>

        <div className="admin-card rounded-xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">WhatsApp & Telegram OCR</h3>
              <p className="text-xs text-slate-500">Automated opportunity extraction</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-2">WhatsApp Webhook <span className="bg-green-100 text-green-700 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold">ACTIVE</span></p>
                <p className="text-xs text-slate-500 mt-1">Listening for forwarded notices</p>
              </div>
              <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors">Configure</button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-2">PDF Parser <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold">PAUSED</span></p>
                <p className="text-xs text-slate-500 mt-1">Automatic PDF circular extraction</p>
              </div>
              <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors">Enable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
