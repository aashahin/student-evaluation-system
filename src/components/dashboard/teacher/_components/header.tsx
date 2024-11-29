"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Book, Menu, UserCircle, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UpdateAccountDialog from "@/components/dashboard/_components/update-user";
import { pb } from "@/lib/api";

const Header = ({
  tabs,
  activeTab,
  setActiveTab,
  title,
}: {
  tabs: Array<{
    id: string;
    label: string;
    icon: React.FC<React.ComponentProps<"svg">>;
  }>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const client = pb();
  const user = client.authStore.record;

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSignOut = () => {
    client.authStore.clear();
    document.cookie = "pb_auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/auth/login";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!mounted || !user) {
    return null;
  }

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Book className="text-blue-600" />
            {title}
          </h1>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex gap-4 items-center">
            <div className="flex bg-gray-100/50 rounded-xl p-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-2.5 rounded-lg
                      transition-all duration-300 ease-in-out
                      ${
                        activeTab === tab.id
                          ? "bg-white shadow-md text-blue-600 scale-105 transform"
                          : "text-gray-600 hover:bg-gray-200/50"
                      }
                    `}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        activeTab === tab.id ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <UserCircle className="h-10 w-10" />
                  <p className="text-sm text-gray-500">حسابي</p>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem>
                  <span className="font-medium">{user.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="text-sm text-muted-foreground overflow-hidden overflow-ellipsis">
                    {user.email}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <UpdateAccountDialog user={user} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={onSignOut}
                >
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </header>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="sm:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMenuOpen(false);
                    }}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        activeTab === tab.id ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 border-t">
                <div className="px-4 py-2">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <UpdateAccountDialog user={user} />
                <Button
                  variant="ghost"
                  className="w-full text-red-600 justify-start px-4"
                  onClick={onSignOut}
                >
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Header;
