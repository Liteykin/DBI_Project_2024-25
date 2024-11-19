"use client";

import { Button } from "@/components/ui/button";
import { Filter, BarChart2, Menu } from "lucide-react";
import { motion } from "framer-motion";

interface MainHeaderProps {
  onMobileMenuOpen: () => void;
  onFilterOpen: () => void;
  onPerformanceOpen: () => void;
  selectedSection: {
    name: string;
    icon: string;
  };
}

export function MainHeader({
  onMobileMenuOpen,
  onFilterOpen,
  onPerformanceOpen,
  selectedSection,
}: MainHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-gray-800 p-4 shadow-sm">
      <button
        onClick={onMobileMenuOpen}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>
      <motion.h2
        className="text-2xl font-bold flex items-center text-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="mr-3 text-3xl">{selectedSection.icon}</span>
        {selectedSection.name}
      </motion.h2>
      <div className="flex space-x-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="sm" onClick={onFilterOpen}>
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="sm" onClick={onPerformanceOpen}>
            <BarChart2 className="mr-2 h-4 w-4" />
            Compare
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
