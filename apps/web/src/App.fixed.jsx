import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Shield, 
  Globe, 
  Radio, 
  FileText, 
  Settings, 
  ChevronRight, 
  ArrowLeft,
  TrendingUp, 
  Zap, 
  Users, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Sliders,
  MapPin,
  HelpCircle,
  Share2,
  Bell,
  MoreHorizontal,
  Volume2,
  Building,
  Briefcase,
  Layers,
  Edit,
  X,
  Info,
  Circle,
  Target,
  Search,
  BarChart2,
  Tv,
  Rss,
  Ship,
  Home
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

// ─── SVG Line Chart Component (Signal Activity / 14-Day History) ────────────
function LineChart({ data, width = 680, height = 200, showTooltip = true, line1Color = '#00e5ff', line2Color = '#f97316', line1Label = 'Signals', line2Label = 'Events', thresholdLine = null, defaultActiveLabel = null }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(width);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setChartWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = chartWidth - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  
  const maxVal = Math.max(...data.map(d => Math.max(d.v1, d.v2)), 100);
  const yTicks = [0, 25, 50, 75, 100];
  
  const xScale = (i) => padding.left + (i / (data.length - 1)) * chartW;
  const yScale = (v) => padding.top + chartH - (v / maxVal) * chartH;
  
  const makePath = (key) => {
    return data.map((d, i) => {
      const x = xScale(i);
      const y = yScale(d[key]);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getTooltipState = (idx) => {
    if (idx < 0 || idx >= data.length) return null;
    return { x: xScale(idx), y: yScale(data[idx].v1), data: data[idx], idx };
  };

  // Find initial default index
  const initialIdx = defaultActiveLabel ? data.findIndex(d => d.label === defaultActiveLabel) : -1;
  const [tooltip, setTooltip] = useState(initialIdx >= 0 ? getTooltipState(initialIdx) : null);

  useEffect(() => {
    const idx = defaultActiveLabel ? data.findIndex(d => d.label === defaultActiveLabel) : -1;
    if (idx >= 0) {
      setTooltip(getTooltipState(idx));
    }
  }, [data, defaultActiveLabel, chartWidth]);

  const handleMouseMove = (e) => {
    if (!svgRef.current || !showTooltip) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left - padding.left;
    const idx = Math.round((mx / chartW) * (data.length - 1));
    if (idx >= 0 && idx < data.length) {
      setTooltip(getTooltipState(idx));
    }
  };

  const handleMouseLeave = () => {
    const idx = defaultActiveLabel ? data.findIndex(d => d.label === defaultActiveLabel) : -1;
    setTooltip(idx >= 0 ? getTooltipState(idx) : null);
  };

  return (
    <div ref={containerRef} className="chart-container" style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} width={chartWidth} height={height} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ display: 'block' }}>
        {/* Grid lines */}
        {yTicks.map(tick => (
          <g key={tick}>
            <line x1={padding.left} y1={yScale(tick)} x2={chartWidth - padding.right} y2={yScale(tick)} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <text x={padding.left - 8} y={yScale(tick) + 4} fill="#57606a" fontSize="11" textAnchor="end">{tick}</text>
          </g>
        ))}
        
        {/* X axis labels */}
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1).map((d, _, arr) => {
          const idx = data.indexOf(d);
          return (
            <text key={d.label} x={xScale(idx)} y={height - 6} fill="#57606a" fontSize="11" textAnchor="middle">{d.label}</text>
          );
        })}
        
        {/* Threshold line if provided */}
        {thresholdLine && (
          <line x1={padding.left} y1={yScale(thresholdLine)} x2={chartWidth - padding.right} y2={yScale(thresholdLine)} stroke="#ef4444" strokeDasharray="6 4" strokeWidth={1} opacity={0.5} />
        )}
        
        {/* Line 2 (Events/secondary) */}
        <path d={makePath('v2')} fill="none" stroke={line2Color} strokeWidth={2} opacity={0.8} />
        
        {/* Line 1 (Signals/primary) */}
        <path d={makePath('v1')} fill="none" stroke={line1Color} strokeWidth={2} />
        
        {/* Data points for line 2 */}
        {data.map((d, i) => (
          <circle key={`e${i}`} cx={xScale(i)} cy={yScale(d.v2)} r={3} fill={line2Color} stroke="none" />
        ))}

        {/* Data points for line 1 */}
        {data.map((d, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(d.v1)} r={3} fill={line1Color} stroke="none" />
        ))}
        
        {/* Tooltip crosshair */}
        {tooltip && (
          <>
            <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={padding.top + chartH} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
            <circle cx={tooltip.x} cy={yScale(tooltip.data.v1)} r={5} fill={line1Color} stroke="#07090e" strokeWidth={2} />
            <circle cx={tooltip.x} cy={yScale(tooltip.data.v2)} r={5} fill={line2Color} stroke="#07090e" strokeWidth={2} />
          </>
        )}
      </svg>
      
      {/* Tooltip popup */}
      {tooltip && (
        <div className="chart-tooltip" style={{ 
          position: 'absolute',
          left: tooltip.x + 12, 
          top: yScale(tooltip.data.v1) - 60,
          background: '#0a0d14',
          border: '1px solid var(--border-color)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: '#fff',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-muted)' }}>{tooltip.data.label}</div>
          <div style={{ color: line2Color, fontWeight: 700 }}>events: {tooltip.data.v2}</div>
          <div style={{ color: line1Color, fontWeight: 700 }}>signals: {tooltip.data.v1}</div>
        </div>
      )}
    </div>
  );
}

