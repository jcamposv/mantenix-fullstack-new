/**
 * Sidebar utility functions
 */

/**
 * Generate user initials from name for avatar fallback
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generate avatar URL with fallback
 */
export function getAvatarUrl(userImage: string | null, userName: string): string {
  return userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff`
}

