import { Injectable, effect, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, firstValueFrom } from 'rxjs';


import { $t } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import Lara from '@primeng/themes/lara';
import Nora from '@primeng/themes/nora';
const presets = { Aura, Lara, Nora } as const;
type KeyOfType<T> = keyof T extends infer U ? U : never;
export interface layoutConfig {
    preset?: string;
    primary?: string;
    surface?: string | undefined | null;
    darkTheme?: boolean;
    menuMode?: string;
}

interface LayoutState {
    staticMenuDesktopInactive?: boolean;
    overlayMenuActive?: boolean;
    configSidebarVisible?: boolean;
    staticMenuMobileActive?: boolean;
    menuHoverActive?: boolean;
}

interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    private http = inject(HttpClient);
    private readonly apiBaseUrl = '/user_preferences';

    // Track dynamic session context safely (Initialized as null)
    public activeTenantId: number | null = null;
    public activeUserId: number | null = null;

    _config: layoutConfig = {
        preset: 'Aura',
        primary: 'emerald',
        surface: null,
        darkTheme: false,
        menuMode: 'static'
    };

    _state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    };

    layoutConfig = signal<layoutConfig>(this._config);
    layoutState = signal<LayoutState>(this._state);

    private configUpdate = new Subject<layoutConfig>();
    private overlayOpen = new Subject<any>();
    private menuSource = new Subject<MenuChangeEvent>();
    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();
    resetSource$ = this.resetSource.asObservable();
    configUpdate$ = this.configUpdate.asObservable();
    overlayOpen$ = this.overlayOpen.asObservable();

    theme = computed(() => (this.layoutConfig()?.darkTheme ? 'light' : 'dark'));
    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive);
    isDarkTheme = computed(() => this.layoutConfig().darkTheme);
    getPrimary = computed(() => this.layoutConfig().primary);
    getSurface = computed(() => this.layoutConfig().surface);
    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');
    transitionComplete = signal<boolean>(false);

    private initialized = false;
    private isInitialLoading = false; // Block loops during programmatic setups

    constructor() {
        effect(() => {
            const config = this.layoutConfig();
            if (config) {
                this.onConfigUpdate();
            }
        });

        effect(() => {
            const config = this.layoutConfig();
            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }
            this.handleDarkModeTransition(config);
        });
    }
    /**
     * Call this inside your AuthService login method.
     * Dynamic values prevent user data mixups.
     */
    
async loadUserPreferences(tenantId: number, userId: number): Promise<void> {
    this.activeTenantId = tenantId;
    this.activeUserId = userId;
    this.isInitialLoading = true; 

    try {
        const url = `${this.apiBaseUrl}/${tenantId}/${userId}`;
        const preferences = await firstValueFrom(this.http.get<any>(url));

        console.log('preferences:', preferences);
        
        if (preferences) {
            const incomingConfig: layoutConfig = {
                preset: preferences.preset || 'Aura',
                primary: preferences.primary || 'emerald',
                surface: preferences.surface,
                darkTheme: preferences.darkTheme ?? preferences.dark_theme ?? false,
                menuMode: preferences.menuMode || 'static'
            };

            // Set signals first
            this.layoutConfig.set(incomingConfig);
            this.toggleDarkMode(incomingConfig);

            // ─── FIX: FORCE PRIMENG THEME ENGINE TO APPLY PALETTES ───
            const activePresetName = incomingConfig.preset || 'Aura';
            const presetInstance = presets[activePresetName as KeyOfType<typeof presets>];
            
            // Build custom configuration extensions dynamically
            const presetExt = this.getDynamicPresetExt(incomingConfig.primary!, activePresetName);

            // Access the static surfaces array values (Mapping definitions match app.configurator)
            const surfacePalette = this.getSurfacePaletteByName(incomingConfig.surface);

            $t()
                .preset(presetInstance)
                .preset(presetExt)
                .surfacePalette(surfacePalette)
                .use({ useDefaultOptions: true });
        }
    } catch (error) {
        console.error('Preference profile mapping sequence failed:', error);
    } finally {
        setTimeout(() => {
            this.isInitialLoading = false;
        }, 100);
    }
}


