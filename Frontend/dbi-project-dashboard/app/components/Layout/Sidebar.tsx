// app/components/Layout/Sidebar.tsx
"use client";

import React, { useState } from "react";
import {
  Package,
  Building,
  Users,
  Filter,
  RefreshCw,
  Database,
  Settings,
  Moon,
  Sun,
  BarChart2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface SidebarProps {
  selectedSection: {
    name: string;
    route: string;
    icon: string;
    description: string;
  };
  onSectionChange: (sectionName: string) => void;
  onRefresh: () => void;
  onFilter: () => void;
  onSeed: () => void;
  isSyncing: boolean;
  selectedDbType: string;
}

export function Sidebar({
  selectedSection,
  onSectionChange,
  onRefresh,
  onFilter,
  onSeed,
  isSyncing,
  selectedDbType,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [expandedSection, setExpandedSection] = useState<string | null>("data");

  const menuSections = [
    {
      id: "data",
      title: "Data Management",
      items: [
        {
          id: "Tiere",
          name: "Animals",
          icon: Package,
          description: "Manage animal inventory",
          badge: selectedDbType === "MongoDB" ? "Document-based" : "Relational",
        },
        {
          id: "Filialen",
          name: "Branches",
          icon: Building,
          description: "Manage branch locations",
          badge: selectedDbType === "MongoDB" ? "Embedded" : "Relational",
        },
        {
          id: "TierFilialen",
          name: "Relations",
          icon: Users,
          description: "Animal-branch relations",
          badge: selectedDbType === "MongoDB" ? "Embedded" : "Relational",
          disabled: selectedDbType === "MongoDB",
        },
      ],
    },
    {
      id: "tools",
      title: "Tools",
      items: [
        {
          id: "filter",
          name: "Filter Data",
          icon: Filter,
          action: onFilter,
          description: "Filter current view",
        },
        {
          id: "refresh",
          name: "Refresh Data",
          icon: RefreshCw,
          action: onRefresh,
          description: "Sync with database",
        },
        {
          id: "seed",
          name: "Seed Database",
          icon: Database,
          action: onSeed,
          description: "Generate test data",
        },
      ],
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="h-full px-3 py-4 overflow-y-auto bg-background border-r">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <BarChart2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Data Manager</span>
          </motion.div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </button>
        </div>

        {/* Sync Status */}
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 px-2"
          >
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Syncing data...</span>
            </div>
          </motion.div>
        )}

        {/* Main Navigation */}
        <div className="space-y-4">
          {menuSections.map((section) => (
            <div key={section.id} className="space-y-2">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                {section.title}
                {expandedSection === section.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {section.items.map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02, translateX: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          item.action ? item.action() : onSectionChange(item.id)
                        }
                        disabled={item.disabled}
                        className={`
                          flex items-center w-full px-4 py-2 text-sm font-medium rounded-md
                          transition-colors relative group
                          ${
                            selectedSection.name === item.id
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }
                          ${
                            item.disabled ? "opacity-50 cursor-not-allowed" : ""
                          }
                        `}
                        title={
                          item.disabled
                            ? "Not available in MongoDB mode"
                            : item.description
                        }
                      >
                        <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <span className="truncate">{item.name}</span>
                          <span className="text-xs opacity-70 truncate">
                            {item.description}
                          </span>
                        </div>
                        {item.badge && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                            {item.badge}
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Database Info */}
        <div className="mt-auto pt-4 px-2">
          <div className="rounded-lg bg-primary/10 p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{selectedDbType}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedDbType === "MongoDB"
                ? "Document-based storage"
                : "Relational database"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
