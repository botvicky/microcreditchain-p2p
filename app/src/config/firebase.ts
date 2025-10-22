// Firebase has been deprecated in this project.
// This file remains as a stub to surface any lingering imports during migration.
// Remove imports of this file once you have migrated all Firebase usages to the new backend.

export const DEPRECATED_FIREBASE = true;

export function throwFirebaseDeprecated() {
  throw new Error('Firebase has been removed. Please migrate this usage to the FastAPI backend.');
}
