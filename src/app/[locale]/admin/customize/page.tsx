'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { DealerConfig, SectionsConfig, ThemeColors } from '@/types/customization';

interface CustomizerProps {
  dealerId: string;
  initialConfig: DealerConfig;
}

export default function CustomizerPage() {
  const [dealerId, setDealerId] = useState('');
  const [config, setConfig] = useState<DealerConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchConfig = async () => {
    if (!dealerId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/dealers/${dealerId}/config?preview=1`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dealer configuration',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const updateDraft = async (updates: Partial<DealerConfig>) => {
    if (!dealerId || !config) return;

    try {
      const response = await fetch(`/api/dealers/${dealerId}/customizations/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Update local config
        setConfig({ ...config, ...updates });
        toast({
          title: 'Draft Updated',
          description: 'Changes saved to draft',
        });
      }
    } catch (error) {
      console.error('Failed to update draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  const publishChanges = async () => {
    if (!dealerId) return;

    setPublishing(true);
    try {
      const response = await fetch(`/api/dealers/${dealerId}/customizations/publish`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Published',
          description: 'Changes have been published successfully',
        });
        // Refresh the preview
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to publish:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish changes',
        variant: 'destructive',
      });
    }
    setPublishing(false);
  };

  const previewUrl = dealerId ? `/en?preview=1&dealer=${dealerId}` : '';

  if (!config && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Dealership Customizer</CardTitle>
            <CardDescription>Enter a dealer ID to start customizing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dealerId">Dealer ID</Label>
              <Input
                id="dealerId"
                value={dealerId}
                onChange={(e) => setDealerId(e.target.value)}
                placeholder="Enter dealer ID"
              />
            </div>
            <Button onClick={fetchConfig} className="w-full">
              Load Customizer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading customizer...</div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Preview Pane */}
        <div className="flex-1 bg-white">
          <div className="h-16 bg-gray-900 flex items-center justify-between px-6">
            <h1 className="text-white font-semibold">Live Preview</h1>
            <Button
              onClick={publishChanges}
              disabled={publishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            style={{ height: 'calc(100vh - 4rem)' }}
          />
        </div>

        {/* Control Panel */}
        <div className="w-96 bg-white border-l overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Customization Panel</h2>

            <Tabs defaultValue="theme" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="theme">Theme</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="menu">Menu</TabsTrigger>
              </TabsList>

              {/* Theme Tab */}
              <TabsContent value="theme" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Selection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={config.theme.key}
                      onValueChange={(value) => {
                        updateDraft({
                          theme: {
                            ...config.theme,
                            key: value,
                          },
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">Base Theme</SelectItem>
                        <SelectItem value="t1">Premium Theme</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Primary Color</Label>
                      <Input
                        type="color"
                        value={config.theme.colors.primary}
                        onChange={(e) => {
                          updateDraft({
                            theme: {
                              ...config.theme,
                              colors: {
                                ...config.theme.colors,
                                primary: e.target.value,
                              },
                            },
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <Input
                        type="color"
                        value={config.theme.colors.secondary}
                        onChange={(e) => {
                          updateDraft({
                            theme: {
                              ...config.theme,
                              colors: {
                                ...config.theme.colors,
                                secondary: e.target.value,
                              },
                            },
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Accent Color</Label>
                      <Input
                        type="color"
                        value={config.theme.colors.accent}
                        onChange={(e) => {
                          updateDraft({
                            theme: {
                              ...config.theme,
                              colors: {
                                ...config.theme.colors,
                                accent: e.target.value,
                              },
                            },
                          });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Heading Font</Label>
                      <Select
                        value={config.theme.typography.headingFont}
                        onValueChange={(value) => {
                          updateDraft({
                            theme: {
                              ...config.theme,
                              typography: {
                                ...config.theme.typography,
                                headingFont: value,
                              },
                            },
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Body Font</Label>
                      <Select
                        value={config.theme.typography.bodyFont}
                        onValueChange={(value) => {
                          updateDraft({
                            theme: {
                              ...config.theme,
                              typography: {
                                ...config.theme.typography,
                                bodyFont: value,
                              },
                            },
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sections Tab */}
              <TabsContent value="sections" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Sections</CardTitle>
                    <CardDescription>Control which sections appear on your pages</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(config.sections).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="capitalize">
                          {key.replace(/^show/, '').replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => {
                            updateDraft({
                              sections: {
                                ...config.sections,
                                [key]: checked,
                              },
                            });
                          }}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Menu Tab */}
              <TabsContent value="menu" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Navigation Menu</CardTitle>
                    <CardDescription>Configure your site navigation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {config.menu.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-sm text-gray-500">/{item.slug}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Edit Menu Items
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}