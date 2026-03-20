import { useState, useRef } from 'react';
import { RefreshCw, Image as ImageIcon, Download, Loader2, UploadCloud, CheckCircle2 } from 'lucide-react';

export default function ImageConverter({ saveDirectory, onSetDirectory }) {
  const [imgSrc, setImgSrc] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [status, setStatus] = useState('idle');
  const imgRef = useRef(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalName(file.name.split('.')[0] || 'converted_image');
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result.toString()));
      reader.readAsDataURL(file);
      setStatus('idle');
    }
  };

  const handleConvert = async () => {
    if (!imgRef.current) return;
    
    // Check if we need a directory
    let currentDir = saveDirectory;
    if (!currentDir) {
        if (window.electronAPI) {
            currentDir = await window.electronAPI.selectDirectory();
            if(!currentDir) return; // User cancelled
            if (onSetDirectory) onSetDirectory(currentDir); // Tell App to save it
        } else {
            alert("No save directory set, and no Electron environment found.");
            return;
        }
    }

    setStatus('converting');
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');

      // Fill white background for JPEGs (which don't support transparency)
      if (format === 'image/jpeg') {
         ctx.fillStyle = "#ffffff";
         ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(image, 0, 0);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, format, quality));
      const arrayBuffer = await blob.arrayBuffer();

      const ext = format.split('/')[1];
      const filename = `${originalName}_rumi.${ext}`;

      const response = await window.electronAPI.saveImage(arrayBuffer, currentDir, filename);
      
      if (response.success) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        alert("Failed to save: " + response.error);
        setStatus('idle');
      }
    } catch (e) {
      console.error(e);
      alert("Failed to convert image");
      setStatus('idle');
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-8 items-center bg-black/5 rounded-3xl overflow-y-auto">
      <h2 className="text-4xl font-black mb-10 tracking-wide uppercase flex items-center gap-4"><RefreshCw size={36}/> Image Converter</h2>
      
      <div className="flex w-full max-w-5xl gap-8 h-[500px]">
          {/* Upload / Preview Area */}
          <label className="flex-1 border-4 border-dashed border-white/30 rounded-3xl flex flex-col justify-center items-center cursor-pointer hover:bg-white/10 hover:border-pastel-blue transition-all group relative overflow-hidden bg-black/20">
              {imgSrc ? (
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-contain p-4 mix-blend-normal"
                  />
              ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud size={80} className="text-white/40 mb-6 group-hover:text-pastel-blue group-hover:scale-110 transition-transform"/>
                    <p className="opacity-70 text-2xl font-black uppercase tracking-widest text-center px-8">Drop Image to Make it Magic</p>
                  </div>
              )}
              <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
          </label>

          {/* Controls Area */}
          <div className="w-96 bg-white/10 p-8 rounded-3xl border border-white/20 flex flex-col gap-8">
              <div>
                  <h3 className="text-pastel-blue font-black tracking-widest uppercase mb-4 text-xl">Output Format</h3>
                  <div className="flex flex-col gap-3">
                      {['image/jpeg', 'image/png', 'image/webp'].map(fmt => (
                          <button
                            key={fmt}
                            onClick={() => setFormat(fmt)}
                            className={`px-6 py-4 rounded-xl font-bold tracking-widest uppercase transition-all border-2 text-left flex justify-between items-center ${format === fmt ? 'bg-pastel-blue text-dark-bg border-pastel-blue scale-[1.02]' : 'border-white/20 hover:bg-white/10'}`}
                          >
                              {fmt.split('/')[1]}
                              {format === fmt && <CheckCircle2 size={20}/>}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Quality slider - only relevant for jpeg and webp */}
              {(format === 'image/jpeg' || format === 'image/webp') && (
                  <div className="animate-fade-in">
                      <h3 className="text-white/70 font-bold tracking-widest uppercase mb-4 text-sm flex justify-between">
                          Quality <span>{Math.round(quality * 100)}%</span>
                      </h3>
                      <input 
                         type="range" 
                         min="0.1" max="1" step="0.1" 
                         value={quality} 
                         onChange={(e) => setQuality(parseFloat(e.target.value))}
                         className="w-full accent-pastel-blue h-2 rounded-lg bg-white/20 appearance-none cursor-pointer"
                      />
                  </div>
              )}

              <div className="mt-auto flex flex-col gap-4">
                  {imgSrc && (
                       <button 
                         onClick={() => setImgSrc('')}
                         className="py-3 px-4 rounded-xl font-bold uppercase tracking-widest text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                       >
                           <ImageIcon size={18}/> Remove Image
                       </button>
                  )}

                  <button
                    onClick={handleConvert}
                    disabled={!imgSrc || status === 'converting'}
                    className="w-full bg-white text-dark-bg font-black px-6 py-5 rounded-2xl text-xl hover:bg-pastel-blue transition-all transform hover:scale-105 active:translate-y-2 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                  >
                      {status === 'converting' ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                      {status === 'converting' ? 'CONVERTING...' : 'CONVERT NOW'}
                  </button>

                  {status === 'success' && <p className="text-pastel-green font-bold text-center mt-2 flex items-center justify-center gap-2"><CheckCircle2 size={18}/> Saved to folder!</p>}
              </div>
          </div>
      </div>
    </div>
  )
}
