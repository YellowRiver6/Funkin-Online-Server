import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Mods.css';

const Mods = () => {
    const [activeTab, setActiveTab] = useState('mods');
    const [modsData, setModsData] = useState([]);
    const [skinsData, setSkinsData] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [modsRes, skinsRes] = await Promise.all([
                    fetch('/api/mods'),
                    fetch('/api/skins')
                ]);

                if (!modsRes.ok) throw new Error('Get mods error: ' + modsRes.status);
                if (!skinsRes.ok) throw new Error('Get skins error: ' + skinsRes.status);

                const modsJson = await modsRes.json();
                const skinsJson = await skinsRes.json();

                const mods = (modsJson.mods || []).map(item => ({
                    name: item.name || '',
                    url: item.url || '',
                    has_link: !!item.url
                }));

                const skins = (skinsJson.mods || []).map(item => ({
                    name: item.name || '',
                    url: item.url || '',
                    has_link: !!item.url
                }));

                setModsData(mods);
                setSkinsData(skins);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const currentData = activeTab === 'mods' ? modsData : skinsData;

    const filtered = useMemo(() => {
        if (!query.trim()) return currentData;
        const q = query.toLowerCase();
        return currentData.filter(item =>
            item.name.toLowerCase().includes(q)
        );
    }, [currentData, query]);

    const highlightText = useCallback((text, q) => {
        if (!q || !text) return text || '';
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = text.split(new RegExp('(' + escaped + ')', 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === q.toLowerCase() ?
                <span key={i} className="mods-highlight">{part}</span> : part
        );
    }, []);

    const copyLink = useCallback(async (url, name) => {
        try {
            await navigator.clipboard.writeText(url);
            alert(`「${name}」下载链接已复制！`);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = url;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert(`「${name}」下载链接已复制！`);
        }
    }, []);

    if (loading) {
        return (
            <div className="mods-loading">
                <div className="mods-spinner"></div>
                <p>正在加载数据...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mods-error">
                <p>加载失败: {error}</p>
                <button onClick={() => window.location.reload()}>重试</button>
            </div>
        );
    }

    return (
        <div className="mods-container">
            <div className="mods-header">
                <h1>{activeTab === 'mods' ? '🔍 Mods' : '🔍 Skins'}</h1>
                <p>Psych Online Download Center</p>
            </div>

            <div className="mods-tabs">
                <button
                    className={activeTab === 'mods' ? 'active' : ''}
                    onClick={() => { setActiveTab('mods'); setQuery(''); }}
                >
                    Mods ({modsData.length})
                </button>
                <button
                    className={activeTab === 'skins' ? 'active' : ''}
                    onClick={() => { setActiveTab('skins'); setQuery(''); }}
                >
                    Skins ({skinsData.length})
                </button>
            </div>

            <div className="mods-search-box">
                <input
                    type="text"
                    className="mods-search-input"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={`Search ${activeTab}...`}
                    autoFocus
                />
                <span className="mods-search-icon">🔍</span>
            </div>

            <div className="mods-stats">
                <div>Total <span>{currentData.length}</span> {activeTab}</div>
                <div>Downloadable <span>{currentData.filter(m => m.has_link).length}</span></div>
            </div>

            <div className="mods-list">
                {filtered.map((item, idx) => (
                    <div
                        key={idx}
                        className={`mod-card ${!item.has_link ? 'no-link' : ''}`}
                        onClick={() => item.has_link && copyLink(item.url, item.name)}
                    >
                        <div className="mod-info">
                            <div className="mod-name">
                                {highlightText(item.name, query)}
                            </div>
                        </div>
                        <div className="mod-actions">
                            {item.has_link ? (
                                <a
                                    href={item.url}
                                    className="mod-download-btn"
                                    onClick={e => e.stopPropagation()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    ⬇ Download
                                </a>
                            ) : (
                                <span className="mod-no-link">No Link</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="mods-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p>No matching {activeTab} found</p>
                </div>
            )}
        </div>
    );
};

export default Mods;
