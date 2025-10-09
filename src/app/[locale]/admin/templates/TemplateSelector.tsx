'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import type { AuthSession } from '@/lib/auth';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  sections: any[];
  settings: any;
  isActive: boolean;
}

interface TemplateSelectorProps {
  session: AuthSession;
  dealerId: string;
}

export function TemplateSelector({ session, dealerId }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/templates', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = async (templateId: string) => {
    setSelecting(templateId);

    try {
      const response = await fetch(`/api/admin/dealers/templates/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to select template');
      }

      toast({
        title: 'Template Selected',
        description: 'Your template has been selected successfully. You can now customize it.',
      });

      // Navigate to customizer
      router.push('/admin/customize');
    } catch (error) {
      console.error('Error selecting template:', error);
      toast({
        title: 'Selection Failed',
        description: 'Failed to select template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-pulse">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg"></div>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          {/* Template Preview */}
          <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div className="text-xs text-gray-500 font-medium">Preview</div>
              </div>
            </div>
          </div>

          <CardHeader className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {template.name}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  {template.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4">
            {/* Template Features */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Included Sections
              </div>
              <div className="flex flex-wrap gap-1">
                {template.sections?.slice(0, 4).map((section: any) => (
                  <Badge key={section.id} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    {section.name}
                  </Badge>
                ))}
                {template.sections?.length > 4 && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    +{template.sections?.length - 4} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Color Preview */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Color Scheme
              </div>
              <div className="flex space-x-2">
                {template.settings?.colors && (
                  <>
                    <div
                      className="w-6 h-6 rounded-full shadow-inner border border-gray-200"
                      style={{ backgroundColor: template.settings?.colors.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full shadow-inner border border-gray-200"
                      style={{ backgroundColor: template.settings?.colors.secondary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full shadow-inner border border-gray-200"
                      style={{ backgroundColor: template.settings?.colors.accent }}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Select Button */}
            <Button
              onClick={() => selectTemplate(template.id)}
              disabled={selecting === template.id}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              {selecting === template.id ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Selecting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Select Template
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}

      {templates.length === 0 && !loading && (
        <div className="col-span-full text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h3>
          <p className="text-sm text-gray-600">
            Please contact support to add templates to your account.
          </p>
        </div>
      )}
    </div>
  );
}