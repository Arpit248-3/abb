import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { WorkspaceView } from "@/components/dashboard/WorkspaceViews"
import { tabMeta, type TabKey } from "@/lib/dashboard-navigation"
import LoginPage from "@/components/auth/LoginPage"

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [transitionClass, setTransitionClass] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const meta = tabMeta[activeTab];

  const handleLoginSuccess = () => {
    setTransitionClass("fade-in");
    setTimeout(() => {
      setIsLoggedIn(true);
      setTransitionClass("");
    }, 400);
  };


  const handleLogout = () => {
    setIsLoggingOut(true);
    setTransitionClass("fade-out");
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoggingOut(false);
      setActiveTab("overview");
      setTransitionClass("");
    }, 400);
  };


  return (
    <div className={`h-screen w-full overflow-hidden ${transitionClass}`}>
      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="flex h-full bg-[#f4f5f7] overflow-hidden font-sans text-zinc-900 selection:bg-blue-100">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
          
          <div className="flex-1 flex flex-col min-w-0">
            <Header meta={meta} />
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f4f5f7] p-2">
              <WorkspaceView tab={activeTab} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
