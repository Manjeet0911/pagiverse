import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FileText, Upload, Sparkles, Calendar, BookOpen, 
  Layers, HelpCircle, CheckCircle2, AlertTriangle, 
  Download, RefreshCw, ChevronRight, Copy, Check,
  Maximize2, Minimize2, ArrowRight, Info, Search, FileDown
} from 'lucide-react';
import './App.css';

// 🚀 NATIVE RE-VERIFIED PRODUCTION LIVE BACKEND CLUSTER ENDPOINT
const API_BASE_URL = "https://pagiverse.onrender.com";

// --- ORIGINAL INTERACTIVE FLASHCARD CARD SUB-SYSTEM ---
function Flashcard({ question, answer }) {
  const [flipped, setFlipped] = useState(false);
  
  return (
    <div 
      className={`flashcard-item ${flipped ? 'flipped' : ''}`} 
      onClick={() => setFlipped(!flipped)}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="card-badge">QUESTION BLOCK</div>
          <p className="card-text-primary">{question}</p>
          <div className="flip-hint-tag">Tap Card to Flip 🔄</div>
        </div>
        <div className="flashcard-back">
          <div className="card-badge ans-badge">AI ANSWER RESOLUTION</div>
          <p className="card-text-secondary">{answer}</p>
          <div className="flip-hint-tag">Tap Card to Return 🔄</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  // --- COMPLETE RAW INDUSTRIAL STATE ENGINE ---
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [copiedText, setCopiedText] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedPageFilter, setSelectedPageFilter] = useState('all');
  
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  // --- HIGH DENSITY MULTI-STAGE STEP PROGRESS LOGS ---
  const stages = [
    "Establishing handshake with production container cluster...",
    "Streaming raw binary buffers via multipart network layer...",
    "Reading layout matrix and running structural bounds calculation...",
    "Isolating textual streams from individual page blocks...",
    "Executing single-shot injection into Gemini-2.5-Flash core pipeline...",
    "Parsing high-density abstract academic content configurations...",
    "Generating deep insights matrix and matching chronological dates...",
    "Validating historian quotes, structural acts, and statutory laws...",
    "Formatting dynamic JSON model to construct interactive flashcards...",
    "Final structural audit completed. Rendering dashboard viewport..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev === stages.length - 1 ? prev : prev + 1));
      }, 4500);
    } else {
      setLoadingStage(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // --- NATIVE DRAG AND DROP HANDLERS LAYER ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Bhai, strict parsing ke liye sirf PDF file hi validate hogi!");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // --- PIPELINE EXECUTION ENGINE ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Bhai, operational pipeline run karne ke liye file toh chuno!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setUploadProgress(10);
    setData(null);

    try {
      // Stream directly into verified cloud runtime infrastructure
      const response = await axios.post(`${API_BASE_URL}/api/process-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Distribute initial load visual metrics safely
          setUploadProgress(10 + Math.round(percentCompleted * 0.4));
        }
      });
      
      setUploadProgress(75);
      
      // Secondary server processing load interpolation simulation
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressTimer);
            return prev;
          }
          return prev + 2;
        });
      }, 500);

      setData(response.data);
      clearInterval(progressTimer);
      setUploadProgress(100);
      
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);

    } catch (error) {
      console.error("Critical Execution Interruption:", error);
      alert("Pipeline Execution Exception. Verify if the Render instance cloud container has warmed up properly.");
    } finally {
      setLoading(false);
    }
  };

  // --- SYSTEM TRANSLATION UTILS: FILE EXPORT & CLIPBOARD EXTRACTION ---
  const exportToJson = () => {
    if (!data) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `${file.name.replace('.pdf', '')}_pagiverse_analytics.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyTabContent = () => {
    let textToCopy = "";
    if (activeTab === 'summary') textToCopy = data.summary;
    else if (activeTab === 'key_points') textToCopy = data.key_points?.join('\n') || "";
    else if (activeTab === 'timeline') textToCopy = data.timeline_dates?.join('\n') || "";
    else if (activeTab === 'quotes') textToCopy = data.historians_quotes?.join('\n') || "";
    else if (activeTab === 'cheat_sheet') textToCopy = data.cheat_sheet?.join('\n') || "";

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  // --- ADVANCED ARRAY CLIENT SEARCH FILTERS ---
  const filterArrayData = (arr) => {
    if (!arr) return [];
    let processedArr = [...arr];
    
    // Exact structural chronological filter match
    if (searchQuery.trim() !== '') {
      processedArr = processedArr.filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return processedArr;
  };

  // --- GENERATE DYNAMIC PAGE DROPDOWN FROM SUMMARY Headings ---
  const getPageOptions = () => {
    if (!data || !data.summary) return [];
    const logs = data.summary.split('\n\n');
    const options = [];
    logs.forEach(block => {
      if (block.trim().startsWith('### Page')) {
        const header = block.split('\n')[0].replace('### ', '').trim();
        options.push(header);
      }
    });
    return options;
  };

  return (
    <div className={`pagiverse-app-root ${fullscreenMode ? 'forced-fullscreen' : ''}`}>
      
      {/* 🌌 HERO PREMIUM BRANDING NODE */}
      <header className="premium-header">
        <div className="branding-node">
          <div className="pulse-logo">
            <Sparkles className="logo-spark" />
          </div>
          <div className="branding-text">
            <h1>Pagiverse <span className="v-tag">Engine v1.0 Live</span></h1>
            <p>Enterprise Academic Analytics Platform • University Core Text Parsing Node</p>
          </div>
        </div>
        <div className="cluster-status-pill">
          <span className="pulse-indicator success-pulse"></span>
          Production Cluster Sync Active
        </div>
      </header>

      {/* 📥 DYNAMIC DATA INJECTION MATRIX */}
      <section className="workspace-container">
        <div className="control-card-wrapper">
          <div 
            className={`drag-drop-zone ${dragActive ? 'active-drop' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden-file-input" 
              accept=".pdf"
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="file-meta-view">
                <div className="icon-wrapper-glow">
                  <FileText className="file-icon-glow" />
                </div>
                <div className="meta-details">
                  <h3>{file.name}</h3>
                  <p>{(file.size / (1024 * 1024)).toFixed(2)} MB • Binary Stream Allocated</p>
                </div>
                <button className="reset-file-btn" onClick={(e) => { e.stopPropagation(); setFile(null); setData(null); }}>
                  Purge Asset
                </button>
              </div>
            ) : (
              <div className="empty-prompt-view">
                <Upload className="upload-icon-bounce" />
                <h3>Feed your Academic Textbook PDF into the engine</h3>
                <p>Drag & Drop or click to scan multi-layer system architecture storage</p>
                <div className="limit-warning-badge">
                  <Info size={13} /> Context Envelope Threshold: Up to 300+ Pages Single-Shot Bounds
                </div>
              </div>
            )}
          </div>

          {file && !data && !loading && (
            <button className="action-trigger-btn-premium" onClick={handleUpload}>
              Initialize Deep AI Structural Processing <ArrowRight size={18} />
            </button>
          )}

          {/* ⚡ ACTIVE COMPILATION PROGRESS PANEL */}
          {loading && (
            <div className="premium-loader-card">
              <div className="progress-track-wrapper">
                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                <span className="progress-percentage-label">{uploadProgress}%</span>
              </div>
              <div className="spinner-orbit">
                <RefreshCw className="animate-spin-heavy" />
              </div>
              <h3>Analyzing Document Vector Architecture</h3>
              <p className="dynamic-stage-logger">Pipeline Event: {stages[loadingStage]}</p>
              <div className="do-not-close-warning">
                <AlertTriangle size={14} /> Critical Pipeline Active: Do not reload workspace or disconnect server hooks.
              </div>
            </div>
          )}
        </div>

        {/* 📊 CORE RESULTS ANALYSIS INTERFACE MODULE */}
        {data && (
          <div ref={resultsRef} className="analytics-workspace-node animate-fade-in">
            
            {/* TOOLBAR MANAGEMENT ARCHITECTURE */}
            <div className="workspace-toolbar">
              <div className="document-identity">
                <CheckCircle2 className="success-icon" />
                <div className="identity-text-wrapper">
                  <h4>Analysis Engine Scope Execution Succeeded</h4>
                  <p className="sub-scope-text">Engine: Gemini-2.5-Flash • Target: Text Isolation Framework</p>
                </div>
              </div>
              
              <div className="utility-action-group">
                <div className="search-box-wrapper">
                  <Search size={16} className="search-embedded-icon" />
                  <input 
                    type="text" 
                    placeholder="Search inside specific active workspace indexes..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="internal-search-input"
                  />
                </div>
                
                {activeTab === 'summary' && (
                  <div className="page-dropdown-wrapper">
                    <select 
                      value={selectedPageFilter} 
                      onChange={(e) => setSelectedPageFilter(e.target.value)}
                      className="page-select-dropdown"
                    >
                      <option value="all">📁 All Page Indices</option>
                      {getPageOptions().map((pageOpt, i) => (
                        <option key={i} value={pageOpt}>{pageOpt}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button className="utility-btn" onClick={copyTabContent} title="Extract Active Tab Context">
                  {copiedText ? <Check className="text-green" size={16} /> : <Copy size={16} />}
                  <span>{copiedText ? "Copied!" : "Copy Stream"}</span>
                </button>
                
                <button className="utility-btn download-premium-btn" onClick={exportToJson} title="Export Structural Mapping Model to Local JSON">
                  <FileDown size={16} />
                  <span>Export JSON</span>
                </button>
                
                <button className="utility-btn mode-toggle-btn" onClick={() => setFullscreenMode(!fullscreenMode)} title="Toggle Fullscreen Workspace Matrix">
                  {fullscreenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>

            <div className="workspace-layout-grid">
              
              {/* SIDEBAR NAVIGATION SYSTEM */}
              <aside className="workspace-sidebar">
                <button className={`nav-pill-item ${activeTab === 'summary' ? 'selected' : ''}`} onClick={() => setActiveTab('summary')}>
                  <FileText size={18} />
                  <div className="pill-text">
                    <span>Page Summaries</span>
                    <small>Granular page index bounds</small>
                  </div>
                  <ChevronRight size={14} className="arrow-marker" />
                </button>

                <button className={`nav-pill-item ${activeTab === 'key_points' ? 'selected' : ''}`} onClick={() => setActiveTab('key_points')}>
                  <BookOpen size={18} />
                  <div className="pill-text">
                    <span>Deep Insights Matrix</span>
                    <small>Micro factual core metrics</small>
                  </div>
                  <ChevronRight size={14} className="arrow-marker" />
                </button>

                <button className={`nav-pill-item ${activeTab === 'timeline' ? 'selected' : ''}`} onClick={() => setActiveTab('timeline')}>
                  <Calendar size={18} />
                  <div className="pill-text">
                    <span>Timeline & Chronology</span>
                    <small>Date historical structures</small>
                  </div>
                  <ChevronRight size={14} className="arrow-marker" />
                </button>

                <button className={`nav-pill-item ${activeTab === 'quotes' ? 'selected' : ''}`} onClick={() => setActiveTab('quotes')}>
                  <Layers size={18} />
                  <div className="pill-text">
                    <span>Quotes, Laws & Acts</span>
                    <small>Verbatim high weightage indices</small>
                  </div>
                  <ChevronRight size={14} className="arrow-marker" />
                </button>

                <button className={`nav-pill-item ${activeTab === 'cheat_sheet' ? 'selected' : ''}`} onClick={() => setActiveTab('cheat_sheet')}>
                  <Sparkles size={18} />
                  <div className="pill-text">
                    <span>Exam Cheat-Sheet</span>
                    <small>High weightage formula blocks</small>
                  </div>
                  <ChevronRight size={14} className="arrow-marker" />
                </button>

                <button className={`nav-pill-item ${activeTab === 'flashcards' ? 'selected' : ''}`} onClick={() => setActiveTab('flashcards')}>
                  <HelpCircle size={18} />
                  <div className="pill-text">
                    <span>Active Flashcards</span>
                    <small>Interactive self-testing metrics</small>
                  </div>
                  <div className="count-badge-sidebar">{data.flashcards?.length || 0}</div>
                </button>
              </aside>

              {/* STABLE INTERACTIVE DATA VIEWPORT VIEW MATRIX */}
              <main className="workspace-data-viewport">
                
                {/* TAB ONE: EXTENDED MARKDOWN SUMMARY EXTRACTOR */}
                {activeTab === 'summary' && (
                  <div className="viewport-inner-card markdown-rendering-engine">
                    {data.summary ? (
                      (() => {
                        const paragraphs = data.summary.split('\n\n');
                        let currentHeading = "";
                        const renderedBlocks = [];

                        paragraphs.forEach((paragraph, idx) => {
                          if (paragraph.trim().startsWith('### Page')) {
                            currentHeading = paragraph.split('\n')[0].replace('### ', '').trim();
                          }

                          // Selected specific dynamic dropdown lookup evaluation
                          if (selectedPageFilter === 'all' || currentHeading === selectedPageFilter) {
                            if (paragraph.trim().startsWith('### Page')) {
                              renderedBlocks.push(<h3 key={`h-${idx}`} className="page-summary-header-node">{paragraph.replace('### ', '')}</h3>);
                            } else if (paragraph.trim() !== '') {
                              // Filter query evaluation inside page summary texts
                              if (searchQuery === '' || paragraph.toLowerCase().includes(searchQuery.toLowerCase())) {
                                renderedBlocks.push(<p key={`p-${idx}`} className="page-summary-text-block">{paragraph}</p>);
                              }
                            }
                          }
                        });

                        return renderedBlocks.length > 0 ? renderedBlocks : <div className="null-state-handler">No summary blocks matches your filter logic query bounds.</div>;
                      })()
                    ) : (
                      <div className="null-state-handler">No structural summary distributions unallocated.</div>
                    )}
                  </div>
                )}

                {/* TAB TWO: HIGH INTENSITY DEEP INSIGHTS METRICS BULLETS */}
                {activeTab === 'key_points' && (
                  <div className="viewport-inner-card">
                    <ul className="premium-bullets-container">
                      {filterArrayData(data.key_points).map((item, idx) => (
                        <li key={idx} className="bullet-node-item">
                          <span className="bullet-bullet-point"></span>
                          <p className="bullet-node-text">{item}</p>
                        </li>
                      ))}
                      {filterArrayData(data.key_points).length === 0 && (
                        <div className="null-state-handler">No micro data insight parameters matched your filter logic.</div>
                      )}
                    </ul>
                  </div>
                )}

                {/* TAB THREE: ABSOLUTE CHRONOLOGICAL TIME AND DATES AXIS GRID */}
                {activeTab === 'timeline' && (
                  <div className="viewport-inner-card timeline-axis-wrapper">
                    {data.timeline_dates && data.timeline_dates.length > 0 ? (
                      <div className="vertical-timeline-line">
                        {filterArrayData(data.timeline_dates).map((dateEvent, idx) => (
                          <div key={idx} className="timeline-event-card-node animate-fade-in">
                            <div className="timeline-node-dot"></div>
                            <div className="timeline-event-content-box">
                              <p className="timeline-event-text-data">{dateEvent}</p>
                            </div>
                          </div>
                        ))}
                        {filterArrayData(data.timeline_dates).length === 0 && (
                          <div className="null-state-handler">No chronological events found corresponding to your lookup constraint.</div>
                        )}
                      </div>
                    ) : (
                      <div className="null-state-handler">No structural sequential timeline entries isolated from this document layer.</div>
                    )}
                  </div>
                )}

                {/* TAB FOUR: VERBATIM HISTORIAN COGNITIVE QUOTES / STATUTORY ACT MATRIX */}
                {activeTab === 'quotes' && (
                  <div className="viewport-inner-card quotes-panel-view">
                    {data.historians_quotes && data.historians_quotes.length > 0 ? (
                      <div className="quotes-layout-masonry">
                        {filterArrayData(data.historians_quotes).map((quoteText, idx) => (
                          <div key={idx} className="premium-quote-card">
                            <span className="quote-styling-bracket">“</span>
                            <p className="raw-quote-string-data">{quoteText}</p>
                          </div>
                        ))}
                        {filterArrayData(data.historians_quotes).length === 0 && (
                          <div className="null-state-handler">No index matches your specific query bounds.</div>
                        )}
                      </div>
                    ) : (
                      <div className="null-state-handler">No verbatim statement indices or institutional acts identified by parser bounds.</div>
                    )}
                  </div>
                )}

                {/* TAB FIVE: CORE EXAM CHEAT SHEET HIGH WEIGHTAGE INDICES COMPILATION */}
                {activeTab === 'cheat_sheet' && (
                  <div className="viewport-inner-card cheat-sheet-matrix-view">
                    <ul className="premium-bullets-container cheat-list">
                      {data.cheat_sheet && data.cheat_sheet.length > 0 ? (
                        filterArrayData(data.cheat_sheet).map((cheatPoint, idx) => (
                          <li key={idx} className="bullet-node-item cheat-node">
                            <span className="bullet-bullet-point cheat-dot"></span>
                            <p className="cheat-node-text-data">{cheatPoint}</p>
                          </li>
                        ))
                      ) : (
                        /* Robust programmatic fallback if specific sub-array bounds are unallocated */
                        filterArrayData(data.key_points?.slice(0, 10) || []).map((backupPoint, idx) => (
                          <li key={idx} className="bullet-node-item cheat-node">
                            <span className="bullet-bullet-point cheat-dot"></span>
                            <p className="cheat-node-text-data">{backupPoint}</p>
                          </li>
                        ))
                      )}
                      {data.cheat_sheet?.length === 0 && data.key_points?.length === 0 && (
                        <div className="null-state-handler">High weightage formula distribution unallocated.</div>
                      )}
                    </ul>
                  </div>
                )}

                {/* TAB SIX: INTERACTIVE GRAPHICAL CARDS MATRIX INTERFACE */}
                {activeTab === 'flashcards' && (
                  <div className="viewport-inner-card flashcards-layout-viewport">
                    {data.flashcards && data.flashcards.length > 0 ? (
                      (() => {
                        const filteredCards = data.flashcards.filter(card => 
                          card.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          card.answer.toLowerCase().includes(searchQuery.toLowerCase())
                        );

                        return filteredCards.length > 0 ? (
                          <div className="interactive-cards-grid-matrix">
                            {filteredCards.map((cardItem, idx) => (
                              <Flashcard 
                                key={idx} 
                                question={cardItem.question} 
                                answer={cardItem.answer} 
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="null-state-handler">No interactive cards matched your filter parameter metrics.</div>
                        );
                      })()
                    ) : (
                      <div className="null-state-handler">Flashcard layout registry mapping unallocated.</div>
                    )}
                  </div>
                )}

              </main>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;