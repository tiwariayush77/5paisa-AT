import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  User, 
  Home as HomeIcon, 
  Briefcase, 
  TrendingUp, 
  ClipboardList, 
  MoreHorizontal, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  ChevronDown,
  Heart,
  AlertCircle,
  PieChart,
  Zap,
  LayoutGrid,
  Filter,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Tab = 'Home' | 'Portfolio' | 'Markets' | 'Orders' | 'More';
type Mode = 'Current' | 'AI';

// --- Mock Data ---
const MARKET_DATA = [
  { name: 'SENSEX', value: '81,240', change: '+0.4%', up: true },
  { name: 'NIFTY', value: '24,680', change: '+0.3%', up: true },
  { name: 'BANKNIFTY', value: '52,140', change: '+0.5%', up: true },
  { name: 'MIDCAP', value: '41,230', change: '-0.2%', up: false },
  { name: 'RELIANCE', value: '2,847', change: '+0.8%', up: true },
  { name: 'HDFC', value: '1,624', change: '-1.1%', up: false },
  { name: 'TCS', value: '3,412', change: '+0.4%', up: true },
];

const WATCHLIST = [
  { name: 'HDFC Bank', exchange: 'NSE', price: '1,624.30', change: '-1.12%', up: false },
  { name: 'Reliance Industries', exchange: 'NSE', price: '2,847.15', change: '+0.84%', up: true },
  { name: 'NIFTYBEES', exchange: 'ETF', price: '228.45', change: '-2.10%', up: false },
];

const HOLDINGS = [
  { name: 'UTI Flexi Cap Fund', type: 'SIP ₹1,000 · MF', value: '₹42,800', gain: '+8.2%', up: true },
  { name: 'HDFC Flexi Cap Fund', type: 'SIP ₹500 · MF', value: '₹28,400', gain: '+6.4%', up: true },
  { name: 'Axis Bluechip Fund', type: 'SIP ₹500 · MF', value: '₹18,700', gain: '+5.9%', up: true },
];

const OVERLAP_STOCKS = [
  { name: 'Reliance Industries', count: '6/7 funds', percentage: 85 },
  { name: 'HDFC Bank', count: '5/7 funds', percentage: 70 },
  { name: 'Infosys', count: '5/7 funds', percentage: 70 },
  { name: 'ICICI Bank', count: '4/7 funds', percentage: 55 },
  { name: 'TCS', count: '3/7 funds', percentage: 40 },
];

const OVERLAPPING_FUNDS = [
  { name: 'UTI Flexi Cap Fund', type: 'Flexi Cap · SIP ₹1,000', overlap: '78%', repeated: '17 holdings' },
  { name: 'HDFC Flexi Cap Fund', type: 'Flexi Cap · SIP ₹500', overlap: '74%', repeated: '15 holdings' },
  { name: 'Axis Bluechip Fund', type: 'Large Cap · SIP ₹500', overlap: '69%', repeated: '12 holdings' },
];

// --- Components ---

