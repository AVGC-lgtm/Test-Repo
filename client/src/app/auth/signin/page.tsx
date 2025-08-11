'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { APP_NAME, COMPANY_INFO } from '@/lib/constants'
import api from '@/lib/api'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/auth/login', { email, password })

      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));

      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{APP_NAME}</CardTitle>
          <CardDescription className="text-center">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Demo Accounts:</h3>
            <div className="text-xs space-y-1">
              <div><strong>DAO:</strong> dao@agrishield.com</div>
              <div><strong>Field Officer:</strong> field@agrishield.com</div>
              <div><strong>Legal Officer:</strong> legal@agrishield.com</div>
              <div><strong>Lab Coordinator:</strong> lab@agrishield.com</div>
              <div><strong>HQ Monitoring:</strong> hq@agrishield.com</div>
              <div><strong>District Admin:</strong> admin@agrishield.com</div>
              <div className="mt-2"><strong>Password:</strong> password123</div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            <div>© 2024 {APP_NAME}</div>
            <div>Developed by {COMPANY_INFO.name}</div>
            <div>Contact: {COMPANY_INFO.contact}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
