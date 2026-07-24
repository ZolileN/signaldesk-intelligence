import re
import os

filepath = '/home/zolile/Documents/signaldesk-app/apps/web/src/App.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. DASHBOARD VIEW: Add SITUATIONS REQUIRING ATTENTION
dashboard_addition = """
            {/* SITUATIONS REQUIRING ATTENTION */}
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>SITUATIONS REQUIRING ATTENTION</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {situations.map((sit) => (
                    <div key={sit.id} className="sd-card" onClick={() => openSituationDetail(sit)} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`badge badge-${(sit.severity || 'high').toLowerCase()}`}>{sit.severity || 'High'}</span>
                          <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>● {sit.status || 'Escalating'}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{sit.situation_type || 'Conflict'}</span>
                        </div>
                        <ChevronRight size={18} color="#00e5ff" />
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00e5ff', marginBottom: '6px' }}>{sit.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '12px' }}>{sit.summary}</p>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', gap: '16px' }}>
                        <span>🌐 South Africa</span><span>⚡ 47 events</span><span>🕒 Updated recently</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="sd-card">
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>GEOGRAPHIC EXPOSURE</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {[
                        { country: 'South Africa', count: 4, color: '#ef4444' },
                        { country: 'Nigeria', count: 2, color: '#f59e0b' },
                        { country: 'DRC', count: 2, color: '#f59e0b' },
                        { country: 'Kenya', count: 1, color: '#fde047' },
                        { country: 'Ethiopia', count: 1, color: '#6ee7b7' },
                        { country: 'Ghana', count: 1, color: '#6ee7b7' },
                      ].map(g => (
                        <div key={g.country} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{g.country}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(g.count/4)*100}%`, height: '100%', background: g.color }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#fff', width: '12px' }}>{g.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.7rem', display: 'flex', gap: '8px', flexWrap: 'wrap', color: 'var(--text-dim)' }}>
                      <span style={{ color: '#ef4444' }}>● Critical</span>
                      <span style={{ color: '#f59e0b' }}>● High</span>
                      <span style={{ color: '#fde047' }}>● Medium</span>
                      <span style={{ color: '#6ee7b7' }}>● Low</span>
                    </div>
                  </div>

                  <div className="sd-card">
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>SITUATIONS BY CATEGORY</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { cat: 'Social Mob.', count: 3 },
                        { cat: 'Security', count: 2 },
                        { cat: 'Econ. Policy', count: 2 },
                        { cat: 'Political', count: 1 },
                        { cat: 'Humanitarian', count: 1 },
                      ].map(c => (
                        <div key={c.cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.cat}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(c.count/3)*100}%`, height: '100%', background: '#00e5ff' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#fff', width: '12px' }}>{c.count}</span>
                          </div>
                        </div>
                      ))}
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
"""
content = content.replace('{/* SIGNAL ACTIVITY CHART (from screenshot) */}', dashboard_addition + '\n            {/* SIGNAL ACTIVITY CHART (from screenshot) */}')


# 2. WHAT TAB: quick-nav grid cards
what_tab_addition = """
                <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {[
                    { id: 'trajectory', label: '02 Trajectory' },
                    { id: 'where', label: '03 Where' },
                    { id: 'who', label: '04 Who' },
                    { id: 'drivers', label: '05 Drivers' },
                    { id: 'scenarios', label: '06 Scenarios' },
                    { id: 'exposure', label: '07 Exposure' },
                    { id: 'actions', label: '08 Actions' },
                    { id: 'network', label: '-- Network' },
                    { id: 'evidence', label: '-- Evidence' },
                  ].map(tab => (
                    <div key={tab.id} className="sd-card" onClick={() => setActiveSubTab(tab.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{tab.label}</span>
                      <ChevronRight size={16} color="#00e5ff" />
                    </div>
                  ))}
                </div>
"""
# insert before the end of what tab
content = re.sub(r'(</div>\n\s*)\}\)\}\n\s*</div>\n\s*</div>\n\s*\)}', r'\1})}' + '\n                </div>' + what_tab_addition + '\n              </div>\n            )}', content, count=1)


