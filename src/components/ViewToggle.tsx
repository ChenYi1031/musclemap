import { useStore } from '../store/useStore';

export function ViewToggle() {
  const { viewMode, toggleViewMode } = useStore();

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
      <button
        onClick={() => viewMode !== 'front' && toggleViewMode()}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          viewMode === 'front'
            ? 'bg-slate-600 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        正面
      </button>
      <button
        onClick={() => viewMode !== 'back' && toggleViewMode()}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          viewMode === 'back'
            ? 'bg-slate-600 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        背面
      </button>
    </div>
  );
}
