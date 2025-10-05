// filepath: /src/pages/admin/Support.tsx
import React, { useState, useMemo } from 'react';
import { Search, Filter, MessageCircle, AlertCircle, CheckCircle, Clock, Eye, Edit, X, User, Calendar, Building2 } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for support tickets
const mockTickets = [
  {
    id: 'TKT-001',
    title: 'Room heating not working',
    description: 'The heater in room A-101 has stopped working. The room is getting very cold.',
    userType: 'tenant',
    userName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@email.com',
    property: 'Krishna PG',
    roomNumber: 'A-101',
    priority: 'high',
    status: 'open',
    category: 'maintenance',
    createdAt: '2023-12-05 10:30:00',
    updatedAt: '2023-12-05 10:30:00',
    assignedTo: null,
    avatar: null
  },
  {
    id: 'TKT-002',
    title: 'Payment not reflecting',
    description: 'I paid my rent 2 days ago via UPI but it is still showing as pending in my account.',
    userType: 'tenant',
    userName: 'Priya Patel',
    userEmail: 'priya.patel@email.com',
    property: 'Comfort PG',
    roomNumber: 'B-205',
    priority: 'medium',
    status: 'in_progress',
    category: 'billing',
    createdAt: '2023-12-04 14:20:00',
    updatedAt: '2023-12-05 09:15:00',
    assignedTo: 'Support Team',
    avatar: null
  },
  {
    id: 'TKT-003',
    title: 'Unable to add new room',
    description: 'Getting error when trying to add a new room to my property. The form submission fails.',
    userType: 'owner',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh.kumar@email.com',
    property: 'Krishna PG',
    roomNumber: null,
    priority: 'medium',
    status: 'resolved',
    category: 'technical',
    createdAt: '2023-12-03 16:45:00',
    updatedAt: '2023-12-04 11:30:00',
    assignedTo: 'Tech Team',
    avatar: null
  },
  {
    id: 'TKT-004',
    title: 'Account verification pending',
    description: 'My account verification has been pending for over a week. Please help resolve this.',
    userType: 'owner',
    userName: 'Sunita Reddy',
    userEmail: 'sunita.reddy@email.com',
    property: 'Tech PG',
    roomNumber: null,
    priority: 'high',
    status: 'open',
    category: 'account',
    createdAt: '2023-12-02 12:15:00',
    updatedAt: '2023-12-02 12:15:00',
    assignedTo: null,
    avatar: null
  }
];

/**
 * AdminSupport - Support ticket management page for administrators
 * Features: Ticket listing, status management, priority filtering, ticket details
 */
const AdminSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(null);
  const [response, setResponse] = useState('');

  // Filter tickets based on search and filters
  const filteredTickets = useMemo(() => {
    return mockTickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.property.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    
    return (
      <Badge className={styles[status as keyof typeof styles] || styles.open}>
        {status === 'open' && <AlertCircle className="w-3 h-3 mr-1" />}
        {status === 'in_progress' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'closed' && <X className="w-3 h-3 mr-1" />}
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      critical: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    
    return (
      <Badge variant="outline" className={styles[priority as keyof typeof styles] || styles.medium}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  // Category badge styling
  const getCategoryBadge = (category: string) => {
    const styles = {
      maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      billing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      technical: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      account: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    
    return (
      <Badge variant="secondary" className={styles[category as keyof typeof styles] || styles.general}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get user type badge
  const getUserTypeBadge = (userType: string) => {
    const styles = {
      tenant: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      owner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    
    return (
      <Badge variant="outline" className={styles[userType as keyof typeof styles]}>
        <User className="w-3 h-3 mr-1" />
        {userType.charAt(0).toUpperCase() + userType.slice(1)}
      </Badge>
    );
  };

  // Summary stats
  const totalTickets = mockTickets.length;
  const openTickets = mockTickets.filter(t => t.status === 'open').length;
  const inProgressTickets = mockTickets.filter(t => t.status === 'in_progress').length;
  const highPriorityTickets = mockTickets.filter(t => t.priority === 'high').length;

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    console.log(`Changing ticket ${ticketId} status to ${newStatus}`);
  };

  const handleAssignTicket = (ticketId: string, assignee: string) => {
    console.log(`Assigning ticket ${ticketId} to ${assignee}`);
  };

  return (
    <DashboardLayout navbar={<AdminNavbar />} sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Support Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage support tickets and customer inquiries
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTickets}</div>
              <p className="text-xs text-muted-foreground">
                All time tickets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{openTickets}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inProgressTickets}</div>
              <p className="text-xs text-muted-foreground">
                Being worked on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{highPriorityTickets}</div>
              <p className="text-xs text-muted-foreground">
                Urgent tickets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tickets by title, user, ID, or property..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.id}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {ticket.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={ticket.avatar || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(ticket.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{ticket.userName}</div>
                            <div className="text-xs">{getUserTypeBadge(ticket.userType)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{ticket.property}</div>
                          {ticket.roomNumber && (
                            <div className="text-xs text-muted-foreground">
                              Room {ticket.roomNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(ticket.category)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ticket.assignedTo ? (
                          <span className="text-sm">{ticket.assignedTo}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                {selectedTicket?.id} - {selectedTicket?.title}
                              </DialogTitle>
                              <DialogDescription className="flex items-center gap-2">
                                {selectedTicket && getStatusBadge(selectedTicket.status)}
                                {selectedTicket && getPriorityBadge(selectedTicket.priority)}
                                {selectedTicket && getCategoryBadge(selectedTicket.category)}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedTicket && (
                              <div className="space-y-4">
                                {/* User Info */}
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={selectedTicket.avatar || undefined} />
                                    <AvatarFallback>
                                      {getInitials(selectedTicket.userName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{selectedTicket.userName}</span>
                                      {getUserTypeBadge(selectedTicket.userType)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {selectedTicket.userEmail}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      {selectedTicket.property}
                                      {selectedTicket.roomNumber && ` - Room ${selectedTicket.roomNumber}`}
                                    </div>
                                  </div>
                                </div>

                                {/* Ticket Description */}
                                <div className="space-y-2">
                                  <h4 className="font-medium">Description</h4>
                                  <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                                    {selectedTicket.description}
                                  </p>
                                </div>

                                {/* Ticket Details */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-sm">Created</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(selectedTicket.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm">Last Updated</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(selectedTicket.updatedAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-4">
                                  <div className="flex gap-2">
                                    <Select
                                      value={selectedTicket.status}
                                      onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                                    >
                                      <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    
                                    <Select
                                      value={selectedTicket.assignedTo || ''}
                                      onValueChange={(value) => handleAssignTicket(selectedTicket.id, value)}
                                    >
                                      <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Assign to..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="support">Support Team</SelectItem>
                                        <SelectItem value="tech">Tech Team</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="billing">Billing Team</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Response */}
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Response</h4>
                                    <Textarea
                                      placeholder="Type your response here..."
                                      value={response}
                                      onChange={(e) => setResponse(e.target.value)}
                                      rows={4}
                                    />
                                    <Button className="w-full">
                                      Send Response
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Empty State */}
            {filteredTickets.length === 0 && (
              <div className="py-16 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                <p className="text-muted-foreground mb-4">
                  No support tickets match your current filters. Try adjusting your search criteria.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setCategoryFilter('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSupport;
