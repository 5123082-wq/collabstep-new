import { z } from 'zod';

// Feature Flag Schemas
export const FeatureFlagSchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  description: z.string().optional(),
  category: z.enum(['platform', 'section', 'subsection', 'capability']),
  parentId: z.string().optional(),
  enabled: z.boolean(),
  defaultEnabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const FeatureOverrideSchema = z.object({
  id: z.string(),
  featureId: z.string(),
  targetType: z.enum(['user', 'segment', 'role', 'account']),
  targetId: z.string(),
  enabled: z.boolean(),
  createdAt: z.string(),
  createdBy: z.string()
});

export const FeatureConditionSchema = z.object({
  id: z.string(),
  featureId: z.string(),
  conditionType: z.enum(['and', 'or']),
  rules: z.array(
    z.object({
      field: z.string(),
      operator: z.enum(['equals', 'contains', 'startsWith', 'in', 'gt', 'lt']),
      value: z.union([z.string(), z.number(), z.array(z.string())])
    })
  ),
  createdAt: z.string()
});

// User Management Schemas
export const AdminRoleSchema = z.enum([
  'owner',
  'product_admin',
  'support',
  'finance_admin',
  'moderator',
  'tester',
  'user'
]);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().optional(),
  roles: z.array(AdminRoleSchema),
  status: z.enum(['active', 'suspended', 'banned', 'pending']),
  lastLoginAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const UserPermissionsSchema = z.object({
  userId: z.string(),
  permissions: z.array(z.string()),
  grantedAt: z.string(),
  grantedBy: z.string(),
  expiresAt: z.string().optional()
});

// Segment Schemas
export const SegmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  criteria: z.object({
    roles: z.array(z.string()).optional(),
    accounts: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    custom: z.record(z.unknown()).optional()
  }),
  memberCount: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const SegmentMemberSchema = z.object({
  segmentId: z.string(),
  userId: z.string(),
  addedAt: z.string(),
  addedBy: z.string()
});

// Audit Schema
export const AuditEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  changes: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.string()
});

// Release Schema
export const ReleaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  targetFeatureId: z.string(),
  scheduledAt: z.string(),
  completedAt: z.string().optional(),
  rolloutStrategy: z.enum(['instant', 'gradual', 'canary']),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'failed']),
  createdBy: z.string(),
  createdAt: z.string()
});

// Support Tools Schema
export const ImpersonationSessionSchema = z.object({
  id: z.string(),
  impersonatorId: z.string(),
  targetUserId: z.string(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  reason: z.string().optional()
});

// API Request Schemas
export const CreateFeatureFlagRequestSchema = FeatureFlagSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const UpdateFeatureFlagRequestSchema = FeatureFlagSchema.partial().required({ id: true });

export const CreateUserRoleRequestSchema = z.object({
  userId: z.string(),
  roles: z.array(AdminRoleSchema)
});

export const CreateSegmentRequestSchema = SegmentSchema.omit({
  id: true,
  memberCount: true,
  createdAt: true,
  updatedAt: true
});

export const ReleaseFeatureRequestSchema = z.object({
  featureId: z.string(),
  scheduledAt: z.string(),
  rolloutStrategy: z.enum(['instant', 'gradual', 'canary'])
});

// Type exports
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type FeatureOverride = z.infer<typeof FeatureOverrideSchema>;
export type FeatureCondition = z.infer<typeof FeatureConditionSchema>;
export type AdminRole = z.infer<typeof AdminRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserPermissions = z.infer<typeof UserPermissionsSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type SegmentMember = z.infer<typeof SegmentMemberSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type Release = z.infer<typeof ReleaseSchema>;
export type ImpersonationSession = z.infer<typeof ImpersonationSessionSchema>;

