"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "./DataTable";
import { DataForm } from "./DataForm";

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
}: DataManagementCardProps) {
  // Don't show form for MongoDB TierFilialen
  const showForm = !(
    selectedDbType === "MongoDB" && selectedSection.name === "TierFilialen"
  );

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
          />
        )}

        <DataTable
          data={data}
          selectedSection={selectedSection}
          selectedDbType={selectedDbType}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
}
