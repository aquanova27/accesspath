import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Zap, 
  Eye, 
  Ear, 
  MessageSquare, 
  Accessibility,
  UserCheck,
  X,
  ArrowDown,
  Sparkles,
  ChevronRight,
  RotateCcw,
  ChevronLeft,
  Send,
  FileText,
  User,
  BookOpen
} from 'lucide-react';

// ============================================================================
// ACCESSIBILITY PROFILES & ADAPTIVE STEPS DATA
// ============================================================================
const RECEPTOR_PROFILES = [
  {
    id: 'default',
    name: 'Standard Steps',
    icon: UserCheck,
    tagline: 'General Care Navigation',
    description: 'Basic steps everyone takes to secure a doctor appointment.'
  },
  {
    id: 'blind',
    name: 'Visual / Blind Support',
    icon: Eye,
    tagline: 'Screen-Reader & Audio Tools',
    description: 'Adds screen-reader checks and audio form assistance.'
  },
  {
    id: 'deaf',
    name: 'Deaf / Hard of Hearing',
    icon: Ear,
    tagline: 'ASL & Visual Communication',
    description: 'Adds ASL interpreter booking and text/TTY relay setups.'
  },
  {
    id: 'aphasia',
    name: 'Speech & Cognitive Support',
    icon: MessageSquare,
    tagline: 'Picture Boards & Helpers',
    description: 'Adds visual picture boards and helper/advocate authorizations.'
  },
  {
    id: 'mobility',
    name: 'Mobility & Wheelchair Access',
    icon: Accessibility,
    tagline: 'Ramp Access & Ride Services',
    description: 'Adds wheelchair access checks and accessible ride booking.'
  }
];

// Master list of pathway steps (main series and simultaneous parallel steps)
const MASTER_NODES_DATA = [
  {
    id: 'node_1',
    stage: 1,
    title: '1. Tell Us What You Need',
    shortTitle: '1. Describe Symptoms',
    description: 'List your current medical symptoms or reasons for needing a visit.',
    profiles: ['all'],
    branchType: 'main'
  },
  {
    id: 'node_1_aphasia',
    stage: 1,
    parentId: 'node_1',
    title: 'Use Picture Symbol Board',
    shortTitle: 'Picture Symbol Board',
    description: 'Pick simple pictures to show your symptoms without typing long texts.',
    profiles: ['aphasia'],
    branchType: 'parallel'
  },
  {
    id: 'node_2',
    stage: 2,
    title: '2. Find a Doctor or Clinic',
    shortTitle: '2. Find Doctor',
    description: 'Search for a local doctor or specialist who takes your insurance.',
    profiles: ['all'],
    branchType: 'main'
  },
  {
    id: 'node_2_blind',
    stage: 2,
    parentId: 'node_2',
    title: 'Screen-Reader Web Check',
    shortTitle: 'Audio Directory Check',
    description: 'Make sure the clinic booking site works smoothly with screen readers.',
    profiles: ['blind'],
    branchType: 'parallel'
  },
  {
    id: 'node_2_mobility',
    stage: 2,
    parentId: 'node_2',
    title: 'Check Ramp & Entrance Access',
    shortTitle: 'Ramp & Access Check',
    description: 'Confirm the clinic has automatic doors, ramps, and accessible exam rooms.',
    profiles: ['mobility'],
    branchType: 'parallel'
  },
  {
    id: 'node_3',
    stage: 3,
    title: '3. Insurance & Approval',
    shortTitle: '3. Insurance Check',
    description: 'Check your health insurance coverage and request pre-approval if needed.',
    profiles: ['all'],
    branchType: 'main'
  },
  {
    id: 'node_3_deaf',
    stage: 3,
    parentId: 'node_3',
    title: 'Set Up Text/TTY Relay Line',
    shortTitle: 'Text/TTY Relay Line',
    description: 'Set up text or video relay calls to talk with insurance representatives.',
    profiles: ['deaf'],
    branchType: 'parallel'
  },
  {
    id: 'node_4',
    stage: 4,
    title: '4. Pick Date & Time',
    shortTitle: '4. Schedule Slot',
    description: 'Choose an open appointment time slot on the calendar.',
    profiles: ['all'],
    branchType: 'main'
  },
  {
    id: 'node_4_deaf',
    stage: 4,
    parentId: 'node_4',
    title: 'Book ASL Sign Language Interpreter',
    shortTitle: 'Book ASL Interpreter',
    description: 'Request an in-person Sign Language interpreter for your appointment time.',
    profiles: ['deaf'],
    branchType: 'parallel'
  },
  {
    id: 'node_4_mobility',
    stage: 4,
    parentId: 'node_4',
    title: 'Book Wheelchair Transportation',
    shortTitle: 'Book Accessible Ride',
    description: 'Schedule a wheelchair-accessible van or shuttle ride for appointment day.',
    profiles: ['mobility'],
    branchType: 'parallel'
  },
  {
    id: 'node_5',
    stage: 5,
    title: '5. Fill Out Intake Forms',
    shortTitle: '5. Pre-Visit Forms',
    description: 'Complete patient registration paperwork and medical history forms.',
    profiles: ['all'],
    branchType: 'main'
  },
  {
    id: 'node_5_blind',
    stage: 5,
    parentId: 'node_5',
    title: 'Request Large Print or Braille Forms',
    shortTitle: 'Large Print/Audio Forms',
    description: 'Ask the clinic to email fillable digital forms or large-print paperwork.',
    profiles: ['blind'],
    branchType: 'parallel'
  },
  {
    id: 'node_5_aphasia',
    stage: 5,
    parentId: 'node_5',
    title: 'Add Family Helper or Advocate',
    shortTitle: 'Add Helper / Advocate',
    description: 'Give permission for a trusted family member or helper to join your appointment.',
    profiles: ['aphasia'],
    branchType: 'parallel'
  },
  {
    id: 'node_6',
    stage: 6,
    title: '6. Attend Doctor Visit',
    shortTitle: '6. Visit Doctor',
    description: 'Arrive for your appointment, speak with your care team, and get your treatment plan.',
    profiles: ['all'],
    branchType: 'main'
  }
];

