import { useEffect, useState } from 'react';
import { ErrorState } from './components/ErrorState';
import { LoadingBar } from './components/LoadingBar';
import { LoadingIndicator } from './components/LoadingIndicator';
import { Navigation } from './components/Navigation';
import { OfflineState } from './components/OfflineState';
import { RepositoryList } from './components/RepositoryList';
import { SettingsPopup } from './components/SettingsPopup';
import { useGitHub } from './hooks/use-github';
import { useInfiniteScroll } from './hooks/use-infinite-scroll';
import { useOnlineStatus } from './hooks/use-online-status';

export function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<string>();
  const [isInitialized, setIsInitialized] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred_language');
    const savedToken = localStorage.getItem('github_token');

    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }

    if (savedToken) {
      setSelectedToken(savedToken);
    }

    setIsInitialized(true);
  }, []);

  const {
    repositories,
    isLoading,
    isFetchingMore,
    fetchMore,
    error,
    refresh,
    isRefetching,
  } = useGitHub({
    language: selectedLanguage,
    token: selectedToken,
    enabled: isInitialized,
  });

  const scrollContainerRef = useInfiniteScroll({
    onLoadMore: fetchMore,
    isLoading: isLoading || isFetchingMore,
  });

  const handleSaveSettings = (language: string, token: string) => {
    setSelectedLanguage(language);
    setSelectedToken(token);
    localStorage.setItem('preferred_language', language);
    localStorage.setItem('github_token', token);
  };

  const getErrorMessage = (error: unknown) => {
    if (!error) return undefined;
    return error instanceof Error ? error.message : String(error);
  };

  return (
    <div className='h-screen relative flex flex-col bg-gradient-to-b from-zinc-900 to-black text-white overflow-hidden'>
      {(isFetchingMore || isLoading || isRefetching) && <LoadingBar />}

      {showSettings && (
        <SettingsPopup
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          initialLanguage={selectedLanguage}
          initialToken={selectedToken}
          error={getErrorMessage(error)}
        />
      )}

      <Navigation
        onSettingsClick={() => setShowSettings(true)}
        onRefreshClick={refresh}
        isDataLoading={isFetchingMore || isLoading || isRefetching}
      />

      {!isOnline ? (
        <OfflineState />
      ) : isLoading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorState error={error.toString()} />
      ) : (
        <RepositoryList
          repositories={repositories}
          scrollContainerRef={scrollContainerRef}
        />
      )}
    </div>
  );
}
