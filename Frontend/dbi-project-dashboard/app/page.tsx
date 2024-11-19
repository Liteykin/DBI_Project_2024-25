"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { toast, Toaster } from "react-hot-toast";
import { Sidebar } from "./components/Layout/Sidebar";
import { DatabaseSelector } from "./components/DatabaseSelection/DatabaseSelector";
import { DataManagementCard } from "./components/DataManagement/DataManagementCard";
import { apiService } from "./services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

const apiSections = [
  {
    name: "Tiere",
    route: "/tiere",
    icon: "🦁",
    description: "Manage animal data and inventory",
  },
  {
    name: "Filialen",
    route: "/filialen",
    icon: "🏢",
    description: "Manage branch locations and details",
  },
  {
    name: "TierFilialen",
    route: "/tierfilialen",
    icon: "🏢🦁",
    description: "Manage animal-branch relationships",
  },
] as const;

const dbTypes = ["Relational", "MongoDB"] as const;

type Section = (typeof apiSections)[number];
type DbType = (typeof dbTypes)[number];

interface FormData {
  name?: string;
  groesse?: number;
  gewicht?: number;
  anzahl?: number;
  adresse?: string;
  filialeId?: number;
  tierName?: string;
}

interface SeedingDialogData {
  tierCount?: number;
  filialeCount?: number;
  tierFilialeCount?: number;
  tierProFilialeCount?: number;
}

