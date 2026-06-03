const AIFloatingPanel = () => {
  return (
    <div id="ai-panel" className="hidden">
        <div className="ai-panel-head" id="panel-head">
            <i className="ti ti-robot"></i>
            <span className="ai-panel-title" id="panel-title">AI Assistant</span>
            <span id="panel-role-chip" style={{ marginleft: 'auto', marginright: '6px', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: 'rgba(255,255,255,.25)' }}></span>
            <button className="ai-panel-close" ><i className="ti ti-x"></i></button>
        </div>
        {/* <!-- small access notice inside panel --> */}
        <div id="panel-notice" style={{ display: 'none', padding: '7px 12px', fontSize: '11px', borderBottom: '1px solid var(--border)', alignItems: 'center', gap: '6px' }}></div>
        <div className="ai-msgs" id="panel-msgs"></div>
        <div className="ai-chips" ></div>
        <div className="ai-input-row">
            <textarea id="panel-input" rows="1" placeholder="Ask a question…" ></textarea>
            <button className="ai-send-btn" id="panel-send-btn"><i className="ti ti-send"></i></button>
        </div>
    </div>
  )
}

export default AIFloatingPanel