# 3. TRAJECTORY TAB: Worsening alert banner
banner = """
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>↑ Worsening rapidly</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      The situation's trajectory shows a rapid escalation with increasing activity level, narrative amplification, and actor involvement. Escalation threshold (70) has been crossed.
                    </div>
                  </div>
                </div>
"""
content = content.replace('{/* Top row: Radar + Dimension Bars */}', banner + '\n                {/* Top row: Radar + Dimension Bars */}')


# 4. WHO TAB: Restyle
who_tab_content = """
              <div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '16px' }}>
                  <span><span style={{ color: '#ef4444' }}>|</span> Primary actor</span>
                  <span><span style={{ color: '#8b5cf6' }}>|</span> Responding actor</span>
                  <span><span style={{ color: '#f97316' }}>|</span> Amplifier</span>
                  <span><span style={{ color: '#3b82f6' }}>|</span> Affected party</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { name: 'Community Action Networks', type: 'Community', typeColor: '#00e5ff', role: 'Primary', activity: 'high', borderColor: '#ef4444', desc: 'Decentralised community groups coordinating via WhatsApp.' },
                    { name: 'Opposition Political Party', type: 'Political', typeColor: '#f97316', role: 'Amplifier', activity: 'high', borderColor: '#f97316', desc: 'Amplifying narratives for political leverage.' },
                    { name: 'South African Police Service', type: 'Government', typeColor: '#8b5cf6', role: 'Responder', activity: 'high', borderColor: '#8b5cf6', desc: 'Deployed public order police units.' },
                    { name: 'Foreign National Business Owners', type: 'Community', typeColor: '#00e5ff', role: 'Affected', activity: 'medium', borderColor: '#3b82f6', desc: 'Direct targets of the mobilisation.' },
                    { name: 'Civil Society Coalition', type: 'Ngo', typeColor: '#10b981', role: 'Responder', activity: 'medium', borderColor: '#8b5cf6', desc: 'Calling for calm and dialogue.' },
                  ].map(actor => (
                    <div key={actor.name} className="sd-card" style={{ borderLeft: `4px solid ${actor.borderColor}`, paddingLeft: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{actor.name}</span>
                        <span className="badge badge-tag" style={{ color: actor.typeColor }}>{actor.type}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Role: {actor.role} | Activity: <strong style={{ color: actor.activity === 'high' ? '#ef4444' : '#f59e0b' }}>{actor.activity}</strong></div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{actor.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="sd-card">
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>ACTOR NETWORK INVOLVEMENT</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Network Density</span>
                    <span style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 700 }}>78 ↑</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ width: '78%', height: '100%', background: '#ef4444' }} />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>High actor involvement indicates a complex, multi-stakeholder situation with increased potential for unexpected interactions.</p>
                </div>
              </div>
"""
# Replace the existing who tab content
content = re.sub(r'\{\/\* ─── SUB-TAB 04: WHO ───────────────────────────────────────── \*\/\}\n\s*\{activeSubTab === \'who\' && \([\s\S]*?\}\)\}\n\s*<\/div>\n\s*\)\}', '{/* ─── SUB-TAB 04: WHO ───────────────────────────────────────── */}\n            {activeSubTab === \'who\' && (\n' + who_tab_content + '\n            )}', content)


# 5. ACTIONS TAB: Info banner + 3 priority actions
actions_tab_content = """
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
"""
content = re.sub(r'\{\/\* ─── SUB-TAB 08: ACTIONS ───────────────────────────────────── \*\/\}\n\s*\{activeSubTab === \'actions\' && \([\s\S]*?<\/div>\n\s*\)\}', '{/* ─── SUB-TAB 08: ACTIONS ───────────────────────────────────── */}\n            {activeSubTab === \'actions\' && (\n' + actions_tab_content + '\n            )}', content)


