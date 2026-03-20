import { Music, Crop, Palette, RefreshCw } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isDarkMode }) {
  const tabs = [
    { id: 'yt', label: 'YT to MP3', icon: <Music size={24} /> },
    { id: 'crop', label: 'SOCIAL MEDIA CROPPER', icon: <Crop size={24} /> },
    { id: 'palette', label: 'PALETTE GENERATOR', icon: <Palette size={24} /> },
    { id: 'convert', label: 'IMAGE CONVERTER', icon: <RefreshCw size={24} /> }
  ];

  return (
    <div className={`w-80 h-full p-6 flex flex-col border-r-4 z-20 ${isDarkMode ? 'border-dark-accent bg-dark-bg/80 border-r-4' : 'border-white bg-white/40'} backdrop-blur-lg`}>
      {/* Text-based RUMITOOLBOX logo (No AI images!) */}
      <div className="mb-12 mt-4 text-center">
        <div className="inline-block bg-black/10 px-6 py-4 rounded-3xl border border-white/10">
        <h1 className="text-4xl font-black tracking-widest" style={{
          textShadow: isDarkMode ? '3px 3px 0 #FF2A93, -1px -1px 0 #6DE2FA' : '3px 3px 0 #FFA6D9, -1px -1px 0 #ffffff'
        }}>
          RUMI<br/>TOOLBOX
        </h1>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform
              ${activeTab === tab.id 
                ? (isDarkMode ? 'bg-gradient-to-r from-dark-accent to-pastel-purple text-white scale-105' 
                              : 'bg-white text-pastel-purple scale-105')
                : 'hover:bg-white/10 hover:scale-[1.02]'
              }
            `}
          >
            {tab.icon}
            <span className="text-left w-full leading-tight">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto text-center opacity-50 text-sm font-bold tracking-wider">
        Y somos amigos ✨
      </div>
    </div>
  );
}
