'use client'

import { useState, useEffect, useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, BarChart, Search, ArrowUpDown, Plus, Pencil, Upload, X, EyeIcon } from 'lucide-react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Job = {
  id: number
  title: string
  company: string
  ctc: number | null
  status: 'Applied' | 'Rejected' | 'Selected'

}

function JobAnalytics({ jobData }: { jobData: Job[] }) {
  const statusCounts = jobData.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalJobs = jobData.length
  const pieChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count
  }))

  const lineChartData = jobData.map((job, index) => ({
    name: `Job ${index + 1}`,
    ctc: job.ctc
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

  return (
    <div className="grid gap-4 md:grid-cols-2 md:h-full">
      <Card>
        <CardHeader>
          <CardTitle>Application Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Statistics:</h3>
            <p>Total Applications: {totalJobs}</p>
            <p>Applied: {statusCounts['Applied'] || 0} ({((statusCounts['Applied'] || 0) / totalJobs * 100).toFixed(1)}%)</p>
            <p>Rejected: {statusCounts['Rejected'] || 0} ({((statusCounts['Rejected'] || 0) / totalJobs * 100).toFixed(1)}%)</p>
            <p>Selected: {statusCounts['Selected'] || 0} ({((statusCounts['Selected'] || 0) / totalJobs * 100).toFixed(1)}%)</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Annual CTC by Job Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ctc" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function JobApplicationTracker() {
  const [jobData, setJobData] = useState<Job[]>([])
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [newJob, setNewJob] = useState<Omit<Job, 'id'>>({
    title: '',
    company: '',
    ctc: null,
    status: 'Applied',
  })
  const [isAddJobOpen, setIsAddJobOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Applied' | 'Rejected' | 'Selected'>('All')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [resume, setResume] = useState<string | null>(null)
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false)
  const [isResumeViewOpen, setIsResumeViewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const storedJobs = localStorage.getItem('jobData')
    const storedResume = localStorage.getItem('resume')
    if (storedJobs) {
      setJobData(JSON.parse(storedJobs))
    }
    if (storedResume) {
      setResume(storedResume)
    }
  }, [])
  const inputRef = useRef<HTMLInputElement>(null);  // Create a ref for the input element
  useEffect(() => {
    if (window?.innerWidth < 768) {
      setIsMobileDevice(true)
    } else {
      setIsMobileDevice(false)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('jobData', JSON.stringify(jobData))
  }, [jobData])

  useEffect(() => {
    if (resume) {
      localStorage.setItem('resume', resume)
    } else {
      localStorage.removeItem('resume')
    }
  }, [resume])

  const handleAddJob = () => {
    const id = jobData.length > 0 ? Math.max(...jobData.map(job => job.id)) + 1 : 1
    setJobData([...jobData, { ...newJob, id }])
    setNewJob({ title: '', company: '', ctc: null, status: 'Applied' })
    setIsAddJobOpen(false)
  }

  const handleStatusChange = (jobId: number, newStatus: 'Applied' | 'Rejected' | 'Selected') => {
    setJobData(jobData.map(job => job.id === jobId ? { ...job, status: newStatus } : job))
  }



  const handleDeleteJob = (jobId: number) => {
    setJobData(jobData.filter(job => job.id !== jobId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      case 'Selected': return 'bg-green-100 text-green-800'
      default: return ''
    }
  }


  const filteredJobs = jobData
    .filter(job =>
      (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'All' || job.status === statusFilter)
    )
    .sort((a, b) => {
      const ctcA = a.ctc ?? 0;
      const ctcB = b.ctc ?? 0;
      return sortOrder === 'asc' ? ctcA - ctcB : ctcB - ctcA;
    })

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setResume(content)
        setIsResumeDialogOpen(false)
        setIsResumeViewOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setResume(content)
        setIsResumeDialogOpen(false)
        setIsResumeViewOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteResume = () => {
    setResume(null)
    setIsResumeViewOpen(false)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">⚡<span className='font-mono'>Volt</span></h1>
      <hr className="border-gray-300 pb-6" />
      <div className="grid grid-cols-7 md:flex gap-2 mb-4">
        <div className='col-span-2'>
          <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
            <DialogTrigger asChild>
              <Button className='w-full bg-[#282828] transition duration-200 ease-in-out hover:scale-[102%]'>+ Add Job</Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-100 rounded rounded-lg w-[90%]">
              <DialogHeader>
                <DialogTitle>Add New Job</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input
                    id="title"
                    className="border-2 col-span-3"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company" className="text-right">Company</Label>
                  <Input
                    id="company"
                    className="border-2 col-span-3"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ctc" className="text-right">CTC <span className="text-gray-400 text-xs">(lacs)</span></Label>
                  <Input
                    type="number"
                    className="border-2 col-span-3"
                    value={newJob.ctc ?? ""}
                    onChange={(e) => setNewJob({ ...newJob, ctc: Number(e.target.value) })}
                  />
                </div>
              </div>
              <Button onClick={handleAddJob}>Add Job</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="col-span-3">
          <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
            <DialogTrigger asChild>
              <Button className="transition duration-200 ease-in-out hover:scale-[102%] bg-orange-100 border border-2 border-orange-300 text-orange-600 hover:bg-orange-200/75">
                <BarChart className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[80vh] w-[95vw] rounded rounded-lg bg-gray-100 sm:max-w-[80vw] sm:max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Job Application Analytics</DialogTitle>
              </DialogHeader>
              <JobAnalytics jobData={jobData} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="ml-[100%] md:ml-auto col-span-1">
          {!resume ?
            <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="px-4 py-0 bg-gray-200/75 border border-2 border-gray-300 hover:bg-gray-200 text-gray-600 transition duration-200 ease-in-out hover:scale-[102%]">
                  <Upload className="md:mr-2 h-4 w-4" />{!(isMobileDevice) && "Add Resume"}</Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-100 rounded rounded-lg w-[70%]">
                <DialogHeader>
                  <DialogTitle>Upload Resume</DialogTitle>
                </DialogHeader>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf"
                  />
                  <p>Drag and drop your resume here, or click to select a file</p>
                </div>
              </DialogContent>
            </Dialog>
            :
            <Dialog open={isResumeViewOpen} onOpenChange={setIsResumeViewOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-100/75 border border-2 border-blue-200 hover:bg-blue-100 text-blue-500/75 transition duration-200 ease-in-out hover:scale-[102%]">
                  <EyeIcon className="md:mr-2 h-4 w-4" />
                  {!(isMobileDevice) && "View Resume"}
                </Button>
              </DialogTrigger>
              {/* <DialogContent className="bg-white sm:max-w-[80vw] sm:max-h-[80vh] h-[80vh]"> */}
              <DialogContent className="bg-white rounded rounded-lg w-[80%]">
                <DialogHeader>
                  <DialogTitle>Your Resume</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col">
                  <div className="flex justify-center md:justify-end space-x-2 mb-4">
                    <Button onClick={() => setIsResumeDialogOpen(true)} className="transition duration-200 ease-in-out hover:scale-105">Change</Button>
                    <Button variant="destructive" onClick={handleDeleteResume} className="transition duration-200 ease-in-out hover:scale-105">Delete</Button>
                  </div>

                  <iframe
                    src={resume ?? ''}
                    className="w-full h-[60vh]"
                    title="Resume"
                  />
                </div>

              </DialogContent>
            </Dialog>
          }
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute h-4 left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by job title or company"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent >
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Selected">Selected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="whitespace-nowrap">Job Title</TableHead>
              <TableHead className="whitespace-nowrap">Company Name</TableHead>
              <TableHead className="whitespace-nowrap flex items-center cursor-pointer group" onClick={toggleSortOrder}>
                CTC (Lacs)
                <ArrowUpDown className="ml-2 h-full w-4 transition-all duration-300 ease-in-out md:group-hover:rotate-180 group-active:scale-[115%]" />
              </TableHead>
              <TableHead className="whitespace-nowrap">Application Status</TableHead>
              <TableHead className="whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job, index) => (
              <TableRow key={job.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="truncate">{job.title.length > 20 ? `${job.title.slice(0, 17)}...` : job.title}</TableCell>
                <TableCell className="truncate">{job.company.length > 20 ? `${job.company.slice(0, 17)}...` : job.company}</TableCell>
                <TableCell>
                  <span className="font-semibold">
                    ₹ {Math.floor(job.ctc ?? 0)}
                  </span>
                  <span className="text-gray-400">.{((job.ctc ?? 0) % 1).toFixed(2).slice(2)} L
                  </span>
                </TableCell>
                <TableCell>
                  <Select onValueChange={(value) => handleStatusChange(job.id, value as 'Applied' | 'Rejected' | 'Selected')}>
                    <SelectTrigger className={`w-[120px] ${getStatusColor(job.status)}`}>
                      <SelectValue placeholder={job.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Selected">Selected</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteJob(job.id)} className="text-red-400 hover:text-red-600 hover:bg-red-100">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div >
  )
}