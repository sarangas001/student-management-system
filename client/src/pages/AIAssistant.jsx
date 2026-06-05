import { AI_ROLES } from "../util/context";
import { Lock, Shield } from "lucide-react";

const AIAssistant = ({role}) => {

  const cfg = AI_ROLES[role];


  return (
    <div id="ai-assistant">
        <div className="ai-page-wrap">
          {/* <!-- Main chat --> */}
          <div className="ai-full-chat">
            {/* <!-- Header changes per role --> */}
            <div className={`ai-full-head bg-linear-to-br ${role === 'admin' ? 'from-[#7c3aed] to-[#1a5faa]' : role === 'teacher' ? 'from-[#0f766e] to-[#1a5faa]' : 'from-[#b45309] to-[#1a5faa]'}`} id="ai-full-head">
              
              <i className="ti ti-robot"></i>
              <div>
                <div className="ai-full-title" id="ai-full-title">{cfg.title}</div>
                <div className="ai-full-sub" id="ai-full-sub">{cfg.sub}</div>
              </div>
              {/* <!-- Role badge --> */}
              <div id="ai-role-badge" className="bg-white/22" style={{"marginLeft" : "auto", "padding": "4px 12px", "borderRadius": "20px", "fontSize": "11px", "fontWeight": "700", "letterSpacing": ".05em"}}>
                {cfg.label}
              </div>
            </div>

            {/* <!-- Access notice banner (hidden for admin) --> */}
            {
              role !== 'admin' && (
                <div id="ai-access-notice" className={`flex text-[12px] py-2.25 px-4  ${role === 'student' ? 'bg-[#fff8e1]' : role === 'teacher' ? 'bg-[#e0f2f1]' : 'bg-[#e8f1fb]'}`} style={{ "padding": "9px 16px", "fontSize": "12px", "alignItems": "center", "gap": "8px", "borderBottom": "1px solid var(--border)"}}>
                  <i className="ti ti-shield-lock" style={{"fontSize": "15px", "flexShrink": "0"}}></i>
                  {cfg.notice !== null && (
                    <>
                      {
                        role == 'student' ? (<Lock className="ti ti-lock w-5 text-[14px] text-[#b45309] shrink-0" />) : role == 'teacher' ? (<Shield className="ti ti-lock w-5 text-[14px] text-[#0f766e] shrink-0" />) : null
                      }
                      <span className="text-[--text2]"><strong className="font-bold">{AI_ROLES[role].notice.boldText}</strong> {AI_ROLES[role].notice.normalText}</span>
                    </>
                  )}
                  <span id="ai-access-text"></span>
                </div>
              )
            }
            

            <div className="ai-full-msgs" id="full-msgs">
              
            </div>

            {/* <!-- Suggested chips — populated by JS --> */}
            <div className="ai-chips" id="full-chips">
              { cfg.chips.map((c, key) => <span key={key} className="ai-chip" >{c}</span>)}
            </div>

            <div className={`ai-full-input `}>
              <textarea id="full-input" rows="1" placeholder={cfg.fullPlaceholder} ></textarea>
              <button className={`ai-send-full bg-linear-to-br  ${role === 'admin' ? 'from-[#7c3aed] to-[#1a5faa]' : role === 'teacher' ? 'from-[#0f766e] to-[#1a5faa]' : 'from-[#b45309] to-[#1a5faa]'}`} id="full-send-btn"><i className="ti ti-send"></i>Ask</button>
            </div>
          </div>

          {/* <!-- Right sidebar — populated by JS --> */}
          <div className="ai-sidebar-panel" id="ai-sidebar-panel">
            <div className="ai-data-card">
              <div className="ai-data-title"><i className="ti ti-database" style={{ fontSize: "13px", marginRight: "4px" }}></i>{cfg.sidebarLabel}</div>
              {cfg.sidebarStats.map(([k,v]) =>
                <div className="ai-data-item"><span>{k}</span><span>{v}</span></div>
              )}
            </div>
            <div className="ai-data-card">
              <div className="ai-suggest-title">💡 Try asking…</div>
              {cfg.sidebarSuggestions.map((suggestion, key) => (
                <button key={key} className="ai-suggest-chip" >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
  )
}

export default AIAssistant