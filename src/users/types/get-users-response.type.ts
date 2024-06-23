import { User } from '@prisma/client';

export type GetUsersResponse = {
  page: number;
  total_pages: number;
  total_users: number;
  count: number;
  links: {
    next_url: string | null;
    prev_url: string | null;
  };
  users: User[];
};