// Helper to construct a smooth sine wave path string between two points
function createSineWavePath(fromX, fromY, toX, toY, amplitude = 14, frequency = 3) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return `M ${fromX} ${fromY}`;

  const ux = dx / distance;
  const uy = dy / distance;
  const px = -uy;
  const py = ux;

  const steps = 40;
  let path = `M ${fromX} ${fromY}`;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const currentX = fromX + ux * distance * t;
    const currentY = fromY + uy * distance * t;

    const envelope = Math.sin(t * Math.PI);
    const waveOffset = Math.sin(t * Math.PI * 2 * frequency) * amplitude * envelope;

    const waveX = currentX + px * waveOffset;
    const waveY = currentY + py * waveOffset;

    path += ` L ${waveX.toFixed(2)} ${waveY.toFixed(2)}`;
  }

  return path;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('intake');
  
  // Allow multiple selected accessibility profile IDs
  const [selectedProfileIds, setSelectedProfileIds] = useState(['default']);

  // Selected node popup state (Side Panel)
  const [selectedNode, setSelectedNode] = useState(null);

  // Submission input box state per step popup
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Internal Profile record stored from user submissions
  const [userProfile, setUserProfile] = useState({
    name: 'Patient User',
    submissions: []
  });

  // Automatically scroll to the top of the page whenever switching views
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentPage]);

  // Dynamic node status mapping
  const [nodeStatuses, setNodeStatuses] = useState({
    'node_1': 'blue',
    'node_1_aphasia': 'blue',
    'node_2': 'grey',
    'node_2_blind': 'grey',
    'node_2_mobility': 'grey',
    'node_3': 'grey',
    'node_3_deaf': 'grey',
    'node_4': 'grey',
    'node_4_deaf': 'grey',
    'node_4_mobility': 'grey',
    'node_5': 'grey',
    'node_5_blind': 'grey',
    'node_5_aphasia': 'grey',
    'node_6': 'grey'
  });

  // Toggle multi-select profile choices
  const toggleProfile = (profileId) => {
    setSelectedProfileIds(prev => {
      if (profileId === 'default') {
        return ['default'];
      }
      const filtered = prev.filter(id => id !== 'default');
      if (filtered.includes(profileId)) {
        const remaining = filtered.filter(id => id !== profileId);
        return remaining.length === 0 ? ['default'] : remaining;
      } else {
        return [...filtered, profileId];
      }
    });
  };

  // Function to update status of a node and unlock downstream steps
  const updateNodeStatus = (nodeId, newStatus) => {
    setNodeStatuses(prev => {
      const updated = { ...prev, [nodeId]: newStatus };

      // If marked green, activate downstream steps in stage
      if (newStatus === 'green') {
        const completedNode = MASTER_NODES_DATA.find(n => n.id === nodeId);
        if (completedNode) {
          const nextStage = completedNode.stage + 1;
          MASTER_NODES_DATA.filter(n => n.stage === nextStage).forEach(nextN => {
            if (updated[nextN.id] === 'grey') {
              updated[nextN.id] = 'blue';
            }
          });
        }
      }

      return updated;
    });

    // Update state of currently open drawer if open
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Compute active pathway nodes, positions, and connections based on chosen profiles
  const activePathway = useMemo(() => {
    // Filter nodes matching selected profiles
    const filteredNodes = MASTER_NODES_DATA.filter(node => {
      if (node.profiles.includes('all')) return true;
      return node.profiles.some(p => selectedProfileIds.includes(p));
    });

    const canvasWidth = 1100;
    const centerX = canvasWidth / 2;
    const stageHeight = 340;
    const startY = 160;

    // Group nodes by stage
    const stageGroups = {};
    filteredNodes.forEach(node => {
      if (!stageGroups[node.stage]) stageGroups[node.stage] = [];
      stageGroups[node.stage].push(node);
    });

    const positionedNodes = [];
    const connections = [];

    const stages = Object.keys(stageGroups).map(Number).sort((a, b) => a - b);

    stages.forEach(stageNum => {
      const nodesInStage = stageGroups[stageNum];
      const stageY = startY + (stageNum - 1) * stageHeight;

      const mainNode = nodesInStage.find(n => n.branchType === 'main');
      const parallelNodes = nodesInStage.filter(n => n.branchType === 'parallel');

      if (mainNode) {
        positionedNodes.push({
          ...mainNode,
          x: centerX,
          y: stageY
        });
      }

      // Position parallel nodes side-by-side with wide spacing
      if (parallelNodes.length > 0) {
        const spacing = 360;
        const totalWidth = (parallelNodes.length - 1) * spacing;
        const startX = centerX - totalWidth / 2;

        parallelNodes.forEach((pNode, idx) => {
          // Offset horizontally if main node exists on same stage
          let px = startX + idx * spacing;
          if (mainNode && parallelNodes.length === 1) {
            px = centerX + 320;
          }

          positionedNodes.push({
            ...pNode,
            x: px,
            y: stageY
          });

          // Connect parallel node to main node on same stage
          if (mainNode) {
            connections.push({
              id: `conn_${mainNode.id}_${pNode.id}`,
              fromX: centerX,
              fromY: stageY,
              toX: px,
              toY: stageY,
              status: nodeStatuses[pNode.id] || 'grey',
              type: 'parallel'
            });
          }
        });
      }
    });

    // Create main vertical spine connections between consecutive stages
    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i];
      const nextStage = stages[i + 1];

      const currentMain = positionedNodes.find(n => n.stage === currentStage && n.branchType === 'main');
      const nextMain = positionedNodes.find(n => n.stage === nextStage && n.branchType === 'main');

      if (currentMain && nextMain) {
        connections.push({
          id: `conn_${currentMain.id}_${nextMain.id}`,
          fromX: currentMain.x,
          fromY: currentMain.y,
          toX: nextMain.x,
          toY: nextMain.y,
          status: nodeStatuses[nextMain.id] || 'grey',
          type: 'spine'
        });
      }
    }

    const totalHeight = startY + stages.length * stageHeight + 100;

    return {
      nodes: positionedNodes,
      connections,
      totalHeight
    };
  }, [selectedProfileIds, nodeStatuses]);

  // Calculate top-to-bottom layout with MUCH LARGER spacing & width (~40% column node sizes)
  const handleFormSubmission = (e) => {
    e.preventDefault();
    if (!submissionText.trim() || !selectedNode) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newRecord = {
        id: `sub_${Date.now()}`,
        stepId: selectedNode.id,
        stepTitle: selectedNode.title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: submissionText
      };

      setUserProfile(prev => ({
        ...prev,
        submissions: [newRecord, ...prev.submissions]
      }));

      // Mark step complete upon submission
      updateNodeStatus(selectedNode.id, 'green');
      setSubmissionText('');
      setIsSubmitting(false);
      setSelectedNode(null);
    }, 400);
  };

  const getNodeGlowStyles = (status) => {
    switch (status) {
      case 'amber':
        return {
          nodeBg: 'bg-amber-100',
          border: 'border-amber-500',
          glow: 'shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-pulse',
          badgeBg: 'bg-amber-200 text-amber-900 border-amber-400',
          animationClass: 'animate-bounce-short',
          icon: <AlertTriangle className="w-14 h-14 text-amber-800 animate-spin-slow" />
        };
      case 'blue':
        return {
          nodeBg: 'bg-blue-100',
          border: 'border-blue-600',
          glow: 'shadow-[0_0_40px_rgba(37,99,235,0.5)] ring-8 ring-blue-300/50',
          badgeBg: 'bg-blue-200 text-blue-900 border-blue-400',
          animationClass: 'animate-pulse',
          icon: <Zap className="w-14 h-14 text-blue-700 fill-blue-700 animate-pulse" />
        };
      case 'green':
        return {
          nodeBg: 'bg-emerald-100',
          border: 'border-emerald-600',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.5)]',
          badgeBg: 'bg-emerald-200 text-emerald-900 border-emerald-400',
          animationClass: '',
          icon: <CheckCircle2 className="w-14 h-14 text-emerald-800" />
        };
      case 'grey':
      default:
        return {
          nodeBg: 'bg-slate-200',
          border: 'border-slate-400',
          glow: 'shadow-none opacity-50',
          badgeBg: 'bg-slate-200 text-slate-700 border-slate-300',
          animationClass: '',
          icon: <Lock className="w-12 h-12 text-slate-500" />
        };
    }
  };

  const selectedProfilesSummary = RECEPTOR_PROFILES
    .filter(p => selectedProfileIds.includes(p.id))
    .map(p => p.name)
    .join(', ');

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans tracking-wide antialiased flex flex-col selection:bg-blue-200 selection:text-slate-900 overflow-x-hidden text-base">
      
      {/* Header */}
      <header className="border-b-2 border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-200 shadow-sm">
              <Accessibility className="w-8 h-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-wider text-slate-900 flex items-center gap-2">
                CARE PATHWAY NAVIGATOR
              </h1>
              <p className="text-sm font-medium text-slate-600">Accessible Step-by-Step Medical Care System</p>
            </div>
          </div>

          {currentPage === 'cascade' && (
            <button
              onClick={() => setCurrentPage('intake')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 border-2 border-slate-300 hover:border-blue-600 text-sm font-bold text-slate-800 transition shadow-sm"
            >
              <RotateCcw className="w-5 h-5 text-blue-700" />
              Edit Support Needs ({selectedProfileIds.length})
            </button>
          )}
        </div>
      </header>

      {/* PAGE 1: MULTI-SELECT SUPPORT OPTIONS */}
      {currentPage === 'intake' && (
        <main className="flex-1 max-w-5xl w-full mx-auto p-8 flex flex-col justify-center items-center text-center my-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border-2 border-blue-300 text-blue-900 text-sm font-bold mb-4">
            <Sparkles className="w-4 h-4 text-blue-700" /> SELECT ALL THAT APPLY
          </div>

          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Choose Your Accessibility Options</h2>
          <p className="text-lg text-slate-700 max-w-2xl mb-10 leading-relaxed font-medium">
            Select one or multiple options below to build a customized, high-contrast pathway tailored for your healthcare needs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-10">
            {RECEPTOR_PROFILES.map((profile) => {
              const Icon = profile.icon;
              const isSelected = selectedProfileIds.includes(profile.id);
              return (
                <button
                  key={profile.id}
                  onClick={() => toggleProfile(profile.id)}
                  className={`p-6 rounded-3xl border-2 text-left flex flex-col justify-between transition-all duration-300 relative shadow-sm ${
                    isSelected 
                      ? 'bg-blue-50/80 border-blue-600 shadow-md ring-4 ring-blue-200' 
                      : 'bg-slate-50 border-slate-300 hover:border-slate-400 hover:bg-slate-100/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3.5 rounded-2xl border-2 ${isSelected ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-slate-300 text-slate-700'}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-700 text-white' : 'border-slate-400 bg-white'}`}>
                        {isSelected && <CheckCircle2 className="w-5 h-5" />}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{profile.name}</h3>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{profile.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-sm font-bold text-slate-700">
                    <span>{isSelected ? 'Selected' : 'Click to Add'}</span>
                    <ChevronRight className="w-5 h-5 text-blue-700" />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage('cascade')}
            className="py-5 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-600/30 transition-all flex items-center gap-3 group"
          >
            <span>View Accessible Pathway</span>
            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </button>
        </main>
      )}

      {/* PAGE 2: VERTICAL CASCADE PATHWAY WITH POPUP SIDE PANEL */}
      {currentPage === 'cascade' && (
        <main className="flex-1 w-full p-8 flex flex-col items-center relative">
          
          {/* Status Legend & Internal Profile Section */}
          <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row items-center justify-between text-sm font-semibold text-slate-700 bg-slate-50 px-8 py-5 rounded-3xl border-2 border-slate-200 shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-blue-700" />
              <span>Selected Needs: <strong className="text-blue-900 font-extrabold">{selectedProfilesSummary}</strong></span>
            </div>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-slate-400"></span> Locked</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-600 shadow-[0_0_10px_#2563eb] animate-pulse"></span> Active</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b] animate-bounce"></span> Blocker</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-600"></span> Done</span>
            </div>
          </div>

          {/* MAIN CONTAINER (Stationary, overlay drawer on left) */}
          <div className="w-full flex justify-center">
            {/* Canvas Box */}
            <div 
              className="relative bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-xl overflow-x-auto" 
              style={{ width: 1100, minHeight: activePathway.totalHeight }}
            >
              {/* SVG Connector Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {activePathway.connections.map((conn) => {
                  const isGreen = conn.status === 'green';
                  const isBlue = conn.status === 'blue';
                  const isAmber = conn.status === 'amber';

                  let strokeColor = '#94a3b8';
                  if (isGreen) strokeColor = '#059669';
                  if (isBlue) strokeColor = '#2563eb';
                  if (isAmber) strokeColor = '#d97706';

                  const wavePath = createSineWavePath(conn.fromX, conn.fromY, conn.toX, conn.toY, 16, 4);

                  return (
                    <path
                      key={conn.id}
                      d={wavePath}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={conn.type === 'spine' ? '5' : '4'}
                      strokeDasharray="8 8"
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>

              {/* CIRCULAR ANIMATED NODES */}
              <div className="relative z-10 w-full h-full">
                {activePathway.nodes.map((node) => {
                  const status = nodeStatuses[node.id] || 'grey';
                  const styles = getNodeGlowStyles(status);
                  const isClickable = status !== 'grey';
                  const isSelected = selectedNode && selectedNode.id === node.id;

                  return (
                    <div
                      key={node.id}
                      style={{
                        position: 'absolute',
                        left: `${node.x}px`,
                        top: `${node.y}px`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      className="flex flex-col items-center group"
                    >
                      {/* NODE BUTTON */}
                      <button
                        onClick={() => isClickable && setSelectedNode({ ...node, status })}
                        disabled={!isClickable}
                        className={`w-36 h-36 rounded-full border-4 ${styles.border} ${styles.nodeBg} ${styles.glow} ${styles.animationClass} flex items-center justify-center transition-all duration-500 transform ${
                          isSelected ? 'scale-125 ring-8 ring-blue-400 z-30' : ''
                        } ${
                          isClickable 
                            ? 'cursor-pointer hover:scale-110 active:scale-95' 
                            : 'cursor-not-allowed'
                        }`}
                        aria-label={`${node.title} - Status: ${status}`}
                      >
                        {styles.icon}
                      </button>

                      <div className="mt-4 text-center max-w-[220px]">
                        <span className={`text-xs font-black tracking-wider px-3.5 py-1.5 rounded-full border-2 ${styles.badgeBg}`}>
                          {node.branchType === 'parallel' ? 'Parallel Step' : `Step ${node.stage}`}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 mt-2.5 leading-snug group-hover:text-blue-700 transition-colors">
                          {node.shortTitle}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* INTERNAL USER PROFILE SUBMISSIONS SUMMARY */}
          {userProfile.submissions.length > 0 && (
            <section className="w-full max-w-4xl mt-12 p-8 bg-slate-50 border-2 border-slate-200 rounded-3xl shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-700" /> My Saved Step Submissions ({userProfile.submissions.length})
              </h2>
              <div className="space-y-4">
                {userProfile.submissions.map((sub) => (
                  <div key={sub.id} className="p-5 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-blue-900 text-sm">{sub.stepTitle}</span>
                      <span className="text-xs font-semibold text-slate-500">{sub.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{sub.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* LEFT SIDE POPUP PANEL WITH SUBMISSION BOX */}
          <aside
            className={`fixed top-0 left-0 h-full w-96 md:w-[440px] bg-white border-r-2 border-slate-200 p-8 z-50 shadow-2xl flex flex-col justify-between transition-transform duration-500 ${
              selectedNode ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {selectedNode && (
              <div className="flex flex-col h-full justify-between space-y-6 overflow-y-auto">
                
                <div className="space-y-6">
                  {/* Panel Top Header */}
                  <div className="flex items-start justify-between border-b-2 border-slate-200 pb-4">
                    <div>
                      <span className={`text-xs px-3 py-1 rounded-full border-2 font-bold uppercase ${getNodeGlowStyles(selectedNode.status).badgeBg}`}>
                        {selectedNode.status === 'blue' ? 'Active Action' : selectedNode.status === 'amber' ? 'Blocker Warning' : selectedNode.status}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 mt-2 leading-tight">{selectedNode.title}</h2>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-slate-500 hover:text-slate-900 p-2.5 rounded-2xl bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 transition"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Instructions Box */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Instructions
                    </h3>
                    <p className="text-base text-slate-800 leading-relaxed bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 shadow-inner font-medium">
                      {selectedNode.description}
                    </p>
                  </div>

                  {/* Interactive Submission Form */}
                  <form onSubmit={handleFormSubmission} className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-blue-700" /> Step Submission Box
                    </h3>
                    <textarea
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Type details, request notes, or medical info for this step..."
                      className="w-full h-28 p-4 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-slate-900 font-medium text-sm resize-none outline-none transition"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !submissionText.trim()}
                      className="w-full py-4 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Save Submission & Complete Step
                    </button>
                  </form>

                  {/* Status Toggle buttons */}
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Manual Status Override</h3>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateNodeStatus(selectedNode.id, 'blue')}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition ${
                          selectedNode.status === 'blue' 
                            ? 'bg-blue-600 text-white border-blue-700 shadow-md' 
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        Active
                      </button>

                      <button
                        onClick={() => updateNodeStatus(selectedNode.id, 'amber')}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition ${
                          selectedNode.status === 'amber' 
                            ? 'bg-amber-500 text-white border-amber-600 shadow-md' 
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        Blocker
                      </button>

                      <button
                        onClick={() => updateNodeStatus(selectedNode.id, 'green')}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition ${
                          selectedNode.status === 'green' 
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' 
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="pt-4 border-t-2 border-slate-200">
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="w-full py-4 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300 font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    Close Panel
                  </button>
                </div>

              </div>
            )}
          </aside>

        </main>
      )}

      {/* Footer */}
      <footer className="border-t-2 border-slate-200 py-4 px-8 text-center text-sm font-bold text-slate-600">
        Accessible Healthcare Navigation Pathway
      </footer>

    </div>
  );
}