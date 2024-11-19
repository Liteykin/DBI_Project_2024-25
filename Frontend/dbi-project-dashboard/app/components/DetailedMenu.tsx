import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Database,
  BarChart2,
  Settings,
  Users,
  Building,
  Package,
  Activity,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

interface MenuProps {
  selectedSection: string;
  onSectionChange: (section: string) => void;
  onPerformanceTest: () => void;
  onFilter: () => void;
  onRefresh: () => void;
}

export function DetailedMenu({
  selectedSection,
  onSectionChange,
  onPerformanceTest,
  onFilter,
  onRefresh,
}: MenuProps) {
  const menuSections = [
    {
      title: "Data Management",
      items: [
        {
          id: "Tiere",
          name: "Animals",
          icon: Package,
          description: "Manage animal data",
        },
        {
          id: "Filialen",
          name: "Branches",
          icon: Building,
          description: "Manage branch locations",
        },
        {
          id: "TierFilialen",
          name: "Relations",
          icon: Users,
          description: "Manage animal-branch relations",
        },
      ],
    },
    {
      title: "Analytics",
      items: [
        {
          id: "performance",
          name: "Performance",
          icon: Activity,
          description: "View system performance",
        },
        {
          id: "statistics",
          name: "Statistics",
          icon: BarChart2,
          description: "View statistics",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          id: "database",
          name: "Database",
          icon: Database,
          description: "Database configuration",
        },
        {
          id: "preferences",
          name: "Preferences",
          icon: Settings,
          description: "User preferences",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onFilter}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Button variant="default" size="sm" onClick={onPerformanceTest}>
          <Activity className="h-4 w-4 mr-2" />
          Test Performance
        </Button>
      </div>

      {menuSections.map((section) => (
        <div key={section.title} className="space-y-2">
          <h3 className="px-4 text-sm font-semibold text-muted-foreground">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <div className="flex flex-col items-start">
                  <span>{item.name}</span>
                  <span className="text-xs opacity-70">{item.description}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