# 6. NETWORK TAB: Interactive actor network visualization
network_tab_content = """
              <div>
                <div className="sd-card" style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>EVENT CAUSALITY GRAPH</div>
                  
                  <div style={{ height: '400px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                    <svg width="100%" height="100%" viewBox="0 0 600 400">
                      {/* Edges */}
                      <line x1="300" y1="200" x2="150" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                      <line x1="300" y1="200" x2="450" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                      <line x1="300" y1="200" x2="150" y2="300" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                      <line x1="300" y1="200" x2="450" y2="300" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                      <line x1="300" y1="200" x2="300" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

                      {/* Nodes */}
                      <circle cx="300" cy="200" r="30" fill="#10b981" />
                      <text x="300" y="200" fill="#fff" fontSize="12" textAnchor="middle" dominantBaseline="middle">Situation</text>

                      <circle cx="150" cy="100" r="24" fill="#ef4444" />
                      <text x="150" y="140" fill="#ef4444" fontSize="11" textAnchor="middle">Community Nets</text>

                      <circle cx="450" cy="100" r="24" fill="#f97316" />
                      <text x="450" y="140" fill="#f97316" fontSize="11" textAnchor="middle">Political Party</text>

                      <circle cx="150" cy="300" r="24" fill="#8b5cf6" />
                      <text x="150" y="340" fill="#8b5cf6" fontSize="11" textAnchor="middle">Police (SAPS)</text>

                      <circle cx="450" cy="300" r="24" fill="#00e5ff" />
                      <text x="450" y="340" fill="#00e5ff" fontSize="11" textAnchor="middle">Affected Business</text>
                      
                      <circle cx="300" cy="60" r="24" fill="#8b5cf6" />
                      <text x="300" y="100" fill="#8b5cf6" fontSize="11" textAnchor="middle">Civil Society</text>
                    </svg>

                    <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}/> Primary</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }}/> Amplifier</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }}/> Responder</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5ff', display: 'inline-block' }}/> Affected</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { name: 'Community Nets', role: 'Primary Driver', impact: 'High' },
                    { name: 'Political Party', role: 'Narrative Amplifier', impact: 'Medium' },
                    { name: 'Police (SAPS)', role: 'Containment', impact: 'High' },
                    { name: 'Civil Society', role: 'De-escalation', impact: 'Low' }
                  ].map(a => (
                    <div key={a.name} className="sd-card">
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '4px' }}>{a.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role: {a.role} | Impact: {a.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
"""
content = re.sub(r'\{\/\* ─── SUB-TAB: NETWORK ──────────────────────────────────────── \*\/\}\n\s*\{activeSubTab === \'network\' && \([\s\S]*?<\/div>\n\s*\)\}', '{/* ─── SUB-TAB: NETWORK ──────────────────────────────────────── */}\n            {activeSubTab === \'network\' && (\n' + network_tab_content + '\n            )}', content)


# 7. EVIDENCE TAB: Full accordion-based evidence view
evidence_tab_content = """
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>EVIDENCE STATUS DISTRIBUTION</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { label: '✓ Observed', count: 4, color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.4)', bg: 'rgba(16,185,129,0.06)' },
                    { label: '? Reported', count: 3, color: '#fde047', borderColor: 'rgba(245,158,11,0.4)', bg: 'rgba(245,158,11,0.06)' },
                    { label: '✕ Disputed', count: 1, color: '#ef4444' },
                    { label: '? Unverified', count: 2, color: '#3b82f6' },
                  ].map(ev => (
                    <div key={ev.label} className="sd-card" style={ev.borderColor ? { border: `1px solid ${ev.borderColor}`, background: ev.bg } : {}}>
                      <div style={{ fontSize: '0.8rem', color: ev.color, fontWeight: 700 }}>{ev.label}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{ev.count}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button style={{ background: 'var(--accent-teal-active)', border: '1px solid rgba(0,229,255,0.4)', color: '#00e5ff', padding: '6px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>Events (4)</button>
                  <button style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '6px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>Claims (3)</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { status: '✓', title: 'Road blockades on N3 highway', date: '22 Jul 2026', loc: 'Johannesburg', type: 'Disruption', expanded: true },
                    { status: '?', title: 'Looting of foreign-owned shops', date: '21 Jul 2026', loc: 'Durban', type: 'Violence', expanded: false },
                    { status: '✓', title: 'Police deployment to Soweto', date: '21 Jul 2026', loc: 'Soweto', type: 'Response', expanded: false },
                    { status: '✓', title: 'Political rally calling for action', date: '20 Jul 2026', loc: 'Cape Town', type: 'Mobilisation', expanded: false },
                  ].map((ev, i) => (
                    <div key={i} className="sd-card" style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: ev.status === '✓' ? '#10b981' : '#f59e0b', fontWeight: 800, fontSize: '1.2rem' }}>{ev.status}</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{ev.title}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{ev.date} · {ev.loc}</span>
                        </div>
                        <span className="badge badge-tag" style={{ color: '#fff' }}>{ev.type}</span>
                      </div>
                      {ev.expanded && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <p style={{ marginBottom: '8px' }}>Protesters have blocked major intersections along the N3, causing significant delays. Verified by traffic cameras and local news reports.</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Actors: Community Nets, SAPS</span>
                            <a href="#" style={{ color: '#00e5ff', textDecoration: 'none' }}>View Source ↗</a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="sd-card" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  📑 Every intelligence assessment in SignalDesk is traceable to its source. "Observed" means directly verified. "Reported" means from a credible source without independent verification.
                </div>
              </div>
"""
content = re.sub(r'\{\/\* ─── SUB-TAB: EVIDENCE ─────────────────────────────────────── \*\/\}\n\s*\{activeSubTab === \'evidence\' && \([\s\S]*?<\/div>\n\s*\)\}', '{/* ─── SUB-TAB: EVIDENCE ─────────────────────────────────────── */}\n            {activeSubTab === \'evidence\' && (\n' + evidence_tab_content + '\n            )}', content)


