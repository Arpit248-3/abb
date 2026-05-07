import { useState } from "react"
import { Lock, Mail, ShieldCheck, Activity, Cpu } from "lucide-react"

const FIXED_EMAIL = "user@example.com";
const FIXED_PASSWORD = "SecurePass123";

interface LoginPageProps {
  onLoginSuccess: () => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(FIXED_EMAIL)
  const [password, setPassword] = useState(FIXED_PASSWORD)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (email === FIXED_EMAIL && password === FIXED_PASSWORD) {
        setError("");
        onLoginSuccess();
      } else {
        setError("Invalid email or password.");
      }
      setIsLoading(false);
    }, 500);
  }

  return (
    <section className="flex h-screen w-full bg-[#f4f5f7] font-sans selection:bg-blue-100">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0a0a0b] p-12 lg:flex">
        {/* Abstract background graphics */}
        <div className="absolute -left-1/4 top-1/4 h-[800px] w-[800px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-emerald-600/10 blur-[100px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-3xl font-black uppercase tracking-tighter text-white">
            DecisionOS <span className="text-blue-500 italic">X</span>
          </div>
          <div className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 opacity-80">
            Intelligent Interface
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="mb-6 text-4xl font-bold leading-tight text-white tracking-tight">
            Advanced operational intelligence at your fingertips.
          </h2>
          <p className="text-lg text-zinc-400">
            Securely access real-time monitoring, predictive analytics, and automated response protocols tailored for industrial scale.
          </p>
          
          <div className="mt-12 grid gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20">
                <ShieldCheck className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="font-bold text-zinc-200">Enterprise Security</div>
                <div className="text-sm text-zinc-500">Bank-grade encryption and compliance</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Activity className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <div className="font-bold text-zinc-200">Real-time Telemetry</div>
                <div className="text-sm text-zinc-500">Sub-millisecond data synchronization</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
                <Cpu className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <div className="font-bold text-zinc-200">AI-Powered Analytics</div>
                <div className="text-sm text-zinc-500">Predictive insights and anomaly detection</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-zinc-500">
          <span>&copy; {new Date().getFullYear()} ABB Industrial. All rights reserved.</span>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex items-center justify-center gap-2 text-3xl font-black uppercase tracking-tighter text-zinc-900">
            DecisionOS <span className="text-blue-600 italic">X</span>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl shadow-zinc-200/50">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Welcome back</h1>
              <p className="mt-2 text-sm text-zinc-500">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700" htmlFor="email">
                  Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-5 w-5 text-zinc-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-zinc-700" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-5 w-5 text-zinc-400" />
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-600 border border-rose-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (<svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>) : null}
                Sign In
              </button>
            </form>
            
            <div className="mt-8 text-center text-sm text-zinc-500">
              By signing in, you agree to our{" "}
              <a href="#" className="font-semibold text-zinc-700 hover:text-blue-600 transition-colors">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="font-semibold text-zinc-700 hover:text-blue-600 transition-colors">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
