"use client";

import UserMenu from './UserMenu';

/** Fixed top-right user-menu strip — rendered globally by RootLayout. */
export default function TopBar() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <UserMenu />
    </div>
  );
}