// ─── SVG Radar Chart Component (Trajectory Radar) ───────────────────────────
function RadarChart({ dimensions, size = 280 }) {
  const center = size / 2;
  const radius = size / 2 - 40;
  const angleStep = (2 * Math.PI) / dimensions.length;
  
  const getPoint = (value, index) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };
  
  const rings = [25, 50, 75, 100];
  
  const dataPoints = dimensions.map((d, i) => getPoint(d.value, i));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  
  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      {/* Rings */}
      {rings.map(ring => {
        const pts = dimensions.map((_, i) => {
          const p = getPoint(ring, i);
          return `${p.x},${p.y}`;
        }).join(' ');
        return <polygon key={ring} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
      })}
      
      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const p = getPoint(100, i);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
      })}
      
      {/* Data polygon */}
      <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(0,229,255,0.12)" stroke="#00e5ff" strokeWidth={2} />
      
      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#00e5ff" stroke="#0e131f" strokeWidth={2} />
      ))}
      
      {/* Labels */}
      {dimensions.map((d, i) => {
        const labelPoint = getPoint(120, i);
        return (
          <text key={d.label} x={labelPoint.x} y={labelPoint.y} fill="#8b949e" fontSize="11" textAnchor="middle" dominantBaseline="middle">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}


const DEFAULT_SITUATIONS = [
  {
    id: 'sit-1',
    title: 'Anti-Immigration Mobilisation — South Africa',
    summary: 'Coordinated anti-immigration protests spreading from Gauteng to KwaZulu-Natal and Western Cape. Multiple actors involved including political parties, community organisations, and informal networks. Significant social media amplification.',
    situation_type: 'Social Mobilisation',
    status: 'Escalating',
    severity: 'Critical',
    trajectory: 'Worsening rapidly',
    country: 'South Africa',
    events_count: 47,
    sources_count: 23,
    time_ago: 'about 13 hours ago'
  },
  {
    id: 'sit-4',
    title: 'DRC Eastern Mining Region — Security Deterioration',
    summary: 'Armed group activity increasing near cobalt mining operations in North Kivu. Three incidents in two weeks. Evacuation protocols activated by two operators.',
    situation_type: 'Security & Conflict',
    status: 'Escalating',
    severity: 'Critical',
    trajectory: 'Worsening rapidly',
    country: 'Democratic Republic of Congo',
    events_count: 28,
    sources_count: 11,
    time_ago: 'about 15 hours ago'
  },
  {
    id: 'sit-2',
    title: 'Port of Durban Operational Disruption',
    summary: 'Labour dispute at Durban container terminal creating significant backlog. Negotiations stalled. Export volumes affected.',
    situation_type: 'Operational Disruption',
    status: 'Active',
    severity: 'High',
    trajectory: 'Stable',
    country: 'South Africa',
    events_count: 12,
    sources_count: 8,
    time_ago: '1 day ago'
  },
  {
    id: 'sit-3',
    title: 'Nigerian Fuel Subsidy Reform — Social Tensions',
    summary: 'Second wave of public discontent over fuel subsidy removal. Transport strikes reported in Lagos and Abuja. Civil society mobilising.',
    situation_type: 'Economic Policy Tension',
    status: 'Developing',
    severity: 'High',
    trajectory: 'Worsening',
    country: 'Nigeria',
    events_count: 19,
    sources_count: 14,
    time_ago: '2 days ago'
  },
  {
    id: 'sit-6',
    title: 'Ethiopia-Tigray Humanitarian Crisis — Aid Access',
    summary: 'Aid access disruptions reported in Tigray following renewed tensions. Humanitarian organisations planning supply corridor issues.',
    situation_type: 'Humanitarian Crisis',
    status: 'Developing',
    severity: 'High',
    trajectory: 'Stable',
    country: 'Ethiopia',
    events_count: 14,
    sources_count: 6,
    time_ago: '4 days ago'
  },
  {
    id: 'sit-5',
    title: 'Kenya Pre-Election Tensions — Nairobi',
    summary: 'Opposition coalition building ahead of 2027 elections. Protests against finance bill sequel. Nascent mobilisation networks.',
    situation_type: 'Political Mobilisation',
    status: 'Emerging',
    severity: 'Medium',
    trajectory: 'Worsening',
    country: 'Kenya',
    events_count: 15,
    sources_count: 9,
    time_ago: 'about 16 hours ago'
  }
];

const mergeSituations = (backendSits) => {
  const merged = [...DEFAULT_SITUATIONS];
  if (!backendSits || !Array.isArray(backendSits)) return merged;
  backendSits.forEach(bSit => {
    const existingIdx = merged.findIndex(m => m.title.toLowerCase() === bSit.title.toLowerCase() || m.id === bSit.id);
    if (existingIdx >= 0) {
      merged[existingIdx] = { ...merged[existingIdx], ...bSit };
    } else {
      merged.push({
        id: bSit.id,
        title: bSit.title,
        summary: bSit.summary,
        situation_type: bSit.situation_type || 'General',
        status: bSit.status || 'Active',
        severity: bSit.severity || 'High',
        trajectory: bSit.trajectory || 'Stable',
        country: bSit.geographic_scope?.country || 'Africa',
        events_count: bSit.event_ids?.length || 0,
        sources_count: 5,
        time_ago: 'recently'
      });
    }
  });
  return merged;
};

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('what');
  
  const [situations, setSituations] = useState(DEFAULT_SITUATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [mediaOutlets, setMediaOutlets] = useState(null);
  const [radioStations, setRadioStations] = useState([]);
  const [govPublications, setGovPublications] = useState([]);
  const [politicalParties, setPoliticalParties] = useState(null);
  const [alerts, setAlerts] = useState([]);
  
  const [capturingStation, setCapturingStation] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [orgProfile, setOrgProfile] = useState({
    name: "Example Organisation",
    industry: "Infrastructure & Mining",
    countries: "South Africa, Nigeria, Democratic Republic of Congo",
    description: "Regional infrastructure developer and mining operator across Sub-Saharan Africa."
  });

  // --- Interactive UI State ---
  const [exposureSubTab, setExposureSubTab] = useState('overview'); // 'overview' | 'assets' | 'recommendations'
  const [selectedMapPin, setSelectedMapPin] = useState(null); // 'Johannesburg' | 'Cape Town' | 'Durban' | null
  const [evidenceMode, setEvidenceMode] = useState('events'); // 'events' | 'claims'
  const [evidenceFilter, setEvidenceFilter] = useState('all'); // 'all' | 'observed' | 'reported' | 'disputed' | 'unverified'
  const [expandedEvent, setExpandedEvent] = useState(0); // active event index
  const [expandedClaim, setExpandedClaim] = useState(0); // active claim index
  const [selectedNetworkNode, setSelectedNetworkNode] = useState(null); // node name
  
  const [assets, setAssets] = useState([
    { id: '1', name: 'Johannesburg Operations Hub', type: 'Office', loc: 'Sandton, Gauteng', country: 'South Africa', notes: 'Head office. ~200 staff.', status: 'critical' },
    { id: '2', name: 'Durban Export Terminal', type: 'Logistics', loc: 'Port of Durban, KZN', country: 'South Africa', notes: 'Primary export throughput facility.', status: 'critical' },
    { id: '3', name: 'Lagos Regional Office', type: 'Office', loc: 'Victoria Island, Lagos', country: 'Nigeria', notes: 'West Africa hub.', status: 'orange' },
    { id: '4', name: 'Kinshasa Project Site', type: 'Project', loc: 'North Kivu', country: 'Democratic Republic of Congo', notes: 'Active mining concession.', status: 'critical' },
    { id: '5', name: 'Cape Town Staff Accommodation', type: 'Staff', loc: 'Cape Town, Western Cape', country: 'South Africa', notes: '', status: 'critical' },
  ]);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetModalOpen, setAssetModalOpen] = useState(false); // false | 'add' | 'edit'
  const [assetForm, setAssetForm] = useState({ name: '', type: 'Office', loc: '', country: '', notes: '' });

  const handleOpenAddAsset = () => {
    setAssetForm({ name: '', type: 'Office', loc: '', country: '', notes: '' });
    setAssetModalOpen('add');
  };

  const handleOpenEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetForm({ ...asset });
    setAssetModalOpen('edit');
  };

  const handleSaveAsset = (e) => {
    e.preventDefault();
    if (assetModalOpen === 'add') {
      const newId = String(assets.length + 1);
      setAssets([...assets, { ...assetForm, id: newId, status: 'critical' }]);
    } else if (assetModalOpen === 'edit') {
      setAssets(assets.map(a => a.id === editingAsset.id ? { ...a, ...assetForm } : a));
    }
    setAssetModalOpen(false);
  };

  const handleDeleteAsset = (id) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  // ─── Signal Activity chart data (14-day) ──────────────────────────────────
  const signalActivityData = [
    { label: '10 Jul', v1: 24, v2: 6 },
    { label: '11 Jul', v1: 28, v2: 8 },
    { label: '12 Jul', v1: 26, v2: 5 },
    { label: '13 Jul', v1: 30, v2: 9 },
    { label: '14 Jul', v1: 29, v2: 7 },
    { label: '15 Jul', v1: 31, v2: 11 },
    { label: '16 Jul', v1: 28, v2: 8 },
    { label: '17 Jul', v1: 33, v2: 12 },
    { label: '18 Jul', v1: 32, v2: 10 },
    { label: '19 Jul', v1: 24, v2: 10 },
    { label: '20 Jul', v1: 42, v2: 18 },
    { label: '21 Jul', v1: 65, v2: 28 },
    { label: '22 Jul', v1: 90, v2: 38 },
  ];

  // ─── 14-Day Activity History data (Trajectory tab) ────────────────────────
  const isKenya = selectedSituation?.title?.toLowerCase().includes('kenya');

  const activityHistoryData = isKenya ? [
    { label: '07 Jul', v1: 22, v2: 5 },
    { label: '08 Jul', v1: 23, v2: 6 },
    { label: '09 Jul', v1: 24, v2: 5 },
    { label: '10 Jul', v1: 25, v2: 6 },
    { label: '11 Jul', v1: 24, v2: 5 },
    { label: '12 Jul', v1: 26, v2: 7 },
    { label: '13 Jul', v1: 25, v2: 6 },
    { label: '14 Jul', v1: 27, v2: 8 },
    { label: '15 Jul', v1: 26, v2: 7 },
    { label: '16 Jul', v1: 28, v2: 9 },
    { label: '17 Jul', v1: 29, v2: 8 },
    { label: '18 Jul', v1: 30, v2: 10 },
    { label: '19 Jul', v1: 31, v2: 9 },
    { label: '20 Jul', v1: 30, v2: 10 },
    { label: '21 Jul', v1: 32, v2: 11 },
    { label: '22 Jul', v1: 30, v2: 10 },
  ] : [
    { label: '07 Jul', v1: 25, v2: 0 },
    { label: '08 Jul', v1: 26, v2: 1 },
    { label: '09 Jul', v1: 28, v2: 2 },
    { label: '10 Jul', v1: 32, v2: 3 },
    { label: '11 Jul', v1: 38, v2: 4 },
    { label: '12 Jul', v1: 40, v2: 6 },
    { label: '13 Jul', v1: 42, v2: 7 },
    { label: '14 Jul', v1: 45, v2: 5 },
    { label: '15 Jul', v1: 43, v2: 6 },
    { label: '16 Jul', v1: 48, v2: 8 },
    { label: '17 Jul', v1: 50, v2: 7 },
    { label: '18 Jul', v1: 55, v2: 10 },
    { label: '19 Jul', v1: 62, v2: 14 },
    { label: '20 Jul', v1: 70, v2: 18 },
    { label: '21 Jul', v1: 78, v2: 22 },
    { label: '22 Jul', v1: 82, v2: 20 },
  ];

  // ─── Trajectory radar dimensions ──────────────────────────────────────────
  const radarDimensions = isKenya ? [
    { label: 'Activity', value: 35 },
    { label: 'Actors', value: 40 },
    { label: 'Geographic', value: 30 },
    { label: 'Institutional', value: 28 },
    { label: 'Operational', value: 28 },
    { label: 'Narrative', value: 50 },
  ] : [
    { label: 'Activity', value: 82 },
    { label: 'Actors', value: 78 },
    { label: 'Geographic', value: 65 },
    { label: 'Institutional', value: 55 },
    { label: 'Operational', value: 60 },
    { label: 'Narrative', value: 88 },
  ];

  // ─── Dimension bars data ──────────────────────────────────────────────────
  const dimensionBars = isKenya ? [
    { label: 'Activity Level', value: 35, color: '#f59e0b' },
    { label: 'Actor Involvement', value: 40, color: '#f59e0b' },
    { label: 'Geographic Spread', value: 30, color: '#f59e0b' },
    { label: 'Institutional Response', value: 28, color: '#f59e0b' },
    { label: 'Operational Impact', value: 28, color: '#f59e0b' },
    { label: 'Narrative Amplification', value: 50, color: '#f59e0b' },
  ] : [
    { label: 'Activity Level', value: 82, color: '#ef4444' },
    { label: 'Actor Involvement', value: 78, color: '#ef4444' },
    { label: 'Geographic Spread', value: 65, color: '#f59e0b' },
    { label: 'Institutional Response', value: 55, color: '#f59e0b' },
    { label: 'Operational Impact', value: 60, color: '#ef4444' },
    { label: 'Narrative Amplification', value: 88, color: '#ef4444' },
  ];

  // ─── Recent Signals feed ──────────────────────────────────────────────────
  const recentSignals = [
    { situation: 'Anti-Immigration Mobilisation', type: 'Institutional Response', text: 'SAPS confirms 12 new arrests in Johannesburg township incidents', source: 'Daily Maverick', time: 'about 11 hours ago', color: '#ef4444' },
    { situation: 'Anti-Immigration Mobilisation', type: 'Constraint Detected', text: 'Radio 702 broadcast: Community leaders call for calm in Soweto', source: 'Audio Insights', time: 'about 12 hours ago', color: '#f59e0b' },
    { situation: 'Nigerian Fuel Subsidy Reform', type: 'Escalation Indicator', text: 'NLC confirms Monday strike — transport disruption in Lagos/Abuja now likely', source: 'Punch Nigeria', time: 'about 14 hours ago', color: '#f97316' },
    { situation: 'DRC North Kivu Security', type: 'Military Movement', text: 'FARDC withdrawal from strategic positions confirmed by multiple sources', source: 'RFI Afrique', time: 'about 16 hours ago', color: '#ef4444' },
    { situation: 'Kenya Pre-Election Tensions', type: 'Political Mobilisation', text: 'Opposition coalition announces Nairobi rally for next weekend', source: 'The Standard', time: 'about 18 hours ago', color: '#f59e0b' },
  ];

  // ─── Claims & Evidence data ───────────────────────────────────────────────
  const claimsData = [
    {
      text: '"Foreign nationals are responsible for the majority of crime in affected townships"',
      badge: 'Disputed',
      source: 'Various community leaders and online accounts',
      spread: 'Wide',
      supporting: ['Some police incident reports cited selectively'],
      contradicting: ['SAPS crime statistics do not support disproportionate foreign national criminality', 'Academic research shows contrary findings'],
    },
    {
      text: '"Foreign nationals are taking jobs from South African citizens"',
      badge: 'Disputed',
      source: 'Protest organisers',
      spread: 'Wide',
      supporting: ['Anecdotal accounts from unemployed youth'],
      contradicting: ['Most foreign nationals working in informal/small business economy', 'Structural unemployment driven by macroeconomic factors'],
    },
    {
      text: '"Protests were pre-planned and coordinated by political actors"',
      badge: 'Unverified',
      source: 'Several media organisations',
      spread: 'Moderate',
      supporting: ['Timing across multiple cities simultaneous', 'Shared messaging templates found'],
      contradicting: ['Organisers deny central coordination'],
    },
    {
      id: 'D',
      title: 'Major operational disruption',
      likelihood: 'Low Likelihood',
      trend: '→ Stable',
      trendColor: '#10b981',
      description: 'Nationwide shutdown of key infrastructure and transport networks.',
      horizon: '14–45 days',
      indicatorsPresent: 0,
      indicatorsTotal: 4,
      indicators: [
        { text: 'Transport sector involvement', active: false },
        { text: 'National emergency declaration', active: false },
        { text: 'Port activity mentions', active: false },
        { text: 'Government crisis committee', active: false },
      ],
    },
  ];

  // ─── Scenarios data ───────────────────────────────────────────────────────
  const scenariosData = [
    {
      id: 'A',
      title: 'De-escalation and containment',
      likelihood: 'Moderate Likelihood',
      trend: '↓ Decreasing',
      trendColor: '#10b981',
      description: 'Police presence and civil society intervention leads to reduction in incidents. Political actors moderate statements. Media coverage shifts.',
      horizon: '7–14 days',
      indicatorsPresent: 1,
      indicatorsTotal: 5,
      indicators: [
        { text: 'Reduction in new incident reports', active: true },
        { text: 'Political actors moderating statements', active: false },
        { text: 'No new geographic spread', active: false },
        { text: 'Community dialogue initiatives', active: false },
        { text: 'Media narrative shift', active: false },
      ],
    },
    {
      id: 'B',
      title: 'Localised continuation',
      likelihood: 'High Likelihood',
      trend: '→ Stable',
      trendColor: '#f59e0b',
      description: 'Sporadic incidents continue in existing areas but do not spread further. Operational disruption remains but does not worsen.',
      horizon: '14–30 days',
      indicatorsPresent: 3,
      indicatorsTotal: 4,
      indicators: [
        { text: 'Repeat incidents in same locations', active: true },
        { text: 'No new actors entering', active: true },
        { text: 'Police lines holding', active: true },
        { text: 'No major political escalation', active: false },
      ],
    },
    {
      id: 'C',
      title: 'Geographic expansion and escalation',
      likelihood: 'Moderate Likelihood',
      trend: '↑ Increasing',
      trendColor: '#ef4444',
      description: 'Protests spread to new provinces — Eastern Cape, Limpopo, Free State. Violence intensifies. International diplomatic pressure mounts.',
      horizon: '7–21 days',
      indicatorsPresent: 3,
      indicatorsTotal: 5,
      indicators: [
        { text: 'Reports from new provinces', active: true },
        { text: 'Political amplification continues', active: true },
        { text: 'Copy-cat incidents', active: true },
        { text: 'International media attention', active: false },
        { text: 'Formal state of emergency declared', active: false },
      ],
    },
    {
      id: 'D',
      title: 'Major operational disruption',
      likelihood: 'Low Likelihood',
      trend: '→ Stable',
      trendColor: '#10b981',
      description: 'Nationwide shutdown of key infrastructure and transport networks.',
      horizon: '14–45 days',
      indicatorsPresent: 0,
      indicatorsTotal: 4,
      indicators: [
        { text: 'Transport sector involvement', active: false },
        { text: 'National emergency declaration', active: false },
        { text: 'Port activity mentions', active: false },
        { text: 'Government crisis committee', active: false },
      ],
    },
  ];

  useEffect(() => {
    fetchAllBackendData();
  }, []);

  const fetchAllBackendData = async () => {
    try {
      const sitRes = await fetch(`${API_BASE}/api/v1/situations`);
      if (sitRes.ok) {
        const sitsData = await sitRes.json();
        setSituations(mergeSituations(sitsData));
        if (sitsData.length > 0) {
          fetchEightQuestionIntelligence(sitsData[0].id);
        }
      }

      const newsRes = await fetch(`${API_BASE}/api/v1/news/outlets`);
      if (newsRes.ok) { setMediaOutlets(await newsRes.json()); }

      const radioRes = await fetch(`${API_BASE}/api/v1/radio/stations`);
      if (radioRes.ok) { setRadioStations(await radioRes.json()); }

      const govRes = await fetch(`${API_BASE}/api/v1/government/publications`);
      if (govRes.ok) { setGovPublications(await govRes.json()); }

      const polRes = await fetch(`${API_BASE}/api/v1/political/parties`);
      if (polRes.ok) { setPoliticalParties(await polRes.json()); }

      const alertRes = await fetch(`${API_BASE}/api/v1/organisations/org-mining-corp-001/alerts`);
      if (alertRes.ok) { setAlerts(await alertRes.json()); }
    } catch (e) {
      console.log("Using backend fallback data");
    }
  };

  const fetchEightQuestionIntelligence = async (sitId) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/situations/${sitId}/intelligence?organisation_id=org-mining-corp-001`);
      if (res.ok) { setIntelligence(await res.json()); }
    } catch (e) {}
  };

  const openSituationDetail = (sit) => {
    setSelectedSituation(sit);
    fetchEightQuestionIntelligence(sit.id);
    setActiveSubTab('what');
    setCurrentView('detail');
  };

  const triggerRadioCapture = async (callSign) => {
    setCapturingStation(callSign);
    try {
      await fetch(`${API_BASE}/api/v1/radio/stations/${encodeURIComponent(callSign)}/trigger-capture`, { method: "POST" });
      fetchAllBackendData();
    } catch (e) {}
    finally { setCapturingStation(null); }
  };

  const saveProfileModal = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/v1/organisations/org-mining-corp-001/watchlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgProfile.name, topics: ["mining", "protest", "strike", "employment"], entity_names: orgProfile.countries.split(',').map(c => c.trim()) })
      });
    } catch (e) {}
    setProfileModalOpen(false);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="app-container">
      
      {/* ─── SIDEBAR ────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-badge">SD</div>
          <div>
            <div className="logo-title">SignalDesk</div>
            <div className="logo-sub">INTELLIGENCE PLATFORM</div>
          </div>
        </div>

        <div className="nav-section-title">PLATFORM</div>

        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Intelligence Dashboard' },
          { id: 'situations', icon: AlertTriangle, label: 'Situations', match: ['situations', 'detail'] },
          { id: 'exposure', icon: Shield, label: 'My Exposure' },
          { id: 'sources', icon: Globe, label: 'Sources' },
          { id: 'audio', icon: Radio, label: 'Audio Insights' },
          { id: 'reports', icon: FileText, label: 'Reports' },
        ].map(nav => {
          const isActive = nav.match ? nav.match.includes(currentView) : currentView === nav.id;
          return (
            <div key={nav.id} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => setCurrentView(nav.id)}>
              <div className="nav-item-left">
                <nav.icon size={18} />
                <span>{nav.label}</span>
              </div>
              {isActive && <ChevronRight size={14} />}
            </div>
          );
        })}

        <div style={{ marginTop: 'auto', paddingBottom: '20px' }}>
          <div className="nav-section-title">PRODUCT FAMILY</div>
          <div style={{ padding: '4px 24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: '6px', color: '#00e5ff' }}>● SignalDesk</div>
            <div style={{ marginBottom: '6px', color: '#10b981' }}>● Vecta News</div>
            <div style={{ color: '#f97316' }}>● Audio Insights</div>
          </div>
          <div className="nav-item" style={{ marginTop: '16px' }}>
            <div className="nav-item-left"><Settings size={18} /><span>Settings</span></div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main className="main-content">
        
        {/* ═══ VIEW 1: INTELLIGENCE DASHBOARD ═══════════════════════════ */}
        {currentView === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Header */}
            <div className="top-header">
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Intelligence Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Thursday, 23 July 2026 · Continuously updated</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                    <line x1="18" y1="20" x2="18" y2="4"></line>
                    <line x1="12" y1="20" x2="12" y2="10"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  98 signals today
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700 }}>
                  <span style={{ width: '6.5px', height: '6.5px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Live
                </span>
              </div>
            </div>

            <div className="page-content">
              {/* 4 Stat Cards */}
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {/* Card 1: Escalating */}
              <div className="sd-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '6px', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '4px'
                }}>
                  <TrendingUp size={14} color="#ef4444" />
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>2</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Escalating</div>
                <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>+1 since yesterday</div>
              </div>

              {/* Card 2: Active / Developing */}
              <div className="sd-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '6px', 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  border: '1px solid rgba(245, 158, 11, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '4px'
                }}>
                  <Activity size={14} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>3</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active / Developing</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>No change</div>
              </div>

              {/* Card 3: Emerging */}
              <div className="sd-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '6px', 
                  background: 'rgba(0, 229, 255, 0.1)', 
                  border: '1px solid rgba(0, 229, 255, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '4px'
                }}>
                  <Zap size={14} color="#00e5ff" />
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>1</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Emerging</div>
                <div style={{ fontSize: '0.72rem', color: '#00e5ff', fontWeight: 600 }}>+1 this week</div>
              </div>

              {/* Card 4: Critical Severity */}
              <div className="sd-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '6px', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '4px'
                }}>
                  <AlertTriangle size={14} color="#ef4444" />
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>2</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Critical Severity</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>Unchanged</div>
              </div>
            </div>

            {/* SITUATIONS REQUIRING ATTENTION */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  <span>SITUATIONS REQUIRING ATTENTION</span>
                </div>
                <span 
                  onClick={() => setCurrentView('situations')} 
                  style={{ fontSize: '0.78rem', color: '#00e5ff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  className="hover-opacity"
                >
                  View all →
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {situations
                    .filter(sit => !sit.title.toLowerCase().includes('kenya'))
                    .map((sit) => {
                      // Style trajectory & bullet dots
                      let trajColor = 'var(--text-dim)';
                      let trajIcon = '—';
                      if (sit.trajectory?.toLowerCase().includes('worsening rapidly')) {
                        trajColor = '#ef4444';
                        trajIcon = '↑';
                      } else if (sit.trajectory?.toLowerCase().includes('worsening')) {
                        trajColor = '#f97316';
                        trajIcon = '↑';
                      } else if (sit.trajectory?.toLowerCase().includes('improving')) {
                        trajColor = '#10b981';
                        trajIcon = '↓';
                      }

                      let sevColor = '#ef4444';
                      let sevBg = 'rgba(239, 68, 68, 0.06)';
                      let sevBorder = 'rgba(239, 68, 68, 0.25)';
                      if (sit.severity?.toLowerCase() === 'high') {
                        sevColor = '#f97316';
                        sevBg = 'rgba(249, 115, 22, 0.06)';
                        sevBorder = 'rgba(249, 115, 22, 0.25)';
                      } else if (sit.severity?.toLowerCase() === 'medium') {
                        sevColor = '#fde047';
                        sevBg = 'rgba(253, 224, 71, 0.06)';
                        sevBorder = 'rgba(253, 224, 71, 0.25)';
                      } else if (sit.severity?.toLowerCase() === 'low') {
                        sevColor = '#10b981';
                        sevBg = 'rgba(16, 185, 129, 0.06)';
                        sevBorder = 'rgba(16, 185, 129, 0.25)';
                      }

                      return (
                        <div 
                          key={sit.id} 
                          className="sd-card" 
                          onClick={() => openSituationDetail(sit)} 
                          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '18px 20px', transition: 'all 0.15s ease' }}
                        >
                          <div style={{ flex: 1, paddingRight: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                              <span style={{ 
                                fontSize: '0.72rem', 
                                fontWeight: 700, 
                                color: sevColor, 
                                border: `1px solid ${sevBorder}`, 
                                background: sevBg, 
                                padding: '2px 8px', 
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                              }}>
                                {sit.severity}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: sevColor, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sevColor, display: 'inline-block' }} />
                                {sit.status}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{sit.situation_type}</span>
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{sit.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px', lineHeight: 1.45 }}>{sit.summary}</p>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={13} /> {sit.country}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BarChart2 size={13} /> {sit.events_count} events</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={13} /> {sit.time_ago}</span>
                            </div>
                          </div>
                          
                          <div style={{ width: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.78rem', color: trajColor, fontWeight: 700 }}>
                              {trajIcon} {sit.trajectory}
                            </span>
                            <ChevronRight size={18} color="#00e5ff" style={{ marginTop: 'auto' }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="sd-card">
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>GEOGRAPHIC EXPOSURE</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                      {[
                        { country: 'South Africa', count: 3, dotColor: '#ef4444', barColor: '#ef4444' },
                        { country: 'Nigeria', count: 2, dotColor: '#f97316', barColor: '#f97316' },
                        { country: 'DRC', count: 2, dotColor: '#ef4444', barColor: '#ef4444' },
                        { country: 'Kenya', count: 1, dotColor: '#fde047', barColor: '#fde047' },
                        { country: 'Ethiopia', count: 1, dotColor: '#f97316', barColor: '#f97316' },
                        { country: 'Ghana', count: 1, dotColor: '#10b981', barColor: '#10b981' },
                      ].map(g => (
                        <div key={g.country} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: g.dotColor, display: 'inline-block' }} />
                            {g.country}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 700, width: '12px', textAlign: 'right' }}>{g.count}</span>
                            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(g.count/3)*100}%`, height: '100%', background: g.barColor, borderRadius: '3px' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.7rem', display: 'flex', gap: '8px', flexWrap: 'wrap', color: 'var(--text-dim)' }}>
                      <span style={{ color: '#ef4444' }}>● Critical</span>
                      <span style={{ color: '#f97316' }}>● High</span>
                      <span style={{ color: '#fde047' }}>● Medium</span>
                      <span style={{ color: '#10b981' }}>● Low</span>
                    </div>
                  </div>

                  <div className="sd-card">
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>SITUATIONS BY CATEGORY</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { cat: 'Soc Mob.', count: 2, color: '#ef4444' },
                        { cat: 'Security', count: 2, color: '#ef4444' },
                        { cat: 'Econ. Policy', count: 1, color: '#00e5ff' },
                        { cat: 'Political', count: 1, color: '#00e5ff' },
                        { cat: 'Humanitarian', count: 1, color: '#00e5ff' },
                      ].map(c => (
                        <div key={c.cat} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ width: '70px', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>{c.cat}</span>
                          <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
                            <div style={{ width: `${(c.count/2)*100}%`, height: '100%', background: c.color }} />
                          </div>
                        </div>
                      ))}
                      {/* X Axis ticks */}
                      <div style={{ display: 'flex', marginLeft: '82px', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span>0</span>
                        <span>0.5</span>
                        <span>1</span>
                        <span>1.5</span>
                        <span>2</span>
                      </div>
                    </div>
                  </div>


                  <div className="sd-card">
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>PIPELINE STATUS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Source ingestion</span><span style={{ color: '#fff' }}>23 sources</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Signal extraction</span><span style={{ color: '#fff' }}>142 today</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Entity resolution</span><span style={{ color: '#fff' }}>98% accuracy</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Situation matching</span><span style={{ color: '#fff' }}>6 active</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Trajectory analysis</span><span style={{ color: '#fff' }}>Updated 6m ago</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Exposure engine</span><span style={{ color: '#fff' }}>4 exposed</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emerging - Monitor Card (Moved here above Signal Activity) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span>EMERGING — MONITOR</span>
              <span style={{ color: '#00e5ff', fontSize: '0.9rem', lineHeight: 1 }}>●</span>
            </div>
            <div className="spotlight-card" onClick={() => {
              const kenyaSit = situations.find(s => s.title?.toLowerCase().includes('kenya')) || situations[0];
              if (kenyaSit) openSituationDetail(kenyaSit);
            }} style={{ marginBottom: '28px', maxWidth: '100%', cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00e5ff' }}>● Emerging</span>
                <span className="badge badge-medium">Medium</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Kenya Pre-Election Tensions — Nairobi</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
                Opposition coalition building ahead of 2027 elections. Protests against finance bill sequel. Nascent mobilisation...
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                <span>Kenya</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>↑ Worsening</span>
              </div>
            </div>

            {/* SIGNAL ACTIVITY CHART (from screenshot) */}
            <div className="sd-card" style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>SIGNAL ACTIVITY</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>10-day signal & event volume</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5ff', display: 'inline-block' }} /> Signals</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} /> Events</span>
                </div>
              </div>
              <LineChart data={signalActivityData} width={700} height={200} defaultActiveLabel="19 Jul" />
            </div>

            {/* RECENT SIGNALS FEED (from screenshot) */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>RECENT SIGNALS</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Last 24 hours</div>
              </div>

              {recentSignals.map((sig, idx) => (
                <div key={idx} className="signal-feed-item">
                  <div className="signal-icon-dot" style={{ background: sig.color }} />
                  <div className="signal-feed-body">
                    <div className="signal-feed-header">
                      <span className="signal-situation-link">{sig.situation}</span>
                      <span className="signal-type-badge">{sig.type}</span>
                    </div>
                    <div className="signal-text">{sig.text}</div>
                    <div className="signal-meta">{sig.source} · {sig.time}</div>
                  </div>
                  <Settings size={16} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: 4, cursor: 'pointer' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

        {/* ═══ VIEW 2: SITUATIONS LIST ══════════════════════════════════ */}
        {currentView === 'situations' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="top-header">
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>All Situations</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>6 monitored situations across Africa and globally</p>
              </div>
            </div>

            <div className="page-content">
              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search situations, countries, categories..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                <span>Status:</span>
                {['All', 'Escalating', 'Active', 'Developing', 'Emerging'].map(status => {
                  const isActive = statusFilter === status;
                  return (
                    <button 
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      style={{ 
                        background: isActive ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                        border: isActive ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid var(--border-color)',
                        color: isActive ? '#00e5ff' : 'var(--text-dim)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {situations
                .filter(sit => {
                  const query = searchQuery.toLowerCase();
                  const matchesSearch = sit.title.toLowerCase().includes(query) || 
                                       sit.summary.toLowerCase().includes(query) || 
                                       sit.situation_type.toLowerCase().includes(query) || 
                                       sit.country.toLowerCase().includes(query);
                  const matchesStatus = statusFilter === 'All' || sit.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map((sit) => {
                  // Style trajectory & bullet dots
                  let trajColor = 'var(--text-dim)';
                  let trajIcon = '—';
                  if (sit.trajectory?.toLowerCase().includes('worsening rapidly')) {
                    trajColor = '#ef4444';
                    trajIcon = '↑';
                  } else if (sit.trajectory?.toLowerCase().includes('worsening')) {
                    trajColor = '#f97316';
                    trajIcon = '↑';
                  } else if (sit.trajectory?.toLowerCase().includes('improving')) {
                    trajColor = '#10b981';
                    trajIcon = '↓';
                  }

                  let sevColor = '#ef4444';
                  let sevBg = 'rgba(239, 68, 68, 0.06)';
                  let sevBorder = 'rgba(239, 68, 68, 0.25)';
                  if (sit.severity?.toLowerCase() === 'high') {
                    sevColor = '#f97316';
                    sevBg = 'rgba(249, 115, 22, 0.06)';
                    sevBorder = 'rgba(249, 115, 22, 0.25)';
                  } else if (sit.severity?.toLowerCase() === 'medium') {
                    sevColor = '#fde047';
                    sevBg = 'rgba(253, 224, 71, 0.06)';
                    sevBorder = 'rgba(253, 224, 71, 0.25)';
                  } else if (sit.severity?.toLowerCase() === 'low') {
                    sevColor = '#10b981';
                    sevBg = 'rgba(16, 185, 129, 0.06)';
                    sevBorder = 'rgba(16, 185, 129, 0.25)';
                  }

                  return (
                    <div 
                      key={sit.id} 
                      className="sd-card" 
                      onClick={() => openSituationDetail(sit)} 
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '18px 20px', transition: 'all 0.15s ease' }}
                    >
                      <div style={{ flex: 1, paddingRight: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 700, 
                            color: sevColor, 
                            border: `1px solid ${sevBorder}`, 
                            background: sevBg, 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}>
                            {sit.severity}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: sevColor, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sevColor, display: 'inline-block' }} />
                            {sit.status}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{sit.situation_type}</span>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{sit.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px', lineHeight: 1.45 }}>{sit.summary}</p>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={13} /> {sit.country}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BarChart2 size={13} /> {sit.events_count} events · {sit.sources_count} sources</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={13} /> {sit.time_ago}</span>
                        </div>
                      </div>
                      
                      <div style={{ width: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.78rem', color: trajColor, fontWeight: 700 }}>
                          {trajIcon} {sit.trajectory}
                        </span>
                        <ChevronRight size={18} color="#00e5ff" style={{ marginTop: 'auto' }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

        {/* ═══ VIEW 3: SITUATION DETAIL ═════════════════════════════════ */}
        {currentView === 'detail' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Back & Actions */}
            <div className="top-header">
              <div onClick={() => setCurrentView('situations')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
                <ArrowLeft size={16} /> All Situations
              </div>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-dim)' }}>
                <Bell size={18} style={{ cursor: 'pointer' }} />
                <Share2 size={18} style={{ cursor: 'pointer' }} />
                <MoreHorizontal size={18} style={{ cursor: 'pointer' }} />
              </div>
            </div>

            <div className="page-content">
              {/* Situation Header */}
              <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-critical">Critical</span>
                <span style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: 600 }}>● Escalating</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Social Mobilisation</span>
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                {intelligence ? intelligence.title : selectedSituation?.title}
              </h1>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                {intelligence ? intelligence.what_is_happening.summary : selectedSituation?.summary}
              </p>
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                <span>🌐 South Africa · Gauteng, KwaZulu-Natal, Western Cape</span>
                <span>⚡ 47 events · 23 sources</span>
                <span>📅 First detected 28 Jun 2026</span>
                <span>🕒 Updated about 9 hours ago</span>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                <span>Emerging</span> — <span>Developing</span> — <span>Active</span> — <span style={{ color: '#ef4444' }}>[Escalating]</span> — <span>De-Escalating</span> — <span>Dormant</span> — <span>Resolved</span>
              </div>
            </div>

            {/* HORIZONTAL SUB-TABS */}
            <div className="sub-nav-tabs">
              {[
                { id: 'what', label: '01 What' },
                { id: 'trajectory', label: '02 Trajectory' },
                { id: 'where', label: '03 Where' },
                { id: 'who', label: '04 Who' },
                { id: 'drivers', label: '05 Drivers' },
                { id: 'scenarios', label: '06 Scenarios' },
                { id: 'exposure', label: '07 Exposure' },
                { id: 'actions', label: '08 Actions' },
                { id: 'network', label: '- Network' },
                { id: 'evidence', label: '- Evidence' },
              ].map(tab => (
                <div key={tab.id} className={`sub-tab-item ${activeSubTab === tab.id ? 'active' : ''}`} onClick={() => setActiveSubTab(tab.id)}>
                  {tab.label}
                </div>
              ))}
            </div>

            {/* ─── SUB-TAB 01: WHAT ──────────────────────────────────────── */}
            {activeSubTab === 'what' && (
              <div>
                <div className="sd-card" style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>SITUATION SUMMARY</div>
                  <p style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>
                    Large-scale anti-immigration protests mobilised across South Africa on 30 June 2026. Demonstrations began in Johannesburg townships but rapidly spread to Durban and Cape Town. Multiple incidents of business looting, road blockades, and confrontations. Key political actors have amplified narratives linking crime and unemployment to foreign nationals.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { label: 'Trajectory', value: '↑ Worsening rapidly', color: '#ef4444' },
                    { label: 'Event Count', value: '47', color: '#fff' },
                    { label: 'Sources', value: '23', color: '#fff' },
                    { label: 'Actors', value: '5', color: '#fff' },
                  ].map(stat => (
                    <div key={stat.label} className="sd-card">
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{stat.label}</div>
                      <div style={{ fontSize: stat.value.length > 5 ? '1.1rem' : '1.4rem', fontWeight: 800, color: stat.color, marginTop: '4px' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Sub-tab Navigation Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { id: 'trajectory', num: '02', name: 'Trajectory', icon: TrendingUp },
                    { id: 'where', num: '03', name: 'Where', icon: MapPin },
                    { id: 'who', num: '04', name: 'Who', icon: Users },
                    { id: 'drivers', num: '05', name: 'Drivers', icon: Zap },
                    { id: 'scenarios', num: '06', name: 'Scenarios', icon: Target },
                    { id: 'exposure', num: '07', name: 'Exposure', icon: Shield },
                    { id: 'actions', num: '08', name: 'Actions', icon: Sliders },
                    { id: 'network', num: '--', name: 'Network', icon: Share2 },
                    { id: 'evidence', num: '--', name: 'Evidence', icon: FileText },
                  ].map(nav => (
                    <div key={nav.id} className="sd-card" onClick={() => setActiveSubTab(nav.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <nav.icon size={18} color="var(--text-dim)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                          <span style={{ color: 'var(--text-dim)', marginRight: '8px' }}>{nav.num}</span> {nav.name}
                        </span>
                      </div>
                      <ChevronRight size={16} color="var(--accent-cyan)" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── SUB-TAB 02: TRAJECTORY (Full from screenshot) ─────────── */}
            {activeSubTab === 'trajectory' && (
              <div>
                
                <div style={{ 
                  background: isKenya ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                  border: isKenya ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #ef4444', 
                  borderRadius: '8px', 
                  padding: '12px 16px', 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'flex-start', 
                  marginBottom: '24px' 
                }}>
                  <AlertTriangle size={20} color={isKenya ? '#f59e0b' : '#ef4444'} style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ color: isKenya ? '#f59e0b' : '#ef4444', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                      {isKenya ? '↑ Worsening' : '↑ Worsening rapidly'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {isKenya 
                        ? 'Situation is gradually worsening. Key indicators trending upward. Monitor closely for acceleration.'
                        : "The situation's trajectory shows a rapid escalation with increasing activity level, narrative amplification, and actor involvement. Escalation threshold (70) has been crossed."}
                    </div>
                  </div>
                </div>

                {/* Top row: Radar + Dimension Bars */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  
                  {/* Trajectory Radar Chart */}
                  <div className="sd-card">
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>TRAJECTORY RADAR</div>
                    <RadarChart dimensions={radarDimensions} size={280} />
                  </div>

                  {/* Dimension Detail Bars */}
                  <div className="sd-card">
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>DIMENSION DETAIL</div>
                    {dimensionBars.map(dim => (
                      <div key={dim.label} className="dimension-bar-row">
                        <span className="dimension-bar-label">{dim.label}</span>
                        <div className="dimension-bar-track">
                          <div className="dimension-bar-fill" style={{ width: `${dim.value}%`, background: dim.color }} />
                        </div>
                        <span className="dimension-bar-value" style={{ color: dim.color }}>{dim.value} ↑</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 14-Day Activity History Chart */}
                <div className="sd-card" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>14-DAY ACTIVITY HISTORY</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Simulated based on current trajectory</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#10b981',
                            display: 'inline-block'
                          }}
                        />
                        Activity
                      </span>

                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {/* Add the second status item here */}
                      </span>
                    </div>
                  </div>

                  {/* ─── SUB-TAB 03: WHERE ─────────────────────────────────────── */}
                    {activeSubTab === 'where' && (
                      <div>
                        {/* WHERE tab content */}
                      </div>
                    )}
                <div className="sd-card" style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>GEOGRAPHIC INTELLIGENCE (SPATIAL CANVASES)</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '16px', minHeight: '380px' }}>
                    
                    {/* SVG Map Section */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="100%" height="340" viewBox="0 0 400 350" style={{ display: 'block' }}>
                        {isKenya ? (
                          <>
                            {/* Kenya Polygon outline approximation */}
                            <path d="M 180 60 
                                     L 240 65 
                                     L 260 120 
                                     L 285 170 
                                     L 255 240 
                                     L 190 280 
                                     L 145 250 
                                     L 125 195 
                                     L 135 120 
                                     L 180 60 Z" 
                                  fill="rgba(255,255,255,0.02)" 
                                  stroke="rgba(255,255,255,0.15)" 
                                  strokeWidth="2" />
                            
                            {/* Nairobi Marker */}
                            <circle cx="195" cy="190" r={selectedMapPin === 'Nairobi' ? 9 : 7} fill="#f59e0b" cursor="pointer" stroke={selectedMapPin === 'Nairobi' ? '#fff' : 'none'} strokeWidth="1.5" onClick={() => setSelectedMapPin('Nairobi')} />
                            <text x="195" y="176" fill={selectedMapPin === 'Nairobi' ? '#00e5ff' : '#fff'} fontSize="9" textAnchor="middle">Nairobi</text>
                            
                            {/* Kisumu Marker */}
                            <circle cx="172" cy="198" r={selectedMapPin === 'Kisumu' ? 8 : 6} fill="#10b981" cursor="pointer" stroke={selectedMapPin === 'Kisumu' ? '#fff' : 'none'} strokeWidth="1.5" onClick={() => setSelectedMapPin('Kisumu')} />
                            <text x="172" y="214" fill={selectedMapPin === 'Kisumu' ? '#00e5ff' : '#fff'} fontSize="9" textAnchor="middle">Kisumu</text>
                          </>
                        ) : (
                          <>
                            {/* Africa Polygon approximation */}
                            <path d="M 170 50 
                                     L 230 52 
                                     L 250 80 
                                     L 280 120 
                                     L 275 140 
                                     L 250 200 
                                     L 220 280 
                                     L 200 320 
                                     L 190 320 
                                     L 180 290 
                                     L 170 240 
                                     L 165 210 
                                     L 145 190 
                                     L 100 170 
                                     L 90 130 
                                     L 120 80 
                                     L 170 50 Z" 
                                  fill="rgba(255,255,255,0.02)" 
                                  stroke="rgba(255,255,255,0.15)" 
                                  strokeWidth="2" />
                            
                            {/* Pretoria Marker */}
                            <circle cx="205" cy="272" r={selectedMapPin === 'Pretoria' ? 8 : 5} fill="#f59e0b" cursor="pointer" stroke={selectedMapPin === 'Pretoria' ? '#fff' : 'none'} strokeWidth="1.5" onClick={() => setSelectedMapPin('Pretoria')} />
                            <text x="205" y="265" fill="#6b7280" fontSize="9" textAnchor="middle">Pretoria</text>
                            
                            {/* Johannesburg Marker */}
                            <circle cx="200" cy="280" r={selectedMapPin === 'Johannesburg' ? 9 : 7} fill="#ef4444" cursor="pointer" stroke={selectedMapPin === 'Johannesburg' ? '#fff' : 'none'} strokeWidth="1.5" onClick={() => setSelectedMapPin('Johannesburg')} />
                            <text x="190" y="280" fill={selectedMapPin === 'Johannesburg' ? '#00e5ff' : '#fff'} fontSize="9" textAnchor="end">Johannesburg</text>
                            
                            {/* Durban Marker */}
                            <circle cx="218" cy="290" r={selectedMapPin === 'Durban' ? 8 : 6} fill="#f59e0b" cursor="pointer" stroke={selectedMapPin === 'Durban' ? '#fff' : 'none'} strokeWidth="1.5" onClick={() => setSelectedMapPin('Durban')} />
                            <text x="226" y="292" fill={selectedMapPin === 'Durban' ? '#00e5ff' : '#fff'} fontSize="9" textAnchor="start">Durban</text>

                            {/* Cape Town Marker */}
                            <circle cx="180" cy="305" r={selectedMapPin === 'Cape Town' ? 8 : 6} fill="#f59e0b" cursor="pointer" stroke={selectedMapPin === 'Cape Town' ? '#fff' : 'none'} strokeWidth="1.5" onClick={() => setSelectedMapPin('Cape Town')} />
                            <text x="172" y="307" fill={selectedMapPin === 'Cape Town' ? '#00e5ff' : '#fff'} fontSize="9" textAnchor="end">Cape Town</text>
                          </>
                        )}
                      </svg>
                      
                      <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.72rem', color: '#fff', display: 'flex', gap: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: isKenya ? '#f59e0b' : '#ef4444', display: 'inline-block' }} /> Origin</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: isKenya ? '#10b981' : '#f59e0b', display: 'inline-block' }} /> Spread</span>
                      </div>
                    </div>

                    {/* Drilldown Sidebar Panel */}
                    <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {selectedMapPin ? (
                        <div style={{ position: 'relative' }}>
                          <button onClick={() => setSelectedMapPin(null)} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                          
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>{selectedMapPin}</h3>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                            {isKenya 
                              ? (selectedMapPin === 'Nairobi' ? 'Origin · 5 events' : 'Spread · 2 events')
                              : (selectedMapPin === 'Johannesburg' ? 'Origin · 28 events' : selectedMapPin === 'Pretoria' ? 'Spread · 3 events' : selectedMapPin === 'Durban' ? 'Spread · 11 events' : 'Spread · 8 events')}
                          </div>

                          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                            <span className={`badge badge-${(selectedMapPin === 'Johannesburg' || selectedMapPin === 'Nairobi') ? 'critical' : 'high'}`}>
                              {(selectedMapPin === 'Johannesburg' || selectedMapPin === 'Nairobi') ? 'Critical' : 'High'}
                            </span>
                            <span className="badge badge-tag" style={{ color: '#fff' }}>
                              {(selectedMapPin === 'Johannesburg' || selectedMapPin === 'Nairobi') ? 'Origin location' : 'Spread location'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>LINKED EVENTS</div>
                          
                          {/* Kenya Nairobi events */}
                          {isKenya && selectedMapPin === 'Nairobi' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ padding: '8px 12px', background: 'rgba(245,158,11,0.06)', borderLeft: '2px solid #f59e0b', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Opposition coalition announces Nairobi rally for next weekend
                              </div>
                              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Protest organizers issue strike notice targeting CBD
                              </div>
                            </div>
                          )}

                          {/* Kenya Kisumu events */}
                          {isKenya && selectedMapPin === 'Kisumu' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ padding: '8px 12px', background: 'rgba(16,185,129,0.06)', borderLeft: '2px solid #10b981', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Precautionary police patrols deployed in Kisumu CBD
                              </div>
                              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Local business groups report minor closures
                              </div>
                            </div>
                          )}

                          {/* South Africa events */}
                          {!isKenya && selectedMapPin === 'Johannesburg' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.06)', borderLeft: '2px solid #ef4444', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Mass road blockades in Johannesburg townships
                              </div>
                              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Political party issues statement endorsing protests
                              </div>
                            </div>
                          )}

                          {!isKenya && selectedMapPin === 'Durban' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ padding: '8px 12px', background: 'rgba(245,158,11,0.06)', borderLeft: '2px solid #f59e0b', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Durban port workers strike & brief slowdown
                              </div>
                              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Truck blockades on N3 highway near Durban
                              </div>
                            </div>
                          )}

                          {!isKenya && selectedMapPin === 'Cape Town' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ padding: '8px 12px', background: 'rgba(245,158,11,0.06)', borderLeft: '2px solid #f59e0b', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Protests in Cape Town city center and informal settlements
                              </div>
                              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Precautionary small business closures
                              </div>
                            </div>
                          )}

                          {!isKenya && selectedMapPin === 'Pretoria' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ padding: '8px 12px', background: 'rgba(245,158,11,0.06)', borderLeft: '2px solid #f59e0b', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Precautionary police patrols deployed in Pretoria CBD
                              </div>
                            </div>
                          )}

                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                          Click a pin marker on the map to view detailed local intelligence.
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <div className="sd-card">
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>ACTIVE LOCATIONS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(isKenya ? [
                      { name: 'Nairobi', role: 'Origin · Kenya', events: 5, color: '#f59e0b' },
                      { name: 'Kisumu', role: 'Spread · Kenya', events: 2, color: '#10b981' }
                    ] : [
                      { name: 'Johannesburg', role: 'Origin · South Africa', events: 28, color: '#ef4444' },
                      { name: 'Durban', role: 'Spread · South Africa', events: 11, color: '#f59e0b' },
                      { name: 'Cape Town', role: 'Spread · South Africa', events: 8, color: '#f59e0b' },
                      { name: 'Pretoria', role: 'Spread · South Africa', events: 3, color: '#f59e0b' }
                    ]).map(loc => {
                      const isActive = selectedMapPin === loc.name;
                      return (
                        <div 
                          key={loc.name} 
                          className="risk-matrix-row"
                          onClick={() => setSelectedMapPin(loc.name)}
                          style={{ 
                            padding: '12px 16px', 
                            background: isActive ? 'var(--accent-teal-active)' : 'rgba(255,255,255,0.02)', 
                            border: isActive ? '1px solid rgba(0,229,255,0.4)' : '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>● {loc.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{loc.role}</div>
                          </div>
                          <span style={{ fontSize: '0.85rem', color: loc.color, fontWeight: 700 }}>{loc.events} events ↗</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Geographic Spread Status Card */}
                <div className="sd-card" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#fff' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#00e5ff' }}>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      Geographic Spread: {isKenya ? '30' : '65'}/100
                    </span>
                  </div>
                  <div className="progress-container" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{ width: isKenya ? '30%' : '65%', background: '#f59e0b', height: '100%' }} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {isKenya 
                      ? 'Limited spread. Primarily contained to original location. Geographic expansion scenario not yet actively supported.'
                      : 'Moderate spread. Spanning multiple key metro areas in Gauteng, KwaZulu-Natal, and Western Cape.'}
                  </div>
                </div>
              </div>
            )}

            {/* ─── SUB-TAB 04: WHO ───────────────────────────────────────── */}
            {activeSubTab === 'who' && (
              <div>
                {/* Category Legend Filter Bar */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '4px', height: '12px', background: '#ef4444', display: 'inline-block' }} /> Primary actor</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '4px', height: '12px', background: '#8b5cf6', display: 'inline-block' }} /> Responding actor</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '4px', height: '12px', background: '#f97316', display: 'inline-block' }} /> Amplifier</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '4px', height: '12px', background: '#00e5ff', display: 'inline-block' }} /> Affected party</span>
                </div>

                {/* Actor Cards list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { name: 'Community Action Networks', type: 'Community', border: '#ef4444', role: 'Primary', activity: 'high', desc: 'Decentralised community groups coordinating via WhatsApp. Diverse membership across townships.' },
                    { name: 'Opposition Political Party', type: 'Political', border: '#f97316', role: 'Amplifier', activity: 'high', desc: 'Issued supportive statements. Positioned issue within election narrative.' },
                    { name: 'South African Police Service', type: 'Government', border: '#8b5cf6', role: 'Responder', activity: 'high', desc: 'Deployed public order police. Managing crowd control.' },
                    { name: 'Foreign National Business Owners', type: 'Community', border: '#00e5ff', role: 'Affected', activity: 'medium', desc: 'Primarily Somali, Ethiopian, and Zimbabwean-owned shops and businesses targeted.' },
                    { name: 'Civil Society Coalition', type: 'Ngo', border: '#8b5cf6', role: 'Responder', activity: 'medium', desc: 'Issued joint statement condemning xenophobia. Coordinating legal support.' },
                  ].map(actor => (
                    <div key={actor.name} className="sd-card" style={{ borderLeft: `4px solid ${actor.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                      <div style={{ flex: 1, paddingRight: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{actor.name}</span>
                          <span className="badge badge-tag" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{actor.type}</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{actor.desc}</p>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '120px', fontSize: '0.8rem' }}>
                        <div style={{ color: 'var(--text-dim)' }}>Role: <span style={{ color: '#fff', fontWeight: 600 }}>{actor.role}</span></div>
                        <div style={{ color: 'var(--text-dim)' }}>Activity: <span style={{ color: actor.activity === 'high' ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{actor.activity}</span></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actor Network Involvement Card */}
                <div className="sd-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} color="#00e5ff" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Actor Network Involvement</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>78 ↑</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ width: '78%', height: '100%', background: '#ef4444' }} />
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Expanding actor networks are a key escalation signal. New types of actors joining — particularly political parties, unions, or media organisations — indicate a situation gaining momentum beyond its original community.
                  </p>
                </div>
              </div>
            )}

            {/* ─── SUB-TAB 05: DRIVERS (Full Causal Chain from screenshot) ── */}
            {activeSubTab === 'drivers' && (
              <div>
                {/* CAUSAL CHAIN */}
                <div className="sd-card" style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>CAUSAL CHAIN</div>
                  
                  <div className="causal-chain-section structural">
                    <div className="causal-chain-title structural">STRUCTURAL CONDITIONS</div>
                    <div>
                      {['High unemployment (32.9%)', 'Housing shortage', 'Economic insecurity', 'Political distrust'].map(tag => (
                        <span key={tag} className="causal-tag">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="causal-chain-arrow">↓</div>

                  <div className="causal-chain-section triggers">
                    <div className="causal-chain-title triggers">TRIGGERS</div>
                    <div>
                      {['Viral social media posts', 'June 30 march announcement', 'Criminal incidents attributed to foreign nationals'].map(tag => (
                        <span key={tag} className="causal-tag">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="causal-chain-arrow">↓</div>

                  <div className="causal-chain-section amplifiers">
                    <div className="causal-chain-title amplifiers">AMPLIFIERS</div>
                    <div>
                      {['WhatsApp group coordination', 'Political endorsements', 'Media coverage', 'Emotional misinformation'].map(tag => (
                        <span key={tag} className="causal-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CONSTRAINTS */}
                <div className="causal-chain-section constraints" style={{ marginBottom: '32px' }}>
                  <div className="causal-chain-title constraints">CONSTRAINTS — FACTORS LIMITING ESCALATION</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['Police deployment', 'Civil society pushback', 'Some municipal leaders calling for calm'].map(item => (
                      <div key={item} className="constraint-item">
                        <div className="constraint-dot" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CLAIMS & EVIDENCE ASSESSMENT */}
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>CLAIMS & EVIDENCE ASSESSMENT</div>

                {claimsData.map((claim, idx) => (
                  <div key={idx} className="claim-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div className="claim-text">{claim.text}</div>
                      <span className={claim.badge === 'Disputed' ? 'badge-disputed' : 'badge-unverified'}>{claim.badge}</span>
                    </div>
                    <div className="claim-meta">Source: {claim.source} · Spread: {claim.spread}</div>
                    <div className="evidence-grid">
                      <div className="evidence-box supporting">
                        <div className="evidence-box-title supporting">◉ Supporting evidence</div>
                        {claim.supporting.map((e, i) => <div key={i} className="evidence-item">· {e}</div>)}
                      </div>
                      <div className="evidence-box contradicting">
                        <div className="evidence-box-title contradicting">◉ Contradicting evidence</div>
                        {claim.contradicting.map((e, i) => <div key={i} className="evidence-item">· {e}</div>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── SUB-TAB 06: SCENARIOS (Full from screenshot) ──────────── */}
            {activeSubTab === 'scenarios' && (
              <div>
                {/* Info banner */}
                <div className="sd-card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(0,229,255,0.15)' }}>
                  <Info size={18} color="#00e5ff" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Scenarios represent plausible futures — not predictions. Likelihood bands are qualitative. Leading indicator counts track how many observable signals associated with each scenario are currently present.
                  </p>
                </div>

                {scenariosData.map(scenario => (
                  <div key={scenario.id} className="scenario-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div>
                        <div className="scenario-label">Scenario {scenario.id}</div>
                        <div className="scenario-title">{scenario.title}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={scenario.likelihood.includes('High') ? 'badge-high-likelihood' : 'badge-moderate-likelihood'}>{scenario.likelihood}</span>
                        <div style={{ fontSize: '0.78rem', color: scenario.trendColor, fontWeight: 600, marginTop: '4px' }}>{scenario.trend}</div>
                      </div>
                    </div>
                    
                    <div className="scenario-description">{scenario.description}</div>
                    <div className="scenario-horizon">Time horizon: {scenario.horizon}</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Leading indicators present</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00e5ff' }}>{scenario.indicatorsPresent} / {scenario.indicatorsTotal}</span>
                    </div>
                    
                    <div className="indicator-bar-track">
                      {Array.from({ length: scenario.indicatorsTotal }).map((_, i) => (
                        <div key={i} className={`indicator-bar-segment ${i < scenario.indicatorsPresent ? 'active' : 'inactive'}`} />
                      ))}
                    </div>

                    <div className="indicator-list">
                      {scenario.indicators.map((ind, i) => (
                        <div key={i} className="indicator-item">
                          {ind.active ? (
                            <span className="indicator-check">◉</span>
                          ) : (
                            <span className="indicator-uncheck">○</span>
                          )}
                          <span style={{ color: ind.active ? 'var(--text-muted)' : 'var(--text-dim)' }}>{ind.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── SUB-TAB 07: EXPOSURE ──────────────────────────────────── */}
            {/* ─── SUB-TAB 07: EXPOSURE ──────────────────────────────────── */}
            {activeSubTab === 'exposure' && (
              <div>
                {isKenya ? (
                  <div className="sd-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <CheckCircle size={24} color="#10b981" />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>No direct exposure detected</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '500px', lineHeight: 1.5, marginBottom: '16px' }}>
                      None of your registered assets are located in the countries affected by this situation. Your current footprint covers South Africa, Nigeria, Democratic Republic of Congo.
                    </p>
                    <span 
                      onClick={() => {
                        setCurrentView('exposure');
                        setExposureSubTab('assets');
                      }}
                      style={{ fontSize: '0.85rem', color: '#00e5ff', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      Manage assets &gt;
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="sd-card" style={{ marginBottom: '24px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.05)' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <span className="badge badge-critical">Critical</span>
                        <span style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: 600 }}>● Escalating</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>CRITICAL EXPOSURE</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Social Mobilisation situation with worsening trajectory may directly affect Office, Logistics, Staff assets in South Africa.
                      </p>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>AFFECTED ASSETS (3)</div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span className="badge badge-tag" style={{ color: '#fff' }}>🏢 Johannesburg Operations Hub</span>
                        <span className="badge badge-tag" style={{ color: '#fff' }}>🚢 Durban Export Terminal</span>
                        <span className="badge badge-tag" style={{ color: '#fff' }}>🏠 Cape Town Staff Accommodation</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>LINKED RECOMMENDATIONS (4)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="sd-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span className="badge badge-critical">P1 · Immediate</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Who: HR / Security Lead | When: Within 24 hours</span>
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Issue staff safety advisory for South Africa. Restrict non-essential movement in affected areas.</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Social mobilisation with escalating trajectory increases risk to staff in public-facing roles.</div>
                      </div>
                      <div className="sd-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span className="badge badge-high">P2 · 48h</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Who: Operations / Supply Chain Manager | When: Within 48 hours</span>
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Audit alternative routing and freight forwarding options for export operations.</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─── SUB-TAB 08: ACTIONS ───────────────────────────────────── */}
            {activeSubTab === 'actions' && (

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="sd-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(0,229,255,0.15)' }}>
                  <Info size={18} color="#00e5ff" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    These recommended actions are generated based on your organisation's exposure footprint matching against the escalating trajectory of this situation.
                  </p>
                </div>
                
                <div className="sd-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="badge badge-critical">Immediate</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Who: HR / Security Lead | When: Within 24 hours</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Issue staff safety advisory for South Africa.</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Restrict non-essential movement in affected areas in Gauteng and Western Cape due to high protest activity.</div>
                  <div style={{ fontSize: '0.75rem', color: '#00e5ff' }}>Linked: Social Mobilisation</div>
                </div>

                <div className="sd-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="badge badge-high" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>Short-term</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Who: Operations | When: Within 48 hours</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Audit alternative routing for logistics.</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Pre-approve backup logistics partners and routes away from N3 corridor.</div>
                  <div style={{ fontSize: '0.75rem', color: '#00e5ff' }}>Linked: Operational Disruption</div>
                </div>

                <div className="sd-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="badge badge-medium" style={{ background: 'rgba(253,224,71,0.15)', color: '#fde047', border: '1px solid rgba(253,224,71,0.3)' }}>Ongoing</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Who: Management | When: Weekly review</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Monitor political sentiment.</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Track statements from political leaders regarding foreign nationals to anticipate policy shifts.</div>
                  <div style={{ fontSize: '0.75rem', color: '#00e5ff' }}>Linked: Political Amplification</div>
                </div>
              </div>

            )}

            {/* ─── SUB-TAB: NETWORK ──────────────────────────────────────── */}
            {activeSubTab === 'network' && (
              <div>
                <div className="sd-card" style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>EVENT CAUSALITY GRAPH</div>
                  
                  <div style={{ height: '400px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                    <svg width="100%" height="100%" viewBox="0 0 600 400">
                      {/* Edges */}
                      <line x1="300" y1="200" x2="150" y2="100" stroke={selectedNetworkNode === 'Community Nets' ? '#ef4444' : 'rgba(255,255,255,0.15)'} strokeWidth={selectedNetworkNode === 'Community Nets' ? 3 : 1.5} />
                      <line x1="300" y1="200" x2="450" y2="100" stroke={selectedNetworkNode === 'Political Party' ? '#f97316' : 'rgba(255,255,255,0.15)'} strokeWidth={selectedNetworkNode === 'Political Party' ? 3 : 1.5} />
                      <line x1="300" y1="200" x2="150" y2="300" stroke={selectedNetworkNode === 'Police (SAPS)' ? '#8b5cf6' : 'rgba(255,255,255,0.15)'} strokeWidth={selectedNetworkNode === 'Police (SAPS)' ? 3 : 1.5} />
                      <line x1="300" y1="200" x2="450" y2="300" stroke={selectedNetworkNode === 'Affected Business' ? '#00e5ff' : 'rgba(255,255,255,0.15)'} strokeWidth={selectedNetworkNode === 'Affected Business' ? 3 : 1.5} />
                      <line x1="300" y1="200" x2="300" y2="60" stroke={selectedNetworkNode === 'Civil Society' ? '#8b5cf6' : 'rgba(255,255,255,0.15)'} strokeWidth={selectedNetworkNode === 'Civil Society' ? 3 : 1.5} />

                      {/* Nodes */}
                      {/* Central Situation Node */}
                      <circle cx="300" cy="200" r="34" fill="#0e131f" stroke="#10b981" strokeWidth="3" cursor="pointer" onClick={() => setSelectedNetworkNode(null)} />
                      <text x="300" y="200" fill="#10b981" fontSize="11" fontWeight="800" textAnchor="middle" dominantBaseline="middle" cursor="pointer" onClick={() => setSelectedNetworkNode(null)}>SITUATION</text>

                      {/* Community Nets */}
                      <circle cx="150" cy="100" r={selectedNetworkNode === 'Community Nets' ? 28 : 22} fill="#ef4444" stroke={selectedNetworkNode === 'Community Nets' ? '#fff' : 'none'} strokeWidth="2" cursor="pointer" onClick={() => setSelectedNetworkNode('Community Nets')} />
                      <text x="150" y="140" fill={selectedNetworkNode === 'Community Nets' ? '#ef4444' : '#8b949e'} fontSize="11" fontWeight={selectedNetworkNode === 'Community Nets' ? '700' : '500'} textAnchor="middle">Community Nets</text>

                      {/* Political Party */}
                      <circle cx="450" cy="100" r={selectedNetworkNode === 'Political Party' ? 28 : 22} fill="#f97316" stroke={selectedNetworkNode === 'Political Party' ? '#fff' : 'none'} strokeWidth="2" cursor="pointer" onClick={() => setSelectedNetworkNode('Political Party')} />
                      <text x="450" y="140" fill={selectedNetworkNode === 'Political Party' ? '#f97316' : '#8b949e'} fontSize="11" fontWeight={selectedNetworkNode === 'Political Party' ? '700' : '500'} textAnchor="middle">Political Party</text>

                      {/* Police (SAPS) */}
                      <circle cx="150" cy="300" r={selectedNetworkNode === 'Police (SAPS)' ? 28 : 22} fill="#8b5cf6" stroke={selectedNetworkNode === 'Police (SAPS)' ? '#fff' : 'none'} strokeWidth="2" cursor="pointer" onClick={() => setSelectedNetworkNode('Police (SAPS)')} />
                      <text x="150" y="340" fill={selectedNetworkNode === 'Police (SAPS)' ? '#8b5cf6' : '#8b949e'} fontSize="11" fontWeight={selectedNetworkNode === 'Police (SAPS)' ? '700' : '500'} textAnchor="middle">Police (SAPS)</text>

                      {/* Affected Business */}
                      <circle cx="450" cy="300" r={selectedNetworkNode === 'Affected Business' ? 28 : 22} fill="#00e5ff" stroke={selectedNetworkNode === 'Affected Business' ? '#fff' : 'none'} strokeWidth="2" cursor="pointer" onClick={() => setSelectedNetworkNode('Affected Business')} />
                      <text x="450" y="340" fill={selectedNetworkNode === 'Affected Business' ? '#00e5ff' : '#8b949e'} fontSize="11" fontWeight={selectedNetworkNode === 'Affected Business' ? '700' : '500'} textAnchor="middle">Affected Business</text>
                      
                      {/* Civil Society */}
                      <circle cx="300" cy="60" r={selectedNetworkNode === 'Civil Society' ? 28 : 22} fill="#8b5cf6" stroke={selectedNetworkNode === 'Civil Society' ? '#fff' : 'none'} strokeWidth="2" cursor="pointer" onClick={() => setSelectedNetworkNode('Civil Society')} />
                      <text x="300" y="100" fill={selectedNetworkNode === 'Civil Society' ? '#8b5cf6' : '#8b949e'} fontSize="11" fontWeight={selectedNetworkNode === 'Civil Society' ? '700' : '500'} textAnchor="middle">Civil Society</text>
                    </svg>

                    <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}/> Primary</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }}/> Amplifier</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }}/> Responder</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5ff', display: 'inline-block' }}/> Affected</span>
                    </div>
                    {selectedNetworkNode && (
                      <div style={{ position: 'absolute', top: '16px', right: '16px', width: '220px', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(10,14,23,0.95)', fontSize: '0.8rem', color: '#fff', zIndex: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <strong style={{ color: '#00e5ff' }}>{selectedNetworkNode}</strong>
                          <button onClick={() => setSelectedNetworkNode(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
               {/* ─── SUB-TAB: EVIDENCE ─────────────────────────────────────── */}
            {activeSubTab === 'evidence' && (

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>EVIDENCE STATUS DISTRIBUTION</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { label: '✓ Observed', count: isKenya ? 0 : 4, color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.4)', bg: 'rgba(16,185,129,0.06)' },
                    { label: '? Reported', count: isKenya ? 0 : 3, color: '#fde047', borderColor: 'rgba(245,158,11,0.4)', bg: 'rgba(245,158,11,0.06)' },
                    { label: '✕ Disputed', count: isKenya ? 0 : 1, color: '#ef4444' },
                    { label: '? Unverified', count: isKenya ? 0 : 2, color: '#3b82f6' },
                  ].map(ev => (
                    <div key={ev.label} className="sd-card" style={ev.borderColor ? { border: `1px solid ${ev.borderColor}`, background: ev.bg } : {}}>
                      <div style={{ fontSize: '0.8rem', color: ev.color, fontWeight: 700 }}>{ev.label}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{ev.count}</div>
                    </div>
                  ))}
                </div>

                 <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button onClick={() => setEvidenceMode('events')} style={{ background: evidenceMode === 'events' ? 'var(--accent-teal-active)' : 'transparent', border: evidenceMode === 'events' ? '1px solid rgba(0,229,255,0.4)' : '1px solid var(--border-color)', color: evidenceMode === 'events' ? '#00e5ff' : 'var(--text-muted)', padding: '6px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Events ({isKenya ? 0 : 4})</button>
                  <button onClick={() => setEvidenceMode('claims')} style={{ background: evidenceMode === 'claims' ? 'var(--accent-teal-active)' : 'transparent', border: evidenceMode === 'claims' ? '1px solid rgba(0,229,255,0.4)' : '1px solid var(--border-color)', color: evidenceMode === 'claims' ? '#00e5ff' : 'var(--text-muted)', padding: '6px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Claims ({isKenya ? 0 : 3})</button>
                </div>

                {isKenya && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {['all', 'observed', 'reported', 'disputed', 'unverified'].map(filter => {
                      const isActive = evidenceFilter === filter;
                      return (
                        <span 
                          key={filter}
                          onClick={() => setEvidenceFilter(filter)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: isActive ? '1px solid rgba(0,229,255,0.4)' : '1px solid var(--border-color)',
                            background: isActive ? 'var(--accent-teal-active)' : 'transparent',
                            color: isActive ? '#00e5ff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontWeight: 600
                          }}
                        >
                          {filter}
                        </span>
                      );
                    })}
                  </div>
                )}

                {isKenya ? (
                  <div className="sd-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.9rem', minHeight: '100px', marginBottom: '24px' }}>
                    No {evidenceMode} with status "{evidenceFilter}" recorded.
                  </div>
                ) : (
                  evidenceMode === 'events' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {[
                        { status: '✓', title: 'Road blockades on N3 highway', date: '22 Jul 2026', loc: 'Johannesburg', type: 'Disruption', desc: 'Residents blocked major arterial roads in Alexandra, Diepsloot, and Soweto during the early morning hours. Businesses owned by foreign nationals targeted.', actors: 'Community Action Network, Residents', source: 'eNCA Breaking News' },
                        { status: '?', title: 'Looting of foreign-owned shops', date: '21 Jul 2026', loc: 'Durban', type: 'Violence', desc: 'Reports of selective looting targeting spaza shops in Durban townships. Local community response underway.', actors: 'Local youth groups, business owners', source: 'Daily Maverick' },
                        { status: '✓', title: 'Police deployment to Soweto', date: '21 Jul 2026', loc: 'Soweto', type: 'Response', desc: 'SAPS deployed public order policing units to restore calm in Soweto following minor clashes.', actors: 'SAPS public order units', source: 'SABC Radio' },
                        { status: '✓', title: 'Political rally calling for action', date: '20 Jul 2026', loc: 'Cape Town', type: 'Mobilisation', desc: 'Opposition political party organised a township rally, raising socio-economic grievances.', actors: 'Opposition party organisers', source: 'The East African' },
                      ].map((ev, i) => (
                        <div key={i} className="sd-card" style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedEvent(expandedEvent === i ? null : i)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ color: ev.status === '✓' ? '#10b981' : '#f59e0b', fontWeight: 800, fontSize: '1.2rem' }}>{ev.status}</span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{ev.title}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{ev.date} · {ev.loc}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="badge badge-tag" style={{ color: '#fff' }}>{ev.type}</span>
                              <span style={{ color: 'var(--text-dim)' }}>{expandedEvent === i ? '▲' : '▼'}</span>
                            </div>
                          </div>
                          {expandedEvent === i && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              <p style={{ marginBottom: '12px', lineHeight: 1.5 }}>{ev.desc}</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '8px 12px', borderRadius: '4px' }}>
                                <span>Actors: <strong style={{ color: '#fff' }}>{ev.actors}</strong></span>
                                <span style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}>Source: {ev.source} ↗</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {[
                        { text: '"Foreign nationals are responsible for the majority of crime in affected townships"', badge: 'Disputed', source: 'Various community leaders and online accounts', spread: 'Wide', supporting: ['Some police incident reports cited selectively'], contradicting: ['SAPS crime statistics do not support disproportionate foreign national criminality', 'Academic research shows contrary findings'] },
                        { text: '"Foreign nationals are taking jobs from South African citizens"', badge: 'Disputed', source: 'Protest organisers', spread: 'Wide', supporting: ['Anecdotal accounts from unemployed youth'], contradicting: ['Most foreign nationals working in informal/small business economy', 'Structural unemployment driven by macroeconomic factors'] },
                        { text: '"Protests were pre-planned and coordinated by political actors"', badge: 'Unverified', source: 'Several media organisations', spread: 'Moderate', supporting: ['Timing across multiple cities simultaneous', 'Shared messaging templates found'], contradicting: ['Organisers deny central coordination'] }
                      ].map((claim, i) => (
                        <div key={i} className="sd-card" style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpandedClaim(expandedClaim === i ? null : i)}>
                            <div style={{ paddingRight: '20px' }}>
                              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontStyle: 'italic', marginBottom: '4px' }}>{claim.text}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Source: {claim.source} · Spread: {claim.spread}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <span className={claim.badge === 'Disputed' ? 'badge-disputed' : 'badge-unverified'}>{claim.badge}</span>
                              <span style={{ color: 'var(--text-dim)' }}>{expandedClaim === i ? '▲' : '▼'}</span>
                            </div>
                          </div>
                          {expandedClaim === i && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                              <div className="evidence-grid">
                                <div className="evidence-box supporting">
                                  <div className="evidence-box-title supporting">◉ Supporting evidence</div>
                                  {claim.supporting.map((e, idx) => <div key={idx} className="evidence-item">· {e}</div>)}
                                </div>
                                <div className="evidence-box contradicting">
                                  <div className="evidence-box-title contradicting">◉ Contradicting evidence</div>
                                  {claim.contradicting.map((e, idx) => <div key={idx} className="evidence-item">· {e}</div>)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}

                <div className="sd-card" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  📑 Every intelligence assessment in SignalDesk is traceable to its source. "Observed" means directly verified. "Reported" means from a credible source without independent verification.
                </div>
              </div>
            )}

          </div>
        </div>
      )}

        {/* ═══ VIEW 4: MY EXPOSURE ══════════════════════════════════════ */}
        {currentView === 'exposure' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="top-header">
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>My Exposure</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Assess how active intelligence situations affect your organisation's footprint.</p>
              </div>
            </div>

            <div className="page-content">
              <div className="sub-nav-tabs" style={{ marginBottom: '24px' }}>
              <div className={`sub-tab-item ${exposureSubTab === 'overview' ? 'active' : ''}`} onClick={() => setExposureSubTab('overview')} style={{ cursor: 'pointer' }}>Overview</div>
              <div className={`sub-tab-item ${exposureSubTab === 'assets' ? 'active' : ''}`} onClick={() => setExposureSubTab('assets')} style={{ cursor: 'pointer' }}>Assets ({assets.length})</div>
              <div className={`sub-tab-item ${exposureSubTab === 'recommendations' ? 'active' : ''}`} onClick={() => setExposureSubTab('recommendations')} style={{ cursor: 'pointer' }}>Recommendations (6)</div>
            </div>

            {exposureSubTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 1. Organisation Profile card */}
                <div className="sd-card" style={{ position: 'relative', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{orgProfile.name}</h3>
                      <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)', padding: '3px 10px', borderRadius: '4px', marginBottom: '6px' }}>
                        {orgProfile.industry}
                      </div>
                    </div>
                    <button onClick={() => setProfileModalOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500 }}>
                      <Edit size={14} /> Edit Profile
                    </button>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                    {orgProfile.description}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {orgProfile.countries.split(',').map(c => c.trim()).map(c => (
                      <span key={c} style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '3px 10px', borderRadius: '4px' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Risk Matrix card */}
                <div className="sd-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '14px', letterSpacing: '0.08em' }}>RISK MATRIX</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                    {[
                      { sit: 'Anti-Immigration Mobilisation — South Africa', status: 'CRITICAL', status2: '● Escalating', color: '#ef4444', bulletColor: '#ef4444' },
                      { sit: 'Port of Durban Operational Disruption', status: 'CRITICAL', status2: '● Active', color: '#ef4444', bulletColor: '#ef4444' },
                      { sit: 'Nigerian Fuel Subsidy Reform — Social Tensions', status: 'HIGH', status2: '● Developing', color: '#f59e0b', bulletColor: '#f59e0b' },
                      { sit: 'DRC Eastern Mining Region — Security Deterioration', status: 'CRITICAL', status2: '● Escalating', color: '#ef4444', bulletColor: '#ef4444' },
                    ].map((row, i) => {
                      const targetSituation = situations.find(s => s.title === row.sit);
                      return (
                        <div 
                          key={i} 
                          className="risk-matrix-row"
                          onClick={() => {
                            if (targetSituation) {
                              openSituationDetail(targetSituation);
                            }
                          }}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            paddingBottom: '12px', 
                            borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none' 
                          }}
                        >
                          <span style={{ color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.bulletColor, display: 'inline-block' }} />
                            {row.sit}
                          </span>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', fontWeight: 700 }}>
                            <span style={{ color: row.color }}>{row.status}</span>
                            <span style={{ color: row.status2.includes('Escalating') || row.status2.includes('Active') ? '#ef4444' : '#f59e0b' }}>{row.status2}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Exposure Detail card list */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>EXPOSURE DETAIL</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Card 1 */}
                    <div className="sd-card" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.02)', padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Anti-Immigration Mobilisation — South Africa</h4>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="badge badge-critical" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>Critical</span>
                            <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700 }}>● Escalating</span>
                            <span style={{ fontSize: '0.72rem', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>CRITICAL EXPOSURE</span>
                          </div>
                        </div>
                        <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                        Social Mobilisation situation with worsening trajectory may directly affect Office, Logistics, Staff assets in South Africa.
                      </p>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 700 }}>MATCHED ASSETS</div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block' }} /> Johannesburg Operations Hub
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block' }} /> Durban Export Terminal
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block' }} /> Cape Town Staff Accommodation
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          Geographic overlap - South Africa
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          Staff safety risk
                        </span>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="sd-card" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.02)', padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Port of Durban Operational Disruption</h4>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="badge badge-high" style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(249, 115, 22, 0.1)', color: '#fdba74', border: '1px solid rgba(249, 115, 22, 0.3)' }}>High</span>
                            <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>● Active</span>
                            <span style={{ fontSize: '0.72rem', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>CRITICAL EXPOSURE</span>
                          </div>
                        </div>
                        <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                        Operational Disruption situation with stable trajectory may directly affect Office, Logistics, Staff assets in South Africa.
                      </p>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 700 }}>MATCHED ASSETS</div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block' }} /> Johannesburg Operations Hub
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block' }} /> Durban Export Terminal
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block' }} /> Cape Town Staff Accommodation
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          Geographic overlap - South Africa
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          Operational disruption
                        </span>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="sd-card" style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.01)', padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Nigerian Fuel Subsidy Reform — Social Tensions</h4>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="badge badge-high" style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(249, 115, 22, 0.1)', color: '#fdba74', border: '1px solid rgba(249, 115, 22, 0.3)' }}>High</span>
                            <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>● Developing</span>
                            <span style={{ fontSize: '0.72rem', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>HIGH EXPOSURE</span>
                          </div>
                        </div>
                        <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                        Economic Policy Tension situation with worsening trajectory may directly affect Office assets in Nigeria.
                      </p>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 700 }}>MATCHED ASSETS</div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block' }} /> Lagos Regional Office
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          Geographic overlap - Nigeria
                        </span>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div className="sd-card" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.02)', padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>DRC Eastern Mining Region — Security Deterioration</h4>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="badge badge-critical" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>Critical</span>
                            <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700 }}>● Escalating</span>
                            <span style={{ fontSize: '0.72rem', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>CRITICAL EXPOSURE</span>
                          </div>
                        </div>
                        <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                        Security & Conflict situation with worsening trajectory may directly affect Project assets in Democratic Republic of Congo.
                      </p>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 700 }}>MATCHED ASSETS</div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fff', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block' }} /> Kinshasa Project Site
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          Geographic overlap - Democratic Republic of Congo
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          Site security threat
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {exposureSubTab === 'assets' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Assets ({assets.length})</h3>
                  <button onClick={handleOpenAddAsset} style={{ background: '#00e5ff', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>+ Add Asset</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {assets.map(asset => (
                    <div key={asset.id} className="sd-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{asset.name}</span>
                        <span className="badge badge-tag" style={{ color: '#00e5ff' }}>{asset.type}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Location: {asset.loc}, {asset.country}</div>
                      {asset.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px', fontStyle: 'italic' }}>{asset.notes}</div>}
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <button onClick={() => handleOpenEditAsset(asset)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleDeleteAsset(asset.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                          <X size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {exposureSubTab === 'recommendations' && (
              <div>
                {/* Group 1: P1 */}
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  P1 · IMMEDIATE ACTION
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {/* Rec 1 */}
                  <div className="sd-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
                    <div style={{ flex: 1, paddingRight: '24px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '6px', lineHeight: 1.4 }}>
                        Activate site security protocols for Democratic Republic of Congo operations. Brief site managers on evacuation routes and emergency contacts.
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                        Escalating armed conflict or security deterioration poses direct risk to personnel and assets.
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                        <span>Who: Security Manager / Country Director</span>
                        <span>Where: Immediately</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>
                          DRC Eastern Mining Region — Securit...
                        </span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', padding: '4px 10px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        P1 - Immediate
                      </span>
                    </div>
                  </div>

                  {/* Rec 2 */}
                  <div className="sd-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
                    <div style={{ flex: 1, paddingRight: '24px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '6px', lineHeight: 1.4 }}>
                        Issue staff safety advisory for South Africa. Restrict non-essential movement in affected areas.
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                        Social mobilisation with escalating trajectory increases risk to staff in public-facing roles.
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                        <span>Who: HR / Security Lead</span>
                        <span>When: Within 24 hours</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>
                          Anti-Immigration Mobilisation — Sout...
                        </span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', padding: '4px 10px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        P1 - Immediate
                      </span>
                    </div>
                  </div>
                </div>

                {/* Group 2: P2 */}
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  P2 · WITHIN 48 HOURS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Rec 3 */}
                  <div className="sd-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
                    <div style={{ flex: 1, paddingRight: '24px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '6px', lineHeight: 1.4 }}>
                        Audit alternative routing and freight forwarding options for export operations. Pre-approve backup logistics partners.
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                        Active disruption at key logistics nodes requires contingency planning to maintain export continuity.
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                        <span>Who: Operations / Supply Chain Manager</span>
                        <span>Where: Within 48 hours</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>
                          Anti-Immigration Mobilisation — Sout...
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>
                          Port of Durban Operational Disruption
                        </span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316', border: '1px solid rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.06)', padding: '4px 10px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        P2 - 48h
                      </span>
                    </div>
                  </div>

                  {/* Rec 4 */}
                  <div className="sd-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
                    <div style={{ flex: 1, paddingRight: '24px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '6px', lineHeight: 1.4 }}>
                        Increase monitoring frequency for: Anti-Immigration Mobilisation — South Africa; Nigerian Fuel Subsidy Reform — Social Tensions. Set 24h alert threshold for key indicator changes.
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                        Escalating situations require tighter reporting cadence to enable timely decisions.
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                        <span>Who: Intelligence Analyst / Risk Team</span>
                        <span>When: Within 48 hours</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>
                          Anti-Immigration Mobilisation — Sout...
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>
                          Nigerian Fuel Subsidy Reform — Soci...
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>
                          DRC Eastern Mining Region — Securit...
                        </span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316', border: '1px solid rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.06)', padding: '4px 10px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        P2 - 48h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Asset Add/Edit Modal */}
            {assetModalOpen && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="sd-card" style={{ width: '500px', background: '#0a0e17', border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{assetModalOpen === 'add' ? 'Add Asset' : 'Edit Asset'}</h3>
                    <button onClick={() => setAssetModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                  </div>
                  <form onSubmit={handleSaveAsset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Name *</label>
                      <input type="text" required value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Type</label>
                      <select value={assetForm.type} onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0a0e17', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}>
                        {['Office', 'Logistics', 'Project', 'Staff', 'Retail', 'Digital'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Location *</label>
                      <input type="text" required value={assetForm.loc} onChange={(e) => setAssetForm({ ...assetForm, loc: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Country *</label>
                      <input type="text" required value={assetForm.country} onChange={(e) => setAssetForm({ ...assetForm, country: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Notes</label>
                      <textarea rows={3} value={assetForm.notes} onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}></textarea>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                      <button type="button" onClick={() => setAssetModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                      <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', background: '#00e5ff', border: 'none', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Save</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

        {/* ═══ VIEW 5: SOURCES ══════════════════════════════════════════ */}
        {currentView === 'sources' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="top-header">
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Monitored Sources</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monitored information sources across Africa and globally</p>
              </div>
            </div>

            <div className="page-content">
              {/* Stat Cards with top-left icons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {[
                { v: '12', l: 'Total Sources', icon: Globe },
                { v: '3', l: 'Audio Sources', icon: Radio },
                { v: '3', l: 'Government', icon: Building },
                { v: '8', l: 'Countries', icon: MapPin }
              ].map((s, idx) => (
                <div key={idx} className="sd-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px' }}>
                  <s.icon size={16} color="var(--text-dim)" style={{ marginBottom: '4px' }} />
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Monitored Registry List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'eNCA', type: 'Television · South Africa', reliability: 'High', icon: Tv },
                { name: 'Daily Maverick', type: 'Digital Media · South Africa', reliability: 'High', icon: Globe },
                { name: 'BusinessDay', type: 'Print / Digital · South Africa', reliability: 'High', icon: Globe },
                { name: 'Premium Times Nigeria', type: 'Digital Media · Nigeria', reliability: 'High', icon: Globe },
                { name: 'The East African', type: 'Regional Print · Kenya/EA', reliability: 'High', icon: Globe },
                { name: 'AllAfrica', type: 'Aggregator · Multi', reliability: 'Medium', icon: Rss },
                { name: 'SABC Radio', type: 'Public Radio · South Africa', reliability: 'High', icon: Radio },
                { name: 'Radio 702', type: 'Talk Radio · South Africa', reliability: 'High', icon: Radio },
                { name: 'Ukhozi FM', type: 'Community Radio · South Africa', reliability: 'Medium', icon: Radio }
              ].map((outlet, idx) => {
                const isHigh = outlet.reliability === 'High';
                const badgeColor = isHigh ? '#10b981' : '#f59e0b';
                const badgeBg = isHigh ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)';
                const badgeBorder = isHigh ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)';

                return (
                  <div key={idx} className="sd-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <outlet.icon size={15} color="var(--text-dim)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>{outlet.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{outlet.type}</div>
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: badgeColor, 
                      border: `1px solid ${badgeBorder}`, 
                      background: badgeBg, 
                      padding: '3px 10px', 
                      borderRadius: '4px' 
                    }}>
                      {outlet.reliability}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

        {/* ═══ VIEW 6: AUDIO INSIGHTS ══════════════════════════════════ */}
        {currentView === 'audio' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="top-header">
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Audio Insights</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>SABC Target Stations: SAfm, Ukhozi FM, Umhlobo Wenene FM, RSG, Radio 2000</p>
              </div>
            </div>

            <div className="page-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {radioStations.map((st) => (
                <div key={st.call_sign} className="sd-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{st.call_sign}</span>
                    <span className="badge badge-high">{st.language_code || 'en'}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>{st.name}</div>
                  <button onClick={() => triggerRadioCapture(st.call_sign)} disabled={capturingStation === st.call_sign} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'var(--accent-teal-active)', border: '1px solid rgba(0,229,255,0.4)', color: '#00e5ff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                    {capturingStation === st.call_sign ? 'Transcribing Audio...' : '🎙️ Listen & Transcribe'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

        {/* ═══ VIEW 7: REPORTS ═════════════════════════════════════════ */}
        {currentView === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="top-header">
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Intelligence Reports & Briefings</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Exportable daily situational intelligence summaries and briefings</p>
              </div>
            </div>

            <div className="page-content">
              <div className="sd-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Daily Executive Briefing — 23 July 2026</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px' }}>Automated synthesis of 92 signals across news, live radio broadcasts, and official South African Government Gazettes.</p>
              <button style={{ background: 'var(--accent-teal-active)', border: '1px solid rgba(0,229,255,0.4)', color: '#00e5ff', borderRadius: '8px', padding: '8px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                Download Executive PDF Report
              </button>
            </div>
          </div>
        </div>
      )}

      </main>

      {/* ─── EDIT PROFILE MODAL ──────────────────────────────────────── */}
      {profileModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="sd-card" style={{ width: '500px', background: '#0a0e17', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Edit Organisation Profile</h3>
              <X size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setProfileModalOpen(false)} />
            </div>
            <form onSubmit={saveProfileModal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Name', key: 'name', type: 'input' },
                { label: 'Industry', key: 'industry', type: 'input' },
                { label: 'Countries (comma-separated)', key: 'countries', type: 'input' },
                { label: 'Description', key: 'description', type: 'textarea' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>{field.label}</label>
                  {field.type === 'input' ? (
                    <input type="text" value={orgProfile[field.key]} onChange={(e) => setOrgProfile({ ...orgProfile, [field.key]: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }} />
                  ) : (
                    <textarea rows={3} value={orgProfile[field.key]} onChange={(e) => setOrgProfile({ ...orgProfile, [field.key]: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}></textarea>
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setProfileModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', background: '#00e5ff', border: 'none', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
