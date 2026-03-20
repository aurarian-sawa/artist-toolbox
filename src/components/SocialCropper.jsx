import { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { UploadCloud, Crop as CropIcon, Save, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';

const PRESETS = [
  { label: 'Freeform', aspect: undefined },
  { label: 'IG Square (1:1)', aspect: 1 },
  { label: 'Twitter Header (3:1)', aspect: 3 },
  { label: 'YT Thumb (16:9)', aspect: 16 / 9 },
  { label: 'IG Story (9:16)', aspect: 9 / 16 },
];

export default function SocialCropper({ saveDirectory, onSetDirectory }) {
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [aspect, setAspect] = useState(undefined);
  const [status, setStatus] = useState('idle');

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); 
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function handleAspectClick(newAspect) {
    setAspect(newAspect);
    if (!newAspect) {
      setCrop(undefined);
    } else if (imgRef.current) {
      setCrop({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25
      });
    }
  }

  async function handleSave() {
    if (!imgRef.current || !crop || !crop.width || !crop.height) return;
    if (!saveDirectory) {
        alert("Please set a save directory first using the Settings icon!");
        onSetDirectory && onSetDirectory();
        return;
    }

    setStatus('saving');
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext('2d');

      const pixelRatio = window.devicePixelRatio;
      canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio);
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;

      ctx.drawImage(
        image,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const arrayBuffer = await blob.arrayBuffer();

      const filename = `RumiCrop_${Date.now()}.png`;

      const response = await window.electronAPI.saveImage(arrayBuffer, saveDirectory, filename);
      if (response.success) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        alert("Failed to save: " + response.error);
        setStatus('idle');
      }
    } catch (e) {
      alert("Error cropping image");
      console.error(e);
      setStatus('idle');
    }
  }

  return (
    <div className="w-full h-full flex flex-col p-8 items-center bg-black/5 rounded-3xl overflow-y-auto">
      <h2 className="text-4xl font-black mb-6 tracking-wide uppercase flex items-center gap-3"><CropIcon size={36}/> Social Media Cropper</h2>
      
      {!imgSrc ? (
        <label className="flex-1 w-full max-w-3xl border-4 border-dashed border-white/30 rounded-3xl flex flex-col justify-center items-center cursor-pointer hover:bg-white/10 hover:border-pastel-pink transition-all group">
            <UploadCloud size={80} className="text-white/40 mb-6 group-hover:text-pastel-pink group-hover:scale-110 transition-transform"/>
            <p className="opacity-70 text-3xl font-black uppercase tracking-widest">Select an Image</p>
            <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
        </label>
      ) : (
        <div className="flex w-full gap-8 h-full min-h-[400px]">
          
          {/* Main Cropper Area */}
          <div className="flex-1 flex flex-col items-center justify-center bg-black/20 rounded-3xl p-4 overflow-hidden relative">
             <div className="flex items-center justify-center w-full h-full">
               <ReactCrop 
                  crop={crop} 
                  onChange={(c) => setCrop(c)} 
                  aspect={aspect}
                  className="max-h-full max-w-full rounded-xl flex items-center justify-center"
               >
                  <img 
                    ref={imgRef} 
                    src={imgSrc} 
                    alt="Crop preview" 
                    className="block mx-auto"
                    style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }}
                  />
               </ReactCrop>
             </div>
          </div>

          {/* Controls Sidebar */}
          <div className="w-80 flex flex-col gap-6">
             <div className="bg-white/10 p-6 rounded-3xl border border-white/10">
                <h3 className="font-black text-xl mb-4 tracking-widest text-pastel-pink">PRESETS</h3>
                <div className="flex flex-col gap-3">
                    {PRESETS.map(p => (
                        <button 
                          key={p.label}
                          onClick={() => handleAspectClick(p.aspect)}
                          className={`
                            px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all uppercase border-2 text-left
                            ${aspect === p.aspect ? 'bg-pastel-pink text-white border-pastel-pink scale-105' : 'border-white/20 hover:border-white/50 bg-black/20 hover:bg-white/10'}
                          `}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
             </div>

             <div className="mt-auto flex flex-col gap-4 text-center">
                 <button 
                   onClick={() => setImgSrc('')}
                   className="py-3 px-4 rounded-xl font-bold uppercase tracking-widest text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                 >
                     <ImageIcon size={18}/> Cancel Image
                 </button>

                 <button 
                   onClick={handleSave}
                   disabled={status === 'saving' || !crop || !crop.width}
                   className="bg-white text-dark-bg font-black px-6 py-5 rounded-2xl text-xl hover:bg-pastel-blue transition-all transform hover:scale-105 active:translate-y-2 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                 >
                   {status === 'saving' ? <Loader2 className="animate-spin" /> : <Save />}
                   {status === 'saving' ? 'SAVING...' : 'SAVE CROP'}
                 </button>
                 
                 {status === 'success' && <p className="text-pastel-green font-bold flex items-center justify-center gap-2 animate-pulse"><CheckCircle2 size={18}/> Saved to folder!</p>}
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
