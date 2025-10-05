import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import OwnerNavbar from '@/components/owner/OwnerNavbar';
import OwnerSidebar from '@/components/owner/OwnerSidebar';
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

const OwnerProfile = () => {
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
    stateId: '',
    cityId: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for location data
  const [cities, setCities] = useState<{ id: number; cityName: string }[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // State for UI interactions
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Load cities for selected state
  const loadCitiesForState = useCallback(async (stateId: number) => {
    setIsLoadingCities(true);
    try {
      const citiesData = getCitiesByStateId(stateId);
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading cities:', error);
      toast.error('Failed to load cities');
    } finally {
      setIsLoadingCities(false);
    }
  }, [getCitiesByStateId]);

  // Update form data when profile data changes
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        mobileNo: profile.mobileNo || '',
        address: profile.address || '',
        stateId: profile.state?.id?.toString() || '',
        cityId: profile.city?.id?.toString() || '',
      }));

      // Load cities if state is selected
      if (profile.state?.id) {
        loadCitiesForState(profile.state.id);
      }
    }
  }, [profile, loadCitiesForState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Load cities when state changes and reset city
    if (name === 'stateId' && value) {
      loadCitiesForState(Number(value));
      setFormData(prev => ({ ...prev, [name]: value, cityId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle state selection from Select component
  const handleStateChange = (value: string) => {
    if (value) {
      loadCitiesForState(Number(value));
      setFormData(prev => ({ ...prev, stateId: value, cityId: '' }));
    } else {
      setFormData(prev => ({ ...prev, stateId: '', cityId: '' }));
    }
  };

  // Handle city selection from Select component
  const handleCityChange = (value: string) => {
    setFormData(prev => ({ ...prev, cityId: value }));
  };

  // Function to move cursor to end of input field
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    const value = input.value;
    // Move cursor to end of text
    setTimeout(() => {
      input.setSelectionRange(value.length, value.length);
    }, 0);
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;

    const success = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobileNo: formData.mobileNo,
      address: formData.address,
      stateId: formData.stateId ? Number(formData.stateId) : undefined,
      cityId: formData.cityId ? Number(formData.cityId) : undefined,
    });

    if (success) {
      setIsEditingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;

    // Validate passwords
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    const success = await changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });

    if (success) {
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setIsEditingPassword(false);
    }
  };

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    // Reset form data to original values
    if (profile) {
      setFormData(prev => ({
        ...prev,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        mobileNo: profile.mobileNo || '',
        address: profile.address || '',
        stateId: profile.state?.id?.toString() || '',
        cityId: profile.city?.id?.toString() || '',
      }));
    }
  };

  return (
    <DashboardLayout
      navbar={<OwnerNavbar />}
      sidebar={<OwnerSidebar />}
    >
      <div className="w-full px-6 lg:px-8 space-y-6">
        {/* Modern Header Section - Full Width */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-green-600 to-emerald-700 dark:from-primary dark:via-green-500 dark:to-emerald-600 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-8 py-10">
            <div className="flex items-start justify-between mb-6">
              {/* Left side - Main header content */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-1">
                      Profile Settings
                    </h1>
                    <p className="text-green-100 text-base font-medium">
                      Manage your account information
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-green-200">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Personal Details</span>
                    </div>
                    <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Security Settings</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Member info */}
              <div className="flex flex-col items-end gap-3">
                {profile?.memberSince && (
                  <div className="text-right">
                    <div className="text-xs text-green-200 mb-1 tracking-wider">MEMBER SINCE</div>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        {new Date(profile.memberSince).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Profile Information Card - Left Side */}
          <Card className="xl:col-span-2 overflow-hidden shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <User className="h-6 w-6 text-primary" />
                  Personal Information
                </CardTitle>
                <div className="flex items-center gap-2">
                  {!isEditingProfile ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelProfileEdit}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading profile...</span>
                  </div>
                ) : (
                  <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* First Name */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">First Name</span>
                        </div>
                        <div className="flex-1 ml-4">
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0"
                            disabled={isUpdating || !isEditingProfile}
                            readOnly={!isEditingProfile}
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Last Name</span>
                        </div>
                        <div className="flex-1 ml-4">
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0"
                            disabled={isUpdating || !isEditingProfile}
                            readOnly={!isEditingProfile}
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Email</span>
                        </div>
                        <div className="flex-1 ml-4">
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0"
                            disabled={isUpdating || !isEditingProfile}
                            readOnly={!isEditingProfile}
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Mobile</span>
                        </div>
                        <div className="flex-1 ml-4">
                          <Input
                            id="mobileNo"
                            name="mobileNo"
                            placeholder="Enter your mobile number"
                            value={formData.mobileNo}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0"
                            disabled={isUpdating || !isEditingProfile}
                            readOnly={!isEditingProfile}
                          />
                        </div>
                      </div>

                      {/* State */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">State</span>
                        </div>
                        <div className="flex-1 ml-4">
                          {isEditingProfile ? (
                            <Select
                              value={formData.stateId}
                              onValueChange={handleStateChange}
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0 w-full [&>span]:text-right [&>span]:w-full">
                                <SelectValue placeholder="Select State" />
                              </SelectTrigger>
                              <SelectContent>
                                {states.map((state) => (
                                  <SelectItem key={state.id} value={state.id.toString()}>
                                    {state.stateName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={profile?.state?.stateName || 'Not specified'}
                              className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0"
                              disabled={true}
                              readOnly={true}
                            />
                          )}
                        </div>
                      </div>

                      {/* City */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">City</span>
                        </div>
                        <div className="flex-1 ml-4">
                          {isEditingProfile ? (
                            <Select
                              value={formData.cityId}
                              onValueChange={handleCityChange}
                              disabled={isUpdating || isLoadingCities || !formData.stateId}
                            >
                              <SelectTrigger className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0 w-full [&>span]:text-right [&>span]:w-full">
                                {isLoadingCities ? (
                                  <div className="flex items-center justify-end">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    <span>Loading cities...</span>
                                  </div>
                                ) : (
                                  <SelectValue placeholder={!formData.stateId ? "Select state first" : "Select City"} />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                {cities.map((city) => (
                                  <SelectItem key={city.id} value={city.id.toString()}>
                                    {city.cityName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={profile?.city?.cityName || 'Not specified'}
                              className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0"
                              disabled={true}
                              readOnly={true}
                            />
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg md:col-span-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Address</span>
                        </div>
                        <div className="flex-1 ml-4">
                          <Input
                            id="address"
                            name="address"
                            placeholder="Enter your address"
                            value={formData.address}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0"
                            disabled={isUpdating || !isEditingProfile}
                            readOnly={!isEditingProfile}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {isEditingProfile && (
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={isUpdating}
                          className="min-w-[120px]"
                        >
                          {isUpdating ? (
                            <>
                              <Save className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings - Right Side */}
          <div className="xl:col-span-1 space-y-6">
            {/* Security Settings */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <KeyRound className="h-6 w-6 text-primary" />
                    Security Settings
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!isEditingPassword ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditingPassword(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setIsEditingPassword(false);
                            setFormData(prev => ({
                              ...prev,
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            }));
                          }}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!isEditingPassword ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">Password Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Click "Edit" to change your password and security settings
                      </p>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>Password is secure and protected</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="h-3 w-3 text-emerald-500" />
                        <span>Account security is active</span>
                      </div>
                    </div>
                  </div>
                ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Current Password</span>
                      </div>
                      <div className="flex-1 ml-4 relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                          className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0 pr-8"
                          disabled={isUpdating || !isEditingPassword}
                          readOnly={!isEditingPassword}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={!isEditingPassword}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">New Password</span>
                      </div>
                      <div className="flex-1 ml-4 relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                          className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0 pr-8"
                          disabled={isUpdating || !isEditingPassword}
                          readOnly={!isEditingPassword}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={!isEditingPassword}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Confirm Password</span>
                      </div>
                      <div className="flex-1 ml-4 relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                          className="border-0 bg-transparent p-0 text-right font-semibold focus:ring-0 pr-8"
                          disabled={isUpdating || !isEditingPassword}
                          readOnly={!isEditingPassword}
                        />
                        <button
                          type="button"
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={!isEditingPassword}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Password Requirements - Only show when editing */}
                  {isEditingPassword && (
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium mb-3 flex items-center justify-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        Password Requirements
                      </h4>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span>At least 6 characters long</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span>Contains letters and numbers</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span>Different from current password</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {isEditingPassword && (
                    <div className="flex justify-center">
                      <Button 
                        type="submit" 
                        variant="outline"
                        disabled={isUpdating}
                        className="min-w-[140px] border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        {isUpdating ? (
                          <>
                            <KeyRound className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerProfile;
