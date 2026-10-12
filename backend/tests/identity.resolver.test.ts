import { describe, it, expect } from 'vitest';
import { resolveCanonicalAccount, AccountResolutionError } from '../src/gerrit/identity.resolver.js';

describe('Gerrit Identity Resolver', () => {
  it('resolves numeric account IDs directly via /detail', async () => {
    const mockFetch = async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('/accounts/458/detail')) {
        return {
          ok: true,
          status: 200,
          text: async () => ")]}'\n{\"_account_id\":458,\"name\":\"Legoktm\",\"username\":\"legoktm\"}"
        } as unknown as Response;
      }
      return { ok: false, status: 404 } as unknown as Response;
    };

    const account = await resolveCanonicalAccount('458', mockFetch as unknown as typeof fetch);
    expect(account._account_id).toBe(458);
    expect(account.username).toBe('legoktm');
    expect(account.name).toBe('Legoktm');
  });

  it('resolves unique username match via search + detail endpoints', async () => {
    const mockFetch = async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('/accounts/?q=mydev')) {
        return {
          ok: true,
          status: 200,
          text: async () => ")]}'\n[{\"_account_id\":999,\"username\":\"mydev\"}]"
        } as unknown as Response;
      }
      if (urlStr.includes('/accounts/999/detail')) {
        return {
          ok: true,
          status: 200,
          text: async () => ")]}'\n{\"_account_id\":999,\"name\":\"Developer My\",\"username\":\"mydev\"}"
        } as unknown as Response;
      }
      return { ok: false, status: 404 } as unknown as Response;
    };

    const account = await resolveCanonicalAccount('mydev', mockFetch as unknown as typeof fetch);
    expect(account._account_id).toBe(999);
    expect(account.name).toBe('Developer My');
  });

  it('raises AMBIGUOUS_ACCOUNT_RESOLUTION with candidates if multiple non-exact matches exist', async () => {
    const mockFetch = async () => {
      return {
        ok: true,
        status: 200,
        text: async () =>
          ")]}'\n[{\"_account_id\":10,\"name\":\"John Smith\",\"username\":\"jsmith\"},{\"_account_id\":20,\"name\":\"Johnathan Smith\",\"username\":\"john_smith\"}]"
      } as unknown as Response;
    };

    try {
      await resolveCanonicalAccount('john', mockFetch as unknown as typeof fetch);
      expect.fail('Should have thrown AccountResolutionError');
    } catch (err) {
      expect(err).toBeInstanceOf(AccountResolutionError);
      const resErr = err as AccountResolutionError;
      expect(resErr.code).toBe('AMBIGUOUS_ACCOUNT_RESOLUTION');
      expect(resErr.candidates).toHaveLength(2);
      expect(resErr.candidates?.[0]._account_id).toBe(10);
    }
  });

  it('throws ACCOUNT_NOT_FOUND when search returns empty results', async () => {
    const mockFetch = async () => {
      return {
        ok: true,
        status: 200,
        text: async () => ")]}'\n[]"
      } as unknown as Response;
    };

    await expect(
      resolveCanonicalAccount('nonexistent_user_123', mockFetch as unknown as typeof fetch)
    ).rejects.toThrowError(/No Gerrit account found/);
  });
});
