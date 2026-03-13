import { Injectable, inject } from '@angular/core';
import { TeamMember, CreateTeamMemberDto, UpdateTeamMemberDto } from '@features/team/models/team-member.model';
import { ProjectOpsService } from '@core/services/project-ops.service';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly projectOps = inject(ProjectOpsService);

  // Expose signals from ProjectOpsService
  readonly members = this.projectOps.teamMembers;
  readonly selectedMember = this.projectOps.selectedMember;
  readonly loading = this.projectOps.loading;
  readonly error = this.projectOps.error;

  // CRUD Operations
  create(dto: CreateTeamMemberDto): TeamMember {
    const member: TeamMember = {
      id: this.generateId(),
      name: dto.name,
      email: dto.email,
      role: dto.role || 'developer',
      avatar: dto.avatar || null,
      projectIds: dto.projectIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projectOps.addTeamMember(member);
    return member;
  }

  update(id: string, dto: UpdateTeamMemberDto): void {
    this.projectOps.updateTeamMember(id, dto);
  }

  delete(id: string): void {
    this.projectOps.removeTeamMember(id);
  }

  select(id: string | null): void {
    this.projectOps.selectTeamMember(id);
  }

  // Query helpers
  getById(id: string): TeamMember | undefined {
    return this.projectOps.getTeamMemberById(id);
  }

  getByRole(role: string): TeamMember[] {
    return this.members().filter(m => m.role === role);
  }

  getByProject(projectId: string): TeamMember[] {
    return this.projectOps.getMembersByProject(projectId);
  }

  // Mock data loader
  loadMockData(): void {
    const mockMembers: TeamMember[] = [
      {
        id: 'member-1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        role: 'admin',
        avatar: null,
        projectIds: ['proj-1', 'proj-3'],
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-01')
      },
      {
        id: 'member-2',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        role: 'developer',
        avatar: null,
        projectIds: ['proj-1', 'proj-2'],
        createdAt: new Date('2023-07-15'),
        updatedAt: new Date('2023-07-15')
      },
      {
        id: 'member-3',
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        role: 'designer',
        avatar: null,
        projectIds: ['proj-2'],
        createdAt: new Date('2023-08-01'),
        updatedAt: new Date('2023-08-01')
      },
    ];

    this.projectOps.setTeamMembers(mockMembers);
  }

  private generateId(): string {
    return `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
