// app/components/Layout/Sidebar.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Popover } from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
