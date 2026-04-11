import { useEditorStore } from '@/store/useEditorStore';
import { LANGUAGE_META } from '@/types';

const STATUS_BRANCH_GLYPH = String.fromCharCode(0x2387);

export const StatusBar = () => {
  const activeFile = useEditorStore((state) => state.activeFile);

  return (
    <footer
      className="flex h-6 shrink-0 items-center px-3 text-[12px]"
      style={{
        background: '#7C3AED',
        color: '#ffffff',
      }}
    >
      <div className="min-w-0 flex-1 truncate">{`${STATUS_BRANCH_GLYPH} yantra-editor`}</div>
      <div className="min-w-0 flex-1 truncate text-center">
        {activeFile ? LANGUAGE_META[activeFile.language].label : 'Editor'}
      </div>
      <div className="min-w-0 flex-1 truncate text-right">Ln 1, Col 1  |  UTF-8  |  Spaces: 2</div>
    </footer>
  );
};
