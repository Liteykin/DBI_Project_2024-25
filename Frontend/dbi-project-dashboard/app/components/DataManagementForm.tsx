import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Save } from "lucide-react";
import { motion } from "framer-motion";

interface DataManagementFormProps {
  formData: any;
  editingId: string | number | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
  selectedSection: string;
}

export function DataManagementForm({
  formData,
  editingId,
  isLoading,
  onSubmit,
  onReset,
  selectedSection,
}: DataManagementFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedSection === "Tiere" && (
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
                  setFormData({ ...formData, groesse: Number(e.target.value) })
                }
                placeholder="Enter size"
              />
            </div>
            {/* Add other fields specific to Tiere */}
          </>
        )}
        {/* Add similar blocks for other sections */}
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
