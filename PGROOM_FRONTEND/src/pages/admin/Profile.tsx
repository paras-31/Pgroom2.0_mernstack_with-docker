import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserCircle, 
  Mail, 
  Phone, 
  Save, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Shield,
  Settings,
  User,
  KeyRound,
  Edit,
  X,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useLocation } from '@/contexts/LocationContext';
import type { City } from '@/contexts/LocationContext';

const AdminProfile = () => {
  const { isAuthenticated, userRole } = useAuth();
  const { profile, isLoading, isUpdating, updateProfile, changePassword } = useUserProfile();
  const { states, getCitiesByStateId } = useLocation();
  
  // State for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    address: '',
    stateId: 0,
    cityId: 0,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for UI
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [cities, setCities] = useState([]);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        mobileNo: profile.mobileNo || '',
        address: profile.address || '',
        stateId: profile.state?.id || 0,
        cityId: profile.city?.id || 0
      }));
    }
  }, [profile]);

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.stateId) {
      const fetchCities = async () => {
        const cityList = await getCitiesByStateId(formData.stateId);
        setCities(cityList);
      };
      fetchCities();
    }
  }, [formData.stateId, getCitiesByStateId]);

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNo: formData.mobileNo,
        address: formData.address,
        stateId: formData.stateId,
        cityId: formData.cityId
      };

      await updateProfile(profileData);
      setIsEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  // Get selected state name
  const getStateName = (stateId: number) => {
    const state = states.find(s => s.id === stateId);
    return state ? state.stateName : '';
  };

  // Get selected city name
  const getCityName = (cityId: number) => {
    const city = cities.find((c: City) => c.id === cityId);
    return city ? city.cityName : '';
  };

  if (!isAuthenticated || userRole !== 1) {
    return null;
  }

  return (
    <DashboardLayout navbar={<AdminNavbar />} sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your admin account settings and preferences
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile Information
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Security Settings
            </div>
          </button>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Update your personal information and contact details
                    </p>
                  </div>
                </div>
                <Button
                  variant={isEditMode ? "outline" : "default"}
                  onClick={() => setIsEditMode(!isEditMode)}
                  disabled={isLoading || isUpdating}
                >
                  {isEditMode ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        First Name
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEditMode}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Last Name
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEditMode}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditMode}
                        placeholder="Enter your email address"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Mobile Number
                      </label>
                      <Input
                        value={formData.mobileNo}
                        onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                        disabled={!isEditMode}
                        placeholder="Enter your mobile number"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Address
                      </label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditMode}
                        placeholder="Enter your address"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          State
                        </label>
                        <Select
                          value={formData.stateId.toString()}
                          onValueChange={(value) => handleInputChange('stateId', parseInt(value))}
                          disabled={!isEditMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.id} value={state.id.toString()}>
                                {state.stateName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          City
                        </label>
                        <Select
                          value={formData.cityId.toString()}
                          onValueChange={(value) => handleInputChange('cityId', parseInt(value))}
                          disabled={!isEditMode || !formData.stateId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city: City) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.cityName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  {isEditMode && (
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleProfileUpdate}
                        disabled={isUpdating}
                        className="flex items-center gap-2"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your password and security preferences
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <KeyRound className="w-5 h-5" />
                  Change Password
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={isUpdating || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                      className="flex items-center gap-2"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isUpdating ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Account Status */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Status
                </h4>
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Admin Account Active
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Your admin account is active with full system access
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminProfile;
