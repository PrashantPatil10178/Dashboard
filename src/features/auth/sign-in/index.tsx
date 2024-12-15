import React, { useState } from 'react'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/services/AxiosInterceptor'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import AuthLayout from '../auth-layout'

interface VerifyOtp {
  accessToken: string
  refreshToken: string
  isNewUser: boolean
}

// Define Zod schemas
const emailSchema = z.string().email('Invalid email address')
const phoneNumberSchema = z
  .string()
  .regex(/^\d{10}$/, 'Phone number must be 10 digits')

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [otpVisible, setOtpVisible] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [alertInfo, setAlertInfo] = useState<{
    type: 'default' | 'error'
    title: string
    description: string
  } | null>(null)

  const navigate = useNavigate({ from: '/sign-in' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAlertInfo(null)

    // Validate email using Zod
    const emailValidation = emailSchema.safeParse(email)
    if (!emailValidation.success) {
      toast({
        title: 'Invalid Email',
        description: emailValidation.error.errors[0].message,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    try {
      if (!otpVisible) {
        const otpResponse = await api.post('/auth/send-otp', { email })
        console.log('OTP Sent Response:', otpResponse)
        setOtpVisible(true)
        setAlertInfo({
          type: 'default',
          title: 'OTP Sent',
          description: 'Please check your email for the OTP.',
        })
      } else {
        const otpValue = otp.join('')
        if (otpValue.length === 6) {
          const response: VerifyOtp = await api.post('/auth/verify-otp', {
            email,
            otp: otpValue,
          })
          console.log('OTP Verified Response:', response)
          api.setTokens(response.accessToken, response.refreshToken)
          if (response.isNewUser) {
            setIsNewUser(true)
            setAlertInfo({
              type: 'default',
              title: 'OTP Verified',
              description: 'Please complete your profile.',
            })
          } else {
            setAlertInfo({
              type: 'default',
              title: 'Login Successful',
              description: 'Welcome back!',
            })
            // Redirect without reloading page
            setTimeout(
              () =>
                navigate({
                  to: '/',
                }),
              1000
            )
          }
        } else {
          setAlertInfo({
            type: 'error',
            title: 'Invalid OTP',
            description: 'Please enter a valid 6-digit OTP.',
          })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setAlertInfo({
        type: 'error',
        title: 'Error',
        description: 'Failed to process request. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    setAlertInfo(null)
    try {
      await api.post('/auth/resend-otp', { email })
      setAlertInfo({
        type: 'default',
        title: 'OTP Resent',
        description: 'A new OTP has been sent to your email.',
      })
    } catch (error) {
      console.error('Resend OTP error:', error)
      setAlertInfo({
        type: 'error',
        title: 'Error',
        description: 'Failed to resend OTP. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAlertInfo(null)

    // Validate phone number using Zod
    const phoneValidation = phoneNumberSchema.safeParse(phoneNumber)
    if (!phoneValidation.success) {
      toast({
        title: 'Invalid Phone Number',
        description: phoneValidation.error.errors[0].message,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await api.post('/users/updateUser', {
        name,
        phoneNumber,
      })
      console.log('Profile Updated Response:', response)
      setAlertInfo({
        type: 'default',
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      })
    } catch (error) {
      console.error('Profile update error:', error)
      setAlertInfo({
        type: 'error',
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className='mx-auto max-w-sm mt-10'>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alertInfo && (
            <Alert
              className={`mb-4 ${
                alertInfo.type === 'error' ? 'bg-destructive/15' : ''
              }`}
            >
              <AlertTitle>{alertInfo.title}</AlertTitle>
              <AlertDescription>{alertInfo.description}</AlertDescription>
            </Alert>
          )}
          {!isNewUser ? (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='m@example.com'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {otpVisible && (
                <div className='space-y-2'>
                  <Label htmlFor='otp'>Enter OTP</Label>
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    value={otp.join('')}
                    onChange={(value) => {
                      const newOtp = value
                        .split('')
                        .concat(Array(6).fill(''))
                        .slice(0, 6)
                      setOtp(newOtp)
                    }}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              )}

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                {otpVisible ? 'Verify OTP' : 'Send OTP'}
              </Button>

              {otpVisible && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className='w-full'
                >
                  {isLoading ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : null}
                  Resend OTP
                </Button>
              )}

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Login */}
            </form>
          ) : (
            <form onSubmit={handleCompleteProfile} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  type='text'
                  placeholder='Parth Momaya'
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phoneNumber'>Phone Number</Label>
                <Input
                  id='phoneNumber'
                  type='tel'
                  placeholder='7620170904'
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Complete Profile
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
