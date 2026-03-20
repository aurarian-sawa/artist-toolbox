import { useState } from 'react';
import Sidebar from './components/Sidebar';
import YtDownloader from './components/YtDownloader';
import SocialCropper from './components/SocialCropper';
import PaletteGenerator from './components/PaletteGenerator';
import ImageConverter from './components/ImageConverter';
import { FolderOpen } from 'lucide-react';

function App() {
  const themes = [
    { id: 'dark', name: 'Dark Void', classes: 'bg-[#1a1a2e] text-white' },
    { id: 'pastel', name: 'Pastel Dream', classes: 'bg-gradient-to-br from-[#a18cd1] to-[#fbc2eb] text-[#1a1a2e]' },
    { id: 'sunset', name: 'Sunset Glow', classes: 'bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] text-[#2c001e]' },
    { id: 'forest', name: 'Minty Forest', classes: 'bg-gradient-to-br from-[#84fab0] to-[#8fd3f4] text-[#0f381f]' },
    { id: 'ocean', name: 'Deep Ocean', classes: 'bg-gradient-to-br from-[#00c6fb] to-[#005bea] text-white' },
    { id: 'grape', name: 'Grape Soda', classes: 'bg-gradient-to-br from-[#9b23ea] to-[#5f72bd] text-white' }
  ];

  const [activeTab, setActiveTab] = useState('yt');
  const [activeThemeId, setActiveThemeId] = useState('dark');
  const [saveDirectory, setSaveDirectory] = useState('');

  const currentTheme = themes.find(t => t.id === activeThemeId) || themes[0];

  const handleSetDirectory = async () => {
    if (window.electronAPI) {
      const dir = await window.electronAPI.selectDirectory();
      if (dir) {
        setSaveDirectory(dir);
      }
    } else {
      alert("Electron API not available in browser dev mode.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'yt': return <YtDownloader saveDirectory={saveDirectory} onSetDirectory={handleSetDirectory} />;
      case 'crop': return <SocialCropper saveDirectory={saveDirectory} onSetDirectory={handleSetDirectory} />;
      case 'palette': return <PaletteGenerator />;
      case 'convert': return <ImageConverter />;
      default: return <YtDownloader saveDirectory={saveDirectory} onSetDirectory={handleSetDirectory} />;
    }
  };

  return (
    <div className={`flex w-screen h-screen ${currentTheme.classes} font-sans relative overflow-hidden`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={activeThemeId === 'dark'} />
      
      <main className="flex-1 p-8 relative z-10 flex flex-col overflow-hidden">
        {/* Top right window controls & settings */}
        <div className="absolute top-4 right-4 flex gap-3 z-50 items-center">
          <select 
            value={activeThemeId}
            onChange={(e) => setActiveThemeId(e.target.value)}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold uppercase tracking-widest text-sm outline-none cursor-pointer border-none"
            title="Choose Theme"
          >
            {themes.map(t => <option key={t.id} value={t.id} className="text-black bg-white">{t.name}</option>)}
          </select>
          <button 
            onClick={handleSetDirectory}
            className="px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-sm bg-white/10 hover:bg-white/20 backdrop-blur-md transition-transform hover:scale-105 flex items-center justify-center gap-2"
            title="Settings (Set Download Folder)"
          >
            <FolderOpen size={18} />
            <span>Change Folder</span>
          </button>
        </div>

        {/* Dynamic Tool Content Box */}
        <div className="flex-1 mt-16 bg-white/5 backdrop-blur-xl border border-white/20 rounded-[40px] overflow-hidden flex flex-col relative">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
