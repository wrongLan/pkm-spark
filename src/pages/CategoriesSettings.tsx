import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchCategories, saveCategories, proposeCategories } from '@/lib/api';

export default function CategoriesSettings() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [proposedCategories, setProposedCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(true);
  const [showProposal, setShowProposal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
      setServerAvailable(true);
    } catch (error: any) {
      if (error.message === 'NOT_AVAILABLE') {
        console.log('Categories endpoint not available - using local storage');
        setServerAvailable(false);
        // Load from localStorage as fallback
        const saved = localStorage.getItem('categories');
        if (saved) {
          setCategories(JSON.parse(saved));
        }
      } else {
        console.error('Failed to load categories:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (serverAvailable) {
        await saveCategories(categories);
        console.log('Categories saved successfully');
      } else {
        // Save to localStorage when server not available
        localStorage.setItem('categories', JSON.stringify(categories));
        console.log('Categories endpoint not available - saved locally');
      }
      setHasUnsavedChanges(false);
    } catch (error: any) {
      if (error.message === 'NOT_AVAILABLE') {
        setServerAvailable(false);
        localStorage.setItem('categories', JSON.stringify(categories));
        console.log('Categories endpoint not available - saved locally');
        setHasUnsavedChanges(false);
      } else {
        console.error('Failed to save categories:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePropose = async () => {
    setIsProposing(true);
    try {
      const proposal = await proposeCategories(200);
      setProposedCategories(proposal);
      setShowProposal(true);
      setServerAvailable(true);
    } catch (error: any) {
      if (error.message === 'NOT_AVAILABLE') {
        console.log('Categories proposal endpoint not available');
        setServerAvailable(false);
        // Provide some default suggestions as fallback
        setProposedCategories([
          'Research', 'Documentation', 'Code', 'Articles', 'Notes', 
          'References', 'Ideas', 'Projects', 'Learning', 'Archive'
        ]);
        setShowProposal(true);
      } else {
        console.error('Failed to propose categories:', error);
      }
    } finally {
      setIsProposing(false);
    }
  };

  const addCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setHasUnsavedChanges(true);
      setNewCategoryInput('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(cat => cat !== categoryToRemove));
    setHasUnsavedChanges(true);
  };

  const acceptProposal = () => {
    setCategories(proposedCategories);
    setHasUnsavedChanges(true);
    setShowProposal(false);
    setProposedCategories([]);
  };

  const discardProposal = () => {
    setShowProposal(false);
    setProposedCategories([]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory(newCategoryInput);
    }
  };

  const moveCategory = (from: number, to: number) => {
    const newCategories = [...categories];
    const [moved] = newCategories.splice(from, 1);
    newCategories.splice(to, 0, moved);
    setCategories(newCategories);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/search')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Categories Settings</h1>
            <p className="text-muted-foreground">
              Organize your knowledge base with custom categories
            </p>
          </div>
        </div>

        {!serverAvailable && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              Categories endpoint not available. Changes will be saved locally for this session only.
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Current Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Current Categories</h2>
              {hasUnsavedChanges && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading categories...</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Add new category..."
                    className="flex-1"
                  />
                  <Button
                    onClick={() => addCategory(newCategoryInput)}
                    disabled={!newCategoryInput.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 min-h-[200px] border rounded-lg p-4">
                  {categories.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No categories yet. Add some or use AI to propose categories.
                    </p>
                  ) : (
                    categories.map((category, index) => (
                      <div
                        key={category}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded border"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <Badge variant="secondary" className="flex-1">
                          {category}
                        </Badge>
                        <button
                          onClick={() => removeCategory(category)}
                          className="p-1 hover:bg-destructive/20 rounded"
                          aria-label={`Remove ${category}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* AI Proposal */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">AI Suggestions</h2>
            
            <Button
              onClick={handlePropose}
              disabled={isProposing}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isProposing ? 'Generating...' : 'Propose Categories with AI'}
            </Button>

            {showProposal && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Proposed Categories</h3>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={acceptProposal}>
                      Accept All
                    </Button>
                    <Button size="sm" variant="outline" onClick={discardProposal}>
                      Discard
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {proposedCategories.map(category => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
                
                {!serverAvailable && (
                  <p className="text-xs text-muted-foreground">
                    * These are default suggestions since AI proposal is not available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}