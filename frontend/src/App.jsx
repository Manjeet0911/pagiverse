import React, { useState } from 'react';
import axios from 'axios';
import Flashcard from './components/Flashcard';
import './App.css';

// 🚀 PRODUCTION LIVE BACKEND URL CONFIGURATION
const API_BASE_URL = "https://pagiverse.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Bhai, pehle koi PDF file toh select karo!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setData(null);

    try {
      // Live Render backend par request ja rahi hai
      const response = await axios.post(`${API_BASE_URL}/api/process-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setData(response.data);
    } catch (error) {
      console.error("Pipeline Exception:", error);
      alert("Oops! Backend se connect karne mein dikkat hui. Ek baar check karo Render active hai ya nahi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🌌 Pagiverse <span className="badge">Engine v1 Live</span></h1>
        <p>Apni textbook PDF upload karo aur Gemini AI se instant page-wise summaries, timeline aur flashcards nikalo!</p>
      </header>

      <main className="main-content">
        {/* Upload Section */}
        <section className="upload-section">
          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-input-wrapper">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                id="pdf-file"
              />
              <label htmlFor="pdf-file" className="custom-file-label">
                {file ? file.name : "📁 Choose Textbook PDF"}
              </label>
            </div>
            <button type="submit" className="btn-upload" disabled={loading}>
              {loading ? "Processing Block Active..." : "⚡ Run AI Analytics"}
            </button>
          </form>
        </section>

        {/* Loading Spinner */}
        {loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Gemini Engine complete text structural data isolate kar raha hai... Thoda sa wait karo bhai!</p>
          </div>
        )}

        {/* Dashboard Results Section */}
        {data && (
          <div className="dashboard-wrapper">
            <nav className="tab-navigation">
              <button 
                className={activeTab === 'summary' ? 'tab-btn active' : 'tab-btn'} 
                onClick={() => setActiveTab('summary')}
              >
                📝 Page Summaries
              </button>
              <button 
                className={activeTab === 'key_points' ? 'tab-btn active' : 'tab-btn'} 
                onClick={() => setActiveTab('key_points')}
              >
                💡 Deep Insights
              </button>
              <button 
                className={activeTab === 'timeline' ? 'tab-btn active' : 'tab-btn'} 
                onClick={() => setActiveTab('timeline')}
              >
                📅 Timeline & Dates
              </button>
              <button 
                className={activeTab === 'quotes' ? 'tab-btn active' : 'tab-btn'} 
                onClick={() => setActiveTab('quotes')}
              >
                📜 Quotes & Laws
              </button>
              <button 
                className={activeTab === 'flashcards' ? 'tab-btn active' : 'tab-btn'} 
                onClick={() => setActiveTab('flashcards')}
              >
                🃏 Flashcards ({data.flashcards?.length || 0})
              </button>
            </nav>

            <div className="tab-content-display">
              {activeTab === 'summary' && (
                <div className="summary-content markdown-body">
                  {data.summary ? (
                    data.summary.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
                  ) : (
                    <p>No summary blocks parsed.</p>
                  )}
                </div>
              )}

              {activeTab === 'key_points' && (
                <ul className="insights-list">
                  {data.key_points?.map((point, index) => (
                    <li key={index} className="insight-item">✨ {point}</li>
                  ))}
                </ul>
              )}

              {activeTab === 'timeline' && (
                <div className="timeline-container">
                  {data.timeline_dates?.length > 0 ? (
                    data.timeline_dates.map((dateStr, index) => (
                      <div key={index} className="timeline-card">
                        <p>{dateStr}</p>
                      </div>
                    ))
                  ) : (
                    <p>Document mein koi dates ya structural timeline nahi mili.</p>
                  )}
                </div>
              )}

              {activeTab === 'quotes' && (
                <ul className="quotes-list">
                  {data.historians_quotes?.map((quote, index) => (
                    <li key={index} className="quote-item"><blockquote>{quote}</blockquote></li>
                  ))}
                </ul>
              )}

              {activeTab === 'flashcards' && (
                <div className="flashcards-grid">
                  {data.flashcards?.map((card, index) => (
                    <Flashcard key={index} question={card.question} answer={card.answer} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;