import type { IMusicProvider } from './IMusicProvider';
import { RoyaltyFreeProvider } from './RoyaltyFreeProvider';
import { useUIStore } from '@/store/uiStore';

class ProviderRegistrySingleton {
  private providers: Map<string, IMusicProvider> = new Map();
  private primaryProviderId: string | null = null;

  /**
   * Registers a new provider into the system.
   */
  register(provider: IMusicProvider, setAsPrimary: boolean = false) {
    this.providers.set(provider.id, provider);
    if (setAsPrimary || !this.primaryProviderId) {
      this.primaryProviderId = provider.id;
    }
  }

  /**
   * Gets the active/primary provider for the application.
   */
  getPrimary(): IMusicProvider {
    const isStacEnabled = useUIStore.getState().isStacEnabled;
    if (!isStacEnabled) {
      return this.royaltyFree;
    }

    if (!this.primaryProviderId) {
      throw new Error('No music provider is currently registered.');
    }
    const provider = this.providers.get(this.primaryProviderId);
    if (!provider) {
      throw new Error(`Primary provider ${this.primaryProviderId} not found.`);
    }
    return provider;
  }

  private royaltyFree = new RoyaltyFreeProvider();

  /**
   * Gets a specific provider by ID.
   */
  getProvider(id: string): IMusicProvider | undefined {
    // Inject Stac logic
    const isStacEnabled = useUIStore.getState().isStacEnabled;
    if (!isStacEnabled) {
      return this.royaltyFree;
    }

    return this.providers.get(id);
  }

  /**
   * Switches the primary provider.
   */
  setPrimary(id: string) {
    if (!this.providers.has(id)) {
      throw new Error(`Cannot set primary provider: ${id} is not registered.`);
    }
    this.primaryProviderId = id;
  }
}

// Export a singleton instance of the registry
export const ProviderRegistry = new ProviderRegistrySingleton();
