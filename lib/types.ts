export type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

export type WeeklyStats = {
  week: number;
  author: string;
  total: number;
};
