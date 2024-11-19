import React, { useCallback } from "react";
import { toast } from "react-hot-toast";
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
import { Edit, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataForm } from "./DataForm";
import { apiService } from "@/app/services/api";

interface DataManagementCardProps {
  selectedSection: {
    name: string;
    type: string;
  };
  formData: any;
  editingId: string | number | null;
  isLoading: boolean;
  data: any[];
  selectedDbType: string;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
  onEdit: (id: string | number, data: any) => void;
  onDelete: (id: string | number) => void;
  parentRef: React.RefObject<HTMLDivElement>;
  virtualizer: ReturnType<typeof useVirtualizer>;
}

export function DataManagementCard({
  selectedSection,
  formData,
  editingId,
  isLoading,
  data,
  selectedDbType,
  onSubmit,
  onReset,
  onEdit,
  onDelete,
  parentRef,
  virtualizer,
}: DataManagementCardProps) {
  const showForm = !(
    selectedDbType === "MongoDB" && selectedSection.name === "TierFilialen"
  );

  const handleAddAnimal = async (filialeId: string, tierData: any) => {
    try {
      await apiService.createMongoTierInFiliale(filialeId, tierData);
      toast.success("Animal added successfully");
    } catch (error) {
      console.error("Error adding animal:", error);
      toast.error("Failed to add animal");
    }
  };

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

  const renderCell = (item: any, column: any) => {
    if (!item || !column) return null;

    try {
      if (column.isObject && Array.isArray(item[column.key])) {
        return (
          <div className="max-w-md">
            {item[column.key].map((tier: any, index: number) => (
              <span
                key={index}
                className="inline-block bg-primary/10 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2"
              >
                {tier?.name || "Unknown"} ({tier?.anzahl || 0})
              </span>
            ))}
          </div>
        );
      }
      return item[column.key] ?? "-";
    } catch (error) {
      console.error("Error rendering cell:", error);
      return <span className="text-red-500">Error</span>;
    }
  };

  if (selectedDbType === "MongoDB" && selectedSection.name === "TierFilialen") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tier-Filiale Management</CardTitle>
          <CardDescription>
            Animal-Branch relationships are managed within the Branches
            collection in MongoDB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please use the Branches section to manage animal relationships in
              MongoDB mode.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const hasNoData = !isLoading && (!data || data.length === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{selectedSection.name} Management</CardTitle>
        <CardDescription>
          Manage your {selectedSection.name.toLowerCase()} data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showForm && (
          <DataForm
            selectedSection={selectedSection}
            formData={formData}
            editingId={editingId}
            isLoading={isLoading}
            onSubmit={onSubmit}
            onReset={onReset}
            selectedDbType={selectedDbType}
            onAddAnimal={handleAddAnimal}
          />
        )}

        <div
          ref={parentRef}
          className="overflow-auto max-h-[600px] rounded-md border smooth-scroll relative"
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
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="h-24 text-center"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center"
                      >
                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Loading data...
                        </span>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ) : hasNoData ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="h-24 text-center"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center text-muted-foreground"
                      >
                        <AlertTriangle className="h-6 w-6 mb-2" />
                        <span>No data available</span>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ) : (
                  virtualizer.getVirtualItems().map((virtualRow) => {
                    const item = data[virtualRow.index];
                    if (!item) return null;

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
                              className="hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this item?"
                                  )
                                ) {
                                  onDelete(item.id || item.name);
                                }
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-100/50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
