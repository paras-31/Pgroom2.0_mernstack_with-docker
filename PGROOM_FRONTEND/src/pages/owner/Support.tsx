import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  X,
  ArrowLeft
} from 'lucide-react';

// Layout components
import OwnerNavbar from '@/components/owner/OwnerNavbar';
import OwnerSidebar from '@/components/owner/OwnerSidebar';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

/**
 * Interface for Help Article content
 */
interface HelpArticleContent {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  content: string;
  lastUpdated: string;
}

/**
 * FAQItem - Component for displaying a single FAQ item
 */
const FAQItem: React.FC<{
  question: string;
  answer: string;
  id: string;
}> = ({ question, answer, id }) => {
  return (
    <AccordionItem value={id}>
      <AccordionTrigger className="text-left">
        {question}
      </AccordionTrigger>
      <AccordionContent>
        <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: answer }} />
      </AccordionContent>
    </AccordionItem>
  );
};



/**
 * HelpArticle - Component for displaying a help article card
 */
const HelpArticle: React.FC<{
  title: string;
  excerpt: string;
  category: string;
  onClick: () => void;
}> = ({ title, excerpt, category, onClick }) => {
  return (
    <Card className="h-full cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <Badge variant="outline" className="w-fit mb-2">{category}</Badge>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{excerpt}</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="p-0 h-auto text-primary" onClick={onClick}>
          Read more <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * HelpArticleModal - Component for displaying a help article in a modal
 */
interface HelpArticleModalProps {
  article: HelpArticleContent | null;
  isOpen: boolean;
  onClose: () => void;
}

const HelpArticleModal: React.FC<HelpArticleModalProps> = ({ article, isOpen, onClose }) => {
  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="w-fit">{article.category}</Badge>
          </div>
          <DialogTitle className="text-xl">{article.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Last updated: {article.lastUpdated}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * OwnerSupport - Help and Support page for property owners
 */
const OwnerSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('help-center');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticleContent | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // FAQ data
  const faqItems = [
    // Property Management
    {
      id: 'faq-1',
      question: 'How do I add a new property?',
      answer: 'To add a new property, navigate to the <strong>Properties</strong> section from the sidebar and click on the <strong>Add Property</strong> button. Fill in the required details in the form and submit.'
    },
    {
      id: 'faq-2',
      question: 'How do I edit or update property details?',
      answer: 'Go to the <strong>Properties</strong> section, find the property you want to edit, and click on the edit icon. Update the necessary information in the form and save your changes.'
    },
    {
      id: 'faq-3',
      question: 'Can I delete a property from my account?',
      answer: 'Yes, you can delete a property by going to the <strong>Properties</strong> section, finding the property you want to remove, and clicking on the delete option. Please note that this action cannot be undone and will remove all associated rooms and tenant assignments.'
    },

    // Room Management
    {
      id: 'faq-4',
      question: 'How do I add rooms to my property?',
      answer: 'After adding a property, go to the property details page and click on <strong>Add Room</strong>. Fill in the room details including room number, total beds, rent amount, and description. You can also upload images of the room.'
    },

    // Tenant Management
    {
      id: 'faq-7',
      question: 'How do I invite tenants to my property?',
      answer: 'Go to the <strong>Tenants</strong> section, click on <strong>Add New Tenant</strong>, fill in their details, and send an invitation. They will receive an email with instructions to create an account.'
    },
    {
      id: 'faq-8',
      question: 'How do I manage room assignments?',
      answer: 'You can assign tenants to rooms by going to the <strong>Tenants</strong> section, selecting a tenant, and clicking on <strong>Assign</strong>. Then select the property and room you want to assign them to.'
    },
    {
      id: 'faq-9',
      question: 'How do I remove a tenant from a room?',
      answer: 'To unassign a tenant from a room, go to the <strong>Rooms</strong> section, click on <strong>View Room</strong> for the specific room, navigate to the <strong>Tenants</strong> tab, and use the unassign option next to the tenant\'s name.'
    },
    {
      id: 'faq-10',
      question: 'What\'s the difference between "Active" and "Invited" tenant status?',
      answer: '"Invited" status means you\'ve sent an invitation to the tenant but they haven\'t yet created their account. "Active" status means the tenant has registered and their account is active in the system.'
    },

    // Dashboard & Reports
    {
      id: 'faq-11',
      question: 'What information can I see on the dashboard?',
      answer: 'The dashboard provides an overview of your property management statistics, including total properties, total rooms, assigned tenants, expected monthly income, room occupancy rates, and a list of recent tenants.'
    },
    {
      id: 'faq-12',
      question: 'How is the "Expected Monthly Income" calculated?',
      answer: 'Expected Monthly Income is calculated based on the total rent amount set for all your rooms. It represents the potential income if all rooms were occupied and all rent payments were collected.'
    },
    {
      id: 'faq-13',
      question: 'Can I generate reports for my properties?',
      answer: 'Yes, you can view basic reports on the <strong>Dashboard</strong>. We are working on more detailed reporting features that will be available soon.'
    },
  ];

  // Help articles
  const helpArticles = [
    {
      id: 1,
      title: 'Getting Started with PG Room Management',
      excerpt: 'Learn the basics of managing your PG properties with our platform.',
      category: 'Getting Started'
    },
    {
      id: 2,
      title: 'Managing Multiple Properties Efficiently',
      excerpt: 'Tips and best practices for owners with multiple properties.',
      category: 'Property Management'
    },
    {
      id: 3,
      title: 'Complete Guide to Room Management',
      excerpt: 'Learn how to add, edit, and manage rooms across your properties.',
      category: 'Room Management'
    },
    {
      id: 4,
      title: 'Tenant Management System Overview',
      excerpt: 'A comprehensive guide to inviting, assigning, and managing tenants.',
      category: 'Tenant Management'
    },
    {
      id: 5,
      title: 'Tenant Communication Best Practices',
      excerpt: 'How to maintain good relationships with your tenants through effective communication.',
      category: 'Tenant Management'
    },
    {
      id: 6,
      title: 'Understanding the Dashboard Analytics',
      excerpt: 'Learn how to interpret and use the data displayed on your dashboard.',
      category: 'Dashboard'
    },
    {
      id: 7,
      title: 'Understanding Billing and Payments',
      excerpt: 'A comprehensive guide to the billing system and payment processing.',
      category: 'Billing'
    },
    {
      id: 8,
      title: 'Setting Up Payment Methods',
      excerpt: 'Step-by-step guide to adding and managing your payment methods.',
      category: 'Billing'
    },
    {
      id: 9,
      title: 'Security Best Practices for Property Owners',
      excerpt: 'Keep your account and property information secure with these tips.',
      category: 'Security'
    },
    {
      id: 10,
      title: 'Troubleshooting Common Issues',
      excerpt: 'Solutions to common problems you might encounter while using the platform.',
      category: 'Troubleshooting'
    },
    {
      id: 11,
      title: 'Mobile App User Guide',
      excerpt: 'How to use the mobile app to manage your properties on the go.',
      category: 'Mobile'
    },
    {
      id: 12,
      title: 'Optimizing Your Property Listings',
      excerpt: 'Tips to make your property listings more attractive to potential tenants.',
      category: 'Marketing'
    }
  ];



  // Handle article click
  const handleArticleClick = (articleId: number) => {
    toast.info(`Opening article #${articleId}`);
    // In a real app, this would navigate to the article page or open a modal
  };

  // Filter FAQ items based on search query
  const filteredFAQs = searchQuery
    ? faqItems.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  return (
    <DashboardLayout
      navbar={<OwnerNavbar />}
      sidebar={<OwnerSidebar />}
    >
      <div className="w-full max-w-[98%] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Help & Support
            </h1>
            <p className="text-muted-foreground mt-1">
              Find answers to common questions in our Help Center and FAQ
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="help-center">Help Center</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Help Center Tab */}
          <TabsContent value="help-center" className="mt-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search articles by title, category, or content"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {helpArticles.map(article => (
                <HelpArticle
                  key={article.id}
                  title={article.title}
                  excerpt={article.excerpt}
                  category={article.category}
                  onClick={() => handleArticleClick(article.id)}
                />
              ))}
            </div>


          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search FAQs by question or answer content"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map(item => (
                <FAQItem
                  key={item.id}
                  id={item.id}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
              {filteredFAQs.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  No FAQs found matching your search. Try a different query or check the Help Center.
                </p>
              )}
            </Accordion>

            <div className="mt-8 p-6 bg-muted rounded-lg">
              <h3 className="text-lg font-medium mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                If you couldn't find the answer you were looking for, please check our comprehensive Help Center.
              </p>
              <Button onClick={() => setActiveTab('help-center')}>
                Visit Help Center
              </Button>
            </div>
          </TabsContent>


        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default OwnerSupport;
