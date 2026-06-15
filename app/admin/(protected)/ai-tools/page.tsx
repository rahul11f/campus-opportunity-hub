import { Bot, Sparkles, Key, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AIToolsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">API & AI Tools</h1>
          <p className="text-gray-400 text-sm mt-1">Manage Gemini API keys and automated OCR ingestion pipelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-card rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">API Configuration</h3>
              <p className="text-xs text-gray-400">Manage your Google Gemini API access</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Gemini API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value="************************"
                  readOnly
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-gray-500 text-sm focus:outline-none"
                />
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">Update</button>
              </div>
              <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Connection active and verified.</p>
            </div>
          </div>
        </div>

        <div className="admin-card rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">WhatsApp & Telegram OCR</h3>
              <p className="text-xs text-gray-400">Automated opportunity extraction</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-medium text-white flex items-center gap-2">WhatsApp Webhook <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold">ACTIVE</span></p>
                <p className="text-xs text-gray-400 mt-1">Listening for forwarded notices</p>
              </div>
              <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors">Configure</button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-medium text-white flex items-center gap-2">PDF Parser <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">PAUSED</span></p>
                <p className="text-xs text-gray-400 mt-1">Automatic PDF circular extraction</p>
              </div>
              <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors">Enable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
