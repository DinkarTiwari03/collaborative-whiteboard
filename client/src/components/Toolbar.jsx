const Toolbar = ({ tool, setTool, color, setColor, brushSize, setBrushSize, onClear, onUndo, onRedo, canUndo, canRedo, onDownload }) => {
  const colors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b',
    '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#d946ef', '#f43f5e'
  ];

  return (
    <div className="bg-dark-800/90 backdrop-blur-md border-r border-dark-700 p-3 flex flex-col items-center space-y-4 h-full">
      {/* Tools */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => setTool('pencil')}
          className={`p-3 rounded-xl transition-all duration-200 ${
            tool === 'pencil'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
          }`}
          title="Pencil"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <button
          onClick={() => setTool('eraser')}
          className={`p-3 rounded-xl transition-all duration-200 ${
            tool === 'eraser'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
          }`}
          title="Eraser"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-dark-600" />

      {/* Brush Size */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <span className="text-xs text-dark-400 font-medium">Size</span>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <span className="text-xs text-dark-400">{brushSize}px</span>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-dark-600" />

      {/* Colors */}
      <div className="grid grid-cols-2 gap-1.5">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); setTool('pencil'); }}
            className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
              color === c && tool === 'pencil'
                ? 'border-white shadow-lg scale-110'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-dark-600" />

      {/* Actions */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-3 rounded-xl transition-all duration-200 ${
            canUndo
              ? 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
              : 'bg-dark-800 text-dark-600 cursor-not-allowed'
          }`}
          title="Undo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-3 rounded-xl transition-all duration-200 ${
            canRedo
              ? 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
              : 'bg-dark-800 text-dark-600 cursor-not-allowed'
          }`}
          title="Redo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>

        <button
          onClick={onClear}
          className="p-3 rounded-xl bg-dark-700 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
          title="Clear Board"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <button
          onClick={onDownload}
          className="p-3 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white transition-all duration-200"
          title="Download"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
