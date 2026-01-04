import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./workspace/workspace.page').then(m => m.WorkspacePage),
        children: [
            {
                path: '',
                loadComponent: () => import('./workspace-cards/workspace-cards.component').then(m => m.WorkspaceCardsComponent)
            },
            {
                path: 'calculator-dashboard',
                loadChildren: () => import('../calculator/calculator.routes').then(m => m.routes)
            }
        ]
    },
  {
    path: 'workspace',
    loadComponent: () => import('./workspace/workspace.page').then( m => m.WorkspacePage)
  }
];
