import React from 'react'

const AIAssistant = () => {
  return (
    <div className="page" id="ai-assistant">
        <div className="ai-page-wrap">
          {/* <!-- Main chat --> */}
          <div className="ai-full-chat">
            {/* <!-- Header changes per role --> */}
            <div className="ai-full-head" id="ai-full-head">
              <i className="ti ti-robot"></i>
              <div>
                <div className="ai-full-title" id="ai-full-title">AI Assistant</div>
                <div className="ai-full-sub" id="ai-full-sub">Loading…</div>
              </div>
              {/* <!-- Role badge --> */}
              <div id="ai-role-badge" style={{"marginLeft" : "auto", "padding": "4px 12px", "borderRadius": "20px", "fontSize": "11px", "fontWeight": "700", "background": "rgba(255,255,255,.2)", "letterSpacing": ".05em"}}></div>
            </div>

            {/* <!-- Access notice banner (hidden for admin) --> */}
            <div id="ai-access-notice" style={{"display": "none", "padding": "9px 16px", "fontSize": "12px", "display": "flex", "alignItems": "center", "gap": "8px", "borderBottom": "1px solid var(--border)"}}>
              <i className="ti ti-shield-lock" style={{"fontSize": "15px", "flexShrink": "0"}}></i>
              <span id="ai-access-text"></span>
            </div>

            <div className="ai-full-msgs" id="full-msgs"></div>

            {/* <!-- Suggested chips — populated by JS --> */}
            <div className="ai-chips" id="full-chips"></div>

            <div className="ai-full-input">
              <textarea id="full-input" rows="1" placeholder="Ask a question…" ></textarea>
              <button className="ai-send-full" id="full-send-btn"><i className="ti ti-send"></i>Ask</button>
            </div>
          </div>

          {/* <!-- Right sidebar — populated by JS --> */}
          <div className="ai-sidebar-panel" id="ai-sidebar-panel"></div>
        </div>
      </div>
  )
}

export default AIAssistant