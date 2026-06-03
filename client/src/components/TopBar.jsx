export const TopBar = ({ pageTitle }) => {
  return (
    <div className="topbar">
      <div className="page-title" id="topbar-title">{pageTitle}</div>
      <div className="topbar-right">
        <button className="btn"><i className="ti ti-bell"></i>Notifications</button>
        <button className="btn btn-primary"><i className="ti ti-search"></i>Search</button>
      </div>
    </div>
  )
}