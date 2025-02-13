import { RefreshCw, Settings } from 'lucide-react';
import { Logo } from './Logo';

interface NavigationProps {
  onSettingsClick: () => void;
  onRefreshClick: () => void;
  isDataLoading: boolean;
}

export function Navigation(props: NavigationProps) {
  const { onSettingsClick, onRefreshClick, isDataLoading } = props;

  return (
    <nav className='px-4 sm:px-6 py-4 flex justify-between flex-row bg-white/5 backdrop-blur-xl border-b border-white/10 z-50'>
      <div className='flex-1 flex justify-between max-w-2xl mx-auto items-center gap-2'>
        <a
          href='https://gitkot.com'
          className='flex items-center gap-2 text-white/70 hover:text-white transition-colors'
        >
          <Logo className='size-8' />
          <span className='text-base font-medium'>gitkot</span>
        </a>

        <div className='flex items-center gap-2'>
          <button
            onClick={onSettingsClick}
            className='p-2 text-white/70 hover:text-white transition-colors'
          >
            <Settings className='w-5 h-5' />
          </button>
          <button
            onClick={onRefreshClick}
            className='p-2 text-white/70 hover:text-white transition-colors'
            disabled={isDataLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isDataLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </nav>
  );
}
