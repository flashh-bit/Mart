import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../utils/api.js';
import { BRAND_CONSTANTS } from '../utils/brandConfig.js';
import { LogoBadgeSvg } from './Logo.js';

interface AdminLoginProps {
  onLoginSuccess: (token: string, email: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.token, res.user.email);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border-subtle shadow-xl p-6 sm:p-8 animate-scale-up space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center mb-3">
            <LogoBadgeSvg size={52} />
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-text-primary">
            {BRAND_CONSTANTS.SHOP_SHORT_NAME} Owner Login
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            Sign in to manage kirana groceries, jewellery items, rates, stock levels, and store timings.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Owner Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-tertiary">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@store.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm text-text-primary outline-none transition-all touch-target"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-tertiary">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm text-text-primary outline-none transition-all touch-target"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-[#FAF7F2] py-3 rounded-xl text-sm font-semibold transition-all shadow-xs touch-target cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span>Verifying access...</span>
            ) : (
              <>
                <span>Enter Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>


        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-text-tertiary hover:text-text-primary hover:underline cursor-pointer"
          >
            ← Return to Public Catalog
          </button>
        </div>

      </div>
    </div>
  );
};
