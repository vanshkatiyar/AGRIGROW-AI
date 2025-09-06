import { Leaf, Wheat, Tractor } from 'lucide-react';

export const AuthBrandingPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-accent to-secondary relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute top-32 right-20 w-24 h-24 border border-white/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        <div className="absolute bottom-20 left-32 w-40 h-40 border-2 border-white/20 rounded-full animate-spin" style={{ animationDuration: '25s' }} />
        <div className="absolute top-1/4 right-12 w-4 h-4 bg-white/30 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 left-16 w-3 h-3 bg-white/40 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
        <div className="text-center space-y-6">
          {/* --- THIS LINE IS UPDATED FOR BETTER LOGO VISIBILITY --- */}
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-white shadow-xl mb-8 animate-float">
            <img src="/AgriGro-Logo.png" alt="AgriGrow Logo" className="w-24 h-24" />
          </div>
          <h1 className="text-5xl font-bold mb-4">AgriGrow</h1>
          <p className="text-xl text-white/90 mb-8 max-w-md">
            The all-in-one platform for modern farming. Connect, trade, and grow with your community.
          </p>
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
                <Leaf className="w-8 h-8" />
              </div>
              <p className="text-sm text-white/80">Grow</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse-glow" style={{ animationDelay: '1s' }}>
                <Wheat className="w-8 h-8" />
              </div>
              <p className="text-sm text-white/80">Trade</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse-glow" style={{ animationDelay: '2s' }}>
                <Tractor className="w-8 h-8" />
              </div>
              <p className="text-sm text-white/80">Connect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};