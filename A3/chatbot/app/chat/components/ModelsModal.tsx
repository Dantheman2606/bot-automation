'use client';

interface ModelsModalProps {
  isOpen: boolean;
  models: string[];
  onClose: () => void;
}

export default function ModelsModal({ isOpen, models, onClose }: ModelsModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" 
      onClick={onClose}
    >
      <div 
        className="bg-black border border-white/20 rounded-3xl p-8 max-w-2xl max-h-[80vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light tracking-wide">
            Available <span className="font-bold">Models</span>
          </h2>
          <button 
            onClick={onClose} 
            className="text-white/50 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        <div className="space-y-2">
          {models.length > 0 ? (
            models.map((model, index) => (
              <div 
                key={index} 
                className="p-3 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <p className="text-sm font-light text-white/80">{model}</p>
              </div>
            ))
          ) : (
            <p className="text-white/50 text-sm">No models available</p>
          )}
        </div>
      </div>
    </div>
  );
}
