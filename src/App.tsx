import { useState, useEffect, FormEvent, useRef } from "react";
import { 
  Search, Sparkles, Zap, BookOpen, AlertCircle, 
  CheckCircle2, HelpCircle, RotateCcw, GraduationCap, 
  Layers, Check, X, Flame, ChevronRight, Award,
  Download, Sun, Moon, Volume2, Pause, Timer,
  Info, Sparkle, Play, Hourglass, ExternalLink,
  Music, SkipForward, SkipBack, VolumeX, Volume1,
  Code, AlertTriangle, Gamepad2, FileText, Brain, Trophy, ChevronDown,
  Send, Quote, Image as ImageIcon
} from "lucide-react";
import { jsPDF } from "jspdf";
import { CramData } from "./types.js";
import { DRY_RUN_TEMPLATES } from "./dryRunTemplates.js";

const SUGGESTIONS = [
  "OS Semaphores",
  "Binary Search Trees",
  "TCP/IP 3-Way Handshake",
  "React Virtual DOM",
  "SQL Joins & Window Functions",
  "Fourier Transform"
];

const RELAXING_TRACKS = [
  {
    title: "Late Night Chill",
    genre: "Lofi Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    icon: "🎧",
    description: "Relaxing vinyl lofi chords, perfect for focus."
  },
  {
    title: "Cozy Study Room",
    genre: "Jazz Piano",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    icon: "🎹",
    description: "Soothe your neurons with gentle keyboard melodies."
  },
  {
    title: "Rainy Evening",
    genre: "Acoustic Ambient",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    icon: "🌧️",
    description: "Warm guitar strings blended with virtual raindrops."
  },
  {
    title: "Deep Cosmic Focus",
    genre: "Zen Synthesizer",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    icon: "🌌",
    description: "A deep, floating soundscape designed for memory."
  },
  {
    title: "Forest Sanctuary",
    genre: "Flute & Nature",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    icon: "🪵",
    description: "Calm wood flute and soft chirps to lower exam stress."
  },
  {
    title: "Midnight Espresso",
    genre: "Warm Analog Bass",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    icon: "☕",
    description: "Subtle sub-bass and vinyl crackle to keep you grounded."
  },
  {
    title: "Sunset Dreamer",
    genre: "Chillwave Ambient",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    icon: "🌅",
    description: "An inspiring retro synth track for long-term coding."
  },
  {
    title: "Alpha Memory Waves",
    genre: "Binaural Brainwave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    icon: "🧠",
    description: "Alpha frequency beats to trigger maximum brain focus."
  },
  {
    title: "Hypnotic Lounge",
    genre: "Deep Concentration",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    icon: "🕯️",
    description: "A repetitive, minimalist ambient drone to zone in completely."
  },
  {
    title: "Spring Blossom",
    genre: "Traditional Koto",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    icon: "🌸",
    description: "Traditional string pluckings in modern lo-fi rhythm."
  }
];

const TAB_INFO = [
  { id: "cheat", label: "AI Cheat Sheets", icon: Zap, color: "from-amber-400 to-orange-500" },
  { id: "cards", label: "Flashcard Station", icon: Layers, color: "from-violet-400 to-indigo-500" },
  { id: "quiz", label: "Adaptive Quiz", icon: GraduationCap, color: "from-cyan-400 to-blue-500" },
  { id: "visualizer", label: "Code Dry Run", icon: Code, color: "from-emerald-400 to-teal-500" },
  { id: "panic", label: "Panic Timeline", icon: AlertTriangle, color: "from-rose-500 to-pink-500" },
  { id: "parser", label: "Syllabus Parser", icon: FileText, color: "from-sky-400 to-blue-600" },
  { id: "battle", label: "MCQ Duel Arena", icon: Gamepad2, color: "from-purple-500 to-fuchsia-600" },
  { id: "videos", label: "Video Lounge", icon: Play, color: "from-rose-500 to-red-600" }
];

