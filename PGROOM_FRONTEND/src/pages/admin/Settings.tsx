// filepath: /src/pages/admin/Settings.tsx
import React, { useState } from 'react';
import { Save, Shield, Bell, Globe, CreditCard, Mail, Database, Users, Building2, Smartphone } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

/**
 * AdminSettings - System-wide settings management for administrators
 * Features: Platform configuration, security, notifications, integrations
 */
const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'PropertyHub PG',
    supportEmail: 'support@propertyhub.com',
    supportPhone: '+91 9876543210',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
    
    // Security Settings
    sessionTimeout: '30',
    passwordMinLength: '8',
    twoFactorAuth: true,
    loginAttempts: '5',
    accountLockDuration: '15',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    paymentReminders: true,
    maintenanceAlerts: true,
    
    // Payment Settings
    lateFeePercentage: '5',
    gracePeriodDays: '3',
    paymentMethods: {
      upi: true,
      bankTransfer: true,
      cash: true,
      card: false
    },
    autoGenerateReceipts: true,
    
    // Property Settings
    maxPropertiesPerOwner: '10',
    maxRoomsPerProperty: '50',
    defaultSecurityDeposit: '2',
    maintenanceChargePercentage: '10',
    
    // System Settings
    backupFrequency: 'daily',
    dataRetentionDays: '365',
    maintenanceMode: false,
    debugMode: false
  });

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedSettingChange = (parent: string, key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // API call to save settings
    console.log('Saving settings:', settings);
  };

  return (
    <DashboardLayout navbar={<AdminNavbar />} sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure platform settings, security, and integrations
            </p>
          </div>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Platform Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={settings.platformName}
                      onChange={(e) => handleSettingChange('platformName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportPhone">Support Phone</Label>
                      <Input
                        id="supportPhone"
                        value={settings.supportPhone}
                        onChange={(e) => handleSettingChange('supportPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleSettingChange('passwordMinLength', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                    <Input
                      id="loginAttempts"
                      type="number"
                      value={settings.loginAttempts}
                      onChange={(e) => handleSettingChange('loginAttempts', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountLockDuration">Account Lock Duration (minutes)</Label>
                    <Input
                      id="accountLockDuration"
                      type="number"
                      value={settings.accountLockDuration}
                      onChange={(e) => handleSettingChange('accountLockDuration', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Security Features</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for all admin accounts
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Notification Channels</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <Label>Email Notifications</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Send notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <Label>SMS Notifications</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Send notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send push notifications to mobile apps
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Notification Types</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatic payment due reminders
                      </p>
                    </div>
                    <Switch
                      checked={settings.paymentReminders}
                      onCheckedChange={(checked) => handleSettingChange('paymentReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        System maintenance and downtime alerts
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenanceAlerts}
                      onCheckedChange={(checked) => handleSettingChange('maintenanceAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Promotional and marketing communications
                      </p>
                    </div>
                    <Switch
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lateFeePercentage">Late Fee Percentage</Label>
                    <Input
                      id="lateFeePercentage"
                      type="number"
                      value={settings.lateFeePercentage}
                      onChange={(e) => handleSettingChange('lateFeePercentage', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gracePeriodDays">Grace Period (days)</Label>
                    <Input
                      id="gracePeriodDays"
                      type="number"
                      value={settings.gracePeriodDays}
                      onChange={(e) => handleSettingChange('gracePeriodDays', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Payment Methods</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label>UPI Payments</Label>
                    <Switch
                      checked={settings.paymentMethods.upi}
                      onCheckedChange={(checked) => handleNestedSettingChange('paymentMethods', 'upi', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Bank Transfer</Label>
                    <Switch
                      checked={settings.paymentMethods.bankTransfer}
                      onCheckedChange={(checked) => handleNestedSettingChange('paymentMethods', 'bankTransfer', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Cash Payments</Label>
                    <Switch
                      checked={settings.paymentMethods.cash}
                      onCheckedChange={(checked) => handleNestedSettingChange('paymentMethods', 'cash', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Card Payments</Label>
                    <Switch
                      checked={settings.paymentMethods.card}
                      onCheckedChange={(checked) => handleNestedSettingChange('paymentMethods', 'card', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Generate Receipts</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate receipts for payments
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoGenerateReceipts}
                    onCheckedChange={(checked) => handleSettingChange('autoGenerateReceipts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Property Settings */}
          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Property Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxProperties">Max Properties per Owner</Label>
                    <Input
                      id="maxProperties"
                      type="number"
                      value={settings.maxPropertiesPerOwner}
                      onChange={(e) => handleSettingChange('maxPropertiesPerOwner', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxRooms">Max Rooms per Property</Label>
                    <Input
                      id="maxRooms"
                      type="number"
                      value={settings.maxRoomsPerProperty}
                      onChange={(e) => handleSettingChange('maxRoomsPerProperty', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultDeposit">Default Security Deposit (months)</Label>
                    <Input
                      id="defaultDeposit"
                      type="number"
                      value={settings.defaultSecurityDeposit}
                      onChange={(e) => handleSettingChange('defaultSecurityDeposit', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceCharge">Maintenance Charge (%)</Label>
                    <Input
                      id="maintenanceCharge"
                      type="number"
                      value={settings.maintenanceChargePercentage}
                      onChange={(e) => handleSettingChange('maintenanceChargePercentage', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Data Retention (days)</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={settings.dataRetentionDays}
                      onChange={(e) => handleSettingChange('dataRetentionDays', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">System Status</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable maintenance mode to restrict access
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable debug logging for troubleshooting
                      </p>
                    </div>
                    <Switch
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save All Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
