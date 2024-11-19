"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DatabaseSelectorProps {
  selectedDbType: string;
  onDbTypeChange: (type: string) => void;
  dbTypes: string[];
}

export function DatabaseSelector({
  selectedDbType,
  onDbTypeChange,
  dbTypes,
}: DatabaseSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Selection</CardTitle>
        <CardDescription>
          Choose between relational and MongoDB databases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedDbType} onValueChange={onDbTypeChange}>
          <TabsList className="grid w-full grid-cols-2">
            {dbTypes.map((type) => (
              <TabsTrigger key={type} value={type}>
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
}
