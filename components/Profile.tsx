
import React from 'react';
import { User, Shield, Terminal, Database, Key, Calendar } from 'lucide-react';

interface ProfileProps {
  user: any;
  sessionsCount: number;
  filesCount: number;
}

export const Profile: React.FC<ProfileProps> = ({ user, sessionsCount, filesCount }) => {
  return (
    <div className="h-full w-full p-8 overflow-y-auto custom-scrollbar flex flex-col items-center pt-24">
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-full bg-[#10a37f] flex items-center justify-center text-4xl font-bold border-4 border-[#3d3d3d]">
            {user.email?.[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{user.email?.split('@')[0]}</h1>
            <p className="text-[#b4b4b4] text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#10a37f]" /> Professional Developer Tier
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-[#2f2f2f] border border-[#3d3d3d] p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-[#b4b4b4] text-xs font-bold uppercase mb-2">
              <Terminal className="w-4 h-4" /> Total Sessions
            </div>
            <div className="text-3xl font-bold">{sessionsCount}</div>
          </div>
          <div className="bg-[#2f2f2f] border border-[#3d3d3d] p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-[#b4b4b4] text-xs font-bold uppercase mb-2">
              <Database className="w-4 h-4" /> Files Indexed
            </div>
            <div className="text-3xl font-bold">{filesCount}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#2f2f2f]/30 border border-[#3d3d3d] rounded-xl">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-[#b4b4b4]" />
              <div>
                <div className="text-sm font-medium">Last Login</div>
                <div className="text-xs text-[#b4b4b4]">{new Date(user.last_sign_in_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#2f2f2f]/30 border border-[#3d3d3d] rounded-xl">
            <div className="flex items-center gap-4">
              <Key className="w-5 h-5 text-[#b4b4b4]" />
              <div>
                <div className="text-sm font-medium">Session ID</div>
                <div className="text-xs text-[#b4b4b4] font-mono">{user.id.slice(0, 16)}...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
