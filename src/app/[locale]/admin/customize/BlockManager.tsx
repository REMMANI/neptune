'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Block {
  id: string;
  type: string;
  name: string;
  content: any;
  settings: any;
  order: number;
  sectionId: string;
}

interface BlockManagerProps {
  sectionId: string;
  sectionName: string;
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  onClose: () => void;
}

export function BlockManager({ sectionId, sectionName, blocks, onBlocksChange, onClose }: BlockManagerProps) {
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOverBlock, setDragOverBlock] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const { toast } = useToast();

  const sectionBlocks = blocks.filter(block => block.sectionId === sectionId);

  const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', blockId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverBlock(blockId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverBlock(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();

    if (!draggedBlock || draggedBlock === targetBlockId) {
      setDraggedBlock(null);
      setDragOverBlock(null);
      return;
    }

    const newBlocks = [...blocks];
    const draggedIndex = newBlocks.findIndex(b => b.id === draggedBlock);
    const targetIndex = newBlocks.findIndex(b => b.id === targetBlockId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedBlock(null);
      setDragOverBlock(null);
      return;
    }

    // Remove dragged item
    const [removed] = newBlocks.splice(draggedIndex, 1);

    // Insert at target position
    newBlocks.splice(targetIndex, 0, removed);

    // Update order values within the section
    const sectionBlocksInNewOrder = newBlocks.filter(b => b.sectionId === sectionId);
    sectionBlocksInNewOrder.forEach((block, index) => {
      block.order = index + 1;
    });

    onBlocksChange(newBlocks);

    toast({
      title: "Block Reordered",
      description: `Block moved successfully within ${sectionName}`,
    });

    setDraggedBlock(null);
    setDragOverBlock(null);
  }, [draggedBlock, blocks, sectionId, sectionName, onBlocksChange, toast]);

  const handleDragEnd = useCallback(() => {
    setDraggedBlock(null);
    setDragOverBlock(null);
  }, []);

  const addNewBlock = useCallback((blockType: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: blockType,
      name: `New ${blockType.charAt(0).toUpperCase() + blockType.slice(1)} Block`,
      content: getDefaultContent(blockType),
      settings: getDefaultSettings(blockType),
      order: sectionBlocks.length + 1,
      sectionId: sectionId,
    };

    onBlocksChange([...blocks, newBlock]);

    toast({
      title: "Block Added",
      description: `${blockType.charAt(0).toUpperCase() + blockType.slice(1)} block added to ${sectionName}`,
    });
  }, [blocks, sectionBlocks.length, sectionId, sectionName, onBlocksChange, toast]);

  const removeBlock = useCallback((blockId: string) => {
    const blockToRemove = blocks.find(b => b.id === blockId);
    if (!blockToRemove) return;

    const updatedBlocks = blocks
      .filter(block => block.id !== blockId)
      .map(block => {
        if (block.sectionId === sectionId && block.order > blockToRemove.order) {
          return { ...block, order: block.order - 1 };
        }
        return block;
      });

    onBlocksChange(updatedBlocks);

    toast({
      title: "Block Removed",
      description: `${blockToRemove.name} has been removed`,
    });
  }, [blocks, sectionId, onBlocksChange, toast]);

  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );

    onBlocksChange(updatedBlocks);
  }, [blocks, onBlocksChange]);

  function getDefaultContent(blockType: string) {
    switch (blockType) {
      case 'text':
        return { text: 'Enter your text content here...', alignment: 'left' };
      case 'image':
        return { src: '', alt: 'Image description', caption: '' };
      case 'button':
        return { text: 'Click Me', link: '#', style: 'primary' };
      case 'video':
        return { url: '', title: 'Video Title', autoplay: false };
      case 'gallery':
        return { images: [], layout: 'grid', columns: 3 };
      case 'testimonial':
        return { quote: 'Great service!', author: 'Customer Name', rating: 5 };
      default:
        return {};
    }
  }

  function getDefaultSettings(blockType: string) {
    return {
      padding: 'medium',
      margin: 'medium',
      backgroundColor: 'transparent',
      textColor: 'default',
      animation: 'none',
    };
  }

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'text':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'button':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'gallery':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'testimonial':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };

  const blockTypes = [
    { type: 'text', name: 'Text Block', description: 'Add text content' },
    { type: 'image', name: 'Image Block', description: 'Add images' },
    { type: 'button', name: 'Button Block', description: 'Add call-to-action buttons' },
    { type: 'video', name: 'Video Block', description: 'Embed videos' },
    { type: 'gallery', name: 'Gallery Block', description: 'Image galleries' },
    { type: 'testimonial', name: 'Testimonial Block', description: 'Customer reviews' },
  ];

  const sortedBlocks = [...sectionBlocks].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Block Manager</h2>
              <p className="text-gray-600 mt-1">Managing blocks in <span className="font-medium">{sectionName}</span> section</p>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-100px)]">
          {/* Block List */}
          <div className="w-2/3 p-6 overflow-y-auto">
            <div className="space-y-4">
              {sortedBlocks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Blocks Yet</h3>
                  <p className="text-sm text-gray-600">Add your first block to get started</p>
                </div>
              ) : (
                sortedBlocks.map((block) => (
                  <Card
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, block.id)}
                    onDragOver={(e) => handleDragOver(e, block.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, block.id)}
                    onDragEnd={handleDragEnd}
                    className={`
                      transition-all duration-200 cursor-move border-2
                      ${draggedBlock === block.id ? 'opacity-50 scale-95' : 'opacity-100'}
                      ${dragOverBlock === block.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
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

                          {/* Block Icon */}
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center">
                            {getBlockIcon(block.type)}
                          </div>

                          {/* Block Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{block.name}</h4>
                              <Badge variant="default" className="text-xs">
                                #{block.order}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {block.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {block.type.charAt(0).toUpperCase() + block.type.slice(1)} content block
                            </p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBlock(block.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </div>

                      {/* Editing Form */}
                      {editingBlock === block.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t">
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`block-name-${block.id}`} className="text-sm font-medium">Block Name</Label>
                              <Input
                                id={`block-name-${block.id}`}
                                value={block.name}
                                onChange={(e) => updateBlock(block.id, { name: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            {block.type === 'text' && (
                              <div>
                                <Label htmlFor={`block-text-${block.id}`} className="text-sm font-medium">Text Content</Label>
                                <textarea
                                  id={`block-text-${block.id}`}
                                  value={block.content.text || ''}
                                  onChange={(e) => updateBlock(block.id, {
                                    content: { ...block.content, text: e.target.value }
                                  })}
                                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg resize-none"
                                  rows={3}
                                />
                              </div>
                            )}
                            {block.type === 'button' && (
                              <>
                                <div>
                                  <Label htmlFor={`button-text-${block.id}`} className="text-sm font-medium">Button Text</Label>
                                  <Input
                                    id={`button-text-${block.id}`}
                                    value={block.content.text || ''}
                                    onChange={(e) => updateBlock(block.id, {
                                      content: { ...block.content, text: e.target.value }
                                    })}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`button-link-${block.id}`} className="text-sm font-medium">Button Link</Label>
                                  <Input
                                    id={`button-link-${block.id}`}
                                    value={block.content.link || ''}
                                    onChange={(e) => updateBlock(block.id, {
                                      content: { ...block.content, link: e.target.value }
                                    })}
                                    className="mt-1"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Add Block Panel */}
          <div className="w-1/3 bg-gray-50 p-6 border-l border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Block</h3>
            <div className="space-y-3">
              {blockTypes.map((blockType) => (
                <Card
                  key={blockType.type}
                  className="cursor-pointer hover:shadow-md transition-shadow bg-white border-gray-200 hover:border-blue-300"
                  onClick={() => addNewBlock(blockType.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                        {getBlockIcon(blockType.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">{blockType.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{blockType.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}