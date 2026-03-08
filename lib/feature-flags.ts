export const featureFlags = {
  enablePaidPlans: false,
  enableSubscriptionsUI: false,
  enableAdvancedAiFeatures: true,
  enableTemplateGallery: true,
  enableAtsTools: true,
} as const;

export type FeatureFlagKey = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return featureFlags[flag];
}
