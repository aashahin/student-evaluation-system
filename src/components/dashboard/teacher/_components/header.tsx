"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  Book,
  Eye,
  EyeOff,
  Menu,
  UserCircle,
  X,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UpdateAccountDialog from "@/components/dashboard/_components/update-user";
import { pb } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "@/types/api";
import { RecordModel } from "pocketbase";

interface Tab {
  id: string;
  label: string;
  icon: React.FC<React.ComponentProps<"svg">>;
}

interface HeaderProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  title,
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
    window.location.href = "/auth/signin";
  };

  if (!mounted || !user) return null;

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <header className="flex justify-between items-center">
          <HeaderTitle title={title} />
          <DesktopNavigation
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            onSignOut={onSignOut}
          />
          <MobileMenuButton
            isOpen={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </header>

        {isMenuOpen && (
          <MobileNavigation
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            onSignOut={onSignOut}
            onClose={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

const HeaderTitle: React.FC<{ title: string }> = ({ title }) => (
  <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
    <Book className="text-blue-600" />
    {title}
  </h1>
);

const DesktopNavigation: React.FC<{
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | RecordModel;
  onSignOut: () => void;
}> = ({ tabs, activeTab, setActiveTab, user, onSignOut }) => (
  <nav className="hidden sm:flex gap-4 items-center">
    <div className="flex bg-gray-100/50 rounded-xl p-1.5">
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
        />
      ))}
    </div>
    <UserMenu user={user} onSignOut={onSignOut} />
  </nav>
);

const TabButton: React.FC<{
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}> = ({ tab, isActive, onClick }) => {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-2.5 rounded-lg
        transition-all duration-300 ease-in-out
        ${
          isActive
            ? "bg-white shadow-md text-blue-600 scale-105 transform"
            : "text-gray-600 hover:bg-gray-200/50"
        }
      `}
    >
      <Icon
        className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-500"}`}
      />
      <span className="font-medium">{tab.label}</span>
    </button>
  );
};

const MobileMenuButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
}> = ({ isOpen, onClick }) => (
  <button
    className="sm:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
    onClick={onClick}
  >
    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
  </button>
);

const MobileNavigation: React.FC<{
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | RecordModel;
  onSignOut: () => void;
  onClose: () => void;
}> = ({ tabs, activeTab, setActiveTab, user, onSignOut, onClose }) => (
  <nav className="sm:hidden mt-4 pb-4">
    <div className="flex flex-col space-y-2">
      {tabs.map((tab) => (
        <MobileTabButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            onClose();
          }}
        />
      ))}
      <MobileUserSection user={user} onSignOut={onSignOut} />
    </div>
  </nav>
);

const MobileTabButton: React.FC<{
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}> = ({ tab, isActive, onClick }) => {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        transition-all duration-200
        ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-gray-600 hover:bg-gray-100"
        }
      `}
    >
      <Icon
        className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500"}`}
      />
      <span className="font-medium">{tab.label}</span>
    </button>
  );
};

const UserMenu: React.FC<{
  user: User | RecordModel;
  onSignOut: () => void;
}> = ({ user, onSignOut }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost">
        <UserCircle className="h-10 w-10" />
        <p className="text-sm text-gray-500">حسابي</p>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="end">
      <UserMenuItems user={user} onSignOut={onSignOut} />
    </DropdownMenuContent>
  </DropdownMenu>
);

const UserMenuItems: React.FC<{
  user: User | RecordModel;
  onSignOut: () => void;
}> = ({ user, onSignOut }) => (
  <>
    <DropdownMenuItem>
      <span className="font-medium">{user.name}</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <span className="text-sm text-muted-foreground overflow-hidden overflow-ellipsis">
        {user.email}
      </span>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    {user.role === "student" && <StudentCredentialsDialog user={user} />}
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <UpdateAccountDialog user={user} />
    </DropdownMenuItem>
    <DropdownMenuItem
      className="text-red-600 cursor-pointer"
      onClick={onSignOut}
    >
      تسجيل الخروج
    </DropdownMenuItem>
  </>
);

const MobileUserSection: React.FC<{
  user: User | RecordModel;
  onSignOut: () => void;
}> = ({ user, onSignOut }) => (
  <div className="pt-2 border-t">
    <div className="px-4 py-2">
      <p className="font-medium">{user.name}</p>
      <p className="text-sm text-gray-500">{user.email}</p>
    </div>
    {user.role === "student" && (
      <div className="px-4 py-2">
        <MobileCredentialsDialog user={user} />
      </div>
    )}
    <UpdateAccountDialog user={user} />
    <Button
      variant="ghost"
      className="w-full text-red-600 justify-start px-4"
      onClick={onSignOut}
    >
      تسجيل الخروج
    </Button>
  </div>
);

const CredentialsDisplay: React.FC<{
  user: User | RecordModel;
  showKey: boolean;
  setShowKey: (show: boolean) => void;
}> = ({ user, showKey, setShowKey }) => (
  <div className="space-y-4">
    <CredentialField label="رقم الطالب" value={user.id} />
    <CredentialField
      label="المفتاح السري"
      value={user.secret_key}
      isSecret
      showSecret={showKey}
      onToggleVisibility={() => setShowKey(!showKey)}
    />
  </div>
);

const CredentialField: React.FC<{
  label: string;
  value: string;
  isSecret?: boolean;
  showSecret?: boolean;
  onToggleVisibility?: () => void;
}> = ({
  label,
  value,
  isSecret = false,
  showSecret = false,
  onToggleVisibility,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-500">{label}</label>
    <div className="flex items-center gap-2">
      <div className="flex-1 p-3 bg-gray-50 rounded-lg font-mono text-lg">
        {isSecret && !showSecret ? "•".repeat(value.length) : value}
      </div>
      {isSecret && onToggleVisibility && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleVisibility}
          className="shrink-0"
        >
          {showSecret ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  </div>
);

const CredentialsWarning = () => (
  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
    <div className="flex items-center justify-start gap-2">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <h3 className="text-md font-medium">تحذير هام</h3>
    </div>
    <p className="text-sm text-gray-500">
      يرجى الاحتفاظ بهذه البيانات في مكان آمن. لا تشاركها مع أي شخص.
    </p>
  </div>
);

const StudentCredentialsDialog: React.FC<{
  user: User | RecordModel;
}> = ({ user }) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          عرض بيانات الحساب
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">بيانات الحساب</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-4">
          <CredentialsDisplay
            user={user}
            showKey={showKey}
            setShowKey={setShowKey}
          />
          <CredentialsWarning />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MobileCredentialsDialog: React.FC<{
  user: User | RecordModel;
}> = ({ user }) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start p-0">
          عرض بيانات الحساب
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>بيانات الحساب</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-4">
          <CredentialsDisplay
            user={user}
            showKey={showKey}
            setShowKey={setShowKey}
          />
          <CredentialsWarning />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Header;