# 8. MY EXPOSURE PAGE
exposure_page_content = """
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>My Exposure</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Assess how active intelligence situations affect your organisation's operational footprint.</p>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                  5 assets · 4 active situations · <span style={{ color: '#ef4444', fontWeight: 700 }}>4 exposures critical/high</span>
                </div>
              </div>
              <button onClick={() => setProfileModalOpen(true)} style={{ background: 'var(--accent-teal-active)', border: '1px solid rgba(0,229,255,0.4)', color: '#00e5ff', borderRadius: '8px', padding: '8px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit size={16} /> Edit Profile
              </button>
            </div>

            <div className="sub-nav-tabs" style={{ marginBottom: '24px' }}>
              <div className="sub-tab-item active">Overview</div>
              <div className="sub-tab-item">Assets (5)</div>
              <div className="sub-tab-item">Recommendations (6)</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
              <div>
                <div className="sd-card" style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>ORGANISATION PROFILE</div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{orgProfile.name}</h3>
                  <div style={{ fontSize: '0.88rem', color: '#00e5ff', marginBottom: '8px' }}>{orgProfile.industry}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Countries: {orgProfile.countries}</div>
                </div>

                <div className="sd-card">
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>RISK MATRIX</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#fff' }}>Social Mobilisation</span>
                      <span style={{ color: '#ef4444' }}>● Critical</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#fff' }}>DRC Security</span>
                      <span style={{ color: '#f59e0b' }}>● High</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#fff' }}>Fuel Subsidy</span>
                      <span style={{ color: '#f59e0b' }}>● High</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#fff' }}>Kenya Tensions</span>
                      <span style={{ color: '#fde047' }}>● Medium</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>EXPOSURE DETAIL</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="sd-card" style={{ border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>Social Mobilisation</span>
                      <span className="badge badge-critical">Critical Exposure</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Worsening trajectory directly affecting 3 assets.</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Matched Assets:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span className="badge badge-tag" style={{ color: '#fff' }}>🏢 Johannesburg Office</span>
                      <span className="badge badge-tag" style={{ color: '#fff' }}>🚢 Durban Logistics</span>
                      <span className="badge badge-tag" style={{ color: '#fff' }}>🏠 Cape Town Staff</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Exposure Pathways: Operational Disruption, Staff Safety</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Assets (5)</h3>
                <button style={{ background: '#00e5ff', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>+ Add Asset</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { name: 'Johannesburg Operations Hub', type: 'Office', loc: 'South Africa' },
                  { name: 'Durban Export Terminal', type: 'Logistics', loc: 'South Africa' },
                  { name: 'Lagos Regional Office', type: 'Office', loc: 'Nigeria' },
                  { name: 'Kinshasa Project Site', type: 'Project', loc: 'DRC' },
                  { name: 'Cape Town Staff Accommodation', type: 'Staff', loc: 'South Africa' },
                ].map(asset => (
                  <div key={asset.name} className="sd-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{asset.name}</span>
                      <span className="badge badge-tag" style={{ color: '#00e5ff' }}>{asset.type}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Location: {asset.loc}</div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Edit size={14} color="var(--text-dim)" />
                      <X size={14} color="var(--text-dim)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Recommendations (6)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="sd-card">
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>P1 IMMEDIATE ACTION (2)</div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>Issue staff safety advisory for South Africa</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Who: HR/Security | When: Within 24h</div>
                    <span className="badge badge-tag" style={{ color: '#ef4444' }}>Social Mobilisation</span>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>Enhance security at Kinshasa site</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Who: Site Manager | When: Within 24h</div>
                    <span className="badge badge-tag" style={{ color: '#f59e0b' }}>DRC Security</span>
                  </div>
                </div>

                <div className="sd-card">
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>P2 WITHIN 48 HOURS (2)</div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>Audit alternative routing for logistics</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Who: Operations | When: 48h</div>
                    <span className="badge badge-tag" style={{ color: '#ef4444' }}>Social Mobilisation</span>
                  </div>
                </div>

                <div className="sd-card">
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fde047', marginBottom: '8px' }}>P3 ROUTINE (2)</div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>Review fuel supply contingencies in Lagos</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Who: Facility Manager | When: Weekly</div>
                    <span className="badge badge-tag" style={{ color: '#f59e0b' }}>Fuel Subsidy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
"""
content = re.sub(r'\{\/\* ═══ VIEW 4: MY EXPOSURE ══════════════════════════════════════ \*\/\}\n\s*\{currentView === \'exposure\' && \([\s\S]*?<\/div>\n\s*\)\}', '{/* ═══ VIEW 4: MY EXPOSURE ══════════════════════════════════════ */}\n        {currentView === \'exposure\' && (\n' + exposure_page_content + '\n        )}', content)


