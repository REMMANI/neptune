'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import type { AuthSession } from '@/lib/auth';
import type { DealerConfig } from '@/types/customization';

interface LiveCustomizerProps {
  session: AuthSession;
  dealer: {
    id: string;
    slug: string;
    themeKey: string;
  };
  initialConfig: DealerConfig;
  dealerId: string;
}

export function LiveCustomizer({ session, dealer, initialConfig, dealerId }: LiveCustomizerProps) {
  const [config, setConfig] = useState(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  // Generate preview URL with authentication
  useEffect(() => {
    const baseUrl = window.location.origin;
    setPreviewUrl(`${baseUrl}/en?preview=1&t=${Date.now()}`);
  }, [config]);

  // Auto-save draft changes with debouncing
  const saveDraft = useCallback(async (updatedConfig: DealerConfig) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/dealers/${dealerId}/customizations/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConfig),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      setHasChanges(true);
      toast({
        title: "Draft Saved",
        description: "Your changes have been saved automatically.",
      });

      // Trigger preview refresh
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = `${previewUrl}&reload=${Date.now()}`;
      }
    } catch (error) {
      console.error('Save draft error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [dealerId, isSaving, previewUrl, toast]);

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasChanges && JSON.stringify(config) !== JSON.stringify(initialConfig)) {
        saveDraft(config);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [config, hasChanges, initialConfig, saveDraft]);

  const updateConfig = useCallback((updates: Partial<DealerConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  const updateThemeColors = useCallback((colorUpdates: Partial<DealerConfig['theme']['colors']>) => {
    setConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          ...colorUpdates,
        },
      },
    }));
    setHasChanges(true);
  }, []);

  const updateSections = useCallback((sectionUpdates: Partial<DealerConfig['sections']>) => {
    setConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        ...sectionUpdates,
      },
    }));
    setHasChanges(true);
  }, []);

  const publishChanges = async () => {
    if (!hasChanges) {
      toast({
        title: "No Changes",
        description: "There are no changes to publish.",
      });
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch(`/api/admin/dealers/${dealerId}/customizations/publish`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to publish');
      }

      setHasChanges(false);
      toast({
        title: "Published Successfully",
        description: "Your changes are now live on the website.",
      });

      // Refresh the page to get latest published config
      router.refresh();
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Publish Failed",
        description: "Failed to publish your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin/login');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Customize {dealer.slug}
            </h1>
            <p className="text-sm text-gray-600">
              Logged in as {session.user.name} ({session.user.role})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isSaving && (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </div>
              )}
              {hasChanges && !isSaving && (
                <span className="text-sm text-amber-600">Unsaved changes</span>
              )}
            </div>
            <Button
              onClick={publishChanges}
              disabled={!hasChanges || isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? 'Publishing...' : 'Publish Changes'}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Customization Panel */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-6">
            <Tabs defaultValue="theme" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="theme">Theme</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="theme" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                    <CardDescription>Customize your brand colors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <Input
                        id="primary-color"
                        type="color"
                        value={config.theme.colors.primary}
                        onChange={(e) => updateThemeColors({ primary: e.target.value })}
                        className="h-12 w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <Input
                        id="secondary-color"
                        type="color"
                        value={config.theme.colors.secondary}
                        onChange={(e) => updateThemeColors({ secondary: e.target.value })}
                        className="h-12 w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <Input
                        id="accent-color"
                        type="color"
                        value={config.theme.colors.accent}
                        onChange={(e) => updateThemeColors({ accent: e.target.value })}
                        className="h-12 w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                    <CardDescription>Font settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="heading-font">Heading Font</Label>
                      <select
                        id="heading-font"
                        className="w-full p-2 border rounded-md"
                        value={config.theme.typography.headingFont}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            typography: {
                              ...prev.theme.typography,
                              headingFont: e.target.value,
                            },
                          },
                        }))}
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Open Sans">Open Sans</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="body-font">Body Font</Label>
                      <select
                        id="body-font"
                        className="w-full p-2 border rounded-md"
                        value={config.theme.typography.bodyFont}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            typography: {
                              ...prev.theme.typography,
                              bodyFont: e.target.value,
                            },
                          },
                        }))}
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Open Sans">Open Sans</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sections" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Sections</CardTitle>
                    <CardDescription>Show or hide sections on your website</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(config.sections).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key} className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^show/, '').trim()}
                        </Label>
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) =>
                            updateSections({ [key]: checked } as Partial<DealerConfig['sections']>)
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Site Content</CardTitle>
                    <CardDescription>Manage your website content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Content management features coming soon. Currently, content is managed through the CMS API.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Live Preview */}
        <div className="flex-1 bg-gray-100 p-4">
          <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800 text-white px-4 py-2 text-sm flex items-center justify-between">
              <span>Live Preview - {previewUrl}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-gray-300"
                onClick={() => {
                  const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                  if (iframe) {
                    iframe.src = iframe.src;
                  }
                }}
              >
                Refresh
              </Button>
            </div>
            <iframe
              id="preview-iframe"
              src={previewUrl}
              className="w-full h-full border-none"
              title="Live Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}