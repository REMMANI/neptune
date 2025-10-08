'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { BlockManager } from './BlockManager';

interface Section {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  order: number;
  description?: string;
}

interface SectionManagerProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

export function SectionManager({ sections, onSectionsChange }: SectionManagerProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [editingBlocks, setEditingBlocks] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const { toast } = useToast();

  const handleDragStart = useCallback((e: React.DragEvent, sectionId: string) => {
    setDraggedItem(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', sectionId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(sectionId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverItem(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetSectionId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const draggedSection = sections.find(s => s.id === draggedItem);
    const targetSection = sections.find(s => s.id === targetSectionId);

    if (!draggedSection || !targetSection) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newSections = [...sections];
    const draggedIndex = newSections.findIndex(s => s.id === draggedItem);
    const targetIndex = newSections.findIndex(s => s.id === targetSectionId);

    // Remove dragged item
    const [removed] = newSections.splice(draggedIndex, 1);

    // Insert at target position
    newSections.splice(targetIndex, 0, removed);

    // Update order values
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index + 1,
    }));

    onSectionsChange(updatedSections);

    toast({
      title: "Section Reordered",
      description: `${draggedSection.name} moved successfully`,
    });

    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, sections, onSectionsChange, toast]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  const toggleSection = useCallback((sectionId: string, enabled: boolean) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, enabled } : section
    );
    onSectionsChange(updatedSections);

    const sectionName = sections.find(s => s.id === sectionId)?.name || 'Section';
    toast({
      title: enabled ? "Section Enabled" : "Section Disabled",
      description: `${sectionName} is now ${enabled ? 'visible' : 'hidden'} on your website`,
    });
  }, [sections, onSectionsChange, toast]);

  const addNewSection = useCallback(() => {
    const newSection: Section = {
      id: `custom-${Date.now()}`,
      name: 'New Section',
      type: 'custom',
      enabled: true,
      order: sections.length + 1,
      description: 'Custom content section',
    };

    onSectionsChange([...sections, newSection]);

    toast({
      title: "Section Added",
      description: "New custom section added to your page",
    });
  }, [sections, onSectionsChange, toast]);

  const removeSection = useCallback((sectionId: string) => {
    const sectionToRemove = sections.find(s => s.id === sectionId);
    if (!sectionToRemove) return;

    const updatedSections = sections
      .filter(section => section.id !== sectionId)
      .map((section, index) => ({
        ...section,
        order: index + 1,
      }));

    onSectionsChange(updatedSections);

    toast({
      title: "Section Removed",
      description: `${sectionToRemove.name} has been removed`,
    });
  }, [sections, onSectionsChange, toast]);

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'hero':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      case 'features':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'gallery':
      case 'inventory':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'contact':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'services':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'testimonials':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Page Sections</h3>
          <p className="text-sm text-gray-600">Drag to reorder, toggle to show/hide</p>
        </div>
        <Button
          onClick={addNewSection}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Section
        </Button>
      </div>

      <div className="space-y-3">
        {sortedSections.map((section, index) => (
          <Card
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section.id)}
            onDragEnd={handleDragEnd}
            className={`
              transition-all duration-200 cursor-move border-2
              ${draggedItem === section.id ? 'opacity-50 scale-95' : 'opacity-100'}
              ${dragOverItem === section.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              ${section.enabled ? 'bg-white' : 'bg-gray-50'}
            `}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Drag Handle */}
                  <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>

                  {/* Section Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    section.enabled
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {getSectionIcon(section.type)}
                  </div>

                  {/* Section Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${section.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                        {section.name}
                      </h4>
                      <Badge
                        variant={section.enabled ? "default" : "secondary"}
                        className="text-xs"
                      >
                        #{section.order}
                      </Badge>
                      {section.type === 'custom' && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                          Custom
                        </Badge>
                      )}
                    </div>
                    {section.description && (
                      <p className="text-xs text-gray-500 mt-1">{section.description}</p>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingBlocks(section.id)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </Button>

                  <Switch
                    checked={section.enabled}
                    onCheckedChange={(checked) => toggleSection(section.id, checked)}
                    className="data-[state=checked]:bg-green-600"
                  />

                  {section.type === 'custom' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sections</h3>
            <p className="text-sm text-gray-600 mb-4">Add your first section to get started</p>
            <Button onClick={addNewSection} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              Add Your First Section
            </Button>
          </div>
        )}
      </div>

      {/* Block Manager Modal */}
      {editingBlocks && (
        <BlockManager
          sectionId={editingBlocks}
          sectionName={sections.find(s => s.id === editingBlocks)?.name || 'Section'}
          blocks={blocks}
          onBlocksChange={setBlocks}
          onClose={() => setEditingBlocks(null)}
        />
      )}
    </div>
  );
}