import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StepId } from './engagement.models';
import { EngagementService } from './engagement.service';

export const stepGuard: CanActivateFn = (route) => {
  const engagement = inject(EngagementService);
  const router = inject(Router);
  const step = route.data['step'] as StepId;
  if (engagement.isUnlocked(step)) {
    return true;
  }
  return router.parseUrl(engagement.furthestPath());
};