const BottomSheet = ({ isOpen, onClose, title, subtext, children }: { isOpen: boolean, onClose: () => void, title: string, subtext?: string, children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 z-50 pointer-events-auto"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-[24px] z-50 overflow-hidden flex flex-col max-h-[90%] pointer-events-auto"
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />
            <div className="px-5 pb-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#171A21]">{title}</h3>
                  {subtext && <p className="text-sm text-[#667085] mt-0.5">{subtext}</p>}
                </div>
                <button onClick={onClose} className="p-1 bg-gray-100 rounded-full">
                  <X size={20} className="text-[#667085]" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-5 py-4 flex-1">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Toast = ({ message, isVisible, onHide }: { message: string, isVisible: boolean, onHide: () => void }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-[#171A21] text-white px-4 py-2.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 min-w-[240px] justify-center pointer-events-auto"
        >
          <CheckCircle2 size={16} className="text-green-400" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TourOverlay = ({ step, onNext, onSkip, activeTab }: { step: number, onNext: () => void, onSkip: () => void, activeTab: string }) => {
  const [targetRect, setTargetRect] = useState<{ top: number, left: number, width: number, height: number, borderRadius: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    viewportRef.current = document.querySelector('.screen-viewport');
  }, []);

  useEffect(() => {
    setShowTooltip(false);
    setTargetRect(null);

    const getTarget = () => {
      if (step === 0) return null;
      const id = step === 1 ? 'tour-health' : 
                 step === 2 ? 'tour-tax' : 
                 step === 3 ? 'ask-button' : 
                 step === 4 ? 'tour-overlap' : '';
      return document.getElementById(id);
    };

    const updatePosition = async () => {
      const shell = document.querySelector('.app-shell');
      const shellRect = shell?.getBoundingClientRect() || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

      if (step === 0) {
        // Welcome step: ensure scroll is unlocked
        const scroller = document.querySelector('.screen-viewport') as HTMLElement;
        if (scroller) {
          scroller.style.overflowY = 'auto';
          scroller.style.pointerEvents = 'auto';
        }
        setTimeout(() => setShowTooltip(true), 100);
        return;
      }

      const target = getTarget();
      if (target && viewportRef.current) {
        const scroller = viewportRef.current;
        
        // 1. Unlock scroll for positioning
        scroller.style.overflowY = 'auto';
        scroller.style.pointerEvents = 'auto';
        
        // 2. Scroll target into upper half
        const targetTop = target.offsetTop;
        scroller.scrollTo({
          top: targetTop - 100,
          behavior: 'smooth'
        });
        
        // 3. Wait for scroll to settle
        await new Promise(resolve => setTimeout(resolve, 450));

        // 4. Get final dimensions
        const rect = target.getBoundingClientRect();
        const borderRadius = window.getComputedStyle(target).borderRadius;
        
        const relativeRect = {
          top: rect.top - shellRect.top,
          left: rect.left - shellRect.left,
          width: rect.width,
          height: rect.height,
          borderRadius
        };

        setTargetRect(relativeRect);

        // 5. Lock scroll now that we are positioned (only for feature steps)
        scroller.style.overflowY = 'hidden';

        setTimeout(() => setShowTooltip(true), 200);
      }
    };

    updatePosition();
    
    // Cleanup: ensure scroll is restored when step changes or unmounts
    return () => {
      const scroller = document.querySelector('.screen-viewport') as HTMLElement;
      if (scroller) {
        scroller.style.overflowY = 'auto';
        scroller.style.pointerEvents = 'auto';
      }
      document.body.style.overflow = '';
    };
  }, [step, activeTab]);

  const tourContent = [
    {
      title: "See what’s new in this 5paisa prototype",
      body: "We’ve added 3 practical portfolio features inside the existing app flow — so users can understand portfolio quality, reduce overlap, and avoid missing tax actions.",
      helper: "",
      button: "Start tour"
    },
    {
      title: "Start with one simple daily signal",
      body: "This score gives users a quick read on portfolio quality — not just returns. It helps them understand if the portfolio is balanced, diversified, and tax-efficient.",
      helper: "Why it matters: investors often track returns, but miss portfolio quality.",
      button: "Next →"
    },
    {
      title: "Catch tax-saving opportunities at the right time",
      body: "This alert surfaces missed or upcoming tax actions in plain language. It turns a complicated year-end task into something visible and reviewable inside the app.",
      helper: "Why it matters: tax efficiency is useful only when it is timely.",
      button: "Next →"
    },
    {
      title: "Contextual help, without changing the app",
      body: "This opens relevant prompts based on the screen the user is on. Guidance stays close to the decision instead of creating a separate AI journey.",
      helper: "Why it matters: support should appear where confusion happens.",
      button: "Next →"
    },
    {
      title: "Here is the clearest fix in the portfolio",
      body: "This card shows when multiple funds keep repeating the same stocks. It helps users see that more funds do not always mean better diversification.",
      helper: "Why it matters: overlap is one of the easiest portfolio problems to act on.",
      button: "Open overlap →"
    }
  ];

  const current = tourContent[step];

  return (
    <div className="tour-overlay absolute inset-0 z-[100] overflow-hidden pointer-events-none">
      {/* Curtain overlay */}
      <AnimatePresence>
        {targetRect && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-0 left-0 right-0 bg-black/40" style={{ height: targetRect.top - 4 }} />
            <div className="absolute bottom-0 left-0 right-0 bg-black/40" style={{ top: targetRect.top + targetRect.height + 4 }} />
            <div className="absolute left-0 bg-black/40" style={{ top: targetRect.top - 4, height: targetRect.height + 8, width: targetRect.left - 4 }} />
            <div className="absolute right-0 bg-black/40" style={{ top: targetRect.top - 4, height: targetRect.height + 8, left: targetRect.left + targetRect.width + 4 }} />
          </motion.div>
        )}
        {!targetRect && step === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 pointer-events-none"
          />
        )}
      </AnimatePresence>
      
      {/* Spotlight */}
      {targetRect && (
        <motion.div 
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: [1, 1.02, 1] }}
          transition={{ scale: { duration: 0.6, times: [0, 0.5, 1], ease: "easeInOut" } }}
          className="absolute z-10 pointer-events-none"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: `calc(${targetRect.borderRadius} + 4px)`,
            border: '2px solid rgba(227,28,61,0.95)',
            boxShadow: '0 0 0 4px rgba(227,28,61,0.12), 0 8px 24px rgba(227,28,61,0.14)',
          }}
        />
      )}

      {/* Coachmark / Welcome Card */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`absolute z-[110] bg-white rounded-[24px] p-4 shadow-[0_20px_40px_rgba(17,24,39,0.16)] pointer-events-auto flex flex-col ${step === 0 ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)]' : 'bottom-[84px] left-4 right-4'}`}
            style={{ maxHeight: '42%' }}
          >
            <div className="flex justify-between items-start mb-2.5">
              <span className="px-2 py-0.5 bg-[#EEF4FF] text-[#2563EB] text-[9px] font-black uppercase tracking-wider rounded">Guided Tour</span>
              <button onClick={onSkip} className="p-1 text-[#98A2B3] hover:text-[#171A21]">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 custom-scrollbar">
              <h3 className="text-sm font-bold text-[#171A21] leading-tight mb-2">{current.title}</h3>
              <p className="text-xs text-[#667085] leading-[1.55]">{current.body}</p>
              {current.helper && (
                <p className="text-[11px] text-[#98A2B3] font-medium mt-2 italic">{current.helper}</p>
              )}
            </div>

            <div className="flex justify-between items-center gap-3 mt-4 pt-2 border-t border-[#F5F7FB]">
              <div className="flex gap-1.5">
                {tourContent.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === step ? 'bg-[#E31C3D]' : 'bg-[#E7EBF2]'}`} />
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button onClick={onSkip} className="text-xs font-medium text-[#667085]">Skip</button>
                <button 
                  onClick={onNext}
                  className="min-w-[96px] h-11 bg-[#171A21] text-white rounded-[14px] text-xs font-bold flex items-center justify-center px-4 shadow-lg shadow-black/10"
                >
                  {current.button}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [mode, setMode] = useState<Mode>('AI');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTour, setShowTour] = useState(true);
  const [tourStep, setTourStep] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '' });
  
  // Sheet states
  const [isHealthSheetOpen, setIsHealthSheetOpen] = useState(false);
  const [isOverlapSheetOpen, setIsOverlapSheetOpen] = useState(false);
  const [overlapFromTour, setOverlapFromTour] = useState(false);
  const [isTaxSheetOpen, setIsTaxSheetOpen] = useState(false);
  const [isAskSheetOpen, setIsAskSheetOpen] = useState(false);
  const [isConfirmSheetOpen, setIsConfirmSheetOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    // Auto-start tour on first load
    const hasSeenTour = sessionStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setTimeout(() => {
        setMode('AI');
        setShowTour(true);
        sessionStorage.setItem('hasSeenTour', 'true');
      }, 700);
    }

    return () => clearInterval(timer);
  }, []);

  // Scroll locking for tour and sheets
  useEffect(() => {
    const viewport = document.querySelector('.screen-viewport') as HTMLElement;
    const isSheetOpen = isHealthSheetOpen || isOverlapSheetOpen || isTaxSheetOpen || isAskSheetOpen || isConfirmSheetOpen;
    
    // Only lock globally if a sheet is open. 
    // TourOverlay handles its own locking for feature steps to allow programmatic scrolling.
    if (isSheetOpen) {
      if (viewport) viewport.style.overflowY = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      // If no sheet is open, we generally want it auto, 
      // UNLESS TourOverlay has locked it (which it does internally for feature steps)
      if (viewport && !showTour) viewport.style.overflowY = 'auto';
      document.body.style.overflow = 'auto';
    }
  }, [showTour, isHealthSheetOpen, isOverlapSheetOpen, isTaxSheetOpen, isAskSheetOpen, isConfirmSheetOpen]);

  const showSuccessToast = (message: string) => {
    setToast({ visible: true, message });
  };

  const cleanupTour = () => {
    setShowTour(false);
    setTourStep(0);
    
    // Hard reset all interaction locks
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    
    const viewport = document.querySelector('.screen-viewport') as HTMLElement;
    if (viewport) {
      viewport.style.overflowY = 'auto';
      viewport.style.pointerEvents = 'auto';
    }
    
    // Remove any potential highlight classes if they were added
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    document.querySelectorAll('.tour-elevated').forEach(el => el.classList.remove('tour-elevated'));
  };

  const handleTourNext = () => {
    if (tourStep === 0) {
      setActiveTab('Home');
      setTourStep(1);
    } else if (tourStep === 4) {
      cleanupTour();
      // Wait a bit for cleanup to settle before opening the next sheet
      setTimeout(() => {
        setOverlapFromTour(true);
        setIsOverlapSheetOpen(true);
      }, 80);
    } else {
      setTourStep(prev => prev + 1);
    }
  };

  // Safety guard: force reset interaction locks when tour closes
  useEffect(() => {
    if (!showTour) {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
      
      const viewport = document.querySelector('.screen-viewport') as HTMLElement;
      if (viewport) {
        viewport.style.overflowY = 'auto';
        viewport.style.pointerEvents = 'auto';
      }
    }
  }, [showTour]);

  const formattedTime = currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const isDay = currentTime.getHours() >= 6 && currentTime.getHours() < 18;

  // --- Render Helpers ---

  const renderHeader = () => (
    <header className="h-[52px] bg-white border-b border-[#E7EBF2] flex items-center justify-between px-[14px] sticky top-0 z-50">
      <div className="flex items-center">
        <img 
          src="https://cdn.brandfetch.io/idl7VNvriH/w/820/h/200/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B" 
          alt="5paisa" 
          className="h-[20px] w-auto max-w-[92px] object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            const fallback = document.createElement('span');
            fallback.innerText = '5paisa';
            fallback.className = 'text-lg font-black text-[#171A21]';
            (e.target as HTMLImageElement).parentElement?.appendChild(fallback);
          }}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-[#F5F7FB] px-2.5 py-1 rounded-full border border-[#E7EBF2]">
          <span className="text-[10px] font-bold text-[#171A21]">EN</span>
        </div>
        <div className="relative">
          <Bell size={20} className="text-[#667085]" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#E31C3D] rounded-full border border-white" />
        </div>
        <div className="w-8 h-8 bg-[#F5F7FB] rounded-full border border-[#E7EBF2] flex items-center justify-center">
          <User size={18} className="text-[#171A21]" />
        </div>
      </div>
    </header>
  );

  const renderTicker = () => (
    <div className="h-[34px] bg-white border-b border-[#E7EBF2] overflow-hidden flex items-center">
      <div className="animate-ticker">
        {[...MARKET_DATA, ...MARKET_DATA].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 px-4 whitespace-nowrap">
            <span className="text-[11px] text-[#667085] font-medium">{item.name}</span>
            <span className="text-[11px] font-bold tabular-nums">{item.value}</span>
            <span className={`text-[10px] font-bold flex items-center ${item.up ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {item.up ? '▲' : '▼'} {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModeToggle = () => (
    <div className="sticky top-[52px] z-40 bg-[#F5F7FB] px-[14px] py-3 border-b border-[#E7EBF2]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex bg-white p-1 rounded-xl border border-[#E7EBF2] w-full max-w-[280px]">
          <button 
            onClick={() => setMode('Current')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${mode === 'Current' ? 'bg-[#171A21] text-white shadow-sm' : 'text-[#667085]'}`}
          >
            Current 5paisa
          </button>
          <button 
            onClick={() => setMode('AI')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${mode === 'AI' ? 'bg-[#E31C3D] text-white shadow-sm' : 'text-[#667085]'}`}
          >
            With embedded AI
          </button>
        </div>
        <button 
          onClick={() => { setMode('AI'); setTourStep(0); setShowTour(true); }}
          className="text-[11px] font-bold text-[#E31C3D] hover:underline"
        >
          See guided tour
        </button>
      </div>
      {mode === 'AI' && (
        <div className="bg-[#E31C3D]/5 border border-[#E31C3D]/10 rounded-lg px-3 py-2 flex items-center gap-2">
          <Sparkles size={12} className="text-[#E31C3D]" />
          <span className="text-[10px] font-bold text-[#E31C3D] uppercase tracking-wider">Portfolio Intelligence Active</span>
        </div>
      )}
    </div>
  );

  const renderHome = () => (
    <div className="p-[14px] space-y-3 pt-2">
      {/* Hero Portfolio Card */}
      <div className="bg-[#171A21] p-4 rounded-[18px] text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Total Portfolio Value</p>
              <h2 className="text-2xl font-black tabular-nums">₹12,48,200</h2>
            </div>
            <div className="bg-white/10 px-2 py-1 rounded-md flex items-center gap-1">
              <TrendingUp size={12} className="text-[#16A34A]" />
              <span className="text-[11px] font-bold text-[#16A34A]">+₹14,200</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Invested</p>
              <p className="text-sm font-bold tabular-nums">₹10,24,000</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Returns</p>
              <p className="text-sm font-bold text-[#16A34A] tabular-nums">+21.8%</p>
            </div>
          </div>
        </div>
      </div>

      {mode === 'AI' && (
        <>
          {/* Portfolio Health Card */}
          <div id="tour-health" className="bg-white p-4 rounded-[18px] border border-[#E7EBF2] shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Heart size={14} className="text-[#E31C3D]" fill="#E31C3D" />
                  <span className="text-[10px] font-bold text-[#E31C3D] uppercase tracking-wider">Portfolio Health</span>
                </div>
                <h3 className="text-[14px] font-bold text-[#171A21]">Your score is 78/100</h3>
              </div>
              <div className="w-10 h-10 rounded-full border-4 border-[#EEF9F1] border-t-[#16A34A] flex items-center justify-center">
                <span className="text-[11px] font-black text-[#171A21]">78</span>
              </div>
            </div>
            <p className="text-[12px] text-[#667085] leading-relaxed mb-4">
              Your portfolio is performing well, but high mutual fund overlap is reducing your diversification benefit.
            </p>
            <button 
              onClick={() => setIsHealthSheetOpen(true)}
              className="w-full py-2.5 bg-[#F5F7FB] border border-[#E7EBF2] rounded-xl text-[12px] font-bold text-[#171A21] flex items-center justify-center gap-2"
            >
              Check Health Report <ChevronRight size={14} />
            </button>
          </div>

          {/* Tax Harvest Alert */}
          <div id="tour-tax" className="bg-[#FFF9F0] p-4 rounded-[18px] border border-amber-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                <AlertCircle size={16} className="text-white" />
              </div>
              <h3 className="text-[14px] font-bold text-[#171A21]">Tax Harvest Alert</h3>
            </div>
            <p className="text-[12px] text-[#667085] leading-relaxed mb-4">
              You can save up to <span className="font-bold text-[#171A21]">₹15,500</span> in taxes by booking partial gains before March 31.
            </p>
            <button 
              onClick={() => setIsTaxSheetOpen(true)}
              className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
            >
              Review Opportunities <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}

      {/* Market Indices */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'NIFTY 50', val: '22,453.20', chg: '+142.10', pct: '+0.64%', up: true },
          { name: 'SENSEX', val: '73,917.40', chg: '+482.30', pct: '+0.66%', up: true },
        ].map((idx, i) => (
          <div key={i} className="bg-white p-3.5 rounded-[18px] border border-[#E7EBF2]">
            <p className="text-[10px] font-bold text-[#98A2B3] uppercase mb-1">{idx.name}</p>
            <p className="text-sm font-black text-[#171A21] tabular-nums">{idx.val}</p>
            <p className={`text-[10px] font-bold mt-0.5 ${idx.up ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {idx.chg} ({idx.pct})
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: <PieChart size={20} />, label: 'Holdings' },
          { icon: <Zap size={20} />, label: 'Quick Buy' },
          { icon: <TrendingUp size={20} />, label: 'Top Gainers' },
          { icon: <LayoutGrid size={20} />, label: 'More' },
        ].map((action, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 bg-white rounded-2xl border border-[#E7EBF2] flex items-center justify-center text-[#171A21]">
              {action.icon}
            </div>
            <span className="text-[10px] font-bold text-[#667085]">{action.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="p-[14px] space-y-3 pt-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[20px] font-bold text-[#171A21]">Portfolio</h2>
        <div className="flex gap-2">
          <button className="p-2 bg-white border border-[#E7EBF2] rounded-lg text-[#667085]">
            <Filter size={16} />
          </button>
          <button className="p-2 bg-white border border-[#E7EBF2] rounded-lg text-[#667085]">
            <Search size={16} />
          </button>
        </div>
      </div>

      {mode === 'AI' && (
        <div id="tour-overlap" className="bg-[#F5F7FB] p-4 rounded-[18px] border border-[#E7EBF2] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-[#171A21] rounded-lg flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <h3 className="text-[14px] font-bold text-[#171A21]">Portfolio Overlap</h3>
          </div>
          <p className="text-[12px] text-[#667085] leading-relaxed mb-4">
            You have <span className="font-bold text-[#171A21]">64% overlap</span> between UTI Flexi Cap and HDFC Flexi Cap. You are paying double fees for the same stocks.
          </p>
          <button 
            onClick={() => setIsOverlapSheetOpen(true)}
            className="w-full py-2.5 bg-[#171A21] text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-2"
          >
            Fix Overlap Issues <ChevronRight size={14} />
          </button>
        </div>
      )}

      <div className="space-y-3">
        {[
          { name: 'HDFC Bank', qty: '42', price: '1,452.10', chg: '+1.2%', up: true, val: '60,988' },
          { name: 'Reliance Industries', qty: '12', price: '2,984.40', chg: '-0.4%', up: false, val: '35,812' },
          { name: 'Infosys', qty: '25', price: '1,642.00', chg: '+2.1%', up: true, val: '41,050' },
          { name: 'TCS', qty: '8', price: '4,120.50', chg: '+0.8%', up: true, val: '32,964' },
        ].map((stock, i) => (
          <div key={i} className="bg-white p-3.5 rounded-[18px] border border-[#E7EBF2] flex justify-between items-center">
            <div>
              <p className="text-[14px] font-bold text-[#171A21]">{stock.name}</p>
              <p className="text-[11px] text-[#667085] font-medium mt-0.5">Qty: {stock.qty} • Avg: ₹{stock.price}</p>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-black text-[#171A21] tabular-nums">₹{stock.val}</p>
              <p className={`text-[11px] font-bold mt-0.5 ${stock.up ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                {stock.chg}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSimpleScreen = (title: string, subtitle: string, content: React.ReactNode) => (
    <div className="px-[14px] pb-24">
      <div className="py-6">
        <h2 className="text-2xl font-bold text-[#171A21]">{title}</h2>
        <p className="text-sm text-[#667085] mt-1 leading-relaxed">{subtitle}</p>
      </div>
      {content}
    </div>
  );

  const renderMarkets = () => renderSimpleScreen(
    "Markets", 
    "The current market-first layout stays intact.",
    <div className="space-y-4">
      {[
        { name: 'NIFTY 50', val: '24,680', chg: '▲0.3%', desc: 'Broad market benchmark' },
        { name: 'SENSEX', val: '81,240', chg: '▲0.4%', desc: 'Large-cap momentum remains stable' },
        { name: 'BANKNIFTY', val: '52,140', chg: '▲0.5%', desc: 'Financials slightly positive' },
      ].map((m, i) => (
        <div key={i} className="bg-white p-4 rounded-[18px] border border-[#E7EBF2] shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-[#171A21]">{m.name}</span>
            <div className="text-right">
              <span className="font-bold tabular-nums">{m.val}</span>
              <span className="ml-2 text-[11px] font-bold text-[#16A34A]">{m.chg}</span>
            </div>
          </div>
          <p className="text-xs text-[#667085]">{m.desc}</p>
        </div>
      ))}
    </div>
  );

  const renderOrders = () => renderSimpleScreen(
    "Orders", 
    "Order history stays where users already expect it.",
    <div className="space-y-3">
      {[
        { label: 'Buy order · NIFTYBEES', status: 'Completed', color: 'text-green-600' },
        { label: 'SIP · UTI Flexi Cap', status: 'Active', color: 'text-blue-600' },
        { label: 'Funds added', status: '₹10,000', color: 'text-[#171A21]' },
      ].map((o, i) => (
        <div key={i} className="bg-white px-4 py-3.5 rounded-[18px] border border-[#E7EBF2] shadow-sm flex justify-between items-center">
          <span className="text-sm font-bold text-[#171A21]">{o.label}</span>
          <span className={`text-xs font-bold ${o.color}`}>{o.status}</span>
        </div>
      ))}
    </div>
  );

  const renderMore = () => renderSimpleScreen(
    "More", 
    "Utility and account actions remain unchanged.",
    <div className="bg-white rounded-[18px] border border-[#E7EBF2] shadow-sm overflow-hidden">
      {['Profile & Account', 'Funds', 'Reports', 'Help & Support'].map((item, i) => (
        <div key={i} className="px-4 py-4 flex justify-between items-center border-b border-[#E7EBF2] last:border-0">
          <span className="text-sm font-bold text-[#171A21]">{item}</span>
          <ChevronRight size={18} className="text-[#98A2B3]" />
        </div>
      ))}
    </div>
  );

  const renderHealthSheetContent = () => (
    <div className="space-y-6">
      <div className="bg-[#FAFBFE] p-6 rounded-[24px] border border-[#E7EBF2] flex flex-col items-center text-center">
        <div className="relative w-28 h-28 flex items-center justify-center mb-4">
          <svg className="w-full h-full -rotate-90">
            <circle cx="56" cy="56" r="50" fill="transparent" stroke="#E7EBF2" strokeWidth="8" />
            <circle cx="56" cy="56" r="50" fill="transparent" stroke="#16A34A" strokeWidth="8" strokeDasharray={314} strokeDashoffset={314 * (1 - 0.78)} strokeLinecap="round" />
          </svg>
          <span className="absolute text-3xl font-black text-[#171A21]">78</span>
        </div>
        <p className="text-sm font-bold text-[#171A21] leading-relaxed px-4">Your portfolio is doing well on returns, but diversification needs work.</p>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Diversification', score: '48/100', desc: 'Several funds repeat the same top holdings.' },
          { label: 'Returns vs Benchmark', score: '71/100', desc: 'Current performance is ahead of your benchmark.' },
          { label: 'Tax Efficiency', score: '54/100', desc: 'Some LTCG opportunities were missed this year.' },
          { label: 'Risk Balance', score: '63/100', desc: 'Overall risk is manageable, but concentration is rising.' },
        ].map((m, i) => (
          <div key={i} className="flex justify-between items-start gap-4 p-1">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-bold text-[#171A21]">{m.label}</span>
                <span className="text-sm font-black text-[#171A21]">{m.score}</span>
              </div>
              <p className="text-xs text-[#667085]">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#98A2B3] uppercase tracking-wider">What’s pulling your score down</h4>
        <p className="text-sm text-[#171A21] leading-relaxed">High fund overlap is the main issue. You also came very close to the annual LTCG exemption limit without using it fully.</p>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#98A2B3] uppercase tracking-wider">Top 3 actions to improve</h4>
        <div className="space-y-2">
          {['Reduce one overlapping fund.', 'Set a year-end tax reminder.', 'Review SIP allocation once this month.'].map((a, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="w-5 h-5 bg-[#EEF4FF] text-[#2563EB] rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">{i+1}</span>
              <p className="text-sm text-[#171A21] font-medium">{a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button 
          onClick={() => { setIsHealthSheetOpen(false); setIsOverlapSheetOpen(true); }}
          className="w-full py-3.5 bg-[#171A21] text-white rounded-xl font-bold"
        >
          Fix overlap
        </button>
        <button 
          onClick={() => { setIsHealthSheetOpen(false); setIsTaxSheetOpen(true); }}
          className="w-full py-3.5 bg-white border border-[#E7EBF2] text-[#171A21] rounded-xl font-bold"
        >
          View tax opportunities
        </button>
        <button 
          onClick={() => setIsHealthSheetOpen(false)}
          className="w-full py-3.5 bg-white text-[#667085] rounded-xl font-bold text-sm"
        >
          Review portfolio
        </button>
      </div>
    </div>
  );

  const renderAskSheetContent = () => {
    const promptsByTab: Record<Tab, string[]> = {
      Home: ["What is hurting my portfolio health?", "Why is overlap high?", "Should I review tax opportunities now?"],
      Portfolio: ["What does 62/100 mean?", "Which fund overlaps the most?", "How can I improve diversification?"],
      Markets: ["Why is NIFTY up today?", "Does this affect my portfolio?", "What should I ignore today?"],
      Orders: ["What was my last completed order?", "Do I have an active SIP?", "What should I check after buying?"],
      More: ["Where can I see reports?", "How do I add funds?", "Where is tax-ready P&L?"]
    };

    const answers: Record<string, string> = {
      "What is hurting my portfolio health?": "The biggest issue is overlap across your equity mutual funds. Returns are holding up, but diversification is weaker than it looks.",
      "Why is overlap high?": "Several of your funds hold the same top stocks like Reliance, HDFC Bank, Infosys, and ICICI Bank.",
      "Should I review tax opportunities now?": "You were very close to the annual LTCG exemption limit. A quick review can help you avoid missing the window next year.",
      "What does 62/100 mean?": "It's a balanced score. You're doing great on returns (71/100), but diversification (48/100) is pulling the overall average down.",
      "Which fund overlaps the most?": "UTI Flexi Cap Fund has a 78% overlap with your other holdings, repeating 17 stocks already in your portfolio.",
      "How can I improve diversification?": "Consider consolidating overlapping funds. Redirecting SIPs from UTI Flexi Cap to a different category fund would help.",
      "Why is NIFTY up today?": "Positive global cues and strong buying in heavyweights like Reliance and TCS are driving the momentum today.",
      "Does this affect my portfolio?": "Yes, your portfolio is up 0.6% today, largely driven by your HDFC and Reliance exposure which are key NIFTY components.",
      "What was my last completed order?": "Your last order was a Buy of NIFTYBEES which was completed successfully earlier today.",
      "Where can I see reports?": "You can find all your tax, P&L, and transaction reports under the 'Reports' section in the 'More' tab."
    };

    return (
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {promptsByTab[activeTab].map((p, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedPrompt(p)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all ${selectedPrompt === p ? 'bg-[#171A21] text-white border-[#171A21]' : 'bg-white text-[#667085] border-[#E7EBF2]'}`}
            >
              {p}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedPrompt && (
            <motion.div 
              key={selectedPrompt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#FAFBFE] p-4 rounded-2xl border border-[#E7EBF2]"
            >
              <p className="text-sm font-bold text-[#171A21] mb-2">{selectedPrompt}</p>
              <p className="text-sm text-[#667085] leading-relaxed">
                {answers[selectedPrompt] || "I can help you with that. Based on your current portfolio and market conditions, it's best to review your holdings once a month."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedPrompt && (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-[#EEF4FF] rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="text-[#2563EB]" size={24} />
            </div>
            <p className="text-sm font-bold text-[#171A21]">Ask me anything</p>
            <p className="text-xs text-[#667085] mt-1">Tap a prompt above to get started</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-root">
      <div className="app-shell">
        
        {/* Top Chrome */}
        <div className="top-chrome">
          {renderHeader()}
          {renderTicker()}
          {renderModeToggle()}
        </div>

        {/* Screen Viewport - Only this scrolls */}
        <div className="screen-viewport custom-scrollbar">
          {activeTab === 'Home' && renderHome()}
          {activeTab === 'Portfolio' && renderPortfolio()}
          {activeTab === 'Markets' && renderMarkets()}
          {activeTab === 'Orders' && renderOrders()}
          {activeTab === 'More' && renderMore()}
        </div>

        {/* FAB Layer */}
        {mode === 'AI' && (
          <div className="fab-layer">
            <motion.button 
              id="ask-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setIsAskSheetOpen(true); setSelectedPrompt(null); }}
              className="ask-fab w-14 h-14 bg-[#14B8A6] text-white rounded-full shadow-lg flex items-center justify-center pointer-events-auto"
            >
              <Sparkles size={24} />
            </motion.button>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="bottom-nav-area">
          <nav className="h-[64px] bg-white border-t border-[#E7EBF2] flex items-center justify-around px-2 relative">
            {[
              { id: 'Home', icon: HomeIcon, label: 'Home' },
              { id: 'Portfolio', icon: Briefcase, label: 'Portfolio' },
              { id: 'Markets', icon: TrendingUp, label: 'Markets' },
              { id: 'Orders', icon: ClipboardList, label: 'Orders' },
              { id: 'More', icon: MoreHorizontal, label: 'More' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className="flex flex-col items-center justify-center gap-1 relative h-full flex-1"
              >
                <tab.icon size={20} className={activeTab === tab.id ? 'text-[#E31C3D]' : 'text-[#98A2B3]'} />
                <span className={`text-[10px] font-bold ${activeTab === tab.id ? 'text-[#E31C3D]' : 'text-[#98A2B3]'}`}>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overlay Layer */}
        <div className="overlay-layer">
          {/* Tour */}
          {showTour && (
            <TourOverlay 
              step={tourStep} 
              onNext={handleTourNext} 
              onSkip={cleanupTour} 
              activeTab={activeTab}
            />
          )}

          {/* Sheets */}
          <BottomSheet 
            isOpen={isHealthSheetOpen} 
            onClose={() => setIsHealthSheetOpen(false)} 
            title="Portfolio Health Report"
            subtext="Your portfolio score is 78/100. Here's how to improve it."
          >
            {renderHealthSheetContent()}
          </BottomSheet>

          <BottomSheet 
            isOpen={isOverlapSheetOpen} 
            onClose={() => { setIsOverlapSheetOpen(false); setOverlapFromTour(false); }} 
            title="Overlap Analysis"
            subtext={overlapFromTour ? "We've identified high overlap in your portfolio." : "See where your funds are repeating stocks."}
          >
            <div className="space-y-6">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-amber-600" />
                  <h3 className="text-sm font-bold text-[#171A21]">High Overlap Detected</h3>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Your UTI Flexi Cap and Parag Parikh Flexi Cap funds have a <span className="font-bold text-[#171A21]">64% overlap</span>. You are paying double fees for the same stocks.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#98A2B3] uppercase tracking-wider">What’s repeating</h4>
                <div className="space-y-3">
                  {OVERLAP_STOCKS.map((s, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#171A21]">{s.name}</span>
                        <span className="text-[#667085]">{s.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${s.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#98A2B3] uppercase tracking-wider">Most overlapping funds</h4>
                <div className="space-y-3">
                  {OVERLAPPING_FUNDS.map((f, i) => (
                    <div key={i} className="bg-white p-3.5 rounded-xl border border-[#E7EBF2] flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-[#171A21]">{f.name}</p>
                        <p className="text-[10px] text-[#667085] font-medium mt-0.5">{f.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-amber-600">{f.overlap}</p>
                        <p className="text-[10px] text-[#98A2B3] font-medium mt-0.5">{f.repeated}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAFBFE] p-5 rounded-[24px] border border-[#E7EBF2]">
                <h4 className="text-sm font-bold text-[#171A21] mb-2">What can you do?</h4>
                <p className="text-sm text-[#667085] leading-relaxed mb-4">Consider stopping the UTI Flexi Cap SIP and redirecting ₹500/month to a lower-overlap fund.</p>
                <div className="flex gap-2">
                  {['Overlap falls: 64% → 38%', 'Saves ₹540/year', 'Improves diversification'].map((p, i) => (
                    <div key={i} className="bg-white px-2 py-1 rounded-md border border-[#E7EBF2]">
                      <span className="text-[9px] font-bold text-[#171A21]">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsConfirmSheetOpen(true)}
                  className="flex-1 py-3.5 bg-[#171A21] text-white rounded-xl font-bold"
                >
                  Try this change
                </button>
                <button 
                  onClick={() => { setIsOverlapSheetOpen(false); showSuccessToast("We will remind you later"); }}
                  className="flex-1 py-3.5 bg-white border border-[#E7EBF2] text-[#171A21] rounded-xl font-bold"
                >
                  Remind me later
                </button>
              </div>
            </div>
          </BottomSheet>

          <BottomSheet 
            isOpen={isConfirmSheetOpen} 
            onClose={() => setIsConfirmSheetOpen(false)} 
            title="Try this change"
          >
            <div className="space-y-6">
              <p className="text-sm text-[#667085] leading-relaxed">Stop UTI Flexi Cap SIP and redirect ₹500/month to a lower-overlap index fund.</p>
              
              <div className="bg-[#EEF9F1] p-4 rounded-2xl border border-[#16A34A]/10">
                <h4 className="text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-3">Expected impact</h4>
                <div className="space-y-2">
                  {['Overlap 64% → 38%', '₹540/year fee saving', 'Cleaner diversification'].map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[#16A34A]" />
                      <span className="text-sm font-bold text-[#171A21]">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => { setIsConfirmSheetOpen(false); setIsOverlapSheetOpen(false); showSuccessToast("Change flow opened in demo"); }}
                  className="flex-1 py-3.5 bg-[#E31C3D] text-white rounded-xl font-bold"
                >
                  Proceed in demo
                </button>
                <button 
                  onClick={() => setIsConfirmSheetOpen(false)}
                  className="flex-1 py-3.5 bg-white border border-[#E7EBF2] text-[#171A21] rounded-xl font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </BottomSheet>

          <BottomSheet 
            isOpen={isTaxSheetOpen} 
            onClose={() => setIsTaxSheetOpen(false)} 
            title="Tax Harvest Alert"
            subtext="Review before year-end and plan better next year."
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'LTCG gains', val: '₹1,24,200', color: 'text-[#171A21]' },
                  { label: 'STCG gains', val: '₹8,400', color: 'text-[#171A21]' },
                  { label: 'Missed saving', val: '₹15,500', color: 'text-[#DC2626]' },
                  { label: 'Status', val: 'Review now', color: 'text-amber-600' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#FAFBFE] p-3.5 rounded-xl border border-[#E7EBF2]">
                    <p className="text-[10px] text-[#98A2B3] font-bold uppercase">{item.label}</p>
                    <p className={`text-sm font-black mt-0.5 tabular-nums ${item.color}`}>{item.val}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#98A2B3] uppercase tracking-wider">Opportunity list</h4>
                <div className="space-y-3">
                  {[
                    { name: 'HDFC Flexi Cap', action: 'Book partial gains before Mar 31', save: '₹6,400' },
                    { name: 'Parag Parikh Flexi Cap', action: 'Redeem selected units', save: '₹4,100' },
                    { name: 'SBI Nifty 50 Index', action: 'Use remaining exemption window', save: '₹5,000' },
                  ].map((o, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-[#E7EBF2] flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-[#171A21]">{o.name}</p>
                        <p className="text-xs text-[#667085] mt-0.5">{o.action}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-[#16A34A] tabular-nums">+{o.save}</p>
                        <p className="text-[9px] text-[#98A2B3] font-bold uppercase mt-0.5">Saved</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#98A2B3] uppercase tracking-wider">Plan better next year</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Set March reminder', action: () => showSuccessToast("March reminder set successfully") },
                    { label: 'Track LTCG threshold live', action: () => {} },
                    { label: 'Download tax-ready P&L', action: () => {} },
                  ].map((c, i) => (
                    <button key={i} onClick={c.action} className="px-3 py-2 bg-[#F5F7FB] border border-[#E7EBF2] rounded-full text-xs font-bold text-[#171A21]">
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-[#E7EBF2] rounded-xl overflow-hidden">
                <details className="group">
                  <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                    <span className="text-sm font-bold text-[#171A21]">How tax harvesting works</span>
                    <ChevronDown size={18} className="text-[#98A2B3] group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-[#667085] leading-relaxed">
                    Gains on long-held equity investments can be tax-optimized. The annual exemption limit matters. A reminder at the right time can reduce avoidable tax without changing your overall long-term plan.
                  </div>
                </details>
              </div>
            </div>
          </BottomSheet>

          <BottomSheet 
            isOpen={isAskSheetOpen} 
            onClose={() => setIsAskSheetOpen(false)} 
            title="Ask 5paisa Guide"
            subtext={
              activeTab === 'Home' ? "Quick help for your home and portfolio alerts." :
              activeTab === 'Portfolio' ? "Questions about your holdings, score, and overlap." :
              activeTab === 'Markets' ? "Questions about what is moving in markets." :
              activeTab === 'Orders' ? "Questions about orders and recent activity." :
              "Help with account and support sections."
            }
          >
            {renderAskSheetContent()}
          </BottomSheet>

          {/* Toast */}
          <Toast 
            message={toast.message} 
            isVisible={toast.visible} 
            onHide={() => setToast({ ...toast, visible: false })} 
          />
        </div>
      </div>
    </div>
  );
}
