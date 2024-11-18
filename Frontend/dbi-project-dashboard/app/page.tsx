// page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { 
  ChevronRight, Menu, X, BarChart2, Database, 
  Filter, Search, Plus, Trash2, Edit, Save, 
  Sun, Moon, Loader2, RefreshCw 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast, Toaster } from 'react-hot-toast'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

// API URL
const API_BASE_URL = 'http://localhost:5184'

// Constants
const apiSections = [
  { name: 'Tiere', route: '/tiere', icon: '🦁' },
  { name: 'Filialen', route: '/filialen', icon: '🏢' },
  { name: 'TierFilialen', route: '/tierfilialen', icon: '🏢🦁' },
]

const dbTypes = ['Relational', 'MongoDB']

interface Tier {
  name: string;
  groesse: number;
  gewicht: number;
  anzahl?: number;
}

interface Filiale {
  id: number;
  name: string;
  adresse: string;
}

interface TierFiliale {
  filialeId: number;
  tierName: string;
  anzahl: number;
}

interface TimedResult<T> {
  result: T;
  time: string;
}

export default function Dashboard() {
  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState(apiSections[0])
  const [selectedDbType, setSelectedDbType] = useState(dbTypes[0])
  const [performanceData, setPerformanceData] = useState({})
  const [formData, setFormData] = useState<any>({})
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [filterCriteria, setFilterCriteria] = useState({})
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const { theme, setTheme } = useTheme()

  // Fetch Data
  useEffect(() => {
    fetchData()
  }, [selectedSection, selectedDbType])

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const baseUrl = selectedDbType === 'MongoDB' ? 
        `${API_BASE_URL}/mongo` : API_BASE_URL;
  
      const response = await fetch(`${baseUrl}${selectedSection.route}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const timedResult: TimedResult<any[]> = await response.json();
      setData(timedResult.result || []); // Access the result property
      toast.success('Data loaded successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
      setData([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Create new item
  const handleCreate = async (formData: any) => {
    try {
      const baseUrl = selectedDbType === 'MongoDB' ? 
        `${API_BASE_URL}/mongo` : API_BASE_URL

      const endpoint = selectedSection.name === 'Tiere' ? 
        '/tier' : selectedSection.name === 'Filialen' ? 
        '/filiale' : '/tierfiliale'

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create item')
      
      toast.success('Created successfully')
      await fetchData()
    } catch (error) {
      console.error('Error creating item:', error)
      toast.error('Failed to create item')
    }
  }

  // Update existing item
  const handleUpdate = async (id: string | number, formData: any) => {
    try {
      const baseUrl = selectedDbType === 'MongoDB' ? 
        `${API_BASE_URL}/mongo` : API_BASE_URL

      const endpoint = selectedSection.name === 'Tiere' ? 
        '/tier' : selectedSection.name === 'Filialen' ? 
        '/filiale' : '/tierfiliale'

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to update item')
      
      toast.success('Updated successfully')
      await fetchData()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Failed to update item')
    }
  }

  // Delete item
  const handleDelete = async (id: string | number) => {
    try {
      const baseUrl = selectedDbType === 'MongoDB' ? 
        `${API_BASE_URL}/mongo` : API_BASE_URL

      const endpoint = selectedSection.name === 'Tiere' ? 
        `/tier/${id}` : selectedSection.name === 'Filialen' ? 
        `/filiale/${id}` : `/tierfiliale/${id}`

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete item')
      
      toast.success('Deleted successfully')
      await fetchData()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (editingId) {
        await handleUpdate(editingId, formData)
      } else {
        await handleCreate(formData)
      }
      
      setFormData({})
      setEditingId(null)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Form submission failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Performance data fetching
  const fetchPerformanceData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: selectedSection.name,
          dbTypes: dbTypes
        })
      })

      if (!response.ok) throw new Error('Failed to fetch performance data')
      
      const result = await response.json()
      setPerformanceData(result)
      toast.success('Performance data updated')
    } catch (error) {
      console.error('Error fetching performance data:', error)
      toast.error('Failed to fetch performance data')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to render the data table
  const renderDataTable = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {selectedSection.name === 'Tiere' && (
              <>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Größe</TableHead>
                <TableHead>Gewicht</TableHead>
                {selectedDbType === 'MongoDB' && <TableHead>Anzahl</TableHead>}
              </>
            )}
            {selectedSection.name === 'Filialen' && (
              <>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Adresse</TableHead>
              </>
            )}
            {selectedSection.name === 'TierFilialen' && (
              <>
                <TableHead>Filiale ID</TableHead>
                <TableHead>Tier Name</TableHead>
                <TableHead>Anzahl</TableHead>
              </>
            )}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item, index) => (
            <TableRow key={index}>
              {selectedSection.name === 'Tiere' && (
                <>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.groesse}</TableCell>
                  <TableCell>{item.gewicht}</TableCell>
                  {selectedDbType === 'MongoDB' && (
                    <TableCell>{item.anzahl}</TableCell>
                  )}
                </>
              )}
              {selectedSection.name === 'Filialen' && (
                <>
                  <TableCell>{item.id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.adresse}</TableCell>
                </>
              )}
              {selectedSection.name === 'TierFilialen' && (
                <>
                  <TableCell>{item.filialeId}</TableCell>
                  <TableCell className="font-medium">{item.tierName}</TableCell>
                  <TableCell>{item.anzahl}</TableCell>
                </>
              )}
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setEditingId(item.id || item.name)
                      setFormData(item)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(item.id || item.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <motion.aside 
        className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0"
        initial={{ x: -64 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center flex-shrink-0 px-4 h-16 border-b border-gray-200 dark:border-gray-700">
            <Database className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-2xl font-bold text-primary">DBI Project</h1>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-2">
            {apiSections.map((section) => (
              <motion.button
                key={section.name}
                onClick={() => setSelectedSection(section)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full transition-colors duration-150 ease-in-out ${
                  selectedSection.name === section.name
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="mr-3 text-2xl">{section.icon}</span>
                {section.name}
                <ChevronRight className="ml-auto w-4 h-4" />
              </motion.button>
            ))}
          </nav>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <Button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {theme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 flex z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              {/* Mobile menu content */}
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <Database className="h-8 w-8 mr-3 text-primary" />
                  <h1 className="text-2xl font-bold text-primary">DBI Project</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {apiSections.map((section) => (
                    <button
                      key={section.name}
                      onClick={() => {
                        setSelectedSection(section);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-md w-full ${
                        selectedSection.name === section.name
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span className="mr-3 text-2xl">{section.icon}</span>
                      {section.name}
                      <ChevronRight className="ml-auto w-4 h-4" />
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 shadow-sm">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
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
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter {selectedSection.name}</DialogTitle>
                  <DialogDescription>
                    Set your filter criteria below
                  </DialogDescription>
                </DialogHeader>
                {/* Filter form content */}
              </DialogContent>
            </Dialog>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={fetchPerformanceData} variant="outline" size="sm">
                <BarChart2 className="mr-2 h-4 w-4" />
                Compare
              </Button>
            </motion.div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Database Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Database Selection</CardTitle>
                <CardDescription>
                  Choose between relational and MongoDB databases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={dbTypes[0]} className="w-full">
                  <TabsList className="mb-4">
                    {dbTypes.map((type) => (
                      <TabsTrigger 
                        key={type} 
                        value={type}
                        onClick={() => setSelectedDbType(type)}
                      >
                        {type}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedSection.name} Management</CardTitle>
                <CardDescription>
                  Manage your {selectedSection.name.toLowerCase()} data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSection.name === 'Tiere' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter animal name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="groesse">Größe</Label>
                          <Input
                            id="groesse"
                            type="number"
                            value={formData.groesse || ''}
                            onChange={(e) => setFormData({ ...formData, groesse: Number(e.target.value) })}
                            placeholder="Enter size"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gewicht">Gewicht</Label>
                          <Input
                            id="gewicht"
                            type="number"
                            value={formData.gewicht || ''}
                            onChange={(e) => setFormData({ ...formData, gewicht: Number(e.target.value) })}
                            placeholder="Enter weight"
                          />
                        </div>
                        {selectedDbType === 'MongoDB' && (
                          <div className="space-y-2">
                            <Label htmlFor="anzahl">Anzahl</Label>
                            <Input
                              id="anzahl"
                              type="number"
                              value={formData.anzahl || ''}
                              onChange={(e) => setFormData({ ...formData, anzahl: Number(e.target.value) })}
                              placeholder="Enter quantity"
                            />
                          </div>
                        )}
                      </>
                    )}
                    {selectedSection.name === 'Filialen' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="id">ID</Label>
                          <Input
                            id="id"
                            type="number"
                            value={formData.id || ''}
                            onChange={(e) => setFormData({ ...formData, id: Number(e.target.value) })}
                            placeholder="Enter branch ID"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter branch name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adresse">Adresse</Label>
                          <Input
                            id="adresse"
                            value={formData.adresse || ''}
                            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                            placeholder="Enter address"
                          />
                        </div>
                      </>
                    )}
                    {selectedSection.name === 'TierFilialen' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="filialeId">Filiale ID</Label>
                          <Input
                            id="filialeId"
                            type="number"
                            value={formData.filialeId || ''}
                            onChange={(e) => setFormData({ ...formData, filialeId: Number(e.target.value) })}
                            placeholder="Enter branch ID"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tierName">Tier Name</Label>
                          <Input
                            id="tierName"
                            value={formData.tierName || ''}
                            onChange={(e) => setFormData({ ...formData, tierName: e.target.value })}
                            placeholder="Enter animal name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="anzahl">Anzahl</Label>
                          <Input
                            id="anzahl"
                            type="number"
                            value={formData.anzahl || ''}
                            onChange={(e) => setFormData({ ...formData, anzahl: Number(e.target.value) })}
                            placeholder="Enter quantity"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData({})
                          setEditingId(null)
                        }}
                      >
                        Reset
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingId ? 'Updating...' : 'Creating...'}
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

                {/* Data Table Section */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedSection.name} List
                    </h3>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchData}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </motion.div>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-12 h-12 text-primary" />
                        </motion.div>
                        <p className="text-sm text-muted-foreground">
                          Loading {selectedSection.name}...
                        </p>
                      </div>
                    </div>
                  ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-muted/10 rounded-lg border border-dashed">
                      <Database className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground">No data found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get started by creating a new {selectedSection.name.toLowerCase().slice(0, -1)}
                      </p>
                      <Button onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add {selectedSection.name.toLowerCase().slice(0, -1)}
                      </Button>
                    </div>
                  ) : (
                    renderDataTable()
                  )}
                </div>

                {/* Performance Chart */}
                {Object.keys(performanceData).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Comparison</CardTitle>
                        <CardDescription>
                          Compare database performance metrics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                {
                                  name: 'Read Operations',
                                  Relational: performanceData.Relational?.read || 0,
                                  MongoDB: performanceData.MongoDB?.read || 0
                                },
                                {
                                  name: 'Write Operations',
                                  Relational: performanceData.Relational?.write || 0,
                                  MongoDB: performanceData.MongoDB?.write || 0
                                }
                              ]}
                            >
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="Relational" fill="hsl(var(--primary))" />
                              <Bar dataKey="MongoDB" fill="hsl(var(--secondary))" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}