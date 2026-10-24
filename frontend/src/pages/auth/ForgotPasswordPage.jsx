import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Zap, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface-950 bg-mesh flex-center p-6">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex-center"><Zap className="w-4 h-4 text-white"/></div>
          <span className="font-display font-bold text-lg text-white">SmartHR Nexus</span>
        </div>

        {!sent ? (
          <>
            <h2 className="font-display text-2xl font-bold text-white mb-1">Forgot Password</h2>
            <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="you@company.com" className="input-field pl-10"/>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-accent-400"/>
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">Email Sent!</h2>
            <p className="text-slate-400 text-sm mb-6">Check your inbox for the reset link. Valid for 10 minutes.</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-xs text-primary-400 hover:text-primary-300 flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5"/>Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
