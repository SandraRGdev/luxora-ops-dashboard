export type MemberRole = 'admin' | 'manager' | 'developer' | 'designer' | 'qa';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  avatar: string | null;
  projectIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamMemberDto {
  name: string;
  email: string;
  role?: MemberRole;
  avatar?: string | null;
  projectIds?: string[];
}

export interface UpdateTeamMemberDto {
  name?: string;
  email?: string;
  role?: MemberRole;
  avatar?: string | null;
  projectIds?: string[];
}
