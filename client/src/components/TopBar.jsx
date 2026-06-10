import { BellIcon } from "lucide-react"

export const TopBar = ({ pageTitle }) => {
  return (
    <div className="topbar">
      <div className="page-title" id="topbar-title">{pageTitle}</div>
      <div className="topbar-right">
        <button className="btn"> <BellIcon className="ti ti-bell" />Notifications</button>
        <button className="btn btn-primary"><i className="ti ti-search"></i>Search</button>
      </div>
    </div>
  )
}