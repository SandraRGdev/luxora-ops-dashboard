import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/metrics',
    pathMatch: 'full'
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('@features/projects/pages/projects-board.page').then(m => m.ProjectsBoardPage)
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('@features/tasks/pages/tasks-list.page').then(m => m.TasksListPage)
  },
  {
    path: 'team',
    loadComponent: () =>
      import('@features/team/pages/team-overview.page').then(m => m.TeamOverviewPage)
  },
  {
    path: 'metrics',
    loadComponent: () =>
      import('@features/metrics/pages/metrics-dashboard.page').then(m => m.MetricsDashboardPage)
  },
  {
    path: '**',
    redirectTo: '/metrics'
  }
];
