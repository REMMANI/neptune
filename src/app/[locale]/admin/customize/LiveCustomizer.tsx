'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import type { Session } from '@/lib/auth';
import type { DealerConfig } from '@/types/customization';
import type { DealerInfo } from '@/lib/dealer-service';
import { SectionManager } from './SectionManager';

interface LiveCustomizerProps {
  session: Session;
  dealer: DealerInfo;
  initialConfig: DealerConfig;
  externalDealerId: string;
  dealerId: string;
}

export function LiveCustomizer({ session, dealer, initialConfig, externalDealerId, dealerId }: LiveCustomizerProps) {
  const [config, setConfig] = useState(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  // Generate preview URL (only set once, don't update with config changes)
  useEffect(() => {
    if (!previewUrl) {
      const baseUrl = window.location.origin;
      // Use external dealer ID for preview URL since we don't store slugs locally
      setPreviewUrl(`${baseUrl}/en?preview=1&dealer=${externalDealerId}`);
    }
  }, [externalDealerId, previewUrl]);

  // Auto-save draft changes with better debouncing
  const saveDraft = useCallback(async (updatedConfig: DealerConfig) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/dealers/customizations/draft`, {
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

      toast({
        title: "Draft Saved",
        description: "Your changes have been saved automatically.",
      });

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
  }, [externalDealerId, isSaving, toast]);

  // Improved debouncing with ref to track latest config
  const configRef = useRef(config);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Only save if there are actual changes
    const hasActualChanges = JSON.stringify(config) !== JSON.stringify(initialConfig);

    if (hasActualChanges && !isSaving) {
      setHasChanges(true);

      // Set new timeout for saving
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft(configRef.current);
      }, 2000); // Increased delay to prevent too frequent saves
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [config, initialConfig, isSaving, saveDraft]);

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

  const handleSectionsChange = useCallback((newSections: any[]) => {
    setConfig(prev => ({
      ...prev,
      sections: newSections.reduce((acc, section) => {
        acc[`show${section.name.replace(/\s+/g, '')}`] = section.enabled;
        return acc;
      }, {} as any),
      sectionOrder: newSections,
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
      const response = await fetch(`/api/admin/dealers/customizations/publish`, {
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Modern Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {dealer.displayName?.slice(0, 2).toUpperCase() || 'DL'}
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {dealer.displayName} Customizer
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {session.user.name}
                    </Badge>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-600">Dealer Admin</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Indicators */}
              <div className="flex items-center gap-3">
                {isSaving && (
                  <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                    <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                    <span className="text-xs font-medium text-blue-700">Saving...</span>
                  </div>
                )}
                {hasChanges && !isSaving && (
                  <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-xs font-medium text-amber-700">Unsaved changes</span>
                  </div>
                )}
                {!hasChanges && !isSaving && (
                  <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs font-medium text-green-700">All changes saved</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <Button
                onClick={publishChanges}
                disabled={!hasChanges || isPublishing}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isPublishing ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Publishing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                    </svg>
                    Publish Live
                  </div>
                )}
              </Button>

              <Button variant="outline" onClick={handleLogout} className="border-gray-300 hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Customization Panel */}
        <div className="w-1/3 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 overflow-y-auto shadow-xl">
          <div className="p-6 space-y-6">
            <Tabs defaultValue="theme" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 p-1">
                <TabsTrigger value="theme" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
                  </svg>
                  Theme
                </TabsTrigger>
                <TabsTrigger value="sections" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Layout
                </TabsTrigger>
                <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Content
                </TabsTrigger>
              </TabsList>

              <TabsContent value="theme" className="space-y-6 mt-6">
                {/* Brand Colors Section */}
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg p-4">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
                        </svg>
                      </div>
                      <div>
                        <CardTitle className="text-lg">Brand Colors</CardTitle>
                        <CardDescription className="text-sm">Define your brand identity</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { key: 'primary', label: 'Primary Color', description: 'Main brand color' },
                      { key: 'secondary', label: 'Secondary Color', description: 'Supporting color' },
                      { key: 'accent', label: 'Accent Color', description: 'Highlight color' }
                    ].map(({ key, label, description }) => (
                      <div key={key} className="group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <Label className="text-sm font-medium text-gray-700">{label}</Label>
                            <p className="text-xs text-gray-500 mt-1">{description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs bg-gray-50">
                            {config.theme.colors[key as keyof typeof config.theme.colors]}
                          </Badge>
                        </div>
                        <div className="relative">
                          <Input
                            type="color"
                            value={config.theme.colors[key as keyof typeof config.theme.colors]}
                            onChange={(e) => updateThemeColors({ [key]: e.target.value } as any)}
                            className="h-16 w-full rounded-xl border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
                          />
                          <div
                            className="absolute inset-2 rounded-lg shadow-inner pointer-events-none"
                            style={{ backgroundColor: config.theme.colors[key as keyof typeof config.theme.colors] }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Typography Section */}
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg p-4">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <CardTitle className="text-lg">Typography</CardTitle>
                        <CardDescription className="text-sm">Choose your fonts</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">Heading Font</Label>
                      <select
                        className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
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
                        <option value="Inter">Inter - Modern & Clean</option>
                        <option value="Roboto">Roboto - Google Font</option>
                        <option value="Poppins">Poppins - Friendly & Round</option>
                        <option value="Open Sans">Open Sans - Professional</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">Body Font</Label>
                      <select
                        className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
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
                        <option value="Inter">Inter - Modern & Clean</option>
                        <option value="Roboto">Roboto - Google Font</option>
                        <option value="Poppins">Poppins - Friendly & Round</option>
                        <option value="Open Sans">Open Sans - Professional</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sections" className="space-y-6 mt-6">
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg p-4">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <CardTitle className="text-lg">Advanced Section Management</CardTitle>
                        <CardDescription className="text-sm">Drag to reorder, customize, and manage your page sections</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SectionManager
                      sections={Object.entries(config.sections).map(([key, value], index) => ({
                        id: key,
                        name: key.replace(/([A-Z])/g, ' $1').replace(/^show/, '').trim(),
                        type: key.replace('show', '').toLowerCase(),
                        enabled: value,
                        order: index + 1,
                        description: `${key.replace(/([A-Z])/g, ' $1').replace(/^show/, '').trim()} section`
                      }))}
                      onSectionsChange={handleSectionsChange}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-6 mt-6">
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg p-4">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div>
                        <CardTitle className="text-lg">Content Management</CardTitle>
                        <CardDescription className="text-sm">Edit your website content</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Content Editor Coming Soon</h3>
                      <p className="text-sm text-gray-600 mb-6 max-w-xs mx-auto">
                        Advanced content management features are in development. Currently, content is managed through the CMS API.
                      </p>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        In Development
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Enhanced Live Preview */}
        <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 p-6">
          <div className="h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50">
            {/* Preview Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center bg-gray-700/50 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-mono">{previewUrl.replace('http://localhost:3001', 'your-domain.com')}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => {
                    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                    if (iframe) {
                      // Force refresh with timestamp to ensure changes are reflected
                      const url = new URL(iframe.src);
                      url.searchParams.set('t', Date.now().toString());
                      iframe.src = url.toString();
                    }
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </Button>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Live Preview
                </Badge>
              </div>
            </div>

            {/* Preview Content */}
            <div className="relative h-full">
              <iframe
                id="preview-iframe"
                src={previewUrl}
                className="w-full h-full border-none"
                title="Live Website Preview"
              />

              {/* Loading Overlay */}
              {isSaving && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-medium text-gray-700">Updating Preview...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}