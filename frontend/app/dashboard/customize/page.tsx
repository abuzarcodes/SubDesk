'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiClient, PageConfigResponse } from '@/lib/api';
import { PageConfig, DEFAULT_CONFIG } from '@/lib/theme';
import { Navbar } from '@/components/navbar';
import { LoadingSpinner } from '@/components/loading-spinner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Save, Globe, EyeOff } from 'lucide-react';

// Custom debounce hook for iframe messages
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const COLOR_PRESETS = [
  { name: 'Default', primary: '#000000', background: '#ffffff', accent: '#000000', text: '#000000' },
  { name: 'Pro Blue', primary: '#3b82f6', background: '#ffffff', accent: '#2563eb', text: '#1e293b' },
  { name: 'Midnight', primary: '#60a5fa', background: '#0f172a', accent: '#3b82f6', text: '#f8fafc' },
  { name: 'Emerald', primary: '#10b981', background: '#f8fafc', accent: '#059669', text: '#0f172a' },
  { name: 'Sunset', primary: '#f43f5e', background: '#fff1f2', accent: '#e11d48', text: '#4c0519' },
  { name: 'Purple Rain', primary: '#8b5cf6', background: '#f5f3ff', accent: '#7c3aed', text: '#2e1065' },
];

export default function CustomizePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [savedConfig, setSavedConfig] = useState<PageConfig | null>(null);
  const [draftConfig, setDraftConfig] = useState<PageConfig>(DEFAULT_CONFIG);
  const [profile, setProfile] = useState<any>(null);
  
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debouncedConfig = useDebounce(draftConfig, 100);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'business') {
      router.push('/login');
      return;
    }
    loadConfig();
  }, [user, authLoading, router]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPageConfig();
      setProfile(response.profile);
      setIsPublished(response.config.is_published);
      
      const configObj: PageConfig = {
        theme: {
          ...DEFAULT_CONFIG.theme,
          ...response.config.theme,
          colors: {
            ...DEFAULT_CONFIG.theme.colors,
            ...(response.config.theme?.colors || {})
          }
        },
        layout: {
          ...DEFAULT_CONFIG.layout,
          ...response.config.layout
        },
        components: {
          ...DEFAULT_CONFIG.components,
          ...response.config.components
        },
      };
      
      setSavedConfig(configObj);
      setDraftConfig(configObj);
    } catch (error) {
      toast.error('Failed to load page configuration');
      // Use defaults if missing
      setSavedConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  };

  // Send updates to iframe when debounced config changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SUBTRCKR_PREVIEW_UPDATE', payload: debouncedConfig },
        '*'
      );
    }
  }, [debouncedConfig]);

  const handleConfigChange = (key: keyof PageConfig, value: any) => {
    setDraftConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = (key: keyof PageConfig['theme'], value: any) => {
    setDraftConfig(prev => ({
      ...prev,
      theme: { ...prev.theme, [key]: value }
    }));
  };

  const handleColorChange = (key: keyof PageConfig['theme']['colors'], value: string) => {
    setDraftConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: { ...prev.theme.colors, [key]: value }
      }
    }));
  };

  const hasChanges = JSON.stringify(draftConfig) !== JSON.stringify(savedConfig);

  const resetChanges = () => {
    if (savedConfig) setDraftConfig(savedConfig);
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      await apiClient.updatePageConfig(draftConfig);
      setSavedConfig(draftConfig);
      toast.success('Draft saved successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    setPublishing(true);
    try {
      if (isPublished) {
        await apiClient.unpublishPageConfig();
        setIsPublished(false);
        toast.info('Page unpublished');
      } else {
        await apiClient.publishPageConfig();
        setIsPublished(true);
        toast.success('Page published successfully!');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to toggle publish status');
    } finally {
      setPublishing(false);
    }
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setDraftConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          primary: preset.primary,
          background: preset.background,
          accent: (preset as any).accent || preset.primary,
          text: (preset as any).text || prev.theme.colors.text,
        }
      }
    }));
    toast.info(`Applied ${preset.name} preset`);
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner />
      </>
    );
  }

  // Use slug if available, otherwise User ID
  const previewIdentifier = profile?.slug || user?.id;
  const previewUrl = `/subscribe/${previewIdentifier}?preview=true`;

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
        
        {/* Left Panel - Controls */}
        <div className="w-1/3 min-w-[320px] max-w-[400px] border-r border-border bg-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <h2 className="font-semibold">Customize Page</h2>
            <div className="flex gap-2 text-xs">
              <Button variant="outline" size="sm" onClick={resetChanges} disabled={!hasChanges || saving}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Revert
              </Button>
              <Button size="sm" onClick={saveDraft} disabled={!hasChanges || saving}>
                <Save className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Theme Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Theme</h3>
                <Select onValueChange={(val) => {
                  const preset = COLOR_PRESETS.find(p => p.name === val);
                  if (preset) applyPreset(preset);
                }}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Presets" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_PRESETS.map(p => (
                      <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Color Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={draftConfig.theme.mode === 'dark'} 
                    onCheckedChange={(c) => handleThemeChange('mode', c ? 'dark' : 'light')}
                  />
                  <span className="text-sm">{draftConfig.theme.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-9 h-9 rounded-md border border-input cursor-pointer shrink-0 shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: draftConfig.theme.colors.primary }}
                    onClick={() => document.getElementById('primary-picker')?.click()}
                  />
                  <input 
                    id="primary-picker"
                    type="color" 
                    className="sr-only"
                    value={draftConfig.theme.colors.primary.startsWith('#') ? draftConfig.theme.colors.primary : '#000000'}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={draftConfig.theme.colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    placeholder="#3b82f6 or oklch(...)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-9 h-9 rounded-md border border-input cursor-pointer shrink-0 shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: draftConfig.theme.colors.background || '#ffffff' }}
                    onClick={() => document.getElementById('bg-picker')?.click()}
                  />
                  <input 
                    id="bg-picker"
                    type="color" 
                    className="sr-only"
                    value={(draftConfig.theme.colors.background || '').startsWith('#') ? draftConfig.theme.colors.background : '#ffffff'}
                    onChange={(e) => handleColorChange('background', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={draftConfig.theme.colors.background}
                    onChange={(e) => handleColorChange('background', e.target.value)}
                    placeholder="#ffffff or oklch(...)"
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Typography & Shape</Label>
                
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select 
                    value={draftConfig.theme.font} 
                    onValueChange={(val: any) => handleThemeChange('font', val)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select font" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans">Geometric Sans (Inter)</SelectItem>
                      <SelectItem value="mono">Developer Mono</SelectItem>
                      <SelectItem value="serif">Elegant Serif</SelectItem>
                      <SelectItem value="display">Modern Display</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Corner Radius</Label>
                  <Select 
                    value={draftConfig.theme.radius} 
                    onValueChange={(val) => handleThemeChange('radius', val)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select radius" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0px">None (Sharp)</SelectItem>
                      <SelectItem value="0.25rem">Small</SelectItem>
                      <SelectItem value="0.5rem">Medium</SelectItem>
                      <SelectItem value="0.75rem">Large</SelectItem>
                      <SelectItem value="1rem">X-Large</SelectItem>
                      <SelectItem value="2rem">Full (Round)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Shadow Depth</Label>
                  <Select 
                    value={draftConfig.theme.shadow || 'md'} 
                    onValueChange={(val) => handleThemeChange('shadow', val)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select shadow" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Flat (None)</SelectItem>
                      <SelectItem value="sm">Subtle</SelectItem>
                      <SelectItem value="md">Standard</SelectItem>
                      <SelectItem value="lg">Deep</SelectItem>
                      <SelectItem value="xl">Dramatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Detailed Colors</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Accent Color</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded border cursor-pointer shrink-0"
                        style={{ backgroundColor: draftConfig.theme.colors.accent || '#000000' }}
                        onClick={() => document.getElementById('accent-picker')?.click()}
                      />
                      <input id="accent-picker" type="color" className="sr-only" value={(draftConfig.theme.colors.accent || '').startsWith('#') ? draftConfig.theme.colors.accent : '#000000'} onChange={(e) => handleColorChange('accent', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Text Color</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded border cursor-pointer shrink-0"
                        style={{ backgroundColor: draftConfig.theme.colors.text || '#000000' }}
                        onClick={() => document.getElementById('text-picker')?.click()}
                      />
                      <input id="text-picker" type="color" className="sr-only" value={(draftConfig.theme.colors.text || '').startsWith('#') ? draftConfig.theme.colors.text : '#000000'} onChange={(e) => handleColorChange('text', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Layout Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Layout</h3>
              
              <div className="space-y-2">
                <Label>Arrangement</Label>
                <Select 
                  value={draftConfig.layout.type} 
                  onValueChange={(val: 'grid'|'list') => handleConfigChange('layout', { ...draftConfig.layout, type: val })}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid (Side by side)</SelectItem>
                    <SelectItem value="list">List (Stacked)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {draftConfig.layout.type === 'grid' && (
                <div className="space-y-2">
                  <Label>Max Columns (Desktop)</Label>
                  <Select 
                    value={draftConfig.layout.columns.toString()} 
                    onValueChange={(val) => handleConfigChange('layout', { ...draftConfig.layout, columns: parseInt(val) })}
                  >
                    <SelectTrigger><SelectValue placeholder="Columns" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Column</SelectItem>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </section>

            {/* Components Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Components</h3>
              
              <div className="space-y-2">
                <Label>Card Style</Label>
                <Select 
                  value={draftConfig.components.cardStyle} 
                  onValueChange={(val: 'solid'|'glass'|'outlined') => handleConfigChange('components', { ...draftConfig.components, cardStyle: val })}
                >
                  <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid (Classic)</SelectItem>
                    <SelectItem value="glass">Glass (Morphic, blur)</SelectItem>
                    <SelectItem value="outlined">Outlined (Minimal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Button Style</Label>
                <Select 
                  value={draftConfig.components.buttonStyle} 
                  onValueChange={(val: 'rounded'|'pill'|'sharp') => handleConfigChange('components', { ...draftConfig.components, buttonStyle: val })}
                >
                  <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rounded">Rounded Corners</SelectItem>
                    <SelectItem value="pill">Pill Shaped</SelectItem>
                    <SelectItem value="sharp">Sharp (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Highlight Plan (Index 0-based)</Label>
                <Select 
                  value={draftConfig.components.highlightPopular?.toString() || "none"} 
                  onValueChange={(val) => handleConfigChange('components', { 
                    ...draftConfig.components, 
                    highlightPopular: val === "none" ? undefined : parseInt(val) 
                  })}
                >
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="0">First Plan (0)</SelectItem>
                    <SelectItem value="1">Second Plan (1)</SelectItem>
                    <SelectItem value="2">Third Plan (2)</SelectItem>
                    <SelectItem value="3">Fourth Plan (3)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Useful to highlight your most popular pricing tier.</p>
              </div>
            </section>

          </div>

          <div className="p-4 border-t border-border bg-muted/10">
            <Button 
              variant={isPublished ? "destructive" : "default"} 
              className="w-full"
              onClick={togglePublish}
              disabled={publishing}
            >
              {isPublished ? (
                <><EyeOff className="h-4 w-4 mr-2" /> Unpublish Page</>
              ) : (
                <><Globe className="h-4 w-4 mr-2" /> Publish Live</>
              )}
            </Button>
            {isPublished && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Live at: <a href={`/subscribe/${previewIdentifier}`} target="_blank" rel="noreferrer" className="underline hover:text-primary">/subscribe/{previewIdentifier}</a>
              </p>
            )}
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="flex-1 bg-muted relative p-4 flex flex-col">
          <div className="bg-background rounded-t-lg border-x border-t border-border p-2 flex items-center justify-between text-sm text-muted-foreground px-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-medium">Live Preview</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs opacity-50 px-2 py-1 bg-muted rounded hidden lg:inline-block">Changes deploy in real-time via postMessage</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-xs" 
                onClick={() => {
                  if (iframeRef.current) {
                    iframeRef.current.src = iframeRef.current.src;
                  }
                }}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reload Frame
              </Button>
            </div>
          </div>
          <div className="flex-1 rounded-b-lg border border-border shadow-xl overflow-hidden bg-background">
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-none"
              title="Live Preview"
              onLoad={() => {
                if (iframeRef.current && iframeRef.current.contentWindow) {
                  iframeRef.current.contentWindow.postMessage(
                    { type: 'SUBTRCKR_PREVIEW_UPDATE', payload: draftConfig },
                    '*'
                  );
                }
              }}
            />
          </div>
        </div>

      </div>
    </>
  );
}
