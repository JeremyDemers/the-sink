import type { HasLabel } from '@typedef/global';
import type { Project } from '@models/Project';

import { t } from '@plugins/i18n';

export const ProjectStatus = {
  Draft: 'draft',
  Completed: 'completed',
  Archived: 'archived',
} as const;

export const ProjectStatusMetadata: Record<Project.Status, HasLabel<string>> = {
  [ProjectStatus.Draft]: {
    label: t('Draft'),
  },
  [ProjectStatus.Completed]: {
    label: t('Completed'),
  },
  [ProjectStatus.Archived]: {
    label: t('Archived'),
  },
} as const;

export const ProjectTransition = {
  Complete: 'complete',
  BackToDraft: 'back_to_draft',
  Archive: 'archive',
  Restore: 'restore',
} as const;

export const ProjectTransitionMetadata: Record<Project.Transition, HasLabel<string>> = {
  [ProjectTransition.Complete]: {
    label: t('Complete'),
  },
  [ProjectTransition.BackToDraft]: {
    label: t('Back to draft'),
  },
  [ProjectTransition.Archive]: {
    label: t('Archive'),
  },
  [ProjectTransition.Restore]: {
    label: t('Un-archive'),
  },
} as const;
