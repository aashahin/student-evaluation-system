"use client";

import {Book, Menu, X} from "lucide-react";
import React, {useState} from "react";

const Header= ({tabs, activeTab, setActiveTab}: {
    tabs: Array<{
        id: string;
        label: string;
        icon: React.FC<React.ComponentProps<"svg">>;
    }>;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    return (
        <div className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 sm:px-6 py-4">
                <header className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Book className="text-blue-600"/>
                        لوحة معلومات المعلم
                    </h1>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex gap-4 items-center">
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
                                                activeTab === tab.id
                                                    ? "text-blue-600"
                                                    : "text-gray-500"
                                            }`}
                                        />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="sm:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6"/>
                        ) : (
                            <Menu className="h-6 w-6"/>
                        )}
                    </button>
                </header>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="sm:hidden mt-4 pb-4">
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
                                                activeTab === tab.id
                                                    ? "text-blue-600"
                                                    : "text-gray-500"
                                            }`}
                                        />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Header;