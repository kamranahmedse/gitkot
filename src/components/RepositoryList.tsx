import { RefObject } from 'react';
import { Repository, RepositoryCard, TokenStatus } from './RepositoryCard';

interface RepositoryListProps {
  repositories: Repository[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  tokenStatus: TokenStatus;
}

export function RepositoryList(props: RepositoryListProps) {
  const { repositories, scrollContainerRef, tokenStatus } = props;

  return (
    <div
      ref={scrollContainerRef}
      className='flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide'
    >
      {repositories.map((repository) => (
        <div
          key={repository.id}
          className='snap-start min-h-[calc(100dvh-60px)] h-[calc(100dvh-60px)] flex items-center py-6'
        >
          <div className='w-full max-w-3xl mx-auto px-4 sm:px-6 h-full'>
            <RepositoryCard repository={repository} tokenStatus={tokenStatus} />
          </div>
        </div>
      ))}
    </div>
  );
}
