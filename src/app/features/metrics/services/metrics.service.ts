import { Injectable, inject } from '@angular/core';
import { KPI, ChartData, BurndownPoint, TeamVelocity, ProjectHealth } from '@features/metrics/models/metrics.model';
import { ProjectOpsService } from '@core/services/project-ops.service';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly projectOps = inject(ProjectOpsService);

  // KPIs
  getKPIs(): KPI[] {
    return [
      {
        id: 'total-projects',
        label: 'Total Projects',
        value: this.projectOps.totalProjects(),
        previousValue: 8,
        trend: 'up',
        trendPercentage: 12
      },
      {
        id: 'active-tasks',
        label: 'Active Tasks',
        value: this.projectOps.inProgressTasks(),
        previousValue: 15,
        trend: 'down',
        trendPercentage: 8
      },
      {
        id: 'completion-rate',
        label: 'Completion Rate',
        value: this.projectOps.taskCompletionRate(),
        unit: '%',
        previousValue: 65,
        trend: 'up',
        trendPercentage: 15
      },
      {
        id: 'team-velocity',
        label: 'Team Velocity',
        value: this.projectOps.teamVelocity(),
        unit: 'tasks/wk',
        previousValue: 4,
        trend: 'up',
        trendPercentage: 10
      }
    ];
  }

  // Task Distribution Chart
  getTaskDistribution(): ChartData {
    const tasksByStatus = this.projectOps.tasksByStatus();
    return {
      labels: ['To Do', 'In Progress', 'Review', 'Done'],
      datasets: [
        {
          label: 'Tasks by Status',
          data: [
            tasksByStatus['todo'] || 0,
            tasksByStatus['in-progress'] || 0,
            tasksByStatus['review'] || 0,
            tasksByStatus['done'] || 0
          ],
          backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#22c55e']
        }
      ]
    };
  }

  // Priority Distribution Chart
  getPriorityDistribution(): ChartData {
    const tasksByPriority = this.projectOps.tasksByPriority();
    return {
      labels: ['Low', 'Medium', 'High', 'Urgent'],
      datasets: [
        {
          label: 'Tasks by Priority',
          data: [
            tasksByPriority['low'] || 0,
            tasksByPriority['medium'] || 0,
            tasksByPriority['high'] || 0,
            tasksByPriority['urgent'] || 0
          ],
          backgroundColor: ['#e0f2fe', '#fef3c7', '#fee2e2', '#dc2626']
        }
      ]
    };
  }

  // Burndown Chart Data
  getBurndownData(): BurndownPoint[] {
    const mockData: BurndownPoint[] = [];
    const today = new Date();
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      mockData.push({
        date,
        planned: Math.max(0, 20 - (14 - i) * 1.4),
        actual: Math.max(0, 20 - (14 - i) * (1.2 + Math.random() * 0.3))
      });
    }
    return mockData;
  }

  // Team Velocity Chart
  getTeamVelocity(): TeamVelocity[] {
    return [
      { week: 'Week 1', completed: 8, planned: 10 },
      { week: 'Week 2', completed: 12, planned: 10 },
      { week: 'Week 3', completed: 9, planned: 12 },
      { week: 'Week 4', completed: 15, planned: 12 }
    ];
  }

  // Project Health Status
  getProjectHealth(): ProjectHealth[] {
    const projects = this.projectOps.projects();
    return projects.map(project => {
      const tasks = this.projectOps.getTasksByProject(project.id);
      const completed = tasks.filter(t => t.status === 'done').length;
      const total = tasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      let health: 'healthy' | 'at-risk' | 'critical' = 'healthy';
      if (progress < 30) health = 'critical';
      else if (progress < 60) health = 'at-risk';

      const endDate = project.endDate ? new Date(project.endDate) : null;
      const daysRemaining = endDate
        ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

      return {
        projectId: project.id,
        projectName: project.name,
        health,
        progress,
        tasksTotal: total,
        tasksCompleted: completed,
        daysRemaining
      };
    });
  }
}
