// src/components/DynamicProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Settings,
  Bell,
  Shield,
  Edit3,
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Check,
  RefreshCw,
  Loader2,
  DollarSign,
  Target,
  Award,
  IndianRupee
} from 'lucide-react';

import { profileService, UserProfile } from '@/services/profileService';

// Form schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  country: z.string().optional(),
  date_of_birth: z.string().optional()
});

const DynamicProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form setup
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
      bio: '',
      country: '',
      date_of_birth: ''
    }
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        phone: profile.profile.phone || '',
        bio: profile.profile.bio || '',
        country: profile.profile.country || '',
        date_of_birth: profile.profile.date_of_birth || ''
      });
    }
  }, [profile, form]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📥 Loading profile data from database...');
      
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      console.log('✅ Profile data loaded:', profileData);
    } catch (error: any) {
      console.error('❌ Failed to load profile:', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPersonalInfo = async (data: z.infer<typeof profileSchema>) => {
    try {
      setSaving(true);
      console.log('💾 Saving personal info...', data);
      
      const updatedProfile = await profileService.updatePersonalInfo({
        name: data.name,
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        country: data.country || undefined,
        date_of_birth: data.date_of_birth || undefined
      });
      
      setProfile(updatedProfile);
      setIsEditing(false);
      
      console.log('✅ Profile updated successfully!');
      // You can add a toast notification here
      
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = async (key: string, value: any) => {
    try {
      console.log(`🔄 Updating preference: ${key} = ${value}`);
      
      const updateData = { [key]: value };
      const updatedProfile = await profileService.updatePreferences(updateData);
      
      setProfile(updatedProfile);
      console.log('✅ Preference updated successfully');
    } catch (error: any) {
      console.error('❌ Failed to update preference:', error);
      setError(error.message || 'Failed to update preference');
    }
  };

  const getInitials = () => {
    if (!profile) return 'U';
    const names = profile.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return profile.name[0].toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getAccountBadge = () => {
    if (!profile) return null;
    
    return profile.stats.account_type === 'premium' ? (
      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
        <Award className="w-3 h-3 mr-1" />
        Premium
      </Badge>
    ) : (
      <Badge variant="secondary">Free</Badge>
    );
  };

  if (loading) {
    return (
      <>
       
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40 p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Loading your profile from database...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40 p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center min-h-96">
            <div className="text-center">
              <p className="text-lg text-red-600 mb-4">{error || 'Failed to load profile'}</p>
              <Button onClick={loadProfileData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40 p-4 md:p-6 lg:p-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">My Profile</h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, {profile.name}! Manage your account and preferences
            </p>
          </header>

          {/* Profile Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={profile.profile.avatar_url} alt={profile.name} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-6">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                      <h2 className="text-2xl font-bold">{profile.name}</h2>
                      {profile.is_verified && (
                        <Check className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{profile.email}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-3 flex-wrap gap-2">
                      {getAccountBadge()}
                      <Badge variant="outline">
                        Member since {new Date(profile.created_at).getFullYear()}
                      </Badge>
                      {profile.stats.account_age_days > 0 && (
                        <Badge variant="outline">
                          {profile.stats.account_age_days} days active
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Financial Score */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Financial Literacy Score
                      </span>
                      <span className="text-2xl font-bold text-primary">{profile.stats.financial_score}/100</span>
                    </div>
                    <Progress value={profile.stats.financial_score} className="h-3 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {profile.stats.financial_score >= 70 
                        ? 'Excellent! You have great financial knowledge.' 
                        : 'Complete your profile to improve your score.'
                      }
                    </p>
                  </div>

                  {/* Profile Completion */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile Completion
                      </span>
                      <span className="text-lg font-bold text-green-600">{profile.stats.profile_completion}%</span>
                    </div>
                    <Progress value={profile.stats.profile_completion} className="h-2" />
                    {profile.stats.profile_completion < 100 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Complete your profile to unlock more features
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="financial">Financial Profile</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-primary" />
                        <span>Personal Information</span>
                      </CardTitle>
                      <CardDescription>Update your basic information from database</CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={saving}
                    >
                      {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitPersonalInfo)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={saving} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} type="tel" placeholder="Optional" disabled={saving} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Your country" disabled={saving} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="date_of_birth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" disabled={saving} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>About Me</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} placeholder="Tell us about yourself..." disabled={saving} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={saving}>
                            {saving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Full Name</Label>
                            <p className="font-medium">{profile.name}</p>
                          </div>

                          <div>
                            <Label className="text-sm text-muted-foreground">Email</Label>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">{profile.email}</p>
                              {profile.is_verified && (
                                <Badge variant="secondary" className="text-xs">Verified</Badge>
                              )}
                            </div>
                          </div>

                          {profile.profile.phone && (
                            <div>
                              <Label className="text-sm text-muted-foreground">Phone</Label>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <p className="font-medium">{profile.profile.phone}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {profile.profile.country && (
                            <div>
                              <Label className="text-sm text-muted-foreground">Country</Label>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <p className="font-medium">{profile.profile.country}</p>
                              </div>
                            </div>
                          )}

                          {profile.profile.date_of_birth && (
                            <div>
                              <Label className="text-sm text-muted-foreground">Date of Birth</Label>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <p className="font-medium">{formatDate(profile.profile.date_of_birth)}</p>
                              </div>
                            </div>
                          )}

                          <div>
                            <Label className="text-sm text-muted-foreground">Account Type</Label>
                            <div className="mt-1">
                              {getAccountBadge()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {profile.profile.bio && (
                        <div>
                          <Label className="text-sm text-muted-foreground">About Me</Label>
                          <p className="font-medium text-sm leading-relaxed mt-1 p-3 bg-muted/50 rounded-lg">
                            {profile.profile.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-primary" />
                      <span>Notifications</span>
                    </CardTitle>
                    <CardDescription>Choose what notifications you want to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get updates via email</p>
                      </div>
                      <Switch
                        checked={profile.preferences.notifications.email}
                        onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Budget Alerts</Label>
                        <p className="text-sm text-muted-foreground">Notify when approaching budget limits</p>
                      </div>
                      <Switch
                        checked={profile.preferences.notifications.budget_alerts}
                        onCheckedChange={(checked) => updatePreference('budget_alerts', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">Weekly financial summary</p>
                      </div>
                      <Switch
                        checked={profile.preferences.notifications.weekly_reports}
                        onCheckedChange={(checked) => updatePreference('weekly_reports', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Newsletter</Label>
                        <p className="text-sm text-muted-foreground">Financial tips and updates</p>
                      </div>
                      <Switch
                        checked={profile.preferences.notifications.newsletter}
                        onCheckedChange={(checked) => updatePreference('newsletter', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-primary" />
                      <span>General Preferences</span>
                    </CardTitle>
                    <CardDescription>Customize your experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium">Currency</Label>
                        <p className="text-sm text-muted-foreground mb-2">Your preferred currency</p>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={profile.preferences.currency}
                          onChange={(e) => updatePreference('currency', e.target.value)}
                        >
                          <option value="INR">Indian Rupee (INR)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                          <option value="GBP">British Pound (GBP)</option>
                        </select>
                      </div>

                      <div>
                        <Label className="font-medium">Language</Label>
                        <p className="text-sm text-muted-foreground mb-2">Your preferred language</p>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={profile.preferences.language}
                          onChange={(e) => updatePreference('language', e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Financial Profile Tab */}
            <TabsContent value="financial">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    <span>Financial Profile</span>
                  </CardTitle>
                  <CardDescription>Your financial information from signup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Monthly Income Range</Label>
                      <p className="font-medium text-lg">
                        {profile.financial_profile.monthly_income_range ? (
                          profile.financial_profile.monthly_income_range.replace('-', ' - ').toUpperCase()
                        ) : (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Financial Goal</Label>
                      <p className="font-medium text-lg capitalize">
                        {profile.financial_profile.financial_goal ? (
                          profile.financial_profile.financial_goal.replace('-', ' ')
                        ) : (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Financial Status</Label>
                      <p className="font-medium text-lg capitalize">
                        {profile.financial_profile.financial_status ? (
                          profile.financial_profile.financial_status.replace('-', ' ')
                        ) : (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Risk Tolerance</Label>
                      <p className="font-medium text-lg capitalize">
                        {profile.financial_profile.risk_tolerance || 'Moderate'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Investment Experience</Label>
                    <p className="font-medium text-lg capitalize">
                      {profile.financial_profile.investment_experience || 'Beginner'}
                    </p>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Update Financial Profile</h3>
                      <p className="text-sm text-muted-foreground">Keep your financial information current</p>
                    </div>
                    <Button variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Account Summary</span>
              </CardTitle>
              <CardDescription>Your account information from database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{profile.stats.total_logins}</p>
                  <p className="text-sm text-muted-foreground">Total Logins</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{profile.stats.account_age_days}</p>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{profile.stats.profile_completion}%</p>
                  <p className="text-sm text-muted-foreground">Profile Complete</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={loadProfileData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
                
                <Button variant="outline" onClick={() => console.log('Export data')}>
                  Export My Data
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Account created: {formatDate(profile.created_at)}</p>
                <p>Last updated: {formatDate(profile.updated_at)}</p>
                {profile.last_login && (
                  <p>Last login: {formatDate(profile.last_login)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DynamicProfilePage;
