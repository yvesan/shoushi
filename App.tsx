import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Hand, Expand, Info, Camera, Loader2, AlertTriangle } from 'lucide-react';

import ParticleSystem from './components/ParticleSystem';
import HandController from './components/HandController';
import { ShapeType } from './types';
import { SHAPE_ICONS, SHAPE_LABELS, COLORS } from './constants';

function App() {
  const [activeShape, setActiveShape] = useState<ShapeType>(ShapeType.HEART);
  const [particleColor, setParticleColor] = useState<string>(COLORS[0]);
  const [handSpread, setHandSpread] = useState<number>(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden font-sans">
      
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} className="z-0">
        <ambientLight intensity={0.5} />
        <ParticleSystem 
          shape={activeShape} 
          color={particleColor} 
          handInfluence={handSpread} 
        />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      </Canvas>

      {/* Hand Tracking Logic */}
      <HandController 
        onHandSpread={(val) => setHandSpread(val)} 
        onCameraStatus={(ready) => {
          setIsCameraReady(ready);
          if (ready) setErrorMessage(null);
        }}
        onError={(msg) => setErrorMessage(msg)}
      />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="pointer-events-auto max-w-xl">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-md">
              手势粒子特效
            </h1>
            <div className="flex flex-col gap-2 mt-2 text-sm text-gray-400">
              {errorMessage ? (
                <div className="flex items-start gap-2 text-red-200 bg-red-900/80 px-4 py-3 rounded-lg border border-red-500/50 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-400" /> 
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              ) : isCameraReady ? (
                <span className="flex items-center gap-1 text-green-400">
                  <Camera size={14} /> 摄像头已运行
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-500 animate-pulse">
                  <Loader2 size={14} className="animate-spin" /> 正在加载视觉模型...
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="pointer-events-auto p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white border border-white/10"
            title="查看说明"
          >
            <Info size={20} />
          </button>
        </div>

        {/* Info Modal */}
        {showInfo && (
          <div className="absolute top-28 right-6 w-80 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 text-sm text-gray-200 shadow-2xl transition-all pointer-events-auto">
             <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-base">
                <Hand size={18} /> 如何控制
             </h3>
             <ul className="space-y-2.5 list-none opacity-90 pl-1">
               <li className="flex gap-2">
                 <span className="text-pink-400">1.</span> 
                 <span>请允许浏览器访问摄像头权限。</span>
               </li>
               <li className="flex gap-2">
                 <span className="text-pink-400">2.</span> 
                 <span>将单手举在摄像头前。</span>
               </li>
               <li className="flex gap-2">
                 <span className="text-pink-400">3.</span> 
                 <span><strong>捏合手指</strong> (食指+拇指) 收缩粒子。</span>
               </li>
               <li className="flex gap-2">
                 <span className="text-pink-400">4.</span> 
                 <span><strong>张开手掌</strong> 使粒子群爆发/扩散。</span>
               </li>
             </ul>
             <div className="mt-5 pt-4 border-t border-white/10">
               <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                 <span>当前手势张开度:</span>
                 <span className="font-mono text-white text-sm">{(handSpread * 100).toFixed(0)}%</span>
               </div>
               {/* Visualizer Bar */}
               <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                 <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-75 ease-out"
                    style={{ width: `${Math.min(handSpread * 100, 100)}%` }}
                 />
               </div>
             </div>
          </div>
        )}

        {/* Controls Panel */}
        <div className="self-center mb-8 pointer-events-auto flex flex-col items-center gap-4">
          
          {/* Shape Selectors */}
          <div className="flex gap-2 bg-white/5 backdrop-blur-lg p-2 rounded-2xl border border-white/10 shadow-xl overflow-x-auto max-w-[90vw]">
            {Object.values(ShapeType).map((shape) => (
              <button
                key={shape}
                onClick={() => setActiveShape(shape)}
                className={`
                  relative px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300
                  flex flex-col items-center gap-1 min-w-[60px]
                  ${activeShape === shape 
                    ? 'bg-gradient-to-b from-white/20 to-white/5 text-white shadow-lg border-t border-white/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <span className="text-2xl filter drop-shadow-sm mb-1">{SHAPE_ICONS[shape]}</span>
                <span className="text-[11px] font-bold">{SHAPE_LABELS[shape]}</span>
                {activeShape === shape && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />
                )}
              </button>
            ))}
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-3 rounded-full border border-white/10">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setParticleColor(color)}
                title={color}
                className={`w-6 h-6 rounded-full border-2 transition-transform duration-200 ${
                  particleColor === color 
                    ? 'border-white scale-125 shadow-[0_0_12px_rgba(255,255,255,0.6)]' 
                    : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4 text-[10px] text-gray-600 pointer-events-none">
           Powered by React Three Fiber & MediaPipe
        </div>

      </div>
    </div>
  );
}

export default App;