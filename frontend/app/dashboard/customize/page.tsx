'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiClient, PageConfigResponse } from '@/lib/api';
import { PageConfig, DEFAULT_CONFIG } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/loading-spinner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Save, Globe, EyeOff, ChevronDown } from 'lucide-react';

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

const DETAILED_PRESETS: { name: string; config: Partial<PageConfig> }[] = [
  {
    name: 'Morphic Glass',
    config: {
      theme: {
        mode: 'dark',
        colors: {
          primary: 'oklch(0.65 0.25 280)', // Vibrant Purple
          accent: 'oklch(0.7 0.2 200)',   // Cyan
          background: 'oklch(0.15 0.02 280)', // Deep Dark
          text: 'oklch(0.98 0.01 280)',
          card: 'oklch(0.2 0.03 280)',
          muted: 'oklch(0.5 0.03 280)',
          border: 'oklch(0.3 0.03 280)',
        },
        font: 'display',
        radius: '1.25rem',
        shadow: 'xl',
      },
      layout: { type: 'grid', columns: 2 },
      components: { cardStyle: 'glass', buttonStyle: 'pill', highlightPopular: 1 }
    }
  },
  {
    name: 'Minimalist Mono',
    config: {
      theme: {
        mode: 'light',
        colors: {
          primary: '#000000',
          accent: '#475569',
          background: '#ffffff',
          text: '#000000',
          card: '#ffffff',
          muted: '#94a3b8',
          border: '#e2e8f0',
        },
        font: 'sans',
        radius: '0px',
        shadow: 'none',
      },
      layout: { type: 'grid', columns: 2 },
      components: { cardStyle: 'outlined', buttonStyle: 'sharp' }
    }
  },
  {
    name: 'Midnight Glow',
    config: {
      theme: {
        mode: 'dark',
        colors: {
          primary: '#22d3ee', // Cyan
          accent: '#818cf8',  // Indigo
          background: '#020617', // Slate 950
          text: '#f8fafc',
          card: '#0f172a',
          muted: '#64748b',
          border: '#1e293b',
        },
        font: 'mono',
        radius: '0.75rem',
        shadow: 'lg',
      },
      layout: { type: 'grid', columns: 2 },
      components: { cardStyle: 'solid', buttonStyle: 'rounded' }
    }
  },
  {
    name: 'Sunset Vibrant',
    config: {
      theme: {
        mode: 'light',
        colors: {
          primary: '#f43f5e', // Rose
          accent: '#f59e0b',  // Amber
          background: '#fff1f2',
          text: '#4c0519',
          card: '#ffffff',
          muted: '#fb7185',
          border: '#ffe4e6',
        },
        font: 'serif',
        radius: '1rem',
        shadow: 'md',
      },
      layout: { type: 'grid', columns: 2 },
      components: { cardStyle: 'solid', buttonStyle: 'pill' }
    }
  },
  {
    name: 'Enterprise Pro',
    config: {
      theme: {
        mode: 'light',
        colors: {
          primary: '#2563eb', // Blue
          accent: '#0f172a',
          background: '#f8fafc',
          text: '#0f172a',
          card: '#ffffff',
          muted: '#64748b',
          border: '#e2e8f0',
        },
        font: 'sans',
        radius: '0.5rem',
        shadow: 'sm',
      },
      layout: { type: 'grid', columns: 2 },
      components: { cardStyle: 'outlined', buttonStyle: 'rounded' }
    }
  },{
  name: 'Neon Cyberpunk',
  config: {
    theme: {
      mode: 'dark',
      colors: {
        primary: '#ff00ff',
        accent: '#00ffff',
        background: '#0a0a0a',
        text: '#e5e5e5',
        card: '#111111',
        muted: '#888888',
        border: '#222222',
      },
      font: 'mono',
      radius: '1rem',
      shadow: 'xl',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'glass', buttonStyle: 'pill', highlightPopular: 0 }
  }
},
{
  name: 'Soft Pastel',
  config: {
    theme: {
      mode: 'light',
      colors: {
        primary: '#a78bfa',
        accent: '#fbcfe8',
        background: '#fef9ff',
        text: '#4c1d95',
        card: '#ffffff',
        muted: '#d8b4fe',
        border: '#f3e8ff',
      },
      font: 'sans',
      radius: '1.5rem',
      shadow: 'md',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'solid', buttonStyle: 'rounded' }
  }
},
{
  name: 'Luxury Gold',
  config: {
    theme: {
      mode: 'dark',
      colors: {
        primary: '#d4af37',
        accent: '#f5deb3',
        background: '#0f0f0f',
        text: '#f5f5dc',
        card: '#1a1a1a',
        muted: '#a3a3a3',
        border: '#2a2a2a',
      },
      font: 'serif',
      radius: '0.75rem',
      shadow: 'lg',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'outlined', buttonStyle: 'pill', highlightPopular: 1 }
  }
},
{
  name: 'Ocean Breeze',
  config: {
    theme: {
      mode: 'light',
      colors: {
        primary: '#0284c7',
        accent: '#22d3ee',
        background: '#f0f9ff',
        text: '#0c4a6e',
        card: '#ffffff',
        muted: '#7dd3fc',
        border: '#e0f2fe',
      },
      font: 'sans',
      radius: '1rem',
      shadow: 'md',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'solid', buttonStyle: 'rounded' }
  }
},
{
  name: 'Forest Nature',
  config: {
    theme: {
      mode: 'light',
      colors: {
        primary: '#166534',
        accent: '#4ade80',
        background: '#f0fdf4',
        text: '#14532d',
        card: '#ffffff',
        muted: '#86efac',
        border: '#dcfce7',
      },
      font: 'serif',
      radius: '1rem',
      shadow: 'sm',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'solid', buttonStyle: 'rounded' }
  }
},
{
  name: 'Dark Minimal Pro',
  config: {
    theme: {
      mode: 'dark',
      colors: {
        primary: '#ffffff',
        accent: '#9ca3af',
        background: '#000000',
        text: '#ffffff',
        card: '#111111',
        muted: '#6b7280',
        border: '#1f2937',
      },
      font: 'sans',
      radius: '0.25rem',
      shadow: 'none',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'outlined', buttonStyle: 'sharp' }
  }
},
{
  name: 'Aurora Gradient',
  config: {
    theme: {
      mode: 'dark',
      colors: {
        primary: '#22c55e',
        accent: '#3b82f6',
        background: '#020617',
        text: '#f1f5f9',
        card: '#0f172a',
        muted: '#64748b',
        border: '#1e293b',
      },
      font: 'display',
      radius: '1.25rem',
      shadow: 'xl',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'glass', buttonStyle: 'pill' }
  }
},
{
  name: 'Warm Coffee',
  config: {
    theme: {
      mode: 'light',
      colors: {
        primary: '#6f4e37',
        accent: '#d6a77a',
        background: '#fdf6ec',
        text: '#3e2723',
        card: '#ffffff',
        muted: '#bcaaa4',
        border: '#efebe9',
      },
      font: 'serif',
      radius: '1rem',
      shadow: 'md',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'solid', buttonStyle: 'pill' }
  }
},
{
  name: 'Electric Lime',
  config: {
    theme: {
      mode: 'dark',
      colors: {
        primary: '#a3e635',
        accent: '#bef264',
        background: '#020617',
        text: '#ecfccb',
        card: '#111827',
        muted: '#4d7c0f',
        border: '#1f2937',
      },
      font: 'mono',
      radius: '0.75rem',
      shadow: 'lg',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'glass', buttonStyle: 'rounded' }
  }
},
{
  name: 'Royal Purple',
  config: {
    theme: {
      mode: 'dark',
      colors: {
        primary: '#7c3aed',
        accent: '#c084fc',
        background: '#1e1b4b',
        text: '#ede9fe',
        card: '#2e1065',
        muted: '#a78bfa',
        border: '#4c1d95',
      },
      font: 'serif',
      radius: '1rem',
      shadow: 'lg',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'solid', buttonStyle: 'pill', highlightPopular: 0 }
  }
},
{
  name: 'Glass Frost',
  config: {
    theme: {
      mode: 'light',
      colors: {
        primary: '#38bdf8',
        accent: '#e0f2fe',
        background: '#f8fafc',
        text: '#0f172a',
        card: '#ffffff',
        muted: '#94a3b8',
        border: '#e2e8f0',
      },
      font: 'display',
      radius: '1.5rem',
      shadow: 'xl',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'glass', buttonStyle: 'rounded' }
  }
},
{
  name: 'Crimson Bold',
  config: {
    theme: {
      mode: 'dark',
      colors: {
        primary: '#dc2626',
        accent: '#f87171',
        background: '#1f0000',
        text: '#fee2e2',
        card: '#2b0000',
        muted: '#b91c1c',
        border: '#450a0a',
      },
      font: 'display',
      radius: '0.75rem',
      shadow: 'xl',
    },
    layout: { type: 'grid', columns: 2 },
    components: { cardStyle: 'solid', buttonStyle: 'pill', highlightPopular: 1 }
  }
}
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
        { type: 'SUBDESK_PREVIEW_UPDATE', payload: debouncedConfig },
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

  const applyPreset = (preset: typeof DETAILED_PRESETS[0]) => {
    setDraftConfig(prev => ({
      ...prev,
      ...preset.config,
      theme: {
        ...prev.theme,
        ...(preset.config.theme || {}),
        colors: {
          ...prev.theme.colors,
          ...(preset.config.theme?.colors || {})
        }
      },
      layout: {
        ...prev.layout,
        ...(preset.config.layout || {})
      },
      components: {
        ...prev.components,
        ...(preset.config.components || {})
      }
    }));
    toast.info(`Applied ${preset.name} preset`);
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  // Use slug if available, otherwise User ID
  const previewIdentifier = profile?.slug || user?.id;
  const previewUrl = `/subscribe/${previewIdentifier}?preview=true`;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
        
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
              <Collapsible defaultOpen>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer group mb-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider group-hover:text-primary transition-colors flex items-center gap-2">
                        Premium Presets
                        <Badge variant="secondary" className="text-[9px] h-4 bg-primary/10 text-primary border-none px-1.5">PRO</Badge>
                      </h3>
                      <p className="text-[10px] text-muted-foreground italic">Instant one-click professional styles</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {DETAILED_PRESETS.map(p => (
                      <button
                        key={p.name}
                        onClick={() => applyPreset(p)}
                        className={cn(
                          "group relative flex flex-col items-start p-3 rounded-xl border transition-all hover:shadow-md",
                          draftConfig.theme.colors.primary === p.config.theme?.colors?.primary 
                            ? "border-primary bg-primary/5 ring-1 ring-primary" 
                            : "border-border bg-card hover:border-primary/40"
                        )}
                      >
                        <div className="flex gap-1 mb-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: p.config.theme?.colors?.primary }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm -ml-1.5"
                            style={{ backgroundColor: p.config.theme?.colors?.accent }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-left leading-tight line-clamp-1">{p.name}</span>
                        <div className="mt-1 flex gap-1">
                          <span className={cn(
                            "text-[8px] px-1 rounded uppercase font-bold",
                            p.config.theme?.mode === 'dark' ? "bg-foreground/10 text-foreground" : "bg-card text-foreground border"
                          )}>
                            {p.config.theme?.mode}
                          </span>
                          <span className="text-[8px] px-1 rounded uppercase font-bold bg-primary/10 text-primary">
                            {p.config.components?.cardStyle}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
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
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
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
                    { type: 'SUBDESK_PREVIEW_UPDATE', payload: draftConfig },
                    '*'
                  );
                }
              }}
            />
          </div>
        </div>

      </div>
  );
}
