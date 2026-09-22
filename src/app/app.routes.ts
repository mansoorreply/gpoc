import { Routes } from '@angular/router';
import { stepGuard } from './core/step.guard';
import { Shell } from './shell/shell.component';
import { Intake } from './steps/intake/intake.component';
import { Plan } from './steps/plan/plan.component';
import { Collect } from './steps/collect/collect.component';
import { Run } from './steps/run/run.component';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'intake' },
      {
        path: 'intake',
        component: Intake,
        canActivate: [stepGuard],
        data: { step: 'intake' },
      },
      {
        path: 'plan',
        component: Plan,
        canActivate: [stepGuard],
        data: { step: 'plan' },
      },
      {
        path: 'collect',
        component: Collect,
        canActivate: [stepGuard],
        data: { step: 'collect' },
      },
      {
        path: 'run',
        component: Run,
        canActivate: [stepGuard],
        data: { step: 'run' },
      },
    ],
  },
];