// Helper method to resolve semantic palettes for lookups on load
private getDynamicPresetExt(primaryColorName: string, preset: string) {
    // Look up palette tokens matching your app.configurator logic
    const activePreset = preset || 'Aura';
    const presetPalette = presets[activePreset as KeyOfType<typeof presets>].primitive;
    
    let colorPalette = (primaryColorName && primaryColorName !== 'noir') 
        ? presetPalette?.[primaryColorName as KeyOfType<typeof presetPalette>] 
        : {};

    if (primaryColorName === 'noir') {
        return {
            semantic: {
                primary: {
                    50: '{surface.50}', 100: '{surface.100}', 200: '{surface.200}', 300: '{surface.300}',
                    400: '{surface.400}', 500: '{surface.500}', 600: '{surface.600}', 700: '{surface.700}',
                    800: '{surface.800}', 900: '{surface.900}', 950: '{surface.950}'
                },
                colorScheme: {
                    light: {
                        primary: { color: '{primary.950}', contrastColor: '#ffffff', hoverColor: '{primary.800}', activeColor: '{primary.700}' },
                        highlight: { background: '{primary.950}', focusBackground: '{primary.700}', color: '#ffffff', focusColor: '#ffffff' }
                    },
                    dark: {
                        primary: { color: '{primary.50}', contrastColor: '{primary.950}', hoverColor: '{primary.200}', activeColor: '{primary.300}' },
                        highlight: { background: '{primary.50}', focusBackground: '{primary.300}', color: '{primary.950}', focusColor: '{primary.950}' }
                    }
                }
            }
        };
    } else {
        return {
            semantic: {
                primary: colorPalette,
                colorScheme: preset === 'Nora' ? {
                    light: {
                        primary: { color: '{primary.600}', contrastColor: '#ffffff', hoverColor: '{primary.700}', activeColor: '{primary.800}' },
                        highlight: { background: '{primary.600}', focusBackground: '{primary.700}', color: '#ffffff', focusColor: '#ffffff' }
                    },
                    dark: {
                        primary: { color: '{primary.500}', contrastColor: '{surface.900}', hoverColor: '{primary.400}', activeColor: '{primary.300}' },
                        highlight: { background: '{primary.500}', focusBackground: '{primary.400}', color: '{surface.900}', focusColor: '{surface.900}' }
                    }
                } : {
                    light: {
                        primary: { color: '{primary.500}', contrastColor: '#ffffff', hoverColor: '{primary.600}', activeColor: '{primary.700}' },
                        highlight: { background: '{primary.50}', focusBackground: '#f1f5f9', color: '{primary.700}', focusColor: '{primary.800}' }
                    },
                    dark: {
                        primary: { color: '{primary.400}', contrastColor: '{surface.900}', hoverColor: '{primary.300}', activeColor: '{primary.200}' },
                        highlight: {
                            background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                            focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                            color: 'rgba(255,255,255,.87)',
                            focusColor: 'rgba(255,255,255,.87)'
                        }
                    }
                }
            }
        };
    }
}

// Helper structure matching the exact hex palettes defined in AppConfigurator
private getSurfacePaletteByName(name: string | null | undefined) {
    const surfaces: Record<string, any> = {
        slate: { 0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
        gray: { 0: '#ffffff', 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' },
        zinc: { 0: '#ffffff', 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' },
        neutral: { 0: '#ffffff', 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a' },
        stone: { 0: '#ffffff', 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' },
        soho: { 0: '#ffffff', 50: '#ececec', 100: '#dedfdf', 200: '#c4c4c6', 300: '#adaeb0', 400: '#97979b', 500: '#7f8084', 600: '#6a6b70', 700: '#55565b', 800: '#3f4046', 900: '#2c2c34', 950: '#16161d' },
        viva: { 0: '#ffffff', 50: '#f3f3f3', 100: '#e7e7e8', 200: '#cfd0d0', 300: '#b7b8b9', 400: '#9fa1a1', 500: '#87898a', 600: '#6e7173', 700: '#565a5b', 800: '#3e4244', 900: '#262b2c', 950: '#0e1315' },
        ocean: { 0: '#ffffff', 50: '#fbfcfc', 100: '#F7F9F8', 200: '#EFF3F2', 300: '#DADEDD', 400: '#B1B7B6', 500: '#828787', 600: '#5F7274', 700: '#415B61', 800: '#29444E', 900: '#183240', 950: '#0c1920' }
    };
    return name ? surfaces[name] : undefined;
}
    /**
     * Explicit trigger method tied to active user click interactions.
     */
    async saveUserPreferences(): Promise<void> {
        if (this.isInitialLoading || !this.activeTenantId || !this.activeUserId) {
            return; // Protects data against loop mutations or missing session contexts
        }

        try {
            const current = this.layoutConfig();
            const payload = {
                tenantId: this.activeTenantId,
                userId: this.activeUserId,
                preset: current.preset,
                primary: current.primary,
                surface: current.surface,
                darkTheme: current.darkTheme,
                menuMode: current.menuMode
            };

            await firstValueFrom(this.http.post(this.apiBaseUrl, payload));
        } catch (error) {
            console.error('User reference preference configuration failed:', error);
        }
    }

    private handleDarkModeTransition(config: layoutConfig): void {
        if ((document as any).startViewTransition) {
            this.startViewTransition(config);
        } else {
            this.toggleDarkMode(config);
            this.onTransitionEnd();
        }
    }

    private startViewTransition(config: layoutConfig): void {
        const transition = (document as any).startViewTransition(() => {
            this.toggleDarkMode(config);
        });
        transition.ready.then(() => { this.onTransitionEnd(); }).catch(() => {});
    }

    toggleDarkMode(config?: layoutConfig): void {
        const _config = config || this.layoutConfig();
        if (_config.darkTheme) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
    }

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => { this.transitionComplete.set(false); });
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({ ...prev, overlayMenuActive: !this.layoutState().overlayMenuActive }));
            if (this.layoutState().overlayMenuActive) this.overlayOpen.next(null);
        }
        if (this.isDesktop()) {
            this.layoutState.update((prev) => ({ ...prev, staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive }));
        } else {
            this.layoutState.update((prev) => ({ ...prev, staticMenuMobileActive: !this.layoutState().staticMenuMobileActive }));
            if (this.layoutState().staticMenuMobileActive) this.overlayOpen.next(null);
        }
    }

    isDesktop() { return window.innerWidth > 991; }
    isMobile() { return !this.isDesktop(); }

    onConfigUpdate() {
        this._config = { ...this.layoutConfig() };
        this.configUpdate.next(this.layoutConfig());
    }

    onMenuStateChange(event: MenuChangeEvent) { this.menuSource.next(event); }
    reset() { this.resetSource.next(true); }
}
