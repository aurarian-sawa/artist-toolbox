import { useState } from 'react';
import { Download, FolderOpen, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function YtDownloader({ saveDirectory, onSetDirectory }) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, downloading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleDownload = async () => {
    if (!url) return;
    if (!saveDirectory) {
      alert("Please select a save directory first using the Settings icon in the top right, or click the folder below!");
      return;
    }
    
    setStatus('downloading');
    try {
      if (!window.electronAPI) throw new Error("Not running in Electron environment.");
      const response = await window.electronAPI.downloadAudio(url, saveDirectory);
      if (response.success) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 5000);
        setUrl('');
      } else {
        setStatus('error');
        setErrorMsg(response.error || "Unknown error occurred");
      }
    } catch (e) {
      setStatus('error');
      setErrorMsg(e.message);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <h2 className="text-5xl font-black mb-6 tracking-wide uppercase text-center">YT TO MP3</h2>
      
      {/* Directory Selector Area */}
      <div className="mb-10 flex items-center justify-center w-full max-w-2xl bg-black/10 px-6 py-4 rounded-2xl border border-white/20">
        <FolderOpen size={24} className="opacity-70 text-pastel-blue mr-3" />
        <span className="font-bold opacity-80 flex-1 truncate max-w-[400px]" title={saveDirectory}>
          {saveDirectory ? saveDirectory : "No folder selected yet!"}
        </span>
        <button 
          onClick={onSetDirectory}
          className="ml-4 text-sm font-black bg-white/20 hover:bg-pastel-blue hover:text-dark-bg px-4 py-2 rounded-xl transition-colors shrink-0"
        >
          {saveDirectory ? "CHANGE" : "SELECT FOLDER"}
        </button>
      </div>

      <div className="w-full max-w-2xl flex gap-4">
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="PUT YOUTUBE LINK HERE" 
          className="flex-1 bg-black/20 border-4 border-white/50 rounded-2xl px-6 py-4 text-xl outline-none focus:border-pastel-pink transition-colors placeholder:text-white/40"
        />
        <button 
          onClick={handleDownload}
          disabled={status === 'downloading' || !url}
          className="bg-white text-dark-bg font-black px-8 py-4 rounded-2xl text-2xl hover:bg-pastel-pink hover:text-white transition-all transform hover:scale-105 active:translate-y-2 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 shrink-0"
        >
          {status === 'downloading' ? <Loader2 className="animate-spin" /> : <Download />}
          {status === 'downloading' ? 'DOWNLOADING...' : 'DOWNLOAD'}
        </button>
      </div>

      {/* Progress or Status Area */}
      <div className="mt-12 h-32 w-full max-w-2xl bg-black/10 rounded-3xl border-2 border-dashed border-white/30 flex items-center justify-center text-center px-6">
        {status === 'idle' && <p className="opacity-50 font-bold uppercase tracking-widest text-lg">Waiting for link...</p>}
        {status === 'downloading' && <p className="animate-pulse font-bold text-pastel-blue text-2xl flex items-center gap-3"><Loader2 className="animate-spin" size={32}/> Extracting Audio... Please wait magically ✨</p>}
        {status === 'success' && <p className="font-bold text-pastel-green text-2xl flex items-center gap-3"><CheckCircle2 size={32}/> Audio Saved Successfully! 💖</p>}
        {status === 'error' && <p className="font-bold text-red-400 text-lg overflow-hidden text-ellipsis max-h-full flex items-center gap-2"><XCircle size={24} className="shrink-0"/> <span className="truncate">{errorMsg}</span></p>}
      </div>
    </div>
  );
}
