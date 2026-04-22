import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileControlsProps {
  onDirection: (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
}

export function MobileControls({ onDirection }: MobileControlsProps) {
  return (
    <div id="mobile-dpad" className="md:hidden flex flex-col items-center gap-2 mt-4 z-20">
      <button
        id="dpad-up"
        onClick={() => onDirection('UP')}
        className="w-14 h-14 bg-[#111] border border-[#00f2ff33] rounded-lg flex items-center justify-center text-[#00f2ff] hover:bg-[#00f2ff22] active:bg-[#00f2ff] active:text-[#050505] transition-all"
        aria-label="Up"
      >
        <ArrowUp size={28} />
      </button>
      <div className="flex gap-2">
        <button
          id="dpad-left"
          onClick={() => onDirection('LEFT')}
          className="w-14 h-14 bg-[#111] border border-[#00f2ff33] rounded-lg flex items-center justify-center text-[#00f2ff] hover:bg-[#00f2ff22] active:bg-[#00f2ff] active:text-[#050505] transition-all"
          aria-label="Left"
        >
          <ArrowLeft size={28} />
        </button>
        <button
          id="dpad-down"
          onClick={() => onDirection('DOWN')}
          className="w-14 h-14 bg-[#111] border border-[#00f2ff33] rounded-lg flex items-center justify-center text-[#00f2ff] hover:bg-[#00f2ff22] active:bg-[#00f2ff] active:text-[#050505] transition-all"
          aria-label="Down"
        >
          <ArrowDown size={28} />
        </button>
        <button
          id="dpad-right"
          onClick={() => onDirection('RIGHT')}
          className="w-14 h-14 bg-[#111] border border-[#00f2ff33] rounded-lg flex items-center justify-center text-[#00f2ff] hover:bg-[#00f2ff22] active:bg-[#00f2ff] active:text-[#050505] transition-all"
          aria-label="Right"
        >
          <ArrowRight size={28} />
        </button>
      </div>
    </div>
  );
}
