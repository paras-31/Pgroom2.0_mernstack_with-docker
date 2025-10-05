import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  X,
  MessageCircle,
  BedDouble,
  CreditCard
} from 'lucide-react';

// Layout components
import TenantNavbar from '@/components/tenant/TenantNavbar';
import TenantSidebar from '@/components/tenant/TenantSidebar';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface HelpArticleContent {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  lastUpdated: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const TenantSupport = () => {
  const [activeTab, setActiveTab] = useState('help-center');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticleContent | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Help article data
  const helpArticles: HelpArticleContent[] = [
    {
      id: 1,
      title: 'Room Booking Guidelines',
      excerpt: 'Learn about the room booking process and requirements.',
      content: '<h2>Room Booking Guidelines</h2><p>Find everything you need to know about room booking here...</p>',
      category: 'Room Management',
      lastUpdated: '2025-06-10'
    },
    {
      id: 2,
      title: 'Making Rent Payments',
      excerpt: 'Step-by-step guide to making rent payments through the platform.',
      content: '<h2>Rent Payment Guide</h2><p>Here\'s everything you need to know about paying your rent...</p>',
      category: 'Payments',
      lastUpdated: '2025-06-09'
    },
    {
      id: 4,
      title: 'Understanding Your Dashboard',
      excerpt: 'A comprehensive guide to your tenant dashboard features.',
      content: '<h2>Dashboard Guide</h2><p>Get familiar with all dashboard features and how to use them...</p>',
      category: 'Dashboard',
      lastUpdated: '2025-06-06'
    }
  ];

  // FAQ data
  const faqItems: FaqItem[] = [
    {
      id: 1,
      question: 'How do I pay my rent?',
      answer: 'You can pay your rent through the Payments section. We accept various payment methods including credit/debit cards and UPI.',
      category: 'Payments'
    },
    {
      id: 2,
      question: 'How can I update my profile information?',
      answer: 'Go to the Profile section and click on "Edit Profile" to update your personal information.',
      category: 'Profile'
    },
    {
      id: 3,
      question: 'What if I face issues with the platform?',
      answer: 'Contact our support team through the Help & Support section or email us at support@propertyhub.com',
      category: 'General'
    },
  ];

  const handleArticleClick = (articleId: number) => {
    const article = helpArticles.find((a: HelpArticleContent) => a.id === articleId);
    if (article) {
      setSelectedArticle(article);
      setIsArticleModalOpen(true);
    }
  };

  // Filter articles based on search query
  const filteredArticles = helpArticles.filter((article: HelpArticleContent) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter FAQ items based on search query
  const filteredFaqItems = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      navbar={<TenantNavbar />}
      sidebar={<TenantSidebar />}
    >
      <div className="w-full max-w-[98%] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Help & Support
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Get help with your account, payments, and other inquiries
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">Contact Support</span>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="group hover:shadow-md transition-all duration-200">
            <CardContent className="p-6 flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20">
                <BedDouble className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Room Management</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">View and manage your room details</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-md transition-all duration-200">
            <CardContent className="p-6 flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Payment Help</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Guidance on rent payments</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="help-center" className="text-sm">Help Center</TabsTrigger>
            <TabsTrigger value="faq" className="text-sm">FAQ</TabsTrigger>
          </TabsList>

          {/* Help Center Tab */}
          <TabsContent value="help-center" className="mt-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search help articles..."
                  className="pl-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article: HelpArticleContent) => (
                <Card 
                  key={article.id} 
                  className="flex flex-col h-full group hover:shadow-md transition-all duration-200"
                >
                  <CardHeader className="p-6 pb-4">
                    <Badge 
                      variant="outline" 
                      className="w-fit mb-2 text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {article.category}
                    </Badge>
                    <CardTitle className="text-base font-medium text-gray-900 dark:text-white">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{article.excerpt}</p>
                  </CardContent>
                  <CardFooter className="mt-auto p-6 pt-4">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto text-primary text-sm hover:bg-transparent hover:text-primary/80 transition-colors duration-200"
                      onClick={() => handleArticleClick(article.id)}
                    >
                      Read more <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search FAQ..."
                  className="pl-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-6">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqItems.map((item) => (
                  <AccordionItem 
                    key={item.id} 
                    value={`item-${item.id}`}
                    className="border-b border-gray-200 dark:border-gray-800"
                  >
                    <AccordionTrigger className="text-left text-sm hover:no-underline hover:text-primary transition-colors duration-200">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600 dark:text-gray-400">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <Dialog open={isArticleModalOpen} onOpenChange={setIsArticleModalOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  variant="outline" 
                  className="w-fit text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {selectedArticle.category}
                </Badge>
              </div>
              <DialogTitle className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedArticle.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-600 dark:text-gray-400">
                Last updated: {selectedArticle.lastUpdated || 'Recently'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="text-sm text-gray-700 dark:text-gray-300" 
                dangerouslySetInnerHTML={{ __html: selectedArticle.content || selectedArticle.excerpt }} 
              />
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsArticleModalOpen(false)}
                className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default TenantSupport;
