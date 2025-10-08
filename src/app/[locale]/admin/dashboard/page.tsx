import { requireDealerAuth } from '@/lib/auth';
import { getDealerConfig } from '@/lib/config';
import { findDealerById } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboard() {
  const { session, dealerId } = await requireDealerAuth();

  const [dealer, config] = await Promise.all([
    findDealerById(dealerId),
    getDealerConfig(dealerId, { preview: false })
  ]);

  if (!dealer) {
    throw new Error('Dealer not found');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {session.user.name}! Manage your dealership website.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Dealer ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{dealer.slug}</div>
              <p className="text-sm text-gray-600">{dealerId}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Current Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 capitalize">
                {dealer.themeKey}
              </div>
              <p className="text-sm text-gray-600">Active theme</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">User Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {session.user.role.replace('_', ' ')}
              </div>
              <p className="text-sm text-gray-600">{session.user.permissions.join(', ')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Customize Website</CardTitle>
              <CardDescription>
                Make changes to your website design, colors, and layout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/customize">
                <Button className="w-full">
                  Open Customizer
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Live Site</CardTitle>
              <CardDescription>
                See how your website looks to visitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/en" target="_blank">
                <Button variant="outline" className="w-full">
                  View Website
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Current Configuration Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
            <CardDescription>
              Overview of your current website settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme Colors */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Theme Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: config.theme.colors.primary }}
                    ></div>
                    <span className="text-sm">Primary: {config.theme.colors.primary}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: config.theme.colors.secondary }}
                    ></div>
                    <span className="text-sm">Secondary: {config.theme.colors.secondary}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: config.theme.colors.accent }}
                    ></div>
                    <span className="text-sm">Accent: {config.theme.colors.accent}</span>
                  </div>
                </div>
              </div>

              {/* Active Sections */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Active Sections</h4>
                <div className="space-y-2">
                  {Object.entries(config.sections).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^show/, '').trim()}
                      </span>
                      <span className={`text-sm ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}