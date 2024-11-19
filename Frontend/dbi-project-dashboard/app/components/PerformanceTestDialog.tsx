// app/components/PerformanceTestDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiService } from "@/app/services/api";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface PerformanceTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: string;
  dbType: string;
}

interface PerformanceResult {
  operation: string;
  responseTime: number;
  timestamp: number;
  success: boolean;
}

export function PerformanceTestDialog({
  isOpen,
  onClose,
  currentSection,
  dbType,
}: PerformanceTestDialogProps) {
  const [results, setResults] = useState<PerformanceResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeOperation, setActiveOperation] = useState<string>("read");
  const [error, setError] = useState<string | null>(null);

  const runPerformanceTest = async () => {
    setIsRunning(true);
    setError(null);
    setResults([]);

    try {
      const operations = {
        read: async () => {
          const startTime = performance.now();
          try {
            if (currentSection === "Tiere") {
              await apiService.getAllTiere(dbType === "MongoDB");
            } else if (currentSection === "Filialen") {
              await apiService.getAllFilialen(dbType === "MongoDB");
            } else {
              await apiService.getAllTierFilialen(dbType === "MongoDB");
            }
            return { success: true, time: performance.now() - startTime };
          } catch (error) {
            return { success: false, time: performance.now() - startTime };
          }
        },
        write: async () => {
          const startTime = performance.now();
          try {
            const testData = generateTestData(currentSection);
            if (currentSection === "Tiere") {
              await apiService.createTier(
                testData as any,
                dbType === "MongoDB"
              );
            } else if (currentSection === "Filialen") {
              await apiService.createFiliale(
                testData as any,
                dbType === "MongoDB"
              );
            } else {
              await apiService.createTierFiliale(
                testData as any,
                dbType === "MongoDB"
              );
            }
            return { success: true, time: performance.now() - startTime };
          } catch (error) {
            return { success: false, time: performance.now() - startTime };
          }
        },
      };

      for (let i = 0; i < 10; i++) {
        const result = await operations[
          activeOperation as keyof typeof operations
        ]();
        setResults((prev) => [
          ...prev,
          {
            operation: activeOperation,
            responseTime: result.time,
            timestamp: Date.now(),
            success: result.success,
          },
        ]);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsRunning(false);
    }
  };

  const generateTestData = (section: string) => {
    switch (section) {
      case "Tiere":
        return {
          name: `Test_${Date.now()}`,
          groesse: Math.random() * 100,
          gewicht: Math.random() * 50,
          anzahl: Math.floor(Math.random() * 10),
        };
      case "Filialen":
        return {
          name: `Branch_${Date.now()}`,
          adresse: "Test Address",
        };
      default:
        return {
          filialeId: 1,
          tierName: "Test",
          anzahl: Math.floor(Math.random() * 10),
        };
    }
  };

  const getAverageResponseTime = () => {
    if (!results.length) return 0;
    return (
      results.reduce((acc, curr) => acc + curr.responseTime, 0) / results.length
    );
  };

  const getSuccessRate = () => {
    if (!results.length) return 0;
    return (results.filter((r) => r.success).length / results.length) * 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Performance Analysis: {currentSection}
          </DialogTitle>
          <DialogDescription>
            Monitor and analyze {dbType} database performance metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeOperation} onValueChange={setActiveOperation}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="read">Read Operations</TabsTrigger>
              <TabsTrigger value="write">Write Operations</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  onClick={runPerformanceTest}
                  disabled={isRunning}
                  className="w-full h-12"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Running Performance Test...
                    </>
                  ) : (
                    "Start Performance Test"
                  )}
                </Button>
              </motion.div>
            </div>

            <AnimatePresence>
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 mt-6"
                >
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(timestamp) =>
                            new Date(timestamp).toLocaleTimeString()
                          }
                        />
                        <YAxis
                          label={{
                            value: "Response Time (ms)",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip
                          labelFormatter={(timestamp) =>
                            new Date(timestamp).toLocaleString()
                          }
                          formatter={(value: number) => [
                            `${value.toFixed(2)} ms`,
                          ]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="responseTime"
                          stroke="#8884d8"
                          name="Response Time"
                          dot={{ strokeWidth: 2 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-lg bg-primary/10"
                    >
                      <div className="text-sm font-medium">
                        Average Response Time
                      </div>
                      <div className="text-2xl font-bold">
                        {getAverageResponseTime().toFixed(2)} ms
                      </div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-lg bg-primary/10"
                    >
                      <div className="text-sm font-medium">Success Rate</div>
                      <div className="text-2xl font-bold">
                        {getSuccessRate().toFixed(1)}%
                      </div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-lg bg-primary/10"
                    >
                      <div className="text-sm font-medium">
                        Total Operations
                      </div>
                      <div className="text-2xl font-bold">{results.length}</div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
