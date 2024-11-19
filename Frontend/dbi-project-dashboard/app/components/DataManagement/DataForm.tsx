// app/components/DataManagement/DataForm.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Save } from "lucide-react";
import { motion } from "framer-motion";

interface DataFormProps {
  selectedSection: {
    name: string;
    type: string;
  };
  formData: any;
  editingId: string | number | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
}

export function DataForm({
  selectedSection,
  formData,
  editingId,
  isLoading,
  onSubmit,
  onReset,
}: DataFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedSection.name === "Tiere" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groesse">Größe</Label>
              <Input
                id="groesse"
                type="number"
                value={formData.groesse || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    groesse: Number(e.target.value),
                  })
                }
                placeholder="Enter size"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gewicht">Gewicht</Label>
              <Input
                id="gewicht"
                type="number"
                value={formData.gewicht || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gewicht: Number(e.target.value),
                  })
                }
                placeholder="Enter weight"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anzahl">Anzahl</Label>
              <Input
                id="anzahl"
                type="number"
                value={formData.anzahl || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    anzahl: Number(e.target.value),
                  })
                }
                placeholder="Enter count"
              />
            </div>
          </>
        )}

        {selectedSection.name === "Filialen" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter branch name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={formData.adresse || ""}
                onChange={(e) =>
                  setFormData({ ...formData, adresse: e.target.value })
                }
                placeholder="Enter address"
              />
            </div>
          </>
        )}

        {selectedSection.name === "TierFilialen" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="filialeId">Filiale ID</Label>
              <Input
                id="filialeId"
                type="number"
                value={formData.filialeId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    filialeId: Number(e.target.value),
                  })
                }
                placeholder="Enter branch ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tierName">Tier Name</Label>
              <Input
                id="tierName"
                value={formData.tierName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tierName: e.target.value })
                }
                placeholder="Enter animal name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anzahl">Anzahl</Label>
              <Input
                id="anzahl"
                type="number"
                value={formData.anzahl || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    anzahl: Number(e.target.value),
                  })
                }
                placeholder="Enter count"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button type="button" variant="outline" onClick={onReset}>
            Reset
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingId ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                {editingId ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create
                  </>
                )}
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
