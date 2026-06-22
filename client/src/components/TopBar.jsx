import axios from "axios"
import { BellIcon } from "lucide-react"

export const TopBar = ({ pageTitle}) => {

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const {data} = await axios.post(import.meta.env.VITE_BACKEND_URL + '/api/auth/logout');
      if (data.success) {
        window.location.reload();
      }
    }
    catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <div className="topbar">
      <div className="page-title" id="topbar-title">{pageTitle}</div>
      <div className="topbar-right">
        <button className="btn"> <BellIcon className="ti ti-bell" />Notifications</button>
        <button className="btn btn-primary" onClick={handleLogout}>
          <i className="ti ti-search"></i>Logout
        </button>
      </div>
    </div>
  )
}