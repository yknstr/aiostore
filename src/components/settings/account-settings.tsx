'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  User, 
  Save, 
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  Shield,
  Camera
} from 'lucide-react'

// Form validation schema
const accountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().min(1, 'Please select a timezone'),
  bio: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type AccountFormData = z.infer<typeof accountSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

interface AccountSettingsProps {}

export function AccountSettings({}: AccountSettingsProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+62 812-3456-7890',
    company: 'Fashion Store Indonesia',
    address: 'Jl. Sudirman No. 123',
    city: 'Jakarta',
    country: 'Indonesia',
    timezone: 'Asia/Jakarta',
    bio: 'E-commerce entrepreneur with 5+ years of experience in fashion retail.',
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: profileData,
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const timezones = [
    { value: 'Asia/Jakarta', label: 'Jakarta (WIB)' },
    { value: 'Asia/Pontianak', label: 'Pontianak (WITA)' },
    { value: 'Asia/Makassar', label: 'Makassar (WITA)' },
    { value: 'Asia/Jayapura', label: 'Jayapura (WIT)' },
  ]

  const handleProfileSubmit = async (data: AccountFormData) => {
    setIsSaving(true)
    // Simulate save process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Ensure all fields have default values if undefined
    setProfileData({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company || profileData.company,
      address: data.address || profileData.address,
      city: data.city || profileData.city,
      country: data.country || profileData.country,
      timezone: data.timezone,
      bio: data.bio || profileData.bio,
    })
    setIsEditingProfile(false)
    setIsSaving(false)
  }

  const handlePasswordChange = async (data: PasswordFormData) => {
    setIsSaving(true)
    // Simulate password change process
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsChangingPassword(false)
    resetPassword()
    setIsSaving(false)
  }

  const handleCancelEdit = () => {
    reset(profileData)
    setIsEditingProfile(false)
  }

  const handleCancelPassword = () => {
    resetPassword()
    setIsChangingPassword(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <p className="text-sm text-gray-600">Manage your personal and business information</p>
            </div>
          </div>
          {!isEditingProfile && (
            <Button
              variant="outline"
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <Button
                type="button"
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">Profile Picture</h4>
              <p className="text-sm text-gray-500">Upload a new profile picture</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Full Name *</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                disabled={!isEditingProfile}
                className={!isEditingProfile ? 'bg-gray-50' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email Address *</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled={!isEditingProfile}
                className={!isEditingProfile ? 'bg-gray-50' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone Number *</span>
              </Label>
              <Input
                id="phone"
                {...register('phone')}
                disabled={!isEditingProfile}
                className={!isEditingProfile ? 'bg-gray-50' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Company/Business Name</span>
              </Label>
              <Input
                id="company"
                {...register('company')}
                disabled={!isEditingProfile}
                className={!isEditingProfile ? 'bg-gray-50' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>City</span>
              </Label>
              <Input
                id="city"
                {...register('city')}
                disabled={!isEditingProfile}
                className={!isEditingProfile ? 'bg-gray-50' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Country</span>
              </Label>
              <Input
                id="country"
                {...register('country')}
                disabled={!isEditingProfile}
                className={!isEditingProfile ? 'bg-gray-50' : ''}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Address</span>
            </Label>
            <Textarea
              id="address"
              {...register('address')}
              disabled={!isEditingProfile}
              className={!isEditingProfile ? 'bg-gray-50' : ''}
              rows={3}
            />
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Timezone *</span>
            </Label>
            <Select
              value={profileData.timezone}
              onValueChange={(value) => setValue('timezone', value)}
              disabled={!isEditingProfile}
            >
              <SelectTrigger className={!isEditingProfile ? 'bg-gray-50' : ''}>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timezone && (
              <p className="text-sm text-red-600">{errors.timezone.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Bio</span>
            </Label>
            <Textarea
              id="bio"
              {...register('bio')}
              disabled={!isEditingProfile}
              className={!isEditingProfile ? 'bg-gray-50' : ''}
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Profile Actions */}
          {isEditingProfile && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Password Change */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600">Update your account password for security</p>
            </div>
          </div>
          {!isChangingPassword && (
            <Button
              variant="outline"
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Change Password</span>
            </Button>
          )}
        </div>

        {isChangingPassword && (
          <form onSubmit={handlePasswordSubmit(handlePasswordChange)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password *</Label>
              <Input
                id="currentPassword"
                type="password"
                {...registerPassword('currentPassword')}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                {...registerPassword('newPassword')}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-600">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...registerPassword('confirmPassword')}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelPassword}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        )}

        {!isChangingPassword && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Password was last changed 3 months ago. For security, we recommend changing your password regularly.
            </p>
          </div>
        )}
      </Card>

      {/* Account Statistics */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Account Statistics</h3>
            <p className="text-sm text-gray-600">Your account activity and information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">2.5</div>
            <div className="text-sm text-gray-600">Years Active</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">1,247</div>
            <div className="text-sm text-gray-600">Total Orders Managed</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm text-gray-600">Platforms Connected</div>
          </div>
        </div>
      </Card>
    </div>
  )
}