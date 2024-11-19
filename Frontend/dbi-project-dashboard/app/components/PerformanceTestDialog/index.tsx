import { useState, useEffect } from "react";
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
  BarChart,
  Bar,
} from "recharts";
import { apiService } from "@/app/services/api";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PerformanceTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: string;
}

interface PerformanceData {
  operation: string;
  database: string;
  responseTime: number;
  timestamp: number;
  success: boolean;
}

interface AggregatedData {
  operation: string;
  database: string;
  avgResponseTime: number;
  successRate: number;
  sampleSize: number;
}

export function PerformanceTestDialog({
  isOpen,
  onClose,
  currentSection,
}: PerformanceTestDialogProps) {
  const [results, setResults] = useState<PerformanceData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeOperation, setActiveOperation] = useState<string>("read");
  const [error, setError] = useState<string | null>(null);
  const [dataSize, setDataSize] = useState<string>("medium");
  const [comparisonView, setComparisonView] = useState<string>("timeline");

  const dataSizes = {
    small: { items: 100, iterations: 5 },
    medium: { items: 500, iterations: 10 },
    large: { items: 1000, iterations: 15 },
  };

  useEffect(() => {
    if (!isOpen) {
      setResults([]);
      setIsRunning(false);
      setError(null);
    }
  }, [isOpen]);

  const runPerformanceTest = async () => {
    setIsRunning(true);
    setError(null);
    setResults([]);

    const { items, iterations } = dataSizes[dataSize as keyof typeof dataSizes];

    try {
      // Test both databases
      for (const database of ["Relational", "MongoDB"]) {
        const isMongoDb = database === "MongoDB";

        for (let i = 0; i < iterations; i++) {
          // Read test
          if (activeOperation === "read" || activeOperation === "both") {
            const startRead = performance.now();
            try {
              if (currentSection === "Tiere") {
                await apiService.getAllTiere(isMongoDb);
              } else if (currentSection === "Filialen") {
                await apiService.getAllFilialen(isMongoDb);
              } else {
                await apiService.getAllTierFilialen(isMongoDb);
              }
              const endRead = performance.now();
              setResults((prev) => [
                ...prev,
                {
                  operation: "Read",
                  database,
                  responseTime: endRead - startRead,
                  timestamp: Date.now(),
                  success: true,
                },
              ]);
            } catch (error) {
              setResults((prev) => [
                ...prev,
                {
                  operation: "Read",
                  database,
                  responseTime: performance.now() - startRead,
                  timestamp: Date.now(),
                  success: false,
                },
              ]);
            }
          }

          // Write test
          if (activeOperation === "write" || activeOperation === "both") {
            const startWrite = performance.now();
            try {
              const testData = {
                name: `Test_${Date.now()}_${i}`,
                groesse: Math.random() * 100,
                gewicht: Math.random() * 50,
                anzahl: Math.floor(Math.random() * 10),
              };

              if (currentSection === "Tiere") {
                await apiService.createTier(testData, isMongoDb);
              } else if (currentSection === "Filialen") {
                await apiService.createFiliale(
                  {
                    ...testData,
                    adresse: `Test Address ${i}`,
                  },
                  isMongoDb
                );
              }

              const endWrite = performance.now();
              setResults((prev) => [
                ...prev,
                {
                  operation: "Write",
                  database,
                  responseTime: endWrite - startWrite,
                  timestamp: Date.now(),
                  success: true,
                },
              ]);
            } catch (error) {
              setResults((prev) => [
                ...prev,
                {
                  operation: "Write",
                  database,
                  responseTime: performance.now() - startWrite,
                  timestamp: Date.now(),
                  success: false,
                },
              ]);
            }
          }

          // Update test
          if (activeOperation === "update" || activeOperation === "both") {
            const startUpdate = performance.now();
            try {
              const testData = {
                name: `Test_${Date.now()}_${i}`,
                groesse: Math.random() * 100,
                gewicht: Math.random() * 50,
                anzahl: Math.floor(Math.random() * 10),
              };

              if (currentSection === "Tiere") {
                await apiService.updateTier(testData, isMongoDb);
              } else if (currentSection === "Filialen") {
                await apiService.updateFiliale(
                  {
                    ...testData,
                    adresse: `Test Address ${i}`,
                  },
                  isMongoDb
                );
              }

              const endUpdate = performance.now();
              setResults((prev) => [
                ...prev,
                {
                  operation: "Update",
                  database,
                  responseTime: endUpdate - startUpdate,
                  timestamp: Date.now(),
                  success: true,
                },
              ]);
            } catch (error) {
              setResults((prev) => [
                ...prev,
                {
                  operation: "Update",
                  database,
                  responseTime: performance.now() - startUpdate,
                  timestamp: Date.now(),
                  success: false,
                },
              ]);
            }
          }

          // Delete test
          if (activeOperation === "delete" || activeOperation === "both") {
            const startDelete = performance.now();
            try {
              const testData = {
                name: `Test_${Date.now()}_${i}`,
                groesse: Math.random() * 100,
                gewicht: Math.random() * 50,
                anzahl: Math.floor(Math.random() * 10),
              };

              if (currentSection === "Tiere") {
                await apiService.deleteTier(testData.name, isMongoDb);
              } else if (currentSection === "Filialen") {
                await apiService.deleteFiliale(testData.name, isMongoDb);
              }

              const endDelete = performance.now();
              setResults((prev) => [
                ...prev,
                {
                  operation: "Delete",
                  database,
                  responseTime: endDelete - startDelete,
                  timestamp: Date.now(),
                  success: true,
                },
              ]);
            } catch (error) {
              setResults((prev) => [
                ...prev,
                {
                  operation: "Delete",
                  database,
                  responseTime: performance.now() - startDelete,
                  timestamp: Date.now(),
                  success: false,
                },
              ]);
            }
          }

          // Add delay between iterations
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsRunning(false);
    }
  };

  const getAggregatedData = (): AggregatedData[] => {
    const aggregated: { [key: string]: AggregatedData } = {};

    results.forEach((result) => {
      const key = `${result.operation}-${result.database}`;
      if (!aggregated[key]) {
        aggregated[key] = {
          operation: result.operation,
          database: result.database,
          avgResponseTime: 0,
          successRate: 0,
          sampleSize: 0,
        };
      }

      const entry = aggregated[key];
      entry.avgResponseTime =
        (entry.avgResponseTime * entry.sampleSize + result.responseTime) /
        (entry.sampleSize + 1);
      entry.successRate =
        (entry.successRate * entry.sampleSize + (result.success ? 1 : 0)) /
        (entry.sampleSize + 1);
      entry.sampleSize += 1;
    });

    return Object.values(aggregated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Database Performance Comparison
          </DialogTitle>
          <DialogDescription>
            Compare performance metrics between MongoDB and Relational databases
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Operation Type</Label>
              <Select
                value={activeOperation}
                onValueChange={setActiveOperation}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read Operations</SelectItem>
                  <SelectItem value="write">Write Operations</SelectItem>
                  <SelectItem value="update">Update Operations</SelectItem>
                  <SelectItem value="delete">Delete Operations</SelectItem>
                  <SelectItem value="both">All Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Size</Label>
              <Select value={dataSize} onValueChange={setDataSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (100 items)</SelectItem>
                  <SelectItem value="medium">Medium (500 items)</SelectItem>
                  <SelectItem value="large">Large (1000 items)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={runPerformanceTest}
              disabled={isRunning}
              className="w-full h-12"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Running Performance Tests...
                </>
              ) : (
                "Start Performance Comparison"
              )}
            </Button>
          </motion.div>

          <Tabs value={comparisonView} onValueChange={setComparisonView}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              <TabsTrigger value="aggregate">Aggregate View</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="h-[400px]"
                  >
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
                          name="MongoDB"
                          connectNulls
                          dot={{ strokeWidth: 2 }}
                          data={results.filter((r) => r.database === "MongoDB")}
                        />
                        <Line
                          type="monotone"
                          dataKey="responseTime"
                          stroke="#82ca9d"
                          name="Relational"
                          connectNulls
                          dot={{ strokeWidth: 2 }}
                          data={results.filter(
                            (r) => r.database === "Relational"
                          )}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="aggregate" className="mt-4">
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getAggregatedData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="database" />
                          <YAxis
                            label={{
                              value: "Average Response Time (ms)",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip
                            formatter={(value: number) => [
                              `${value.toFixed(2)} ms`,
                            ]}
                          />
                          <Legend />
                          <Bar
                            dataKey="avgResponseTime"
                            fill="#8884d8"
                            name="Average Response Time"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {getAggregatedData().map((data) => (
                        <motion.div
                          key={`${data.operation}-${data.database}`}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 rounded-lg bg-primary/10"
                        >
                          <div className="text-sm font-medium">
                            {data.database} - {data.operation}
                          </div>
                          <div className="text-2xl font-bold">
                            {data.avgResponseTime.toFixed(2)} ms
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Success Rate: {(data.successRate * 100).toFixed(1)}%
                            <br />
                            Sample Size: {data.sampleSize}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-4 p-4 rounded-lg bg-muted">
                      <h3 className="text-lg font-semibold mb-2">
                        Performance Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getPerformanceAnalysis(getAggregatedData())}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getPerformanceAnalysis(data: AggregatedData[]): string {
  if (data.length === 0) return "No performance data available.";

  const mongoData = data.filter((d) => d.database === "MongoDB");
  const relationalData = data.filter((d) => d.database === "Relational");

  if (mongoData.length === 0 || relationalData.length === 0) {
    return "Insufficient data to compare databases.";
  }

  const mongoAvg =
    mongoData.reduce((acc, curr) => acc + curr.avgResponseTime, 0) /
    mongoData.length;
  const relationalAvg =
    relationalData.reduce((acc, curr) => acc + curr.avgResponseTime, 0) /
    relationalData.length;

  const difference = Math.abs(mongoAvg - relationalAvg);
  const fasterDb = mongoAvg < relationalAvg ? "MongoDB" : "Relational";
  const percentageDiff = (difference / Math.max(mongoAvg, relationalAvg)) * 100;

  const readComparison =
    mongoData.some((d) => d.operation === "Read") &&
    relationalData.some((d) => d.operation === "Read")
      ? `For read operations, ${
          mongoData.find((d) => d.operation === "Read")!.avgResponseTime <
          relationalData.find((d) => d.operation === "Read")!.avgResponseTime
            ? "MongoDB"
            : "Relational DB"
        } showed better performance.`
      : "";

  const writeComparison =
    mongoData.some((d) => d.operation === "Write") &&
    relationalData.some((d) => d.operation === "Write")
      ? `For write operations, ${
          mongoData.find((d) => d.operation === "Write")!.avgResponseTime <
          relationalData.find((d) => d.operation === "Write")!.avgResponseTime
            ? "MongoDB"
            : "Relational DB"
        } showed better performance.`
      : "";

  const updateComparison =
    mongoData.some((d) => d.operation === "Update") &&
    relationalData.some((d) => d.operation === "Update")
      ? `For update operations, ${
          mongoData.find((d) => d.operation === "Update")!.avgResponseTime <
          relationalData.find((d) => d.operation === "Update")!.avgResponseTime
            ? "MongoDB"
            : "Relational DB"
        } showed better performance.`
      : "";

  const deleteComparison =
    mongoData.some((d) => d.operation === "Delete") &&
    relationalData.some((d) => d.operation === "Delete")
      ? `For delete operations, ${
          mongoData.find((d) => d.operation === "Delete")!.avgResponseTime <
          relationalData.find((d) => d.operation === "Delete")!.avgResponseTime
            ? "MongoDB"
            : "Relational DB"
        } showed better performance.`
      : "";

  return `
    On average, ${fasterDb} performed ${percentageDiff.toFixed(
    1
  )}% faster in this test scenario.
    MongoDB average response time: ${mongoAvg.toFixed(2)}ms
    Relational DB average response time: ${relationalAvg.toFixed(2)}ms

    ${readComparison}
    ${writeComparison}
    ${updateComparison}
    ${deleteComparison}
  `;
}
