'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';
import { RotateCcw, Plus, Minus } from 'lucide-react';
import { DISTRICTS } from '@/data/districts';
import DistrictOverlay from './DistrictOverlay';
import InfoCard from './InfoCard';

const FOCUS_ZOOM = 2; // How much to zoom in when a district is tapped
const MIN_ZOOM = 0.9;
const MAX_ZOOM = 4;

export default function CityMap() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const mapInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const selected = useMemo(
    () => DISTRICTS.find((d) => d.id === selectedId) ?? null,
    [selectedId]
  );
  const hovered = useMemo(
    () => DISTRICTS.find((d) => d.id === hoveredId) ?? null,
    [hoveredId]
  );

  /**
   * 🎯 Smoothly zoom + pan so the selected district lands at a target
   * viewport position (left-center on desktop, upper-center on mobile).
   */
  const focusDistrict = (id: string) => {
  setSelectedId(id);

  const district = DISTRICTS.find((d) => d.id === id);
  if (!district || !transformRef.current || !mapInnerRef.current) return;

  const mapEl = mapInnerRef.current;
  const mapRect = mapEl.getBoundingClientRect();
  const currentScale = transformRef.current.state.scale;

  const naturalWidth = mapRect.width / currentScale;
  const naturalHeight = mapRect.height / currentScale;

  const districtX = (district.centerCoords.x / 100) * naturalWidth;
  const districtY = (district.centerCoords.y / 100) * naturalHeight;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  // 🎯 FIX: Position district in the LEFT-CENTER area (not covered by info card)
  // Info card sits at ~right 30% → we want district at ~25-30% from left
  const targetVX = isMobile ? viewportW * 0.25 : viewportW * 0.10;  
  const targetVY = isMobile ? viewportH * 0.32 : viewportH * 0.5;

  const newX = targetVX - districtX * FOCUS_ZOOM;
  const newY = targetVY - districtY * FOCUS_ZOOM;

  transformRef.current.setTransform(newX, newY, FOCUS_ZOOM, 600, 'easeOut');
};
  const handleReset = () => {
    setSelectedId(null);
    transformRef.current?.resetTransform(500, 'easeOut');
  };

  const handleZoomIn = () => transformRef.current?.zoomIn(0.3, 300);
  const handleZoomOut = () => transformRef.current?.zoomOut(0.3, 300);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-100">
      

      {/* 🏙️ Pan/Zoom map layer */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={MIN_ZOOM}
        maxScale={MAX_ZOOM}
        centerOnInit
        limitToBounds={false}
        doubleClick={{ mode: 'reset', animationTime: 400 }}
        panning={{
          velocityDisabled: false,
          excluded: ['button'], // don't pan when clicking buttons
        }}
        wheel={{ step: 0.15 }}
        pinch={{ step: 5 }}
      >
        <TransformComponent
          wrapperClass="!w-full !h-[100dvh]"
          contentClass="!w-full !h-full flex items-center justify-center"
        >
          {/*
            📐 Map container — BIG so users have space to pan.
            Size differs per breakpoint for optimal exploration feel.

            🎯 KEY POINT: city SVG and polygon SVG are BOTH inside this
            container at 100% width/height. They scale together.
            No secondary CSS scale hack needed. Polygons stay aligned. ✅
          */}
          <div
            ref={mapInnerRef}
            className="relative
                       w-[180vw] h-[180vw]
                       md:w-[130vmin] md:h-[130vmin]
                       lg:w-[120vmin] lg:h-[120vmin]
                       xl:w-[110vmin] xl:h-[110vmin]"
            style={{
              filter: 'drop-shadow(0 25px 40px rgba(30, 41, 59, 0.25))',
            }}
            onClick={(e) => {
              // Prevent clicks on the map bg from closing the info card
              e.stopPropagation();
            }}
          >
            {/* City illustration */}
              <div
    className="absolute inset-0 pointer-events-none overflow-visible"
    style={{
      transform: 'scale(1.7)',        // 👈 tweak this
      transformOrigin: 'center center',
    }}
  >
    <img
      src="/assets/city-map.svg"
      alt=""
      className="absolute inset-0 w-full h-full select-none"
      draggable={false}
      style={{ objectFit: 'contain' }}
    />
  </div>

            {/* Polygon overlay — perfectly aligned because same container */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            >
              {DISTRICTS.map((d) => (
                <DistrictOverlay
                  key={d.id}
                  district={d}
                  isHovered={hoveredId === d.id}
                  isSelected={selectedId === d.id}
                  isDimmed={!!(selectedId || hoveredId) && (selectedId ?? hoveredId) !== d.id}
                  onHover={setHoveredId}
                  onClick={focusDistrict}
                />
              ))}
            </svg>

            {/* Persistent district labels (small pills) */}
            {DISTRICTS.map((d) => (
              <motion.div
                key={`label-${d.id}`}
                className="absolute pointer-events-none z-10
                           flex items-center gap-1
                           px-2 py-1 md:px-2.5 md:py-1
                           rounded-full text-[9px] md:text-[10px] font-bold
                           bg-slate-900/90 text-white
                           shadow-lg whitespace-nowrap
                           -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${d.centerCoords.x}%`,
                  top: `${d.centerCoords.y}%`,
                  border: `1.5px solid ${d.color}`,
                }}
                animate={{
                  opacity: selectedId
                    ? selectedId === d.id
                      ? 1
                      : 0.25
                    : hoveredId
                      ? hoveredId === d.id
                        ? 1
                        : 0.4
                      : 0.85,
                  scale: (selectedId === d.id || hoveredId === d.id) ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <d.Icon size={10} style={{ color: d.color }} strokeWidth={2.5} />
                <span>{d.name}</span>
              </motion.div>
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* 🎯 Header */}
      <div className="absolute top-4 md:top-6 left-4 md:left-6 z-40 pointer-events-none max-w-[70%]">
        <div className="inline-block bg-white/85 backdrop-blur-md border border-slate-200 p-3 md:p-5 rounded-xl shadow-lg">
          <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
                  Computer Area
          </h1>
          <p className="text-[11px] md:text-sm text-slate-500 mt-0.5 font-medium">
            Class 12 · NEB · {isMobile ? 'Drag to explore' : 'Hover & click a district'}
          </p>
        </div>
      </div>

      {/* 🧭 Zoom controls (bottom-right) */}
      <div className="absolute bottom-6 right-4 md:right-6 z-40 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md
                     shadow-lg border border-slate-200
                     flex items-center justify-center
                     text-slate-700 hover:bg-white active:scale-95
                     transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md
                     shadow-lg border border-slate-200
                     flex items-center justify-center
                     text-slate-700 hover:bg-white active:scale-95
                     transition-all"
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={handleReset}
          aria-label="Reset view"
          className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md
                     shadow-lg border border-slate-200
                     flex items-center justify-center
                     text-slate-700 hover:bg-white active:scale-95
                     transition-all"
        >
          <RotateCcw size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* 💳 Info card (uses your existing InfoCard — becomes bottom sheet on mobile via its own responsive styles) */}
      <InfoCard district={selected} onClose={handleReset} />
    </div>
  );
}
