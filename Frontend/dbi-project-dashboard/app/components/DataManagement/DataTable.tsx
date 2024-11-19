"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface DataTableProps {
  data: any[];
  selectedSection: {
    name: string;
    type: string;
  };
  selectedDbType: string;
  onEdit: (id: string | number, data: any) => void;
  onDelete: (id: string | number) => void;
}

export function DataTable({
  data,
  selectedSection,
  selectedDbType,
  onEdit,
  onDelete,
}: DataTableProps) {
  const [isLoading, setIsLoading] = useState(false);
  const parentRef = React.useRef<HTMLDivElement>(null);

  const getColumns = useCallback(() => {
    switch (selectedSection.name) {
      case "Tiere":
        return selectedDbType === "MongoDB"
          ? [
              { key: "name", label: "Name" },
              { key: "groesse", label: "Größe" },
              { key: "gewicht", label: "Gewicht" },
              { key: "anzahl", label: "Anzahl" },
            ]
          : [
              { key: "name", label: "Name" },
              { key: "groesse", label: "Größe" },
              { key: "gewicht", label: "Gewicht" },
            ];
      case "Filialen":
        return [
          { key: "name", label: "Name" },
          { key: "adresse", label: "Adresse" },
          { key: "tiere", label: "Tiere", isObject: true },
        ];
      case "TierFilialen":
        if (selectedDbType === "MongoDB") return [];
        return [
          { key: "filialeId", label: "Filiale ID" },
          { key: "tierName", label: "Tier Name" },
          { key: "anzahl", label: "Anzahl" },
        ];
      default:
        return [];
    }
  }, [selectedSection.name, selectedDbType]);

  const columns = getColumns();

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  const renderCell = (item: any, column: any) => {
    if (column.isObject && Array.isArray(item[column.key])) {
      return (
        <div className="max-w-md">
          {item[column.key].map((tier: any, index: number) => (
            <span
              key={index}
              className="inline-block bg-primary/10 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2"
            >
              {tier.name} ({tier.anzahl})
            </span>
          ))}
        </div>
      );
    }
    return item[column.key];
  };

  // Don't render for MongoDB TierFilialen
  if (selectedDbType === "MongoDB" && selectedSection.name === "TierFilialen") {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Tier-Filiale relationships are managed directly within the Filialen
        collection in MongoDB.
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto max-h-[600px] rounded-md border"
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="h-24 text-center"
              >
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : (
            rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = data[virtualRow.index];
              return (
                <motion.tr
                  key={virtualRow.index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCell(item, column)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item.id || item.name, item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id || item.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
