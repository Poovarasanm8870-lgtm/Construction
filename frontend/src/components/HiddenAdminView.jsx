import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, KeyRound, ShieldAlert, X, Eye, EyeOff } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import { bouncyTap, modalBackdropVariant, modalSlideUpVariant } from '../animations/iosSprings';

export default function HiddenAdminView({ isOpen, onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passcode === 'admin123' || passcode === 'construct2026' || passcode === '1234') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid Access Key. Access Denied.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          variants={modalBackdropVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          variants={modalSlideUpVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-6xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-10 my-auto p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Internal Management Portal</h3>
                <p className="text-xs text-slate-500">Secured Executive Metrics & Usage Analytics</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isAuthenticated ? (
            /* Passcode Unlock Form */
            <div className="max-w-md mx-auto py-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                <KeyRound className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">Enter Management Key</h4>
                <p className="text-xs text-slate-500 mt-1">This dashboard is restricted to internal staff only.</p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter Key (e.g. admin123)"
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {errorMsg && (
                    <p className="text-xs font-bold text-rose-600 mt-2">{errorMsg}</p>
                  )}
                </div>

                <motion.button
                  whileTap={bouncyTap}
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-md"
                >
                  Unlock Analytics Dashboard
                </motion.button>
              </form>
              <p className="text-[11px] text-slate-600 font-mono">Demo key: admin123</p>
            </div>
          ) : (
            /* Authenticated Admin Dashboard */
            <div>
              <AdminDashboard />
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
