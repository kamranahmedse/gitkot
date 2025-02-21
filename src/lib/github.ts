import { Repository } from '../components/RepositoryCard';
import {
  InvalidTokenError,
  OnlyFirst1000ResultsError,
  RateLimitExceededError,
} from './errors';

const GITHUB_API_BASE = 'https://api.github.com';

export interface SearchResponse {
  total_count: number;
  items: Repository[];
}

export type SearchCriteria = {
  stars: string;
  language?: string;
  created?: string;
};

export type FeedType = 'random' | 'new';

export const PER_PAGE = 10;
export const MAX_PAGES = 100; // GitHub's 1000 result limit with 10 items per page

// search criteria in steps of 2000 i.e.
// [700...2000, 2000...4000, 4000...6000, 6000...8000]
export const getSearchCriterias = (feedType: FeedType): SearchCriteria[] => {
  if (feedType === 'new') {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const formattedDate = date.toISOString().split('T')[0];
    return [{ stars: '>10', created: `>${formattedDate}` }];
  }

  const criterias: SearchCriteria[] = [];
  criterias.push({ stars: '700...2000' });

  for (let i = 2000; i < 50000; i += 2000) {
    criterias.push({
      stars: `${i}...${i + 2000}`,
    });
  }

  criterias.push({ stars: '>50000' });
  return criterias;
};

function buildSearchQuery(criteria: SearchCriteria): string {
  const parts = [`stars:${criteria.stars}`];

  if (criteria.language) {
    parts.push(`language:${criteria.language}`);
  }

  if (criteria.created) {
    parts.push(`created:${criteria.created}`);
  }

  return parts.join(' ');
}

export interface FetchRepositoriesParams {
  criteria: SearchCriteria;
  page: number;
}

export async function fetchRepositoriesPage(
  { criteria, page }: FetchRepositoriesParams,
  token?: string
): Promise<SearchResponse> {
  if (page > MAX_PAGES) {
    throw new Error('Only first 1000 results are available');
  }

  const query = buildSearchQuery(criteria);
  const isNewFeed = criteria.created !== undefined;
  const sortParam = isNewFeed ? 'created' : 'stars';
  const savedToken = localStorage.getItem('github_token');
  const url = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
    query
  )}&sort=${sortParam}&order=desc&page=${page}&per_page=${PER_PAGE}`;

  const response = await fetch(
    url,
    token
      ? {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      : undefined
  );

  if (!response.ok) {
    if (response.status === 403) {
      throw new RateLimitExceededError(
        'Rate limit exceeded. Please add a GitHub token for extended access or try again later.'
      );
    }

    if (response.status === 422) {
      throw new OnlyFirst1000ResultsError(
        'Only first 1000 search results are available'
      );
    }

    if (response.status === 401) {
      throw new InvalidTokenError(
        'Invalid token, please check your GitHub token and try again.'
      );
    }

    throw new Error('Failed to fetch repositories');
  }

  const data = await response.json();

  if(savedToken){

    // Fetch subscribers_count for each repository
    const repositoriesWithSubscribers = await Promise.all(
      data.items.map(async (repo: any) => {
        const detailsResponse = await fetch(
          repo.url,
          token
            ? {
                headers: {
                  Authorization: `token ${token}`,
                },
              }
            : undefined
        );
  
        if (!detailsResponse.ok) {
          // If fetching details fails, continue without subscribers_count
          return {
            ...repo,
            subscribers_count: null,
          };
        }
  
        const details = await detailsResponse.json();
  
        return {
          ...repo,
          subscribers_count: details.subscribers_count || 0,
        };
      })
    );
  
    // Return the modified response with subscribers_count
    return {
      ...data,
      items: repositoriesWithSubscribers,
    };
  }
  
  return data;
}