export default function App() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CramData | null>(null);
  const [activeTab, setActiveTab] = useState<"cheat" | "cards" | "quiz" | "visualizer" | "panic" | "parser" | "battle" | "videos">("cheat");
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  
  // Custom states requested
  const [isEasyMode, setIsEasyMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Pomodoro Study Timer states
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25 mins by default
  const [timerActive, setTimerActive] = useState(false);
  const [timerType, setTimerType] = useState<"study" | "break">("study");
  const [timerNotification, setTimerNotification] = useState<string | null>(null);

  // Quiz & Flashcard states
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Additional features requested
  const [moreLoading, setMoreLoading] = useState<Record<string, boolean>>({});
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: "Hey there! I'm Crammy, your AI exam pilot! 🤖 Ready to conquer the night? Type your questions or doubts about any topic, and I will clear them instantly!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatbotTyping, setChatbotTyping] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Background/Ambient quotes rotating state
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);

  const STUDY_QUOTES = [
    { quote: "The beautiful thing about learning is nobody can take it away from you.", author: "B.B. King" },
    { quote: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
    { quote: "Make it work, make it right, make it fast.", author: "Kent Beck" },
    { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { quote: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie" },
    { quote: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
    { quote: "Strive for perfection in everything you do. Take the best that exists and make it better.", author: "Sir Henry Royce" },
    { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { quote: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuoteIdx(prev => (prev + 1) % STUDY_QUOTES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Interactive Video Learning States
  const [videoNotes, setVideoNotes] = useState<Record<number, string>>({});
  const [videoFlashcards, setVideoFlashcards] = useState<Record<number, any[]>>({});
  const [videoQuizzes, setVideoQuizzes] = useState<Record<number, any[]>>({});
  const [videoCoding, setVideoCoding] = useState<Record<number, any[]>>({});
  const [completedVideos, setCompletedVideos] = useState<Record<number, boolean>>({});
  const [generatingVideoItem, setGeneratingVideoItem] = useState<Record<string, boolean>>({});
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<Record<number, "notes" | "flashcards" | "quiz" | "coding" | null>>({});
  const [videoQuizAnswers, setVideoQuizAnswers] = useState<Record<string, string>>({}); // keys like "videoIndex-questionIndex"
  const [videoQuizSubmitted, setVideoQuizSubmitted] = useState<Record<number, boolean>>({});
  const [videoFlippedCards, setVideoFlippedCards] = useState<Record<string, boolean>>({}); // keys like "videoIndex-cardIndex"

  // Hackathon Study Themes Customizer
  const [selectedTheme, setSelectedTheme] = useState<"cyber" | "sunset" | "forest" | "amber">("cyber");

  // Speed-Cram RSVP Mode states
  const [speedReadActive, setSpeedReadActive] = useState(false);
  const [speedReadWords, setSpeedReadWords] = useState<string[]>([]);
  const [speedReadIndex, setSpeedReadIndex] = useState(0);
  const [speedReadWpm, setSpeedReadWpm] = useState(300);

  // Binaural Focus Synthesizer Audio State
  const [synthActive, setSynthActive] = useState(false);
  const [synthPreset, setSynthPreset] = useState<"binaural" | "rain" | "drone">("binaural");
  const [synthVolume, setSynthVolume] = useState(0.2);

  // Curated 10 relaxing music track states
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [musicVolume, setMusicVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTrackIndexRef = useRef<number | null>(null);

  // --- NEW EXAM SURVIVAL STATE VARIABLES ---
  
  // 1. Syllabus / Text note parser
  const [parserText, setParserText] = useState("");
  const [parserLoading, setParserLoading] = useState(false);

  // 2. Code Dry Run Visualizer states
  const [selectedDryRunTemplate, setSelectedDryRunTemplate] = useState("bubble-sort");
  const [dryRunCode, setDryRunCode] = useState("");
  const [dryRunStepIndex, setDryRunStepIndex] = useState(0);
  const [dryRunPlaying, setDryRunPlaying] = useState(false);

  // 3. Panic Mode timeline state
  const [panicHoursLeft, setPanicHoursLeft] = useState(5);
  const [panicActive, setPanicActive] = useState(false);
  const [panicCompletedTasks, setPanicCompletedTasks] = useState<Record<string, boolean>>({
    "task-0": true, // Read 1-page notes
    "task-1": false, // Solve quick adaptive quiz
    "task-2": false, // Review weak topics
    "task-3": false, // Practice core formulas
    "task-4": false  // Run rapid revision & mock quiz
  });

  // 4. Adaptive Quiz and Weakness states
  const [quizDifficulty, setQuizDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [weaknessSubtopics, setWeaknessSubtopics] = useState<Record<string, number>>({});
  const [mistakeNotebook, setMistakeNotebook] = useState<Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    wrongAnswer: string;
    subtopic: string;
  }>>([]);

  // 5. MCQ Battle Duel states
  const [playerName, setPlayerName] = useState("Rookie Ninja");
  const [battleActive, setBattleActive] = useState(false);
  const [battleQuestionIndex, setBattleQuestionIndex] = useState(0);
  const [battleTimer, setBattleTimer] = useState(15);
  const [battleUserScore, setBattleUserScore] = useState(0);
  const [battleBotScore, setBattleBotScore] = useState(0);
  const [battleSelectedOption, setBattleSelectedOption] = useState<string | null>(null);
  const [battleMessages, setBattleMessages] = useState<string[]>([]);
  const [battleLeaderboard, setBattleLeaderboard] = useState([
    { name: "GPT-4 Master", score: 950, rank: 1, avatar: "🤖" },
    { name: "Coding Ninja Pro", score: 870, rank: 2, avatar: "🥷" },
    { name: "Cram Hero", score: 720, rank: 3, avatar: "⚡" },
    { name: "Srinivasa", score: 680, rank: 4, avatar: "🎓" },
    { name: "Rohan (Peer)", score: 540, rank: 5, avatar: "👨‍💻" }
  ]);
  const [battleShowLeaderboard, setBattleShowLeaderboard] = useState(false);

  // 1. Web Audio API synthesized focus chime (no asset dependency)
  const playFocusChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Sound synthesis bypassed:", e);
    }
  };

  // 2. Study Timer Effects
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      playFocusChime();
      
      if (timerType === "study") {
        setTimerNotification("Study cycle finished! Take a quick 5-minute breather.");
        setTimerType("break");
        setTimerSeconds(300); // 5 mins break
      } else {
        setTimerNotification("Break's over! Let's get focused for another 25-minute sprint.");
        setTimerType("study");
        setTimerSeconds(1500); // 25 mins study
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, timerType]);

  // MCQ Battle countdown timer effect
  useEffect(() => {
    let timer: any = null;
    if (battleActive && battleTimer > 0 && !battleSelectedOption) {
      timer = setInterval(() => {
        setBattleTimer(prev => prev - 1);
      }, 1000);
    } else if (battleTimer === 0 && battleActive && !battleSelectedOption) {
      // User timed out!
      handleBattleAnswer("");
    }
    return () => clearInterval(timer);
  }, [battleActive, battleTimer, battleSelectedOption]);

  // Code Dry Run autoplay effect
  useEffect(() => {
    const template = DRY_RUN_TEMPLATES[selectedDryRunTemplate];
    if (template) {
      setDryRunCode(template.code);
      setDryRunStepIndex(0);
      setDryRunPlaying(false);
    }
  }, [selectedDryRunTemplate]);

  useEffect(() => {
    let interval: any = null;
    if (dryRunPlaying) {
      interval = setInterval(() => {
        setDryRunStepIndex(prev => {
          const template = DRY_RUN_TEMPLATES[selectedDryRunTemplate];
          if (template && prev + 1 < template.steps.length) {
            return prev + 1;
          } else {
            setDryRunPlaying(false);
            return prev;
          }
        });
      }, 1800); // 1.8s per step
    }
    return () => clearInterval(interval);
  }, [dryRunPlaying, selectedDryRunTemplate]);

  // Hackathon Audio Focus Engine (Synthesized sounds with Web Audio API)
  useEffect(() => {
    if (!synthActive) return;

    let ctx: AudioContext | null = null;
    let mainGain: GainNode | null = null;
    let oscillators: OscillatorNode[] = [];
    let noiseSource: AudioBufferSourceNode | null = null;
    let intervalId: any = null;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      ctx = new AudioContextClass();
      
      mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(synthVolume * 0.15, ctx.currentTime);
      mainGain.connect(ctx.destination);

      if (synthPreset === "binaural") {
        // Binaural Beat: Left 200Hz, Right 210Hz
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        
        oscL.type = "sine";
        oscL.frequency.setValueAtTime(200, ctx.currentTime);
        
        oscR.type = "sine";
        oscR.frequency.setValueAtTime(210, ctx.currentTime);

        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-1, ctx.currentTime);
          pannerR.pan.setValueAtTime(1, ctx.currentTime);
          
          oscL.connect(pannerL);
          pannerL.connect(mainGain);
          
          oscR.connect(pannerR);
          pannerR.connect(mainGain);
        } else {
          oscL.connect(mainGain);
          oscR.connect(mainGain);
        }

        oscL.start();
        oscR.start();
        oscillators.push(oscL, oscR);

      } else if (synthPreset === "rain") {
        // Brown noise simulation
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(mainGain);
        noiseSource.start();

        // High pitch randomized pops
        const playDrop = () => {
          if (!ctx || !mainGain) return;
          const oscD = ctx.createOscillator();
          const gainD = ctx.createGain();
          
          oscD.type = "sine";
          oscD.frequency.setValueAtTime(1100 + Math.random() * 900, ctx.currentTime);
          
          gainD.gain.setValueAtTime(0, ctx.currentTime);
          gainD.gain.linearRampToValueAtTime(0.01 + Math.random() * 0.012, ctx.currentTime + 0.01);
          gainD.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2 + Math.random() * 0.25);
          
          const fD = ctx.createBiquadFilter();
          fD.type = "lowpass";
          fD.frequency.setValueAtTime(1400, ctx.currentTime);

          oscD.connect(fD);
          fD.connect(gainD);
          gainD.connect(mainGain);
          
          oscD.start();
          oscD.stop(ctx.currentTime + 0.5);
        };

        intervalId = setInterval(() => {
          if (Math.random() > 0.3) playDrop();
        }, 150);

      } else if (synthPreset === "drone") {
        // Slow sweeping analog drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(65.41, ctx.currentTime); // C2
        
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(65.7, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(180, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
        lfoGain.gain.setValueAtTime(50, ctx.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(mainGain);

        osc1.start();
        osc2.start();
        lfo.start();
        
        oscillators.push(osc1, osc2, lfo);
      }
    } catch (e) {
      console.warn("Synthesizer startup error:", e);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (noiseSource) {
        try { noiseSource.stop(); } catch {}
      }
      oscillators.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      if (ctx) {
        ctx.close();
      }
    };
  }, [synthActive, synthPreset, synthVolume]);

  // Speed-Cram RSVP Mode effect loop
  useEffect(() => {
    if (!speedReadActive || speedReadWords.length === 0) return;

    const msPerWord = (60 / speedReadWpm) * 1000;
    const interval = setInterval(() => {
      setSpeedReadIndex((prev) => {
        if (prev >= speedReadWords.length - 1) {
          clearInterval(interval);
          setSpeedReadActive(false);
          return prev;
        }
        return prev + 1;
      });
    }, msPerWord);

    return () => clearInterval(interval);
  }, [speedReadActive, speedReadWords, speedReadWpm]);

  // Synchronize Relaxing Music Volume State separately to prevent interruptions
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Synchronize Relaxing Music Playback & Track Change States
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const currentTrack = RELAXING_TRACKS[currentTrackIndex];
    
    // Only set src and load if track index has changed, or if src is empty
    if (lastTrackIndexRef.current !== currentTrackIndex || !audioRef.current.src) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.loop = true;
      lastTrackIndexRef.current = currentTrackIndex;
      // If we are changing track and playing, trigger load
      if (musicPlaying) {
        audioRef.current.load();
      }
    }

    if (musicPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Audio playback failed or was interrupted:", error);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [musicPlaying, currentTrackIndex]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSearch = async (e?: FormEvent, selectedTopic?: string) => {
    if (e) e.preventDefault();
    const query = (selectedTopic || topic).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setData(null);
    setQuizAnswers({});
    setFlippedCards({});
    
    try {
      const response = await fetch("/api/cram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          topic: query,
          simplified: isEasyMode
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "An error occurred during material generation.");
      }

      setData(result);
      setCurrentTopic(query);
      if (selectedTopic) setTopic(selectedTopic);
      setActiveTab("cheat");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate material. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async (type: "summary" | "flashcards" | "quiz") => {
    if (!currentTopic) return;
    setMoreLoading(prev => ({ ...prev, [type]: true }));
    try {
      const response = await fetch("/api/cram/more", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: currentTopic,
          type,
          simplified: isEasyMode
        })
      });

      const newItems = await response.json();
      if (!response.ok) {
        throw new Error(newItems.error || "Failed to load more items.");
      }

      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [type]: [...(prev[type] || []), ...newItems]
        };
      });

      // Simple success feedback sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch {}
    } catch (err: any) {
      console.error(err);
      alert("Failed to fetch more items: " + err.message);
    } finally {
      setMoreLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleGenerateVideoInteractive = async (videoIndex: number, type: "notes" | "flashcards" | "quiz" | "coding") => {
    if (!currentTopic || !data || !data.videoResources) return;
    const video = data.videoResources[videoIndex];
    if (!video) return;

    // Toggle active interactive tab
    setActiveInteractiveTab(prev => {
      const current = prev[videoIndex];
      if (current === type) {
        return { ...prev, [videoIndex]: null };
      }
      return { ...prev, [videoIndex]: type };
    });

    // If already generated, don't re-fetch
    if (type === "notes" && videoNotes[videoIndex]) return;
    if (type === "flashcards" && videoFlashcards[videoIndex]) return;
    if (type === "quiz" && videoQuizzes[videoIndex]) return;
    if (type === "coding" && videoCoding[videoIndex]) return;

    const itemKey = `${type}-${videoIndex}`;
    setGeneratingVideoItem(prev => ({ ...prev, [itemKey]: true }));

    try {
      const response = await fetch("/api/cram/video-interactive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: currentTopic,
          videoTitle: video.title,
          searchQuery: video.searchQuery,
          type
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to generate interactive video learning resource.");
      }

      if (type === "notes") {
        setVideoNotes(prev => ({ ...prev, [videoIndex]: result.notes }));
      } else if (type === "flashcards") {
        setVideoFlashcards(prev => ({ ...prev, [videoIndex]: result.flashcards }));
      } else if (type === "quiz") {
        setVideoQuizzes(prev => ({ ...prev, [videoIndex]: result.quiz }));
        setVideoQuizSubmitted(prev => ({ ...prev, [videoIndex]: false }));
      } else if (type === "coding") {
        setVideoCoding(prev => ({ ...prev, [videoIndex]: result.codingProblems }));
      }

      // Simple success sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch {}

    } catch (err: any) {
      console.error(err);
      alert("Error generating video aid: " + err.message);
      setActiveInteractiveTab(prev => ({ ...prev, [videoIndex]: null }));
    } finally {
      setGeneratingVideoItem(prev => ({ ...prev, [itemKey]: false }));
    }
  };

  const toggleCompletedVideo = (videoIndex: number) => {
    setCompletedVideos(prev => ({
      ...prev,
      [videoIndex]: !prev[videoIndex]
    }));
  };

  const handleChatbotOption = (option: string) => {
    setChatbotTyping(true);
    const userOptionLabels: Record<string, string> = {
      tip: "💡 Give me a study tip!",
      motivate: "🔥 Motivate me!",
      joke: "☕ Tell me a developer joke",
      test: "🧠 Test my concepts"
    };
    const label = userOptionLabels[option] || "Help me study";
    setChatHistory(prev => [...prev, { sender: "user", text: label }]);

    setTimeout(() => {
      setChatbotTyping(false);
      let responseText = "";
      if (option === "tip") {
        const tips = [
          "Take a deep breath and stay hydrated. Drink water, not just energy drinks! 💧",
          "Active recall is 10x more effective than passive reading. Use our Flashcards mode!",
          "To remember concepts better, try to teach them out loud to an imaginary person. 🗣️",
          "If a concept seems too heavy, break it into three simpler blocks. ELI5 style!",
          "Make sure to get at least 4 hours of restful sleep before the exam, it helps consolidate memory!"
        ];
        responseText = "💡 Study Tip: " + tips[Math.floor(Math.random() * tips.length)];
      } else if (option === "motivate") {
        const encourages = [
          "You are fully capable of conquering this! Just take it one bite-sized takeaway at a time. 🔥",
          "Cramming feels intense, but you are sharpening your survival learning skills right now! You've got this! 🙌",
          "Do not stress about what you don't know yet. Focus 100% on what you are learning right now. 🌟",
          "Pressure makes diamonds! Let's polish this topic and ace that exam tomorrow!"
        ];
        responseText = "🔥 Motivational Quote: " + encourages[Math.floor(Math.random() * encourages.length)];
      } else if (option === "joke") {
        const jokes = [
          "Why do programmers wear glasses? Because they can't C#! 🤓",
          "There are 10 types of people in the world: those who understand binary, and those who don't! 😂",
          "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?' 📊",
          "How do you comfort a JavaScript bug? You console it! 🖥️"
        ];
        responseText = "☕ Programmer Joke: " + jokes[Math.floor(Math.random() * jokes.length)];
      } else if (option === "test") {
        if (data && data.flashcards && data.flashcards.length > 0) {
          const card = data.flashcards[Math.floor(Math.random() * data.flashcards.length)];
          responseText = `🧠 Quiz Challenge! Do you know what **${card.term}** is? \n\nAnswer: ${card.definition}`;
        } else {
          responseText = "🧠 I'll gladly test you once you type a topic in the search hub and generate material! Let's get started!";
        }
      }
      setChatHistory(prev => [...prev, { sender: "bot", text: responseText }]);
    }, 450);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const newUserMsg = { sender: "user" as const, text: textToSend };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    if (!customText) {
      setChatInput("");
    }
    setChatbotTyping(true);

    try {
      let context = "";
      if (data) {
        context = `Active Topic: ${currentTopic}\n\n`;
        context += `Core Takeaways:\n${data.summary.slice(0, 10).join("\n")}\n\n`;
        if (data.formulas && data.formulas.length > 0) {
          context += `Formulas/Code Patterns:\n${data.formulas.join("\n")}\n\n`;
        }
        if (data.mnemonics && data.mnemonics.length > 0) {
          context += `Mnemonics:\n${data.mnemonics.join("\n")}\n\n`;
        }
        if (data.commonMistakes && data.commonMistakes.length > 0) {
          context += `Common Pitfalls:\n${data.commonMistakes.join("\n")}\n\n`;
        }
      } else {
        context = "No active topic or study guide loaded yet. The student is asking general questions.";
      }

      const payloadHistory = updatedHistory.map(h => ({
        role: h.sender === "user" ? ("user" as const) : ("model" as const),
        text: h.text
      })).slice(-10);

      const response = await fetch("/api/cram/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: payloadHistory,
          context
        })
      });

      if (!response.ok) {
        throw new Error("Chatbot API response was not OK");
      }

      const resData = await response.json();
      setChatHistory(prev => [...prev, { sender: "bot" as const, text: resData.text }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatHistory(prev => [...prev, { sender: "bot" as const, text: "My neural transmitters are slightly jammed! ⚡ Try asking again, or check your internet connection." }]);
    } finally {
      setChatbotTyping(false);
    }
  };

  // Custom PDF study guide builder in premium layout
  const handleExportPDF = () => {
    if (!data) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const margin = 20;
      const width = 210 - (margin * 2);
      const pageHeight = 297;
      let y = 50;

      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          // Paint clean headers for secondary pages
          doc.setFillColor(243, 244, 246);
          doc.rect(0, 0, 210, 15, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(107, 114, 128);
          doc.text(`CramNight AI - Study Guide: ${currentTopic.toUpperCase()}`, margin, 10);
          y = 25;
        }
      };

      // Header Banner Block (Elegant Dark Mode look on PDF cover)
      doc.setFillColor(15, 15, 26);
      doc.rect(0, 0, 210, 42, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("CramNight AI Study Guide", margin, 18);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(167, 139, 250);
      doc.text(`TOPIC: ${currentTopic.toUpperCase()} ${isEasyMode ? "(EASY / SIMPLIFIED CONCEPTUAL MODE)" : "(RIGOROUS MODE)"}`, margin, 26);
      
      doc.setTextColor(156, 163, 175);
      doc.text(`Generated: ${new Date().toLocaleDateString()} · Powered by Gemini Flash`, margin, 32);

      // Section I: Key takeaways
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(109, 40, 217); // Darker Indigo
      doc.text("I. Instant Cheat-Sheet Takeaways", margin, y);
      y += 8;

      data.summary.forEach((bullet, index) => {
        const cleanBullet = bullet.replace(/\*\*/g, ""); // strip bold markers
        const lines = doc.splitTextToSize(`${index + 1}. ${cleanBullet}`, width);
        const textHeight = lines.length * 5;
        checkPageOverflow(textHeight + 6);

        // draw background frame for cards
        doc.setFillColor(250, 250, 250);
        doc.rect(margin - 2, y - 4, width + 4, textHeight + 6, "F");
        doc.setDrawColor(229, 231, 235);
        doc.rect(margin - 2, y - 4, width + 4, textHeight + 6, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(55, 65, 81);
        lines.forEach((line: string) => {
          doc.text(line, margin, y + 1);
          y += 5;
        });
        y += 6;
      });

      // Section IA: Formulas
      if (data.formulas && data.formulas.length > 0) {
        y += 6;
        checkPageOverflow(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(109, 40, 217);
        doc.text("II. Essential Formulas & Syntaxes", margin, y);
        y += 8;

        data.formulas.forEach((item, index) => {
          const lines = doc.splitTextToSize(`${index + 1}. ${item}`, width);
          const textHeight = lines.length * 5;
          checkPageOverflow(textHeight + 6);

          doc.setFillColor(245, 243, 255); // soft purple
          doc.rect(margin - 2, y - 4, width + 4, textHeight + 6, "F");
          doc.setDrawColor(196, 181, 253);
          doc.rect(margin - 2, y - 4, width + 4, textHeight + 6, "S");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(91, 33, 182);
          lines.forEach((line: string) => {
            doc.text(line, margin, y + 1);
            y += 5;
          });
          y += 6;
        });
      }

      // Section IB: Mnemonics
      if (data.mnemonics && data.mnemonics.length > 0) {
        y += 6;
        checkPageOverflow(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(109, 40, 217);
        doc.text("III. Memory Tricks & Mnemonics", margin, y);
        y += 8;

        data.mnemonics.forEach((item, index) => {
          const lines = doc.splitTextToSize(`${index + 1}. ${item}`, width);
          const textHeight = lines.length * 5;
          checkPageOverflow(textHeight + 6);

          doc.setFillColor(253, 242, 248); // soft pink
          doc.rect(margin - 2, y - 4, width + 4, textHeight + 6, "F");
          doc.setDrawColor(244, 143, 177); // soft pink border
          doc.rect(margin - 2, y - 4, width + 4, textHeight + 6, "S");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(157, 23, 77);
          lines.forEach((line: string) => {
            doc.text(line, margin, y + 1);
            y += 5;
          });
          y += 6;
        });
      }

      // Section IC: Common Mistakes
      if (data.commonMistakes && data.commonMistakes.length > 0) {
        y += 6;
        checkPageOverflow(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(109, 40, 217);
        doc.text("IV. Common Pitfalls & Exam Traps", margin, y);
        y += 8;

        data.commonMistakes.forEach((item, index) => {
          const lines = doc.splitTextToSize(`• ${item}`, width);
          const textHeight = lines.length * 5;
          checkPageOverflow(textHeight + 6);

          doc.setFillColor(254, 242, 242); // soft red/rose
          doc.rect(margin - 2, y - 4, width + 4, textHeight + 6, "F");
          doc.setDrawColor(252, 165, 165);
          doc.rect(margin - 2, y - 4, width + 4, textHeight + 6, "S");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(153, 27, 27);
          lines.forEach((line: string) => {
            doc.text(line, margin, y + 1);
            y += 5;
          });
          y += 6;
        });
      }

      // Section ID: Expected Questions
      if (data.expectedQuestions && data.expectedQuestions.length > 0) {
        y += 6;
        checkPageOverflow(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(109, 40, 217);
        doc.text("V. Highly Probable Exam Questions & Answers", margin, y);
        y += 8;

        data.expectedQuestions.forEach((item, index) => {
          const lines = doc.splitTextToSize(`Q: ${item}`, width);
          const textHeight = lines.length * 5;
          checkPageOverflow(textHeight + 6);

          doc.setFillColor(240, 253, 250); // soft teal
          doc.rect(margin - 2, y - 4, width + 4, textHeight + 6, "F");
          doc.setDrawColor(153, 246, 228);
          doc.rect(margin - 2, y - 4, width + 4, textHeight + 6, "S");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(15, 118, 110);
          lines.forEach((line: string) => {
            doc.text(line, margin, y + 1);
            y += 5;
          });
          y += 6;
        });
      }

      // Section II: Flashcards
      y += 6;
      checkPageOverflow(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(109, 40, 217);
      doc.text("VI. Active Recall Flashcards", margin, y);
      y += 8;

      data.flashcards.forEach((card, index) => {
        const termLines = doc.splitTextToSize(`Concept ${index + 1}: ${card.term}`, width);
        const defLines = doc.splitTextToSize(card.definition, width - 10);
        const textHeight = (termLines.length * 5) + (defLines.length * 4.5) + 6;
        checkPageOverflow(textHeight + 6);

        doc.setFillColor(243, 244, 246);
        doc.rect(margin - 2, y - 4, width + 4, textHeight, "F");
        doc.setDrawColor(139, 92, 246);
        doc.rect(margin - 2, y - 4, width + 4, textHeight, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(109, 40, 217);
        termLines.forEach((line: string) => {
          doc.text(line, margin, y + 1);
          y += 5;
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(75, 85, 99);
        defLines.forEach((line: string) => {
          doc.text(line, margin + 4, y + 1);
          y += 4.5;
        });
        y += 6;
      });

      // Section III: Quiz
      y += 6;
      checkPageOverflow(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(109, 40, 217);
      doc.text("VII. Diagnostic Assessment Test", margin, y);
      y += 8;

      data.quiz.forEach((q, index) => {
        const qLines = doc.splitTextToSize(`Question ${index + 1}: ${q.question}`, width);
        const blockHeight = (qLines.length * 5) + (q.options.length * 4.5) + 10;
        checkPageOverflow(blockHeight + 8);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(17, 24, 39);
        qLines.forEach((line: string) => {
          doc.text(line, margin, y + 1);
          y += 5;
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        q.options.forEach((opt, optIdx) => {
          const isCorrect = opt === q.correctAnswer;
          const letter = String.fromCharCode(65 + optIdx) + ") ";
          const [r, g, b] = isCorrect ? [16, 185, 129] : [75, 85, 99];
          doc.setTextColor(r, g, b);
          doc.setFont("helvetica", isCorrect ? "bold" : "normal");
          doc.text(`${letter}${opt}${isCorrect ? " [CORRECT ANSWER]" : ""}`, margin + 4, y + 1.5);
          y += 4.5;
        });
        y += 6;
      });

      doc.save(`${currentTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")}_cram_notes.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to compile study PDF. Try again.");
    }
  };

  // Helper to highlight terms wrapped in **
  const parseBoldText = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="text-brand-violet-light font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // --- FALLBACK BATTLE QUIZ FOR DUEL MODE ---
  const FALLBACK_QUIZ = [
    {
      question: "What is the worst-case time complexity of searching in an unbalanced Binary Search Tree (BST)?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctAnswer: "O(n)"
    },
    {
      question: "Which data structure is primarily used to implement Breadth-First Search (BFS)?",
      options: ["Stack", "Queue", "Priority Queue", "BST"],
      correctAnswer: "Queue"
    },
    {
      question: "Which of the following sorting algorithms is stable and has O(n log n) worst-case time complexity?",
      options: ["Quick Sort", "Merge Sort", "Heap Sort", "Selection Sort"],
      correctAnswer: "Merge Sort"
    },
    {
      question: "What is the primary function of Semaphores in Operating Systems?",
      options: ["Memory allocation", "Process synchronization", "CPU scheduling", "Page replacement"],
      correctAnswer: "Process synchronization"
    },
    {
      question: "Which layer of the OSI model is responsible for routing packets across networks?",
      options: ["Data Link Layer", "Transport Layer", "Network Layer", "Physical Layer"],
      correctAnswer: "Network Layer"
    }
  ];

  // --- NEW SURVIVAL KIT INTERACTIVE FUNCTIONS ---

  // 1. Syllabus note templates & loading
  const loadPresetSyllabus = (presetId: string) => {
    let content = "";
    if (presetId === "dsa") {
      content = `Data Structures and Algorithms Syllabus:
- Binary Search Trees: Properties, operations (insert, search, delete), height calculations.
- Sorting Algorithms: Merge Sort, Quick Sort (pivot strategies, partitions), Bubble Sort, Heap Sort.
- Graph Algorithms: BFS, DFS, Dijkstra's Shortest Path, Topological Sorting.
- Time & Space Complexity: Big O notations, Recurrence relations, Master Theorem.`;
    } else if (presetId === "os") {
      content = `Operating Systems Core Curriculum:
- Processes & Threads: Context switching, process state transitions.
- Process Synchronization: Semaphores, Mutexes, critical section problem, Producer-Consumer.
- Memory Management: Paging, segmentation, page replacement algorithms (FIFO, LRU, Optimal).
- CPU Scheduling: First-Come First-Served, Round Robin, Shortest Job First.`;
    } else if (presetId === "dbms") {
      content = `Database Management Systems (DBMS):
- Relational Databases: SQL Joins (Inner, Left, Right, Full Outer), Aggregate functions, Group By.
- Normalization: 1NF, 2NF, 3NF, BCNF, Functional Dependencies.
- Transactions & Concurrency: ACID properties, Serializability, Two-Phase Locking (2PL).
- Indexing: B-Trees, B+ Trees, Hashing.`;
    } else if (presetId === "networks") {
      content = `Computer Networks:
- TCP/IP & OSI Reference Models: 7 Layers and their protocols.
- Transport Layer: TCP 3-Way Handshake, Congestion Control, UDP comparison.
- Network Layer: IP Addressing, routing protocols (RIP, OSPF, BGP).
- Application Layer: DNS, HTTP vs HTTPS, DHCP.`;
    }
    setParserText(content);
  };

  const handleSyllabusParse = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = parserText.trim();
    if (!cleanText) return;

    setParserLoading(true);
    setError(null);
    setData(null);
    setQuizAnswers({});
    setFlippedCards({});
    setQuizSubmitted(false);
    setWeaknessSubtopics({});

    try {
      const response = await fetch("/api/cram/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceText: cleanText,
          simplified: isEasyMode
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to parse syllabus/notes.");
      }

      setData(result);
      setCurrentTopic("Pasted Syllabus/Notes");
      setTopic("Pasted Syllabus/Notes");
      setActiveTab("cheat");
      playFocusChime();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to parse custom syllabus text. Please check server status and retry.");
    } finally {
      setParserLoading(false);
    }
  };

  // 2. MCQ Battle Arena Logic
  const startMCQBattle = (opponent: string) => {
    setBattleActive(true);
    setBattleQuestionIndex(0);
    setBattleTimer(15);
    setBattleUserScore(0);
    setBattleBotScore(0);
    setBattleSelectedOption(null);
    setBattleMessages([
      `⚔️ Duel initiated against ${opponent}!`,
      `⏱️ 15 seconds per question. Quick answers get higher speed bonus!`,
      `🚀 First question is loaded. Good luck, ${playerName}!`
    ]);
  };

  const handleBattleAnswer = (selectedOption: string) => {
    if (battleSelectedOption) return; // Prevent double clicks
    
    setBattleSelectedOption(selectedOption);
    
    // Get current question from cram data, or fallback if none loaded
    const quizPool = data?.quiz && data.quiz.length > 0 ? data.quiz : FALLBACK_QUIZ;
    const currentQ = quizPool[battleQuestionIndex % quizPool.length];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    
    // 1. Calculate user score
    let userPoints = 0;
    if (isCorrect) {
      userPoints = 100 + battleTimer * 5; // speed bonus
      setBattleUserScore(prev => prev + userPoints);
    }
    
    // 2. Simulating opponent selection & score
    const botType = battleMessages[0]?.includes("GPT-4") ? "gpt" : "rohan";
    const botCorrectChance = botType === "gpt" ? 0.90 : 0.65;
    const botIsCorrect = Math.random() < botCorrectChance;
    let botPoints = 0;
    if (botIsCorrect) {
      const simulatedTimeRemaining = Math.floor(Math.random() * 8) + 5; // bot responds with 5-12 seconds left
      botPoints = 100 + simulatedTimeRemaining * 5;
      setBattleBotScore(prev => prev + botPoints);
    }
    
    // Construct updates
    const newUserMsg = isCorrect 
      ? `✅ You got it right! +${userPoints} pts (Time left: ${battleTimer}s)` 
      : `❌ Incorrect. The right answer was: "${currentQ.correctAnswer}"`;
      
    const newBotMsg = botIsCorrect
      ? `🤖 Opponent answered CORRECTLY and gained +${botPoints} pts.`
      : `❌ Opponent made a MISTAKE and gained 0 pts.`;

    setBattleMessages(prev => [
      ...prev,
      newUserMsg,
      newBotMsg
    ]);

    // Proceed to next step after a short delay
    setTimeout(() => {
      const nextIndex = battleQuestionIndex + 1;
      const totalBattleQ = 5; // battle is best of 5
      
      if (nextIndex < totalBattleQ) {
        setBattleQuestionIndex(nextIndex);
        setBattleTimer(15);
        setBattleSelectedOption(null);
        setBattleMessages(prev => [
          ...prev,
          `📝 Question ${nextIndex + 1} loaded...`
        ]);
      } else {
        // Duel over! Compare score
        const finalUserScore = battleUserScore + (isCorrect ? userPoints : 0);
        const finalBotScore = battleBotScore + (botIsCorrect ? botPoints : 0);
        let duelOutcome = "";
        
        if (finalUserScore > finalBotScore) {
          duelOutcome = `🏆 VICTORY! You scored ${finalUserScore} and beat the opponent (${finalBotScore})! Legendary crammer!`;
          playFocusChime();
        } else if (finalUserScore < finalBotScore) {
          duelOutcome = `👾 DEFEAT! Opponent won (${finalBotScore} vs ${finalUserScore}). Don't worry, hit the cheat sheets and try again!`;
        } else {
          duelOutcome = `🤝 TIE GAME! Both scored ${finalUserScore}! Incredible match.`;
        }
        
        // Add to leaderboard
        const userEntry = { name: playerName + " (You)", score: finalUserScore, rank: 9, avatar: "🔥" };
        setBattleLeaderboard(prev => {
          const combined = [...prev, userEntry];
          // sort descending
          combined.sort((a, b) => b.score - a.score);
          // assign rank
          return combined.map((entry, i) => ({ ...entry, rank: i + 1 }));
        });

        setBattleMessages(prev => [
          ...prev,
          "🏁 DUEL COMPLETE!",
          duelOutcome
        ]);
        setBattleActive(false);
        setBattleSelectedOption(null);
      }
    }, 2500);
  };

  // 3. Subtopic categorization & Weakness Detection
  const getSubtopicCategory = (question: string): string => {
    const text = question.toLowerCase();
    if (text.includes("tree") || text.includes("bst") || text.includes("avl") || text.includes("binary search tree") || text.includes("traversal")) {
      return "Trees & Traversals";
    }
    if (text.includes("graph") || text.includes("bfs") || text.includes("dfs") || text.includes("dijkstra") || text.includes("shortest path")) {
      return "Graphs & Networks";
    }
    if (text.includes("sort") || text.includes("bubble") || text.includes("merge") || text.includes("quick") || text.includes("heap")) {
      return "Sorting Algorithms";
    }
    if (text.includes("stack") || text.includes("queue") || text.includes("linked list") || text.includes("array") || text.includes("list")) {
      return "Linear Data Structures";
    }
    if (text.includes("hash") || text.includes("map") || text.includes("collision")) {
      return "Hashing & Hash Tables";
    }
    if (text.includes("complexity") || text.includes("big o") || text.includes("recurrence") || text.includes("omega") || text.includes("theta")) {
      return "Complexity Analysis";
    }
    return "General Computer Science";
  };

  const handlePanicButton = (hours: number) => {
    setPanicHoursLeft(hours);
    setPanicActive(true);
    // Preset checklist tasks based on time left
    const baseTasks: Record<string, boolean> = {
      "task-0": false, // Read 1-Page Cheat Sheet
      "task-1": false, // Practice Formulas & Mnemonics
      "task-2": false, // Run dry-run trace animation
      "task-3": false, // Solve quick Adaptive Quiz
      "task-4": false  // Beat the MCQ Bot in Duel
    };
    setPanicCompletedTasks(baseTasks);
    playFocusChime();
  };

  // Quiz calculations
  const totalQuizQuestions = data?.quiz?.length || 0;
  const answeredCount = Object.keys(quizAnswers).length;
  const correctQuizAnswersCount = data?.quiz
    ? data.quiz.reduce((acc, q, idx) => {
        return acc + (quizAnswers[idx] === q.correctAnswer ? 1 : 0);
      }, 0)
    : 0;

  // Format Timer text
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Dynamic visual configurations for multi-palette beautiful colors requested
  const getThemeConfig = () => {
    if (!isDarkMode) {
      return {
        bodyBg: "bg-[#f8fafc] text-slate-800",
        ambient1: "bg-violet-300/10",
        ambient2: "bg-cyan-200/15",
        header: "border-slate-200/80 bg-white/70",
        panel: "bg-white border-slate-200 shadow-xl shadow-slate-100 text-slate-800",
        card: "bg-white border-slate-200/80 hover:border-brand-violet/30 hover:bg-violet-50/50",
        textPrimary: "text-slate-800",
        textSecondary: "text-slate-500",
        badge: "bg-violet-50 border-violet-100 text-brand-violet font-semibold",
        onboardingCard: "bg-white border-slate-200 shadow-xl shadow-slate-100",
        suggestionBtn: "bg-slate-100 border-slate-200/80 text-slate-600 hover:border-brand-violet/30 hover:bg-violet-50 hover:text-brand-violet",
        buttonSecondary: "bg-slate-100 border-slate-200 hover:border-brand-violet/30 hover:text-brand-violet text-slate-600",
        accentGlow: "shadow-brand-violet/5 border-brand-violet/20",
        badgeText: "text-brand-violet"
      };
    }

    // Dark modes based on chosen beautiful study room environments
    switch (selectedTheme) {
      case "sunset":
        return {
          bodyBg: "bg-[#0b040a] text-pink-50",
          ambient1: "bg-rose-500/15",
          ambient2: "bg-amber-500/10",
          header: "border-rose-950/40 bg-[#0b040a]/70",
          panel: "bg-white/[0.03] border-rose-900/40 text-rose-50",
          card: "bg-white/[0.02] border-rose-950/50 hover:border-rose-500/40 hover:bg-rose-950/20",
          textPrimary: "text-pink-50",
          textSecondary: "text-pink-200/60",
          badge: "bg-rose-500/10 border-rose-500/20 text-rose-300",
          onboardingCard: "bg-gradient-to-br from-rose-950/10 to-transparent border-rose-950/30",
          suggestionBtn: "bg-rose-950/20 border-rose-950/40 text-rose-300 hover:border-rose-400/40 hover:bg-rose-950/40 hover:text-rose-200",
          buttonSecondary: "bg-rose-950/30 border-rose-900/30 hover:border-rose-500/40 hover:text-rose-200 text-rose-300",
          accentGlow: "shadow-rose-500/10 border-rose-500/30",
          badgeText: "text-rose-400"
        };
      case "forest":
        return {
          bodyBg: "bg-[#020704] text-emerald-50",
          ambient1: "bg-emerald-500/10",
          ambient2: "bg-teal-500/10",
          header: "border-emerald-950/40 bg-[#020704]/70",
          panel: "bg-white/[0.03] border-emerald-900/40 text-emerald-50",
          card: "bg-white/[0.02] border-emerald-950/50 hover:border-emerald-500/40 hover:bg-emerald-950/20",
          textPrimary: "text-emerald-50",
          textSecondary: "text-emerald-200/60",
          badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
          onboardingCard: "bg-gradient-to-br from-emerald-950/10 to-transparent border-emerald-950/30",
          suggestionBtn: "bg-emerald-950/20 border-emerald-950/40 text-emerald-300 hover:border-emerald-400/40 hover:bg-emerald-950/40 hover:text-emerald-200",
          buttonSecondary: "bg-emerald-950/30 border-emerald-900/30 hover:border-emerald-500/40 hover:text-emerald-200 text-emerald-300",
          accentGlow: "shadow-emerald-500/10 border-emerald-500/30",
          badgeText: "text-emerald-400"
        };
      case "amber":
        return {
          bodyBg: "bg-[#080502] text-amber-50",
          ambient1: "bg-amber-600/10",
          ambient2: "bg-orange-600/10",
          header: "border-amber-950/40 bg-[#080502]/70",
          panel: "bg-white/[0.03] border-amber-900/40 text-amber-50",
          card: "bg-white/[0.02] border-amber-950/50 hover:border-amber-500/40 hover:bg-amber-950/20",
          textPrimary: "text-amber-50",
          textSecondary: "text-amber-200/60",
          badge: "bg-amber-500/10 border-amber-500/20 text-amber-300",
          onboardingCard: "bg-gradient-to-br from-amber-950/10 to-transparent border-amber-950/30",
          suggestionBtn: "bg-amber-950/20 border-amber-950/40 text-amber-300 hover:border-amber-400/40 hover:bg-amber-950/40 hover:text-amber-200",
          buttonSecondary: "bg-amber-950/30 border-amber-900/30 hover:border-amber-500/40 hover:text-amber-200 text-amber-300",
          accentGlow: "shadow-amber-500/10 border-amber-500/30",
          badgeText: "text-amber-400"
        };
      case "cyber":
      default:
        return {
          bodyBg: "bg-[#030307] text-gray-100",
          ambient1: "bg-brand-violet/15",
          ambient2: "bg-brand-cyan/15",
          header: "border-white/5 bg-[#030307]/60",
          panel: "bg-white/[0.03] border-white/10 text-white",
          card: "bg-white/[0.02] border-white/5 hover:border-brand-violet/40 hover:bg-brand-violet/5",
          textPrimary: "text-white",
          textSecondary: "text-gray-400",
          badge: "bg-white/5 border-white/10 text-brand-cyan",
          onboardingCard: "bg-gradient-to-br from-white/[0.02] to-transparent border-white/5",
          suggestionBtn: "bg-white/5 border-white/5 text-gray-300 hover:border-brand-violet/30 hover:bg-brand-violet/10 hover:text-brand-violet-light",
          buttonSecondary: "bg-white/5 border-white/10 hover:border-brand-violet/30 hover:text-brand-violet-light text-gray-300",
          accentGlow: "shadow-brand-violet/10 border-brand-violet/30",
          badgeText: "text-brand-violet-light"
        };
    }
  };

  const theme = getThemeConfig();

  return (
    <div className={`relative min-h-screen overflow-hidden font-sans grid-pattern transition-colors duration-300 ${theme.bodyBg}`}>
      
      {/* Stunning Late-Night Cozy Study Room Background Illustration */}
      <div 
        className="absolute inset-0 pointer-events-none bg-cover bg-center transition-all duration-500 z-0"
        style={{
          backgroundImage: `url('/src/assets/images/cramnight_background_1782756511440.jpg')`,
          opacity: isDarkMode ? 0.09 : 0.04,
          mixBlendMode: isDarkMode ? "screen" : "multiply"
        }}
      />
      
      {/* Dynamic Ambient Background Blobs */}
      <div className={`absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none animate-drift-slow transition-colors duration-300 ${theme.ambient1}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[130px] pointer-events-none animate-drift-reverse transition-colors duration-300 ${theme.ambient2}`} />

      {/* Navigation Header */}
      <header className={`relative z-20 border-b backdrop-blur-md transition-colors duration-300 ${theme.header}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-violet to-brand-indigo flex items-center justify-center shadow-lg shadow-brand-violet/20">
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight">
              Cram<span className="text-brand-violet">Night</span> <span className="text-xs bg-brand-violet/20 border border-brand-violet/30 px-2 py-0.5 rounded-full text-brand-violet-light ml-2 uppercase font-mono tracking-widest font-bold">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Immersive Dark Mode Theme Customizer */}
            {isDarkMode && (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl shadow-inner">
                <button
                  onClick={() => setSelectedTheme("cyber")}
                  className={`w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 border transition-all cursor-pointer ${selectedTheme === "cyber" ? "border-white scale-115 ring-2 ring-indigo-500/35" : "border-transparent opacity-60 hover:opacity-100"}`}
                  title="Midnight Cyberpunk Preset"
                />
                <button
                  onClick={() => setSelectedTheme("sunset")}
                  className={`w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 border transition-all cursor-pointer ${selectedTheme === "sunset" ? "border-white scale-115 ring-2 ring-rose-500/35" : "border-transparent opacity-60 hover:opacity-100"}`}
                  title="Sunset Eclipse Preset"
                />
                <button
                  onClick={() => setSelectedTheme("forest")}
                  className={`w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border transition-all cursor-pointer ${selectedTheme === "forest" ? "border-white scale-115 ring-2 ring-emerald-500/35" : "border-transparent opacity-60 hover:opacity-100"}`}
                  title="Forest Sanctuary Preset"
                />
                <button
                  onClick={() => setSelectedTheme("amber")}
                  className={`w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 border transition-all cursor-pointer ${selectedTheme === "amber" ? "border-white scale-115 ring-2 ring-amber-500/35" : "border-transparent opacity-60 hover:opacity-100"}`}
                  title="Cozy Espresso Amber Preset"
                />
              </div>
            )}

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-violet/30 text-gray-400 hover:text-brand-violet transition-all cursor-pointer"
              title="Toggle Dark/Light Mode"
              id="theme-toggle"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-brand-indigo" />}
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Gemini Engine
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10">
        
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-4 font-mono uppercase tracking-wider transition-colors duration-300 ${theme.badge}`}>
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Exam Study Suite
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-4 leading-none">
            Master complex topics. <br />
            <span className="text-gradient-purple-cyan font-black">In 5 minutes flat.</span>
          </h1>
          <p className={`max-w-xl mx-auto text-sm sm:text-base leading-relaxed ${theme.textSecondary}`}>
            Cram-mode AI assistance. Get active summaries, interactive recall flashcards, and automated multiple-choice mock quizzes instantly.
          </p>
        </div>

        {/* Study Timer Component (Top Bar Focus Aide) */}
        <div className={`mb-8 p-4 rounded-2xl border transition-all duration-300 ${theme.panel}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-violet/10 flex items-center justify-center text-brand-violet border border-brand-violet/20 animate-pulse">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-brand-violet">Cram Focus Timer</h4>
                <p className="text-xs text-gray-400">Keep sprints active. Maintain 25-minute cycles.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono text-2xl font-bold tracking-wider text-brand-cyan">
                {formatTime(timerSeconds)}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    timerActive 
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                      : "bg-brand-violet text-white"
                  }`}
                >
                  {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{timerActive ? "Pause" : "Focus"}</span>
                </button>
                
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSeconds(timerType === "study" ? 1500 : 300);
                  }}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-gray-400 hover:text-white cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Timer Mode Switchers */}
          <div className="mt-3 pt-3 border-t border-white/5 flex gap-2 justify-center">
            <button
              onClick={() => {
                setTimerActive(false);
                setTimerType("study");
                setTimerSeconds(1500);
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                timerType === "study" ? "bg-brand-violet/20 border border-brand-violet/40 text-brand-violet-light font-bold" : "text-gray-500"
              }`}
            >
              📚 Study Sprint (25m)
            </button>
            <button
              onClick={() => {
                setTimerActive(false);
                setTimerType("break");
                setTimerSeconds(300);
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                timerType === "break" ? "bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan font-bold" : "text-gray-500"
              }`}
            >
              ☕ Quick Break (5m)
            </button>
          </div>

          {/* Persistent in-app Notification Banner */}
          {timerNotification && (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between gap-2 animate-[fadeIn_0.3s_ease]">
              <span className="font-semibold">{timerNotification}</span>
              <button onClick={() => setTimerNotification(null)} className="text-gray-400 hover:text-white font-bold">×</button>
            </div>
          )}

          {/* Immersive Sound Lounge Control Deck */}
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-brand-violet animate-pulse" />
                Focus Soundscape:
              </span>
              <div className="flex bg-black/40 border border-white/5 rounded-lg p-0.5">
                <button
                  onClick={() => {
                    setSynthPreset("binaural");
                    setSynthActive(true);
                  }}
                  className={`px-2 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${synthActive && synthPreset === "binaural" ? "bg-brand-violet text-white font-bold" : "text-gray-400 hover:text-white"}`}
                >
                  🧬 Binaural Waves
                </button>
                <button
                  onClick={() => {
                    setSynthPreset("rain");
                    setSynthActive(true);
                  }}
                  className={`px-2 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${synthActive && synthPreset === "rain" ? "bg-brand-violet text-white font-bold" : "text-gray-400 hover:text-white"}`}
                >
                  🌧️ Cozy Rain
                </button>
                <button
                  onClick={() => {
                    setSynthPreset("drone");
                    setSynthActive(true);
                  }}
                  className={`px-2 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${synthActive && synthPreset === "drone" ? "bg-brand-violet text-white font-bold" : "text-gray-400 hover:text-white"}`}
                >
                  🛸 Space Drone
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 font-mono">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={synthVolume}
                  onChange={(e) => setSynthVolume(parseFloat(e.target.value))}
                  className="w-16 accent-brand-violet h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <button
                onClick={() => setSynthActive(!synthActive)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${synthActive ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse font-bold"}`}
              >
                {synthActive ? "⏹️ Mute Soundscape" : "▶️ Play Focus Waves"}
              </button>
            </div>
          </div>

          {/* Lofi Study Station & Music Lounge (10 Relaxing Tracks requested) */}
          <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs text-gray-300 font-bold flex items-center gap-1.5">
                <Music className="w-4 h-4 text-brand-cyan animate-[spin_4s_linear_infinite]" />
                Lofi Study Station <span className="text-[10px] text-gray-500 font-normal font-mono bg-white/5 px-2 py-0.5 rounded-full">10 Mind-Relaxing Tracks</span>
              </span>

              {/* Bouncing Audio Bars Visualizer */}
              {musicPlaying && (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-brand-cyan rounded-full animate-[bounce_0.8s_infinite]" style={{ height: "100%" }} />
                  <span className="w-0.5 bg-brand-violet rounded-full animate-[bounce_0.8s_infinite]" style={{ height: "60%", animationDelay: "0.2s" }} />
                  <span className="w-0.5 bg-brand-cyan rounded-full animate-[bounce_0.8s_infinite]" style={{ height: "80%", animationDelay: "0.1s" }} />
                  <span className="w-0.5 bg-brand-violet rounded-full animate-[bounce_0.8s_infinite]" style={{ height: "40%", animationDelay: "0.3s" }} />
                </div>
              )}
            </div>

            {/* Main Player Widget */}
            <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-brand-cyan/20 to-brand-violet/20 flex items-center justify-center text-xl shadow-inner shrink-0 border border-white/10 animate-[pulse_2s_infinite]">
                  {RELAXING_TRACKS[currentTrackIndex].icon}
                </div>
                <div className="text-left overflow-hidden">
                  <h5 className="text-xs font-bold text-white truncate max-w-[200px] flex items-center gap-1">
                    {RELAXING_TRACKS[currentTrackIndex].title}
                  </h5>
                  <p className="text-[10px] text-brand-cyan font-mono truncate max-w-[200px]">
                    {RELAXING_TRACKS[currentTrackIndex].genre}
                  </p>
                  <p className="text-[9px] text-gray-500 line-clamp-1 max-w-[260px]">
                    {RELAXING_TRACKS[currentTrackIndex].description}
                  </p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentTrackIndex((prev) => (prev === 0 ? RELAXING_TRACKS.length - 1 : prev - 1));
                      setMusicPlaying(true);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                    title="Previous Track"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setMusicPlaying(!musicPlaying)}
                    className={`p-2.5 rounded-full text-white transition-all cursor-pointer shadow-lg ${
                      musicPlaying 
                        ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" 
                        : "bg-brand-cyan hover:bg-brand-cyan-light shadow-brand-cyan/20 text-black"
                    }`}
                    title={musicPlaying ? "Pause Music" : "Play Music"}
                  >
                    {musicPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-black font-bold fill-current" />}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTrackIndex((prev) => (prev === RELAXING_TRACKS.length - 1 ? 0 : prev + 1));
                      setMusicPlaying(true);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                    title="Next Track"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Music Volume Control */}
                <div className="flex items-center gap-1.5 shrink-0 bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                  <button
                    onClick={() => setMusicVolume(prev => prev === 0 ? 0.4 : 0)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {musicVolume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    ) : musicVolume < 0.3 ? (
                      <Volume1 className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-brand-cyan" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    className="w-14 accent-brand-cyan h-1 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Track Selector List */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {RELAXING_TRACKS.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setMusicPlaying(true);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-medium text-left border transition-all flex items-center gap-1 cursor-pointer truncate ${
                      isSelected 
                        ? "bg-brand-cyan/15 border-brand-cyan/40 text-brand-cyan font-bold shadow-sm" 
                        : "bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <span className="shrink-0">{track.icon}</span>
                    <span className="truncate flex-1">{track.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Study Motivation Quote Card with Purple, Pink and Violet Glowing Accents */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-tr from-brand-violet/5 via-brand-pink/5 to-transparent border-neon-glow relative overflow-hidden transition-all duration-500 hover:scale-[1.01] animate-[fadeIn_0.5s_ease-out]">
          <div className="absolute top-0 right-0 p-3 opacity-[0.03] pointer-events-none text-brand-pink">
            <Quote className="w-24 h-24 transform rotate-180" />
          </div>
          <div className="flex gap-4 items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-violet via-brand-pink to-brand-indigo flex items-center justify-center text-white border border-white/10 shrink-0 shadow-lg shadow-brand-pink/10">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-pink font-bold mb-1">
                STUDY SPIRIT ACCELERATOR
              </p>
              <p className="text-sm sm:text-base text-gray-200 italic font-medium leading-relaxed font-sans">
                "{STUDY_QUOTES[activeQuoteIdx].quote}"
              </p>
              <p className="text-xs text-brand-violet-light font-bold mt-1.5 font-mono">
                — {STUDY_QUOTES[activeQuoteIdx].author}
              </p>
            </div>
          </div>
        </div>

        {/* Search Hub */}
        <section className="mb-6" id="search-hub">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl p-1.5 focus-within:border-brand-violet/50 focus-within:ring-2 focus-within:ring-brand-violet/10 transition-all shadow-xl">
              <Search className="absolute left-5 w-5 h-5 text-gray-400 pointer-events-none" />
              <input 
                type="text"
                placeholder="What topic are you cramming? (e.g. TCP/IP Handshake)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent pl-12 pr-32 py-3 text-sm sm:text-base text-gray-200 outline-none placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="absolute right-2 sm:right-3 px-5 py-2.5 bg-gradient-to-r from-brand-violet to-brand-indigo hover:from-brand-violet-light hover:to-brand-indigo text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-violet/20 flex items-center gap-2 glow-btn"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cramming...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Cram It!</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Easy Language / ELI5 Mode Switch Toggle */}
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                <Info className="w-3.5 h-3.5 text-brand-violet" />
                Customize language:
              </span>
            </div>
            <button
              onClick={() => setIsEasyMode(!isEasyMode)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isEasyMode 
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-md" 
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <Sparkle className={`w-3.5 h-3.5 ${isEasyMode ? "text-amber-400 animate-spin" : "text-gray-400"}`} />
              <span>{isEasyMode ? "ELI5: Simple Analogies Mode (Enabled) ✓" : "Standard Rigorous Mode"}</span>
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="mt-5 flex flex-wrap gap-2 items-center justify-center">
            <span className="text-xs text-gray-500 font-mono">Suggestions:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(undefined, s)}
                disabled={loading}
                className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${theme.suggestionBtn}`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Error Notification */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Cram session interrupted</p>
              <p className="text-xs text-rose-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Skeleton state */}
        {loading && (
          <div className="space-y-6">
            <div className="w-48 h-8 bg-white/5 rounded-lg animate-pulse" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
              <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
              <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
            </div>
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="w-3/4 h-6 bg-white/10 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-white/5 rounded animate-pulse" />
                <div className="w-full h-4 bg-white/5 rounded animate-pulse" />
                <div className="w-5/6 h-4 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Generated Study Workspace */}
        {data && !loading && (
          <div className="space-y-6">
            
            {/* Header of Generated Material */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-white/5`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-brand-violet">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-mono uppercase tracking-wider block">
                    Cram Guide Ready {isEasyMode ? "· ELI5 Easy Mode" : ""}
                  </span>
                  <h2 className="font-display font-bold text-xl tracking-tight text-brand-violet-light">{currentTopic}</h2>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* PDF Study Guide Exporter Button */}
                <button 
                  onClick={handleExportPDF}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Easy Notes PDF</span>
                </button>

                <button 
                  onClick={() => {
                    setTopic(currentTopic);
                    const el = document.getElementById("search-hub");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${theme.buttonSecondary}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Adjust Topic</span>
                </button>
              </div>
            </div>

            {/* Tabs Controller */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 p-1.5 rounded-2xl transition-all duration-300 ${theme.panel}`}>
              {TAB_INFO.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? "bg-brand-violet/20 text-brand-violet-light border border-brand-violet/30 shadow-lg shadow-black/30 font-bold" 
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? "text-brand-violet-light" : "text-gray-500"}`} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-1 w-5 h-1 bg-gradient-to-r from-brand-violet to-brand-cyan rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab A: Instant Cheat-Sheet */}
            {activeTab === "cheat" && (
              <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex items-center gap-2 px-3 py-1 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md w-fit font-mono">
                  <Zap className="w-3 h-3" />
                  Takeaways {isEasyMode ? "(Simplified Concept Focus)" : ""}
                </div>

                {/* RSVP Speed-Cram Word Flasher */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-violet/15 via-brand-indigo/5 to-transparent border border-brand-violet/20 flex flex-col items-center text-center gap-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-gradient-purple-cyan flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
                        Speed-Cram Word Flasher (RSVP)
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">Absorb all concepts in under a minute using fast bionic visual streaming.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={speedReadWpm}
                        onChange={(e) => setSpeedReadWpm(parseInt(e.target.value))}
                        className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300 font-mono outline-none cursor-pointer"
                      >
                        <option value="200">200 WPM</option>
                        <option value="300">300 WPM</option>
                        <option value="400">400 WPM</option>
                        <option value="500">500 WPM</option>
                        <option value="600">600 WPM (Hyper-Drill)</option>
                      </select>

                      {!speedReadActive ? (
                        <button
                          onClick={() => {
                            if (!data || !data.summary) return;
                            const allText = data.summary.map(s => s.replace(/\*\*/g, "")).join(" ");
                            const words = allText.split(/\s+/).filter(w => w.trim().length > 0);
                            setSpeedReadWords(words);
                            setSpeedReadIndex(0);
                            setSpeedReadActive(true);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-brand-cyan to-brand-violet hover:from-brand-cyan-light text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-cyan/20 cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start Drill</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setSpeedReadActive(false)}
                          className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Pause
                        </button>
                      )}
                    </div>
                  </div>

                  {speedReadActive && speedReadWords.length > 0 && (
                    <div className="w-full bg-black/80 border border-brand-violet/30 rounded-2xl py-12 px-4 flex flex-col items-center justify-center gap-4 relative overflow-hidden animate-[fadeIn_0.3s_ease] shadow-inner">
                      {/* Sub-progress bar */}
                      <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-brand-cyan to-brand-violet transition-all duration-100" style={{ width: `${(speedReadIndex / speedReadWords.length) * 100}%` }} />
                      
                      <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-brand-cyan drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] select-none">
                        {speedReadWords[speedReadIndex]}
                      </div>

                      <div className="text-[10px] text-gray-500 font-mono">
                        Word {speedReadIndex + 1} of {speedReadWords.length} · {Math.round((speedReadIndex / speedReadWords.length) * 100)}% complete
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                  {data.summary?.map((bullet, index) => (
                    <div 
                      key={index}
                      className={`glass-panel p-5 rounded-2xl flex gap-4 items-start duration-300 border border-white/5 shadow-md ${theme.card}`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-brand-violet/10 flex-shrink-0 flex items-center justify-center text-brand-violet font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className={`leading-relaxed text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-slate-700"}`}>
                        {parseBoldText(bullet)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Want More option for Tab A summaries */}
                <div className="pt-6 border-t border-white/10 flex flex-col items-center text-center gap-2">
                  <h4 className="text-sm font-bold text-gradient-purple-cyan">Need to drill deeper into {currentTopic}?</h4>
                  <p className="text-xs text-gray-400 max-w-md">Instantly prompt Gemini to formulate another 10 customized, high-yield summary points without duplicates.</p>
                  <button
                    onClick={() => handleLoadMore("summary")}
                    disabled={moreLoading["summary"]}
                    className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-violet to-brand-indigo hover:from-brand-violet-light text-white text-xs font-bold shadow-lg shadow-brand-violet/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {moreLoading["summary"] ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing and compiling...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Want more? (Add 10 More Points)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Enriched Hackathon Survival Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Formulas Section */}
                  {data.formulas && data.formulas.length > 0 && (
                    <div className={`p-6 rounded-2xl border border-amber-500/10 ${theme.card} relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
                      <h4 className="text-base font-bold text-amber-400 flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5" />
                        Quick Formulas & Cheat Constants
                      </h4>
                      <ul className="space-y-2">
                        {data.formulas.map((f, i) => (
                          <li key={i} className="text-sm text-gray-300 font-mono bg-amber-500/5 p-2 rounded border border-amber-500/10">
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mnemonics Section */}
                  {data.mnemonics && data.mnemonics.length > 0 && (
                    <div className={`p-6 rounded-2xl border border-violet-500/10 ${theme.card} relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl" />
                      <h4 className="text-base font-bold text-violet-400 flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5" />
                        Memory Mnemonics
                      </h4>
                      <ul className="space-y-2">
                        {data.mnemonics.map((m, i) => (
                          <li key={i} className="text-sm text-gray-300 bg-violet-500/5 p-2 rounded border border-violet-500/10">
                            {parseBoldText(m)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Common Mistakes Section */}
                  {data.commonMistakes && data.commonMistakes.length > 0 && (
                    <div className={`p-6 rounded-2xl border border-rose-500/10 ${theme.card} relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
                      <h4 className="text-base font-bold text-rose-400 flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5" />
                        Common Exam Pitfalls & Mistakes
                      </h4>
                      <ul className="space-y-2">
                        {data.commonMistakes.map((m, i) => (
                          <li key={i} className="text-sm text-gray-300 bg-rose-500/5 p-2 rounded border border-rose-500/10 flex gap-2">
                            <span className="text-rose-400 font-bold">⚠️</span>
                            <span>{parseBoldText(m)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expected Questions Section */}
                  {data.expectedQuestions && data.expectedQuestions.length > 0 && (
                    <div className={`p-6 rounded-2xl border border-emerald-500/10 ${theme.card} relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
                      <h4 className="text-base font-bold text-emerald-400 flex items-center gap-2 mb-3">
                        <Trophy className="w-5 h-5" />
                        Expected Questions & Grading Focus
                      </h4>
                      <ul className="space-y-2">
                        {data.expectedQuestions.map((q, i) => (
                          <li key={i} className="text-sm text-gray-300 bg-emerald-500/5 p-2 rounded border border-emerald-500/10 flex gap-2">
                            <span className="text-emerald-400 font-bold">🎯</span>
                            <span>{parseBoldText(q)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab B: Flashcards & Formulas */}
            {activeTab === "cards" && (
              <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 text-xs bg-purple-500/10 text-brand-violet-light border border-purple-500/20 rounded-md w-fit font-mono">
                    <BookOpen className="w-3 h-3" />
                    Active Recall Decks
                  </div>
                  <button 
                    onClick={() => setFlippedCards({})}
                    className="text-xs text-gray-500 hover:text-brand-violet-light transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Cards
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.flashcards?.map((card, index) => {
                    const isFlipped = flippedCards[index] || false;
                    return (
                      <div
                        key={index}
                        onClick={() => setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }))}
                        className="h-44 perspective-1000 cursor-pointer"
                      >
                        <div className={`relative w-full h-full duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}>
                          
                          {/* Card Front */}
                          <div className={`absolute inset-0 backface-hidden rounded-2xl p-6 flex flex-col justify-between border transition-all ${theme.panel} hover:border-brand-violet/50`}>
                            <span className="text-xs text-gray-500 font-mono">Flashcard {index + 1}</span>
                            <div className="my-auto text-center">
                              <h3 className={`text-lg font-bold tracking-tight ${theme.textPrimary}`}>{card.term}</h3>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 text-xs text-brand-violet-light font-medium">
                              <span>Reveal Explanation</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>

                          {/* Card Back */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-brand-violet/20 to-brand-indigo/20 border border-brand-violet/30 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-brand-violet/10">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-brand-violet-light font-mono font-bold">Concept Definition</span>
                              <CheckCircle2 className="w-4 h-4 text-brand-violet-light/50" />
                            </div>
                            <p className="my-auto text-sm text-gray-200 text-center leading-relaxed font-sans">
                              {card.definition}
                            </p>
                            <span className="text-[10px] text-gray-400 font-mono text-center">Tap to flip back</span>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Want More option for Tab B flashcards */}
                <div className="pt-6 border-t border-white/10 flex flex-col items-center text-center gap-2">
                  <h4 className="text-sm font-bold text-gradient-purple-cyan">Need more cards to memorize?</h4>
                  <p className="text-xs text-gray-400 max-w-md">Instantly pull 5 more high-yield flashcards to round out your active recall session.</p>
                  <button
                    onClick={() => handleLoadMore("flashcards")}
                    disabled={moreLoading["flashcards"]}
                    className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-violet to-brand-indigo hover:from-brand-violet-light text-white text-xs font-bold shadow-lg shadow-brand-violet/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {moreLoading["flashcards"] ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating supplementary decks...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Want more? (Add 5 More Cards)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tab C: 5-Minute Mock Quiz */}
            {activeTab === "quiz" && (
              <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                
                {/* Quiz Header Scorecard */}
                <div className={`p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${theme.panel}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan border border-brand-cyan/20">
                      <Award className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-base ${theme.textPrimary}`}>Assessment Sandbox</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Diagnostic test verifying memory.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block font-mono">Progress</span>
                      <span className="text-sm font-bold text-brand-cyan">{answeredCount} of {totalQuizQuestions} Completed</span>
                    </div>
                    {answeredCount === totalQuizQuestions && (
                      <div className="px-3 py-1.5 bg-brand-cyan/20 rounded-xl border border-brand-cyan/30 text-center">
                        <span className="text-xs font-bold text-white block">Score</span>
                        <span className="text-lg font-extrabold text-brand-cyan font-mono">{correctQuizAnswersCount}/{totalQuizQuestions}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-6">
                  {data.quiz?.map((q, questionIndex) => {
                    const chosenAnswer = quizAnswers[questionIndex];
                    const hasAnswered = chosenAnswer !== undefined;
                    const isAnswerCorrect = chosenAnswer === q.correctAnswer;

                    return (
                      <div 
                        key={questionIndex}
                        className={`p-6 rounded-2xl border transition-all ${theme.panel} ${
                          hasAnswered 
                            ? isAnswerCorrect 
                              ? "border-emerald-500/30 bg-emerald-500/[0.02]" 
                              : "border-rose-500/30 bg-rose-500/[0.02]" 
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs text-brand-cyan font-mono uppercase tracking-wider font-bold">
                            Diagnostic Q{questionIndex + 1}
                          </span>
                          {hasAnswered && (
                            <span className={`inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-md ${
                              isAnswerCorrect ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            }`}>
                              {isAnswerCorrect ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Correct
                                </>
                              ) : (
                                <>
                                  <X className="w-3.5 h-3.5" />
                                  Incorrect
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        <h3 className={`text-base sm:text-lg font-bold mb-4 leading-relaxed ${theme.textPrimary}`}>
                          {q.question}
                        </h3>

                        {/* Quiz Options */}
                        <div className="grid gap-2.5">
                          {q.options?.map((option, optIdx) => {
                            const isSelected = chosenAnswer === option;
                            const isCorrectVal = option === q.correctAnswer;
                            
                            let optionClass = isDarkMode 
                              ? "bg-white/[0.02] border-white/5 text-gray-300 hover:bg-white/[0.05] hover:border-white/10"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300";
                            
                            if (hasAnswered) {
                              if (isSelected) {
                                optionClass = isAnswerCorrect 
                                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-semibold" 
                                  : "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-300 font-semibold";
                              } else if (isCorrectVal) {
                                optionClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300/80 font-medium";
                              } else {
                                optionClass = "bg-transparent border-slate-200/50 dark:border-white/5 text-gray-400 opacity-50";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={hasAnswered}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [questionIndex]: option }))}
                                className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between gap-3 ${optionClass} ${!hasAnswered ? "cursor-pointer" : "cursor-default"}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-6 h-6 rounded-lg text-xs font-mono flex items-center justify-center flex-shrink-0 ${
                                    isSelected 
                                      ? isAnswerCorrect 
                                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" 
                                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                      : "bg-white/5 text-gray-400 border border-white/5"
                                  }`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="leading-relaxed">{option}</span>
                                </div>
                                {hasAnswered && isSelected && (
                                  isAnswerCorrect ? <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <X className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                )}
                                {hasAnswered && !isSelected && isCorrectVal && (
                                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-500 uppercase font-mono font-bold tracking-wider">Correct Answer</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Score Complement & Feedback Card */}
                {answeredCount === totalQuizQuestions && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-violet/20 via-brand-indigo/10 to-brand-cyan/15 border border-brand-violet/30 text-center space-y-4 animate-[fadeIn_0.5s_ease]">
                    <div className="w-16 h-16 rounded-full bg-brand-cyan/10 border-2 border-brand-cyan flex items-center justify-center mx-auto text-brand-cyan text-2xl font-extrabold font-mono shadow-lg shadow-brand-cyan/20">
                      {Math.round((correctQuizAnswersCount / totalQuizQuestions) * 100)}%
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xl text-white">Cram Session Assessment Finished!</h4>
                      <p className="text-sm text-gray-300 mt-1">
                        You scored <span className="text-brand-cyan font-bold text-lg font-mono">{correctQuizAnswersCount}</span> out of <span className="text-white font-bold font-mono">{totalQuizQuestions}</span> correct answers.
                      </p>
                    </div>
                    <div className="max-w-md mx-auto p-4 rounded-xl bg-black/40 border border-white/5 text-sm text-gray-200 leading-relaxed font-sans shadow-inner">
                      {(() => {
                        const pct = (correctQuizAnswersCount / totalQuizQuestions) * 100;
                        if (pct === 100) {
                          return "🏆 Legendary Crammer! Unblemished perfection! You are completely bulletproof for this exam. Now go secure that A+!";
                        } else if (pct >= 80) {
                          return "🌟 Elite Ready! Almost flawless! Minor gaps but you have a stellar conceptual handle on this. Double-check the incorrect ones and crush it!";
                        } else if (pct >= 60) {
                          return "📈 Solid Effort! You have the core foundation. Run through the flashcards one more time to solidify those tricky gray areas!";
                        } else {
                          return "☕ Mid-Night Fuel! Don't fret, that's why we're here. Turn on ELI5 mode, review the cheat sheet, and let's retake it to win!";
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* Want More option for Tab C quiz */}
                <div className="pt-6 border-t border-white/10 flex flex-col items-center text-center gap-2">
                  <h4 className="text-sm font-bold text-gradient-purple-cyan">Want to test yourself on more concepts?</h4>
                  <p className="text-xs text-gray-400 max-w-md">Instantly prompt Gemini to formulate another 5 diagnostic quiz questions to keep your sharp focus.</p>
                  <button
                    onClick={() => handleLoadMore("quiz")}
                    disabled={moreLoading["quiz"]}
                    className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-violet to-brand-indigo hover:from-brand-violet-light text-white text-xs font-bold shadow-lg shadow-brand-violet/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {moreLoading["quiz"] ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating new assessment items...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Want more? (Add 5 More Questions)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Reset button at the bottom */}
                {answeredCount === totalQuizQuestions && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setQuizAnswers({})}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-violet to-brand-indigo hover:from-brand-violet-light text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-brand-violet/20 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Quiz</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab D: YouTube Video Hub */}
            {activeTab === "videos" && (
              <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-md w-fit font-mono">
                    <Play className="w-3 h-3" />
                    <span>AI-Optimized Companion YouTube Guide for {currentTopic}</span>
                  </div>

                  {data.videoResources && data.videoResources.length > 0 && (() => {
                    const completedCount = Object.values(completedVideos).filter(Boolean).length;
                    const totalVideos = data.videoResources.length;
                    const percent = Math.round((completedCount / totalVideos) * 100) || 0;
                    return (
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs font-mono">
                        <span className="text-gray-400">Survival Checklist:</span>
                        <span className="text-red-400 font-bold">{completedCount}/{totalVideos} Done ({percent}%)</span>
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Custom Inline URL Player Input */}
                <div className={`p-5 rounded-2xl border ${theme.panel} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Play className="w-4 h-4 text-red-500" />
                        Interactive Video Station
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Use the search queries on the cards below to find the videos on YouTube, copy any video's link, and paste it here to play it inline!
                      </p>
                    </div>
                    {activeVideoUrl && (
                      <button
                        onClick={() => setActiveVideoUrl(null)}
                        className="text-xs text-gray-400 hover:text-white bg-white/5 border border-white/10 px-2.5 py-1 rounded-md cursor-pointer"
                      >
                        ✕ Close Player
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...) to play inline"
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 outline-none focus:border-red-500/50"
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        if (val && (val.includes("youtube.com") || val.includes("youtu.be"))) {
                          setActiveVideoUrl(val);
                        }
                      }}
                      value={activeVideoUrl || ""}
                    />
                  </div>

                  {activeVideoUrl && (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/5 shadow-inner bg-neutral-900 mt-4 animate-[fadeIn_0.3s_ease]">
                      {(() => {
                        const embedUrl = (() => {
                          try {
                            let videoId = "";
                            const url = activeVideoUrl;
                            if (url.includes("v=")) {
                              videoId = url.split("v=")[1]?.split("&")[0];
                            } else if (url.includes("youtu.be/")) {
                              videoId = url.split("youtu.be/")[1]?.split("?")[0];
                            } else if (url.includes("embed/")) {
                              videoId = url.split("embed/")[1]?.split("?")[0];
                            }
                            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
                          } catch {
                            return null;
                          }
                        })();

                        if (embedUrl) {
                          return (
                            <iframe
                              src={embedUrl}
                              className="absolute inset-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title="CramNight Video Player"
                            />
                          );
                        } else {
                          return (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                              <p className="text-sm font-semibold mb-2">Could not construct embed player for this link.</p>
                              <a
                                href={activeVideoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-red-400 hover:underline font-mono"
                              >
                                {activeVideoUrl} ↗
                              </a>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>

                {/* Grid of Video Cards */}
                {data.videoResources && data.videoResources.length > 0 ? (
                  <div className="space-y-6">
                    {data.videoResources.map((video, index) => {
                      const isCompleted = completedVideos[index] || false;
                      const activeWorkTab = activeInteractiveTab[index] || null;

                      // Level style config
                      let levelStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                      if (video.level === "Intermediate") {
                        levelStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                      } else if (video.level === "Advanced") {
                        levelStyle = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                      }

                      return (
                        <div
                          key={index}
                          className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col gap-5 ${
                            isCompleted 
                              ? "bg-emerald-500/[0.01] border-emerald-500/20 shadow-lg shadow-emerald-500/[0.01]" 
                              : `bg-white/[0.02] border-white/5 hover:border-red-500/20`
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            {/* Left Meta info */}
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${levelStyle}`}>
                                  {video.level || "Standard"} Level
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded-full">
                                  Channel: {video.channelRecommendation || "YouTube"}
                                </span>
                                <span className="text-[10px] text-red-400 font-mono font-bold bg-red-500/5 px-2 py-0.5 rounded-full">
                                  ⏱ Duration: {video.duration || "Video Guide"}
                                </span>
                              </div>

                              <h3 className="font-bold text-base sm:text-lg text-white leading-snug">
                                {video.title}
                              </h3>

                              <p className="text-xs text-gray-400 leading-relaxed italic">
                                "{video.whyWatch}"
                              </p>

                              {/* Key concepts */}
                              {video.keyConcepts && video.keyConcepts.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  <span className="text-[10px] text-gray-500 font-mono uppercase">Covers:</span>
                                  {video.keyConcepts.map((concept, ci) => (
                                    <span key={ci} className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-md font-mono">
                                      {concept}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {video.prerequisites && video.prerequisites !== "None" && (
                                <p className="text-[10px] text-gray-500 font-mono">
                                  Prerequisites: <span className="text-gray-400">{video.prerequisites}</span>
                                </p>
                              )}
                            </div>

                            {/* Complete Task Circle Button */}
                            <button
                              onClick={() => toggleCompletedVideo(index)}
                              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
                                isCompleted
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? "text-emerald-400 fill-emerald-400/20" : ""}`} />
                              <span>{isCompleted ? "Completed" : "Mark Done"}</span>
                            </button>
                          </div>

                          {/* Search Query bar */}
                          <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] text-gray-500 font-mono block uppercase">Optimized YouTube Keyword</span>
                              <span className="text-xs text-red-400 font-mono font-bold truncate block">{video.searchQuery}</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(video.searchQuery);
                                window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`, "_blank");
                              }}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/35 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>Copy & Search ↗</span>
                            </button>
                          </div>

                          {/* Interactive Learning Workspace Buttons */}
                          <div className="border-t border-white/5 pt-4">
                            <span className="text-[10px] text-gray-500 font-mono block uppercase mb-2">AI-Generated Companion Workspace</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <button
                                onClick={() => handleGenerateVideoInteractive(index, "notes")}
                                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                                  activeWorkTab === "notes"
                                    ? "bg-amber-500 text-black border-amber-400 font-black"
                                    : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>📑 Notes</span>
                              </button>

                              <button
                                onClick={() => handleGenerateVideoInteractive(index, "flashcards")}
                                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                                  activeWorkTab === "flashcards"
                                    ? "bg-violet-500 text-white border-violet-400 font-black"
                                    : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                                }`}
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span>🃏 Cards</span>
                              </button>

                              <button
                                onClick={() => handleGenerateVideoInteractive(index, "quiz")}
                                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                                  activeWorkTab === "quiz"
                                    ? "bg-cyan-500 text-black border-cyan-400 font-black"
                                    : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                                }`}
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>📝 Mini Quiz</span>
                              </button>

                              <button
                                onClick={() => handleGenerateVideoInteractive(index, "coding")}
                                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                                  activeWorkTab === "coding"
                                    ? "bg-emerald-500 text-black border-emerald-400 font-black"
                                    : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                                }`}
                              >
                                <Code className="w-3.5 h-3.5" />
                                <span>💻 Practice</span>
                              </button>
                            </div>
                          </div>

                          {/* Active Workspace View */}
                          {activeWorkTab && (
                            <div className="border-t border-white/5 pt-4 animate-[fadeIn_0.3s_ease]">
                              {generatingVideoItem[`${activeWorkTab}-${index}`] ? (
                                <div className="p-8 flex flex-col items-center justify-center gap-3 bg-black/20 rounded-xl border border-white/5">
                                  <div className="w-8 h-8 border-3 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                  <span className="text-xs text-gray-400 font-mono">Formulating tailored sub-resources...</span>
                                </div>
                              ) : (
                                <div className="p-5 rounded-xl bg-black/40 border border-white/5 space-y-4">
                                  
                                  {/* NOTES VIEW */}
                                  {activeWorkTab === "notes" && videoNotes[index] && (
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                          <FileText className="w-3.5 h-3.5" />
                                          Structured Video Study Notes
                                        </h4>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(videoNotes[index]);
                                            alert("Notes copied to clipboard!");
                                          }}
                                          className="text-[10px] text-gray-400 hover:text-white bg-white/5 px-2 py-1 rounded cursor-pointer"
                                        >
                                          Copy Notes
                                        </button>
                                      </div>
                                      <div className="text-xs sm:text-sm text-gray-300 leading-relaxed space-y-2 whitespace-pre-wrap font-sans font-medium">
                                        {videoNotes[index]}
                                      </div>
                                    </div>
                                  )}

                                  {/* FLASHCARDS VIEW */}
                                  {activeWorkTab === "flashcards" && videoFlashcards[index] && (
                                    <div className="space-y-3">
                                      <h4 className="text-xs font-bold text-violet-400 flex items-center gap-1">
                                        <Layers className="w-3.5 h-3.5" />
                                        Sub-Topic Active Recall Deck
                                      </h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {videoFlashcards[index].map((card, ci) => {
                                          const cardKey = `${index}-${ci}`;
                                          const isFlipped = videoFlippedCards[cardKey] || false;
                                          return (
                                            <div
                                              key={ci}
                                              onClick={() => setVideoFlippedCards(prev => ({ ...prev, [cardKey]: !isFlipped }))}
                                              className="p-4 rounded-xl border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col justify-between min-h-[100px]"
                                            >
                                              <div className="text-xs font-bold text-gray-400 font-mono mb-2">Card {ci + 1}</div>
                                              <div className="my-auto text-center">
                                                {!isFlipped ? (
                                                  <span className="text-xs font-bold text-white leading-normal">{card.term}</span>
                                                ) : (
                                                  <span className="text-xs text-violet-300 leading-relaxed block animate-[fadeIn_0.2s_ease]">{card.definition}</span>
                                                )}
                                              </div>
                                              <div className="text-[9px] text-gray-500 font-mono text-center mt-2 uppercase">
                                                {isFlipped ? "Tap to hide definition" : "Tap to flip"}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* QUIZ VIEW */}
                                  {activeWorkTab === "quiz" && videoQuizzes[index] && (() => {
                                    const quizCompleted = videoQuizSubmitted[index] || false;
                                    return (
                                      <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                                          <GraduationCap className="w-3.5 h-3.5" />
                                          Mini Revision Test
                                        </h4>
                                        <div className="space-y-3">
                                          {videoQuizzes[index].map((q, qi) => {
                                            const ansKey = `${index}-${qi}`;
                                            const selectedAns = videoQuizAnswers[ansKey];
                                            const isCorrect = selectedAns === q.correctAnswer;
                                            return (
                                              <div key={qi} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] space-y-2">
                                                <p className="text-xs font-bold text-white leading-normal">{qi + 1}. {q.question}</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                  {q.options.map((opt, oi) => {
                                                    const isSelected = selectedAns === opt;
                                                    let btnStyle = "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10";
                                                    if (quizCompleted) {
                                                      if (opt === q.correctAnswer) {
                                                        btnStyle = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold";
                                                      } else if (isSelected) {
                                                        btnStyle = "bg-rose-500/20 border-rose-500/40 text-rose-300 line-through";
                                                      }
                                                    } else if (isSelected) {
                                                      btnStyle = "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold";
                                                    }

                                                    return (
                                                      <button
                                                        key={oi}
                                                        disabled={quizCompleted}
                                                        onClick={() => setVideoQuizAnswers(prev => ({ ...prev, [ansKey]: opt }))}
                                                        className={`p-2 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${btnStyle}`}
                                                      >
                                                        {opt}
                                                      </button>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                          {quizCompleted ? (
                                            <button
                                              onClick={() => {
                                                // Reset answers
                                                videoQuizzes[index].forEach((_, qi) => {
                                                  setVideoQuizAnswers(prev => {
                                                    const copy = { ...prev };
                                                    delete copy[`${index}-${qi}`];
                                                    return copy;
                                                  });
                                                });
                                                setVideoQuizSubmitted(prev => ({ ...prev, [index]: false }));
                                              }}
                                              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all text-white cursor-pointer"
                                            >
                                              Reset Quiz
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                // Verify all are answered
                                                const unanswered = videoQuizzes[index].some((_, qi) => !videoQuizAnswers[`${index}-${qi}`]);
                                                if (unanswered) {
                                                  alert("Please answer all questions before submitting!");
                                                  return;
                                                }
                                                setVideoQuizSubmitted(prev => ({ ...prev, [index]: true }));
                                              }}
                                              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-xs font-bold transition-all cursor-pointer"
                                            >
                                              Submit & Check Answers
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* CODING EXERCISES VIEW */}
                                  {activeWorkTab === "coding" && videoCoding[index] && (
                                    <div className="space-y-4">
                                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                        <Code className="w-3.5 h-3.5" />
                                        Sub-Topic Practice Exercises
                                      </h4>
                                      <div className="space-y-3">
                                        {videoCoding[index].map((prob, pi) => {
                                          const hintKey = `${index}-${pi}`;
                                          const isHintFlipped = videoFlippedCards[hintKey] || false;
                                          return (
                                            <div key={pi} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-2">
                                              <p className="text-xs font-bold text-white">{pi + 1}. {prob.title}</p>
                                              <p className="text-[11px] text-gray-400 leading-normal">{prob.description}</p>
                                              <div className="pt-1">
                                                <button
                                                  onClick={() => setVideoFlippedCards(prev => ({ ...prev, [hintKey]: !isHintFlipped }))}
                                                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-mono cursor-pointer"
                                                >
                                                  {isHintFlipped ? "✕ Hide Mentor Hint" : "💡 Reveal Mentor Hint"}
                                                </button>
                                                {isHintFlipped && (
                                                  <div className="mt-2 p-2.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-300 leading-relaxed font-mono animate-[fadeIn_0.2s_ease]">
                                                    {prob.hint}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-white/[0.01] border border-white/5">
                    <p className="text-sm text-gray-400">No companion video resources were formulated for this topic yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab E: Code Dry Run Visualizer */}
            {activeTab === "visualizer" && (
              <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md w-fit font-mono">
                    <Code className="w-3.5 h-3.5" />
                    <span>Visual Code Dry-Run Debugger</span>
                  </div>
                  
                  {/* Template selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">Select Algorithm:</span>
                    <select
                      value={selectedDryRunTemplate}
                      onChange={(e) => setSelectedDryRunTemplate(e.target.value)}
                      className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 outline-none cursor-pointer hover:border-emerald-500/30 transition-all font-semibold"
                    >
                      <option value="bubble-sort">Bubble Sort (Swaps)</option>
                      <option value="binary-search">Binary Search (Divide & Conquer)</option>
                      <option value="fibonacci">Fibonacci (DP Table)</option>
                    </select>
                  </div>
                </div>

                {/* Sub-header instruction */}
                <p className="text-xs text-gray-400 -mt-2">
                  Trace variable scopes, arrays, and pointer shifts line-by-line in real-time. No compilation delays!
                </p>

                {/* Core debugger layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left block: Interactive code lines */}
                  <div className={`lg:col-span-7 rounded-2xl bg-[#0d0e15] border border-white/5 overflow-hidden flex flex-col shadow-2xl`}>
                    <div className="px-4 py-3 bg-black/40 border-b border-white/5 flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400">trace_engine.ts</span>
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                    </div>

                    <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-gray-300 select-none">
                      {(() => {
                        const template = DRY_RUN_TEMPLATES[selectedDryRunTemplate];
                        if (!template) return null;
                        const currentStep = template.steps[dryRunStepIndex];
                        const lines = template.code.split("\n");

                        return lines.map((lineText, idx) => {
                          const lineNum = idx + 1;
                          const isHighlighted = currentStep && currentStep.line === lineNum;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center -mx-4 px-4 transition-all duration-200 ${
                                isHighlighted
                                  ? "bg-emerald-500/15 border-l-4 border-emerald-500 text-white font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.1)] py-0.5"
                                  : "text-gray-400"
                              }`}
                            >
                              {/* Line number */}
                              <span className="w-8 text-right pr-4 text-gray-600 font-mono text-[10px] select-none">
                                {lineNum}
                              </span>
                              {/* Code contents */}
                              <span className="whitespace-pre">{lineText}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Navigation bar controls */}
                    <div className="p-4 bg-black/40 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDryRunStepIndex(prev => Math.max(0, prev - 1))}
                          disabled={dryRunStepIndex === 0}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-40 text-xs rounded-lg transition-all font-bold cursor-pointer"
                        >
                          ◀ Prev
                        </button>
                        
                        <button
                          onClick={() => setDryRunPlaying(!dryRunPlaying)}
                          className={`px-4 py-1.5 ${
                            dryRunPlaying 
                              ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30" 
                              : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
                          } text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1`}
                        >
                          {dryRunPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          <span>{dryRunPlaying ? "Pause Trace" : "Auto Trace"}</span>
                        </button>

                        <button
                          onClick={() => {
                            const template = DRY_RUN_TEMPLATES[selectedDryRunTemplate];
                            if (template) {
                              setDryRunStepIndex(prev => Math.min(template.steps.length - 1, prev + 1));
                            }
                          }}
                          disabled={(() => {
                            const template = DRY_RUN_TEMPLATES[selectedDryRunTemplate];
                            return template ? dryRunStepIndex === template.steps.length - 1 : true;
                          })()}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-40 text-xs rounded-lg transition-all font-bold cursor-pointer"
                        >
                          Next ▶
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setDryRunStepIndex(0);
                          setDryRunPlaying(false);
                        }}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white text-xs rounded-lg font-bold transition-all cursor-pointer"
                      >
                        Reset Trace
                      </button>
                    </div>
                  </div>

                  {/* Right block: Variable Trace and Visual Array representation */}
                  <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                    {/* Active explanation trace card */}
                    {(() => {
                      const template = DRY_RUN_TEMPLATES[selectedDryRunTemplate];
                      if (!template) return null;
                      const step = template.steps[dryRunStepIndex];
                      if (!step) return null;

                      return (
                        <div className="space-y-4">
                          <div className={`p-5 rounded-2xl border border-emerald-500/10 ${theme.card} space-y-3 shadow-xl`}>
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                              Step {dryRunStepIndex + 1} of {template.steps.length}: Code Logic
                            </h4>
                            <p className="text-sm text-gray-200 leading-relaxed font-sans">
                              {step.explanation}
                            </p>
                          </div>

                          {/* Variable Tracing */}
                          <div className={`p-5 rounded-2xl border border-white/5 ${theme.card} space-y-3 shadow-xl`}>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                              Active Variables Monitor
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(step.variables).map(([name, val]) => {
                                const isChanging = val !== "undefined";
                                return (
                                  <div key={name} className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex flex-col font-mono text-xs">
                                    <span className="text-gray-500">{name}</span>
                                    <span className={`font-bold mt-0.5 ${isChanging ? "text-emerald-400" : "text-gray-600"}`}>
                                      {val.toString()}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Array visual element */}
                          {step.arr && step.arr.length > 0 && (
                            <div className={`p-5 rounded-2xl border border-white/5 ${theme.card} space-y-3 shadow-xl`}>
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-brand-cyan animate-pulse" />
                                Memory Array Visualization
                              </h4>
                              
                              <div className="flex gap-2 justify-center items-end py-3">
                                {step.arr.map((val, idx) => {
                                  // Highlight sorted/swapping elements dynamically
                                  const isPointerJ = step.variables.j === idx;
                                  const isPointerJPlus1 = step.variables.j + 1 === idx;
                                  const isMid = step.variables.mid === idx;
                                  const isHighlighted = isPointerJ || isPointerJPlus1 || isMid;
                                  
                                  return (
                                    <div key={idx} className="flex flex-col items-center gap-1">
                                      {/* Value block */}
                                      <div
                                        className={`w-12 rounded-xl flex items-center justify-center font-bold font-mono transition-all duration-300 shadow-lg ${
                                          isHighlighted
                                            ? "h-16 bg-gradient-to-t from-emerald-500 to-teal-400 text-white ring-4 ring-emerald-500/20 scale-110"
                                            : "h-12 bg-black/60 border border-white/10 text-gray-300"
                                        }`}
                                      >
                                        {val}
                                      </div>
                                      
                                      {/* Pointer Badge */}
                                      <span className="text-[9px] font-mono font-bold text-gray-500">
                                        {isPointerJ && "j"}
                                        {isPointerJPlus1 && "j+1"}
                                        {isMid && "mid"}
                                        {!isHighlighted && `[${idx}]`}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Tab F: Panic Timeline Mode */}
            {activeTab === "panic" && (
              <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md w-fit font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                    <span>"Last 24 Hours" Emergency Timeline Planner</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-semibold">How many hours left?</span>
                    <div className="flex rounded-lg overflow-hidden border border-white/10">
                      {[2, 5, 12, 24].map((h) => (
                        <button
                          key={h}
                          onClick={() => handlePanicButton(h)}
                          className={`px-3 py-1 text-xs font-bold cursor-pointer border-r border-white/5 last:border-0 ${
                            panicHoursLeft === h && panicActive
                              ? "bg-rose-500 text-white"
                              : "bg-black/40 text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 -mt-2">
                  No time for full textbooks! Toggle the slider or buttons to formulate an hour-by-hour tactical survival roadmap with instant readiness forecasting.
                </p>

                {/* Main crisis layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Interactive checklists */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className={`p-6 rounded-2xl border border-rose-500/10 ${theme.card} space-y-4 shadow-xl relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
                      
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-rose-400 font-mono uppercase tracking-wider flex items-center gap-2">
                          <Flame className="w-4 h-4 text-red-500" />
                          Emergency Checklist ({panicHoursLeft} Hours Plan)
                        </h4>
                        <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold">
                          CRISIS ACTIVE
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {(() => {
                          const hoursTextMap: Record<number, string[]> = {
                            2: [
                              "Hour 1 (0-60m): Bullet Summaries, Formulas & Mnemonics",
                              "Hour 1.5 (60-90m): Rapid MCQ Battles with bot",
                              "Hour 2 (90-120m): Practice wrong answers notebook",
                              "Hour 2+: Relax, stay hydrated and get ready!",
                              "Review Cheat sheets while waiting in hallway"
                            ],
                            5: [
                              "Hour 1: Core concepts and 1-page notes",
                              "Hour 2: Visual Code dry-runs & variable traces",
                              "Hour 3: Interactive Adaptive diagnostic test",
                              "Hour 4: Focus on weakest subtopics identified",
                              "Hour 5: MCQ duel battle & final speed RSVP drills"
                            ],
                            12: [
                              "Hour 1-3: Detailed summaries, mnemonics & formula sheet",
                              "Hour 4-5: Companion video hub list review",
                              "Hour 6-7: Interactive debugger traces on Bubble sort/Search",
                              "Hour 8-9: Adaptive diagnostic mock tests",
                              "Hour 10-11: Review mistake logs & play high-speed RSVP drills",
                              "Hour 12: 6 Hours of restorative sleep (Memory consolidation)"
                            ],
                            24: [
                              "Hour 1-4: Syllabus parsing & initial cheat compilation",
                              "Hour 5-8: Deep dive video courses & visual sorting dry-runs",
                              "Hour 9-12: Full diagnostic assessments (Adaptive tests)",
                              "Hour 13-16: Memorize mnemonic acronyms & code tracing",
                              "Hour 17-20: Mistake notebook clearing & MCQ battle arena",
                              "Hour 21-24: Binaural beat relaxation session & deep sleep"
                            ]
                          };

                          const steps = hoursTextMap[panicHoursLeft] || hoursTextMap[5];
                          return steps.map((step, idx) => {
                            const taskId = `task-${idx}`;
                            const isChecked = !!panicCompletedTasks[taskId];
                            
                            return (
                              <label
                                key={idx}
                                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? "bg-rose-500/5 border-rose-500/20 text-gray-400 line-through"
                                    : "bg-black/40 border-white/5 text-gray-200 hover:border-white/10"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setPanicCompletedTasks(prev => ({
                                      ...prev,
                                      [taskId]: !prev[taskId]
                                    }));
                                  }}
                                  className="mt-0.5 rounded border-rose-500/30 text-rose-500 focus:ring-rose-500 h-4 w-4 bg-black/60 cursor-pointer"
                                />
                                <span className="text-xs sm:text-sm font-medium">{step}</span>
                              </label>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Right: Dynamic Readiness Indicator */}
                  <div className="lg:col-span-5 space-y-4">
                    {(() => {
                      // Calculate dynamic readiness score
                      const totalTasks = 5;
                      const completedCount = Object.values(panicCompletedTasks).filter(Boolean).length;
                      const baseScore = Math.max(10, 100 - panicHoursLeft * 3.5); // fewer hours = harder starting readiness
                      const incremental = Math.floor((100 - baseScore) * (completedCount / totalTasks));
                      const finalReadiness = Math.min(100, Math.floor(baseScore + incremental));

                      let readinessColor = "text-rose-400";
                      let readinessBg = "bg-rose-500/10 border-rose-500/20";
                      let message = "Danger level critical! Clear the checklist immediately.";

                      if (finalReadiness > 85) {
                        readinessColor = "text-emerald-400";
                        readinessBg = "bg-emerald-500/10 border-emerald-500/20";
                        message = "Excellent! You are structurally optimized to crush this exam!";
                      } else if (finalReadiness > 60) {
                        readinessColor = "text-amber-400";
                        readinessBg = "bg-amber-500/10 border-amber-500/20";
                        message = "Decent progress. Finish remaining checklist items to lock in an A.";
                      }

                      return (
                        <div className="space-y-4">
                          <div className={`p-6 rounded-2xl border text-center ${readinessBg} space-y-4 shadow-xl`}>
                            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">
                              Estimated Exam Readiness Forecast
                            </h4>

                            <div className="flex flex-col items-center justify-center space-y-2 py-4">
                              <span className={`text-6xl font-black font-mono tracking-tight ${readinessColor} animate-pulse`}>
                                {finalReadiness}%
                              </span>
                              <span className="text-xs text-gray-300 font-semibold uppercase font-mono tracking-wider">
                                Readiness Coefficient
                              </span>
                            </div>

                            <p className="text-xs text-gray-300 leading-relaxed italic max-w-xs mx-auto">
                              "{message}"
                            </p>
                          </div>

                          <div className={`p-5 rounded-2xl border border-white/5 ${theme.card} space-y-3 shadow-xl`}>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                              Tactical Advice for {panicHoursLeft} Hours left
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {panicHoursLeft === 2 && "⚡ Focus purely on memory mnemonics and active formula constants. DO NOT read lengthy explanations. Hit the MCQ Battle Duel 2 times to prime your test-taking neural reflex."}
                              {panicHoursLeft === 5 && "💡 Complete the 5-minute Adaptive quiz to identify your red flag weakness subtopics, trace Bubble Sort or binary search debugger animation, then sleep for 30 minutes right before entering."}
                              {panicHoursLeft === 12 && "🛌 Make sure to complete 6 full hours of rest. Sleep transfers short-term memories formed during cram sessions into the permanent cerebral cortex."}
                              {panicHoursLeft === 24 && "🎓 Excellent time framework. Parse your exact course syllabus text in our 'Syllabus Parser' tab, load custom bento cheat sheets, and take a diagnostic test every 4 hours."}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Tab G: Syllabus / Note Parser */}
            {activeTab === "parser" && (
              <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md w-fit font-mono">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Syllabus & Lecture Transcripts PDF/Text Parser</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-semibold">Load Preset Curriculums:</span>
                    <div className="flex flex-wrap gap-1">
                      {["dsa", "os", "dbms", "networks"].map((id) => (
                        <button
                          key={id}
                          onClick={() => loadPresetSyllabus(id)}
                          className="px-2.5 py-1 text-[10px] bg-sky-500/5 hover:bg-sky-500/10 border border-sky-500/10 hover:border-sky-500/30 text-sky-300 font-bold rounded-lg cursor-pointer uppercase font-mono"
                        >
                          {id}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 -mt-2">
                  Paste raw syllabus text, copy-pasted slides, or classroom transcripts. CramNight AI will instantly parse the topics, isolate high-yield points, formulas, common mistakes, flashcards, and expected exam questions.
                </p>

                <form onSubmit={handleSyllabusParse} className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={parserText}
                      onChange={(e) => setParserText(e.target.value)}
                      placeholder="Paste your syllabus checklist or slide text here (e.g. 'Binary Search Trees: operations, worst-case height, traversal formulas...')"
                      rows={10}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-mono text-gray-200 outline-none focus:border-sky-500/30 focus:ring-1 focus:ring-sky-500/30 placeholder-gray-600 transition-all shadow-inner"
                      disabled={parserLoading}
                    />
                    
                    <div className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono">
                      {parserText.length} characters
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-400">
                      <input
                        type="checkbox"
                        checked={isEasyMode}
                        onChange={(e) => setIsEasyMode(e.target.checked)}
                        className="rounded border-sky-500/30 text-sky-500 focus:ring-sky-500 h-4 w-4 bg-black/60 cursor-pointer"
                      />
                      <span>Explain concepts like I'm 5 (ELI5 Simple Mode)</span>
                    </label>

                    <button
                      type="submit"
                      disabled={parserLoading || !parserText.trim()}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-45"
                    >
                      {parserLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>AI Extracting Concepts & Compiling Survival Kit...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Extract & Compile Cram Kit</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab H: MCQ Battle Arena */}
            {activeTab === "battle" && (
              <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md w-fit font-mono">
                    <Gamepad2 className="w-3.5 h-3.5 animate-bounce" />
                    <span>Rapid MCQ Battle Arena (Peer Duel)</span>
                  </div>

                  <button
                    onClick={() => setBattleShowLeaderboard(!battleShowLeaderboard)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{battleShowLeaderboard ? "Hide Rankings" : "Show Rankings"}</span>
                  </button>
                </div>

                <p className="text-xs text-gray-400 -mt-2">
                  Test your split-second retrieval reflex against peers or an advanced GPT-4 bot. The faster you lock in correct answers, the higher your speed multipliers.
                </p>

                {/* Configuration / Lobby lobby screen */}
                {!battleActive && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Character Select */}
                    <div className={`md:col-span-7 p-6 rounded-2xl border border-white/5 ${theme.card} space-y-4 shadow-xl flex flex-col justify-between`}>
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-purple-400 font-mono uppercase tracking-wider">
                          Enter the Lobby
                        </h4>
                        
                        <div className="space-y-2">
                          <label className="text-xs text-gray-400 block font-semibold">Crammer Nickname:</label>
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-gray-200 outline-none focus:border-purple-500/30 transition-all"
                            placeholder="Player nickname..."
                          />
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="text-xs text-gray-400 block font-semibold">Select Opponent:</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => startMCQBattle("Rohan (Peer)")}
                              className="p-4 rounded-xl border border-white/5 bg-black/40 hover:bg-white/5 hover:border-purple-500/30 transition-all text-left space-y-1 cursor-pointer"
                            >
                              <div className="text-base">👨‍💻 Rohan (Peer)</div>
                              <div className="text-[10px] text-gray-400 font-medium">Difficulty: Medium (65% Accuracy)</div>
                            </button>
                            <button
                              onClick={() => startMCQBattle("GPT-4 (AI Bot)")}
                              className="p-4 rounded-xl border border-white/5 bg-black/40 hover:bg-white/5 hover:border-purple-500/30 transition-all text-left space-y-1 cursor-pointer"
                            >
                              <div className="text-base text-purple-300">🤖 GPT-4 (AI Overlord)</div>
                              <div className="text-[10px] text-gray-400 font-medium">Difficulty: Extreme (90% Accuracy)</div>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 bg-black/40 border border-white/5 p-3 rounded-xl mt-4">
                        💡 Duels draw questions from your generated quiz. If no material is loaded, default Computer Science questions are supplied!
                      </div>
                    </div>

                    {/* Leaderboard or logs */}
                    <div className="md:col-span-5 p-6 rounded-2xl border border-white/5 bg-black/40 space-y-4 shadow-xl">
                      <h4 className="text-sm font-bold text-gray-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        Hackathon Hall of Fame
                      </h4>

                      <div className="space-y-2">
                        {battleLeaderboard.map((user) => (
                          <div
                            key={user.rank}
                            className={`flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 ${
                              user.name.includes("You") ? "border-purple-500/20 bg-purple-500/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-sm font-mono font-bold text-gray-500 w-4">{user.rank}</span>
                              <span className="text-base">{user.avatar}</span>
                              <span className="text-xs font-semibold text-gray-200">{user.name}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-purple-400">{user.score} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Battle Gameplay Arena */}
                {battleActive && (
                  <div className="space-y-4">
                    {/* Combatants HUD */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* User HUD */}
                      <div className={`p-4 rounded-2xl border border-white/5 bg-black/40 space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-bold">{playerName} (You)</span>
                          <span className="text-sm font-mono font-black text-purple-400">{battleUserScore} pts</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${Math.min(100, (battleUserScore / 1000) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Opponent HUD */}
                      <div className={`p-4 rounded-2xl border border-white/5 bg-black/40 space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-300 font-bold">
                            {battleMessages[0]?.includes("GPT-4") ? "🤖 GPT-4 (AI)" : "👨‍💻 Rohan (Peer)"}
                          </span>
                          <span className="text-sm font-mono font-black text-rose-400">{battleBotScore} pts</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${Math.min(100, (battleBotScore / 1000) * 100)}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Question Box */}
                    {(() => {
                      const quizPool = data?.quiz && data.quiz.length > 0 ? data.quiz : FALLBACK_QUIZ;
                      const qIndex = battleQuestionIndex % quizPool.length;
                      const currentQ = quizPool[qIndex];

                      return (
                        <div className={`p-6 sm:p-8 rounded-2xl border border-purple-500/10 ${theme.card} space-y-6 shadow-2xl relative overflow-hidden`}>
                          {/* Timer overlay bar */}
                          <div
                            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-rose-500 transition-all duration-1000"
                            style={{ width: `${(battleTimer / 15) * 100}%` }}
                          />

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-purple-400">
                              QUESTION {battleQuestionIndex + 1} OF 5
                            </span>
                            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                              battleTimer < 5 ? "bg-rose-500/20 text-rose-400" : "bg-white/5 text-gray-300"
                            }`}>
                              ⏱️ {battleTimer}s LEFT
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-gray-100 leading-relaxed">
                            {currentQ.question}
                          </h3>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {currentQ.options.map((opt) => {
                              const isSelected = battleSelectedOption === opt;
                              const isCorrectAnswer = opt === currentQ.correctAnswer;
                              
                              let buttonStyle = "bg-black/40 border-white/5 text-gray-300 hover:bg-white/5 hover:border-white/10";
                              if (battleSelectedOption) {
                                if (isSelected) {
                                  buttonStyle = isCorrectAnswer
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                                    : "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                                } else if (isCorrectAnswer) {
                                  buttonStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold";
                                } else {
                                  buttonStyle = "bg-black/20 border-white/5 text-gray-600 opacity-60";
                                }
                              }

                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleBattleAnswer(opt)}
                                  disabled={!!battleSelectedOption}
                                  className={`p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${buttonStyle}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Battle Logs scrolling output */}
                    <div className="p-4 bg-black/60 border border-white/5 rounded-2xl h-44 overflow-y-auto font-mono text-xs text-gray-400 space-y-1.5 shadow-inner">
                      <div className="text-[10px] uppercase font-bold text-gray-500 border-b border-white/5 pb-1 mb-2">
                        Battle Logs / Commentary Output
                      </div>
                      {battleMessages.map((msg, i) => (
                        <div key={i} className={`animate-[fadeIn_0.2s_ease]`}>
                          {msg}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Empty Dashboard onboarding state */}
        {!data && !loading && (
          <div className={`mt-12 rounded-3xl text-center border relative overflow-hidden transition-all duration-300 ${theme.onboardingCard} p-0`}>
            {/* Aesthetic Relevant Study Room Header Image with Violet-Pink Gradient Mask */}
            <div className="relative h-48 w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#030307] via-[#030307]/50 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-violet/40 via-brand-pink/30 to-transparent mix-blend-color z-10" />
              <img 
                src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80" 
                alt="Vaporwave Lofi Aesthetic Study Room"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform scale-105 hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 z-20 flex gap-1.5">
                <span className="px-2 py-1 rounded bg-black/75 backdrop-blur-md text-[10px] text-brand-pink font-bold font-mono uppercase tracking-wider border border-brand-pink/30 shadow">
                  LOFI FOCUS ROOM
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-pink flex items-center justify-center mx-auto text-white shadow-lg mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              
              <h3 className={`font-display font-extrabold text-2xl mb-2 ${theme.textPrimary}`}>
                Ready for a rapid break-through?
              </h3>
              <p className={`text-sm max-w-lg mx-auto leading-relaxed mb-6 ${theme.textSecondary}`}>
                Type any educational, tech, or interview topic. CramNight AI will instantly generate bite-sized summaries, active recall cards, and diagnostic mock assessment questions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className={`p-4 rounded-2xl border transition-all ${theme.card} border-brand-violet/20 hover:border-brand-violet/40 shadow-sm hover:shadow-brand-violet/5`}>
                  <Zap className="w-5 h-5 text-amber-500 mb-2" />
                  <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${theme.textPrimary}`}>Instant Guide</h4>
                  <p className="text-[11px] text-gray-400 mt-1">High-yield study points with bold takeaways.</p>
                </div>
                <div className={`p-4 rounded-2xl border transition-all ${theme.card} border-brand-pink/20 hover:border-brand-pink/40 shadow-sm hover:shadow-brand-pink/5`}>
                  <Layers className="w-5 h-5 text-brand-pink mb-2" />
                  <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${theme.textPrimary}`}>Flashcards</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Responsive micro-animations for active recall.</p>
                </div>
                <div className={`p-4 rounded-2xl border transition-all ${theme.card} border-brand-violet/20 hover:border-brand-violet/40 shadow-sm hover:shadow-brand-violet/5`}>
                  <GraduationCap className="w-5 h-5 text-brand-cyan mb-2" />
                  <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${theme.textPrimary}`}>Diagnostic Quiz</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Multiple choice practice with color-coded feedback.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Interactive Emoji AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Chatbot Bubble Dialog */}
        {chatbotOpen && (
          <div className="pointer-events-auto w-96 max-w-[calc(100vw-2rem)] rounded-2xl border bg-black/90 backdrop-blur-md border-brand-violet/40 p-4 shadow-2xl shadow-brand-pink/15 animate-[fadeIn_0.25s_ease-out] flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono tracking-wider">CRAMMY AI HELPER</h4>
                  <span className="text-[9px] text-brand-pink font-bold tracking-widest font-mono block uppercase">● ONLINE · ACTIVE</span>
                </div>
              </div>
              <button 
                onClick={() => setChatbotOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Bubble Message text */}
            <div className="text-xs space-y-2 max-h-60 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-brand-violet/40 scrollbar-track-transparent">
              {chatHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}
                >
                  <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider">
                    {msg.sender === "user" ? "You" : "Crammy"}
                  </span>
                  <div className={`p-2.5 rounded-xl leading-relaxed whitespace-pre-line text-xs ${
                    msg.sender === "user" 
                      ? "bg-gradient-to-tr from-brand-violet via-brand-pink to-brand-indigo text-white rounded-br-none border border-white/10" 
                      : "bg-white/[0.04] text-gray-200 rounded-bl-none border border-white/5"
                  }`}>
                    {parseBoldText(msg.text)}
                  </div>
                </div>
              ))}
              
              {chatbotTyping && (
                <div className="self-start flex flex-col gap-1 items-start">
                  <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wider">Crammy is thinking</span>
                  <div className="p-2.5 rounded-xl rounded-bl-none bg-white/[0.04] border border-white/5">
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-violet animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action options grid */}
            <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-white/5">
              <button
                type="button"
                onClick={() => handleChatbotOption("tip")}
                className="py-1 px-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] text-gray-300 hover:bg-brand-violet/20 hover:border-brand-violet/30 hover:text-white transition-all cursor-pointer font-semibold text-center truncate"
                title="Study Tip"
              >
                💡 Tip
              </button>
              <button
                type="button"
                onClick={() => handleChatbotOption("motivate")}
                className="py-1 px-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] text-gray-300 hover:bg-brand-pink/20 hover:border-brand-pink/30 hover:text-white transition-all cursor-pointer font-semibold text-center truncate"
                title="Motivate Me"
              >
                🔥 Motivate
              </button>
              <button
                type="button"
                onClick={() => handleChatbotOption("test")}
                className="py-1 px-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] text-gray-300 hover:bg-brand-indigo/20 hover:border-brand-indigo/30 hover:text-white transition-all cursor-pointer font-semibold text-center truncate"
                title="Test Concept"
              >
                🧠 Test
              </button>
              <button
                type="button"
                onClick={() => handleChatbotOption("joke")}
                className="py-1 px-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all cursor-pointer font-semibold text-center truncate"
                title="Developer Joke"
              >
                ☕ Joke
              </button>
            </div>

            {/* Custom Question input form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5 mt-1 border-t border-white/5 pt-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything about this topic..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-pink/60 transition-all font-sans"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatbotTyping}
                className="p-1.5 bg-gradient-to-tr from-brand-violet to-brand-pink hover:opacity-90 active:scale-95 disabled:opacity-40 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Floating Avatar Trigger Button */}
        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="pointer-events-auto w-14 h-14 rounded-full bg-gradient-to-tr from-brand-violet to-brand-cyan hover:from-brand-violet-light flex items-center justify-center shadow-xl shadow-brand-violet/20 border-2 border-white/20 hover:border-white/50 cursor-pointer animate-bounce group transition-all"
          title="Toggle Study Companion Chatbot"
        >
          <span className="text-2xl transition-transform group-hover:scale-125">🤖</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 mt-auto border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500 font-mono tracking-wide">
            CramNight AI utilizes Gemini 3.5 Flash · Orchestrated Server Integration.
          </p>
          <p className="text-[10px] text-gray-600 mt-2">
            © 2026 CramNight AI. Built for active last-minute cramming and interview readiness.
          </p>
        </div>
      </footer>
    </div>
  );
}