# 9. SCENARIOS TAB: Add Scenario D
scenario_d = """    {
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
  ];"""
content = content.replace('    },\n  ];', '    },\n' + scenario_d)


# 10. WHERE TAB: Schematic map
where_tab_content = """
              <div>
                <div className="sd-card" style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>GEOGRAPHIC INTELLIGENCE (SPATIAL CANVASES)</div>
                  <div style={{ height: '350px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                    <svg width="100%" height="100%" viewBox="0 0 400 350">
                      {/* South Africa Polygon approximation */}
                      <polygon points="50,150 150,50 300,50 350,150 320,250 200,300 100,280" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                      
                      {/* Markers */}
                      <circle cx="280" cy="120" r="8" fill="#ef4444" cursor="pointer" />
                      <text x="280" y="140" fill="#fff" fontSize="10" textAnchor="middle">Johannesburg (Origin)</text>
                      
                      <circle cx="270" cy="100" r="4" fill="#6b7280" />
                      <text x="270" y="90" fill="#6b7280" fontSize="10" textAnchor="middle">Pretoria</text>

                      <circle cx="330" cy="180" r="6" fill="#f59e0b" cursor="pointer" />
                      <text x="330" y="200" fill="#fff" fontSize="10" textAnchor="middle">Durban (Spread)</text>

                      <circle cx="120" cy="270" r="6" fill="#f59e0b" cursor="pointer" />
                      <text x="120" y="290" fill="#fff" fontSize="10" textAnchor="middle">Cape Town (Spread)</text>
                    </svg>
                    
                    <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '4px', fontSize: '0.75rem', color: '#fff', display: 'flex', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} /> Origin</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} /> Spread</span>
                    </div>
                  </div>
                </div>
                <div className="sd-card">
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>ACTIVE LOCATIONS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { name: 'Johannesburg', role: 'Origin · South Africa', events: 28, color: '#ef4444' },
                      { name: 'Durban', role: 'Spread · South Africa', events: 11, color: '#f59e0b' },
                      { name: 'Cape Town', role: 'Spread · South Africa', events: 8, color: '#f59e0b' },
                    ].map(loc => (
                      <div key={loc.name} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>● {loc.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{loc.role}</div>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: loc.color, fontWeight: 700 }}>{loc.events} events ↗</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
"""
content = re.sub(r'\{\/\* ─── SUB-TAB 03: WHERE ─────────────────────────────────────── \*\/\}\n\s*\{activeSubTab === \'where\' && \([\s\S]*?<\/div>\n\s*\)\}', '{/* ─── SUB-TAB 03: WHERE ─────────────────────────────────────── */}\n            {activeSubTab === \'where\' && (\n' + where_tab_content + '\n            )}', content)


with open(filepath, 'w') as f:
    f.write(content)
print("Patched successfully")
