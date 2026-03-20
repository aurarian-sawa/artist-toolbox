import { useState } from 'react';
import { Palette as PaletteIcon, Sparkles, Copy, CheckCircle2 } from 'lucide-react';

export default function PaletteGenerator() {
  const [colors, setColors] = useState([]);
  const [copied, setCopied] = useState(null);
  const [paletteType, setPaletteType] = useState('Random');
  const [colorCount, setColorCount] = useState(5);

  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();

  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  const generatePalette = () => {
    const count = Math.max(2, Math.min(20, colorCount));
    const newColors = [];
    const baseH = Math.floor(Math.random() * 360);
    const baseS = 60 + Math.floor(Math.random() * 30); 
    const baseL = 50 + Math.floor(Math.random() * 30);

    for(let i=0; i<count; i++) {
       let h = baseH, s = baseS, l = baseL;
       const step = i / Math.max(1, count - 1);

       switch(paletteType) {
          case 'Mono': 
             l = 20 + (60 * step); 
             s = baseS;
             break;
          case 'Analogous':
             h = (baseH + (i * 30)) % 360;
             break;
          case 'Complementary':
             h = (baseH + (i % 2 === 0 ? 0 : 180)) % 360;
             l = l + (i * 5); 
             break;
          case 'Triadic':
             h = (baseH + ((i % 3) * 120)) % 360;
             l = l + (i * 3);
             break;
          case 'Split-Comp':
             const offsets = [0, 150, 210];
             h = (baseH + offsets[i % 3]) % 360;
             l = l + (i * 3);
             break;
          case 'Tetradic':
             const tOffsets = [0, 90, 180, 270];
             h = (baseH + tOffsets[i % 4]) % 360;
             l = l + (i * 2);
             break;
          case 'Chaos':
             h = Math.floor(Math.random() * 360);
             s = 20 + Math.floor(Math.random() * 80);
             l = 20 + Math.floor(Math.random() * 60);
             break;
          case 'Random': 
          default:
             h = (baseH + (i * 45)) % 360;
             s = 70 + Math.floor(Math.random() * 20);
             l = 65 + Math.floor(Math.random() * 20);
             break;
       }
       
       s = Math.max(0, Math.min(100, s));
       l = Math.max(0, Math.min(100, l));
       
       newColors.push(hslToHex(Math.round(h), Math.round(s), Math.round(l)));
    }
    setColors(newColors);
  };

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col p-8 items-center bg-black/5 rounded-3xl overflow-y-auto">
      <h2 className="text-4xl font-black mb-10 tracking-wide uppercase flex items-center gap-4"><PaletteIcon size={36}/> Palette Generator</h2>
      
      {/* Controls */}
      <div className="flex gap-6 w-full max-w-4xl bg-white/10 p-6 rounded-3xl border border-white/20 items-end justify-between">
          <div className="flex gap-8">
              <div className="flex flex-col gap-2">
                  <label className="text-pastel-blue font-black tracking-widest uppercase text-sm">Theme Rule</label>
                  <select 
                      value={paletteType} 
                      onChange={(e) => setPaletteType(e.target.value)}
                      className="px-4 py-3 bg-black/20 rounded-xl font-bold uppercase tracking-widest outline-none border border-white/10"
                  >
                      {['Random', 'Chaos', 'Mono', 'Analogous', 'Complementary', 'Triadic', 'Split-Comp', 'Tetradic'].map(t => (
                          <option key={t} value={t} className="text-black">{t}</option>
                      ))}
                  </select>
              </div>
              <div className="flex flex-col gap-2">
                  <label className="text-pastel-blue font-black tracking-widest uppercase text-sm">Colors ({colorCount})</label>
                  <input 
                      type="range" 
                      min="2" max="20" 
                      value={colorCount} 
                      onChange={(e) => setColorCount(Number(e.target.value))}
                      className="w-48 accent-pastel-blue h-2 mt-4 rounded-lg bg-white/20 appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-bold opacity-50 px-1 mt-1">
                      <span>2</span>
                      <span>20</span>
                  </div>
              </div>
          </div>
          
          <button 
            onClick={generatePalette}
            className="bg-white text-dark-bg px-8 py-3 font-black rounded-xl text-xl hover:bg-pastel-blue transition-all active:scale-95 flex items-center gap-3"
          >
              <Sparkles size={24} />
              GENERATE
          </button>
      </div>

      {/* Palette Area */}
      {colors.length > 0 ? (
         <div className="w-full max-w-4xl mt-12 animate-fade-in flex-1 min-h-[300px] flex flex-col pb-8">
             <div className="flex flex-row w-full h-full rounded-2xl overflow-hidden border-2 border-white/10">
                 {colors.map((hex, i) => (
                     <div 
                         key={i} 
                         className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:flex-[1.5] transition-all duration-300 relative group"
                         style={{ backgroundColor: hex }}
                         onClick={() => copyToClipboard(hex)}
                         title="Click to copy HEX"
                     >
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-white font-bold tracking-widest flex items-center gap-2 -rotate-90 whitespace-nowrap">
                             {copied === hex ? <CheckCircle2 size={16}/> : <Copy size={16}/>}
                             {copied === hex ? "COPIED" : hex}
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      ) : (
          <div className="w-full max-w-4xl mt-12 flex-1 min-h-[300px] flex items-center justify-center border-4 border-dashed border-white/20 rounded-3xl opacity-50">
             <p className="text-2xl font-black uppercase tracking-widest flex items-center gap-3"><Sparkles/> Click Generate to start</p>
          </div>
      )}
    </div>
  )
}
