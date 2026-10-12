import React from "react";
import { Check, Copy } from "lucide-react";

interface GoogleSignInProps {
  handleGoogleOAuth: () => void | Promise<void>;
  handleCopyRedirectUri: () => void;
  loading: boolean;
  copiedRedirect: boolean;
  currentRedirectUri: string;
}

export const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  handleGoogleOAuth, handleCopyRedirectUri, loading, copiedRedirect, currentRedirectUri,
}) => {
  return (
          <div className="mt-5 pt-4 border-t border-white/5">
            <p className="text-[10px] uppercase font-display font-bold tracking-widest text-slate-500 text-center mb-3">Or continue with</p>
            <button
              onClick={handleGoogleOAuth}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 px-4 py-3 text-xs font-bold text-slate-300 shadow-sm transition active:scale-[98%] cursor-pointer hover:text-white"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Sign In with Google Account</span>
            </button>

            <div className="mt-3 p-2.5 rounded-lg border border-white/5 bg-white/2 text-[10px]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">Google OAuth Redirect URI:</span>
                <button
                  onClick={handleCopyRedirectUri}
                  type="button"
                  className="flex items-center gap-1 font-bold text-[#ff2a54] hover:text-[#ff4d6d] transition cursor-pointer"
                >
                  {copiedRedirect ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy URI</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-slate-400 break-all bg-black/30 p-1.5 rounded text-[9px] select-all">
                {currentRedirectUri}
              </p>
              <p className="mt-1 text-[9px] text-slate-500 leading-tight">
                Must be listed in your Google Cloud Console under <strong className="text-slate-400">Authorized redirect URIs</strong>.
              </p>
            </div>
          </div>
  );
};