export default function Dashboard() {
  // State management
  const [selectedSection, setSelectedSection] = useState<Section>(
    apiSections[0]
  );
  const [selectedDbType, setSelectedDbType] = useState<DbType>(dbTypes[0]);
  const [formData, setFormData] = useState<FormData>({});
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [seedingData, setSeedingData] = useState<SeedingDialogData>({});
  const [filterValue, setFilterValue] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const { theme, setTheme } = useTheme();
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  interface TimedResult<T> {
    result: T;
    executionTime?: number;
  }

  const API_BASE_URL = "http://localhost:5184";

  // Data fetching function
  const fetchData = useCallback(async () => {
    if (!selectedSection || !selectedDbType) return;

    setIsLoading(true);
    setIsSyncing(true);

    try {
      const baseUrl =
        selectedDbType === "MongoDB" ? `${API_BASE_URL}/mongo` : API_BASE_URL;

      const response = await fetch(`${baseUrl}${selectedSection.route}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const timedResult: TimedResult<any[]> = await response.json();
      let transformedData: any[] = [];

      // Transform the data based on section
      if (timedResult.result) {
        switch (selectedSection.name) {
          case "Tiere":
            transformedData = timedResult.result.map((item) => ({
              ...item,
              id: item.name,
              displayName: item.name,
              metrics: {
                size: item.groesse,
                weight: item.gewicht,
                count: item.anzahl,
              },
            }));
            break;

          case "Filialen":
            transformedData = timedResult.result.map((item) => ({
              ...item,
              id: item.id || item.name,
              displayName: item.name,
              location: item.adresse,
              animals:
                selectedDbType === "MongoDB"
                  ? (item.tiere || []).map((t: any) => ({
                      name: t.name,
                      count: t.anzahl,
                      displayInfo: `${t.name} (${t.anzahl})`,
                    }))
                  : (item.tierFilialen || []).map((tf: any) => ({
                      name: tf.tierName,
                      count: tf.anzahl,
                      displayInfo: `${tf.tierName} (${tf.anzahl})`,
                    })),
            }));
            break;

          case "TierFilialen":
            if (selectedDbType !== "MongoDB") {
              transformedData = timedResult.result.map((item) => ({
                ...item,
                id: `${item.filialeId}-${item.tierName}`,
                displayName: `${item.tierName} at Branch ${item.filialeId}`,
                relationship: {
                  branch: item.filialeId,
                  animal: item.tierName,
                  count: item.anzahl,
                },
              }));
            }
            break;
        }
      }

      setData(transformedData);
      setFilteredData(transformedData);
      toast.success(`${selectedSection.name} data loaded successfully`);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(`Failed to fetch ${selectedSection.name} data`);
      setData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [selectedSection, selectedDbType]);

  // Use the fetch data with proper error boundaries
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load data. Please refresh the page.");
      }
    };

    loadData();
  }, [fetchData]);

  const handleError = (error: Error) => {
    console.error("Application error:", error);
    toast.error("An error occurred. Please refresh the page.");
  };

  useEffect(() => {
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  const handleSectionChange = (sectionName: string) => {
    const newSection = apiSections.find(
      (section) => section.name === sectionName
    );
    if (newSection) {
      if (newSection.name === "Tiere" && selectedDbType === "MongoDB") {
        toast.error("Animal management is not available in MongoDB mode");
        return;
      }
      setSelectedSection(newSection);
      setFilterValue("");
      setFilteredData([]);
      toast.success(`Switched to ${newSection.name} management`);
    }
  };

  // Filter handling
  const handleFilter = async () => {
    setIsLoading(true);
    try {
      if (!filterValue.trim()) {
        setFilteredData(data);
        return;
      }

      const isMongoDb = selectedDbType === "MongoDB";
      let filteredResults: any[] = [];

      switch (selectedSection.name) {
        case "Tiere":
          try {
            // For both MongoDB and Relational
            const response = await apiService.getTierByName(
              filterValue,
              isMongoDb
            );
            if (response.data) {
              // Transform the response to match the expected format
              const transformedData = {
                ...response.data,
                id: response.data.name,
                displayName: response.data.name,
                metrics: {
                  size: response.data.groesse,
                  weight: response.data.gewicht,
                  count: isMongoDb ? response.data.anzahl : undefined,
                },
              };
              filteredResults = [transformedData];
            }
          } catch (error) {
            console.error("Error fetching filtered Tiere:", error);
            // Fallback to local filtering
            filteredResults = data.filter((tier) =>
              tier.name.toLowerCase().includes(filterValue.toLowerCase())
            );
          }
          break;

        case "Filialen":
          try {
            const response = await apiService.getFilialeByTier(
              filterValue,
              isMongoDb
            );
            if (response.data) {
              // Transform the response to match the expected format
              filteredResults = response.data.map((filiale) => ({
                ...filiale,
                id: filiale.id || filiale.name,
                displayName: filiale.name,
                location: filiale.adresse,
                animals: isMongoDb
                  ? (filiale.tiere || []).map((t: any) => ({
                      name: t.name,
                      count: t.anzahl,
                      displayInfo: `${t.name} (${t.anzahl})`,
                    }))
                  : (filiale.tierFilialen || []).map((tf: any) => ({
                      name: tf.tierName,
                      count: tf.anzahl,
                      displayInfo: `${tf.tierName} (${tf.anzahl})`,
                    })),
              }));
            }

            // If no results found by tier name, try filtering by filiale name
            if (filteredResults.length === 0) {
              filteredResults = data.filter((filiale) =>
                filiale.name.toLowerCase().includes(filterValue.toLowerCase())
              );
            }
          } catch (error) {
            console.error("Error fetching filtered Filialen:", error);
            // Fallback to local filtering
            filteredResults = data.filter((filiale) =>
              filiale.name.toLowerCase().includes(filterValue.toLowerCase())
            );
          }
          break;

        case "TierFilialen":
          if (!isMongoDb) {
            try {
              const response = await apiService.getTierFilialeByTier(
                filterValue,
                false
              );
              if (response.data) {
                // Transform the response to match the expected format
                filteredResults = response.data.map((tf) => ({
                  ...tf,
                  id: `${tf.filialeId}-${tf.tierName}`,
                  displayName: `${tf.tierName} at Branch ${tf.filialeId}`,
                  relationship: {
                    branch: tf.filialeId,
                    animal: tf.tierName,
                    count: tf.anzahl,
                  },
                }));
              }
            } catch (error) {
              console.error("Error fetching filtered TierFilialen:", error);
              // Fallback to local filtering
              filteredResults = data.filter((tf) =>
                tf.tierName.toLowerCase().includes(filterValue.toLowerCase())
              );
            }
          }
          break;
      }

      setFilteredData(filteredResults);
      toast.success(`Filter applied: Found ${filteredResults.length} results`);
    } catch (error) {
      console.error("Error applying filter:", error);
      toast.error("Failed to apply filter");
      setFilteredData([]);
    } finally {
      setIsLoading(false);
      setShowFilterDialog(false);
    }
  };

  // Database seeding
  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const isMongoDb = selectedDbType === "MongoDB";
      if (isMongoDb) {
        await apiService.startSeed(
          {
            tierProFilialeCount: seedingData.tierProFilialeCount || 5,
            filialeCount: seedingData.filialeCount || 10,
          } as any,
          true
        );
      } else {
        await apiService.startSeed(
          {
            tierCount: seedingData.tierCount || 10,
            filialeCount: seedingData.filialeCount || 5,
            tierFilialeCount: seedingData.tierFilialeCount || 15,
          } as any,
          false
        );
      }
      toast.success("Database seeded successfully");
      await fetchData();
    } catch (error) {
      toast.error("Failed to seed database");
      console.error("Seeding error:", error);
    } finally {
      setIsLoading(false);
      setShowSeedDialog(false);
      setSeedingData({});
    }
  };

  // CRUD operations
  const handleCreate = async (data: any) => {
    setIsLoading(true);
    try {
      const isMongoDb = selectedDbType === "MongoDB";
      switch (selectedSection.name) {
        case "Tiere":
          await apiService.createTier(data, isMongoDb);
          break;
        case "Filialen":
          await apiService.createFiliale(data, isMongoDb);
          break;
        case "TierFilialen":
          if (!isMongoDb) {
            await apiService.createTierFiliale(data, isMongoDb);
          }
          break;
      }
      toast.success(`${selectedSection.name} created successfully`);
      await fetchData();
    } catch (error) {
      toast.error(`Failed to create ${selectedSection.name}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string | number, formData: any) => {
    try {
      const baseUrl =
        selectedDbType === "MongoDB" ? `${API_BASE_URL}/mongo` : API_BASE_URL;

      let endpoint = "";
      if (selectedDbType === "MongoDB" && selectedSection.name === "Filialen") {
        endpoint = "/filiale";
      } else if (selectedSection.name === "Tiere") {
        endpoint = "/tier";
      } else if (selectedSection.name === "Filialen") {
        endpoint = "/filiale";
      } else {
        endpoint = "/tierfiliale";
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update item");
      }

      toast.success("Updated successfully");
      await fetchData();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(error.message || "Failed to update item");
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      const baseUrl =
        selectedDbType === "MongoDB" ? `${API_BASE_URL}/mongo` : API_BASE_URL;

      const endpoint =
        selectedSection.name === "Tiere"
          ? `/tier/${id}`
          : selectedSection.name === "Filialen"
          ? `/filiale/${id}`
          : `/tierfiliale/${id}`;

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete item");
      }

      toast.success("Deleted successfully");
      await fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(error.message || "Failed to delete item");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await handleUpdate(editingId, formData);
      } else {
        await handleCreate(formData);
      }
      setFormData({});
      setEditingId(null);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Toaster position="top-right" />

      <div className="fixed inset-y-0 left-0 w-64">
        <Sidebar
          selectedSection={selectedSection}
          onSectionChange={handleSectionChange}
          onRefresh={fetchData}
          onFilter={() => setShowFilterDialog(true)}
          onSeed={() => setShowSeedDialog(true)}
          isSyncing={isSyncing}
          selectedDbType={selectedDbType}
        />
      </div>

      <div className="flex-1 ml-64">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6 overflow-y-auto smooth-scroll">
            <DatabaseSelector
              selectedDbType={selectedDbType}
              onDbTypeChange={(type) => {
                setSelectedDbType(type as DbType);
                setData([]);
                setFilteredData([]);
              }}
              dbTypes={dbTypes}
            />

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center h-64"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <DataManagementCard
                    selectedSection={selectedSection}
                    formData={formData}
                    editingId={editingId}
                    isLoading={isLoading}
                    data={filteredData.length > 0 ? filteredData : data}
                    selectedDbType={selectedDbType}
                    onSubmit={handleSubmit}
                    onReset={() => {
                      setFormData({});
                      setEditingId(null);
                    }}
                    onEdit={(id, item) => {
                      setEditingId(id);
                      setFormData(item);
                    }}
                    onDelete={handleDelete}
                    parentRef={parentRef}
                    virtualizer={rowVirtualizer}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter {selectedSection.name}</DialogTitle>
            <DialogDescription>
              Enter search criteria to filter{" "}
              {selectedSection.name.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="filter">Search Term</Label>
              <Input
                id="filter"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder={`Enter ${selectedSection.name.toLowerCase()} name`}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowFilterDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleFilter} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Filtering...
                </>
              ) : (
                "Apply Filter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seed Dialog */}
      <Dialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Seed Database</DialogTitle>
            <DialogDescription>
              Configure the amount of test data to generate
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedDbType === "MongoDB" ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="filialeCount">Number of Branches</Label>
                  <Input
                    id="filialeCount"
                    type="number"
                    value={seedingData.filialeCount || ""}
                    onChange={(e) =>
                      setSeedingData({
                        ...seedingData,
                        filialeCount: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="100"
                    className="col-span-3"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tierProFilialeCount">
                    Animals per Branch
                  </Label>
                  <Input
                    id="tierProFilialeCount"
                    type="number"
                    value={seedingData.tierProFilialeCount || ""}
                    onChange={(e) =>
                      setSeedingData({
                        ...seedingData,
                        tierProFilialeCount: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="50"
                    className="col-span-3"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="tierCount">Number of Animals</Label>
                  <Input
                    id="tierCount"
                    type="number"
                    value={seedingData.tierCount || ""}
                    onChange={(e) =>
                      setSeedingData({
                        ...seedingData,
                        tierCount: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="100"
                    className="col-span-3"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filialeCount">Number of Branches</Label>
                  <Input
                    id="filialeCount"
                    type="number"
                    value={seedingData.filialeCount || ""}
                    onChange={(e) =>
                      setSeedingData({
                        ...seedingData,
                        filialeCount: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="50"
                    className="col-span-3"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tierFilialeCount">Number of Relations</Label>
                  <Input
                    id="tierFilialeCount"
                    type="number"
                    value={seedingData.tierFilialeCount || ""}
                    onChange={(e) =>
                      setSeedingData({
                        ...seedingData,
                        tierFilialeCount: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="200"
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSeedDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleSeed}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                "Start Seeding"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Test Dialog */}
      <Dialog
        open={showPerformanceDialog}
        onOpenChange={setShowPerformanceDialog}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Performance Analysis</DialogTitle>
            <DialogDescription>
              Monitor and analyze database performance metrics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">{/* Performance test content */}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
