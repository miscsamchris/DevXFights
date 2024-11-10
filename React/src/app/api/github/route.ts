import { NextRequest, NextResponse } from 'next/server';

interface GitHubProfile {
  name: string;
  avatar_url: string;
  bio: string;
  company: string;
  location: string;
  followers: number;
  following: number;
  public_repos: number;
}

interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  open_issues_count: number;
  license: any;
  fork: boolean;
}

interface LanguageStats {
  [key: string]: number;
}

async function getUserDetails(username: string) {
  let profileResponse: GitHubProfile | null = null;
  let readmeContent: string = '';
  let repoResponse: GitHubRepo[] = [];
  let languageStats: LanguageStats = {};
  let developerType: string = '';

  console.log(`Fetching profile for user: ${username}`);
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    
    profileResponse = await response.json();

    if (!response.ok || !profileResponse) {
      console.error('Profile not found for user:', username);
      throw new Error('Profile not found');
    }
    console.log('Profile fetched successfully:', profileResponse);
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Could not fetch profile');
  }

  console.log(`Fetching README for user: ${username}`);
  try {
    const readmeResponse = await fetch(`https://raw.githubusercontent.com/${username}/${username}/master/README.md`);
    if (readmeResponse.ok) {
      readmeContent = await readmeResponse.text();
      console.log('README fetched successfully');
    } else {
      console.log('README not found for user:', username);
    }
  } catch (error) {
    console.error('Error fetching README:', error);
    readmeContent = '';
  }

  console.log(`Fetching repositories for user: ${username}`);
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    repoResponse = await response.json();

    if (!response.ok || !repoResponse) {
      console.error('Repositories not found for user:', username);
      throw new Error('Repositories not found');
    }
    console.log('Repositories fetched successfully:', repoResponse.length);

    // Fetch languages for each repository
    for (const repo of repoResponse) {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }
    }
    console.log('Language statistics calculated:', languageStats);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw new Error('Could not fetch repositories');
  }

  // Sort languages by usage and get top 3
  const topLanguages = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / repoResponse.length) * 100)
    }));
  console.log('Top languages determined:', topLanguages);

  // After calculating topLanguages, prepare and send data to the custom API
  console.log('Preparing data for custom API');
  try {
    
    const apiPayload = {
      username: username,
      bio: profileResponse.bio,
      programming_languages: topLanguages.map(lang => lang.language)
    };

    console.log('API payload:', apiPayload);

    const customApiResponse = await fetch('https://devx-flask.onrender.com/api/github-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload)
    });

    const customApiResult = await customApiResponse.json();
    developerType = customApiResult.developer_type;
    console.log('Custom API response:', customApiResult);
  } catch (error) {
    console.error('Error calling custom API:', error);
  }

  return {
    name: profileResponse.name,
    avatar_url: profileResponse.avatar_url,
    bio: profileResponse.bio,
    company: profileResponse.company,
    location: profileResponse.location,
    followers: profileResponse.followers,
    following: profileResponse.following,
    public_repos: profileResponse.public_repos,
    profile_readme: readmeContent,
    developer_type: developerType,
    top_languages: topLanguages,
    last_15_repositories: repoResponse
      .slice(0, 15)
      .map((repo: GitHubRepo) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        fork: repo.fork,
      })),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');

  if (!username) {
    console.error('Username is required but not provided');
    return NextResponse.json({ message: 'Username is required' }, { status: 400 });
  }

  console.log(`Received request to fetch GitHub data for username: ${username}`);
  try {
    const githubData = await getUserDetails(username);
    console.log('GitHub data fetched successfully for username:', username);
    return NextResponse.json(githubData);
  } catch (error) {
    console.error('Error fetching GitHub data for username:', username, error);
    return NextResponse.json(
      { message: 'Error fetching GitHub data' },
      { status: 500 }
    );
  }
}