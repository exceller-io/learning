"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { GraduationCap, LogOut, User, BookOpen, LayoutDashboard, FileText, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardHref =
    session?.user?.role === "ADMIN"
      ? "/admin"
      : session?.user?.role === "AUTHOR"
      ? "/author"
      : "/student";

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
          <GraduationCap className="h-7 w-7 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">Exceller</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              Courses
            </Button>
          </Link>
          <Link href="/articles">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Articles
            </Button>
          </Link>

          {session ? (
            <>
              <Link href={dashboardHref}>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden text-sm font-medium text-gray-700 lg:block">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="gap-1.5 text-gray-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3 sm:px-6">
            <Link
              href="/courses"
              onClick={closeMobile}
              className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </Link>
            <Link
              href="/articles"
              onClick={closeMobile}
              className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileText className="h-4 w-4" />
              Articles
            </Link>

            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={closeMobile}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="mt-2 flex items-center gap-3 border-t border-gray-100 px-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {session.user.name || session.user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={closeMobile}>
                  <Button variant="ghost" size="sm" className="w-full justify-center">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMobile}>
                  <Button size="sm" className="w-full justify-center">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
