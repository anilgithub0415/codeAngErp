import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private USER_ID_KEY = 'user_id';
  private ACTIVE_CONTEXT_KEY = 'active_context';

  getAuthToken(): string | null { return localStorage.getItem('mytoken'); }
  setAuthToken(token: string): void { localStorage.setItem('mytoken', token); }
  getRefreshToken(): string | null { return localStorage.getItem('refreshToken'); }
  setRefreshToken(rt: string | undefined): void { localStorage.setItem('refreshToken', rt || ''); }
  clearTokens(): void {
    localStorage.removeItem('mytoken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.ACTIVE_CONTEXT_KEY);
  }
  saveActiveContext(ctx: any|null) { ctx ? localStorage.setItem(this.ACTIVE_CONTEXT_KEY, JSON.stringify(ctx)) : localStorage.removeItem(this.ACTIVE_CONTEXT_KEY); }
  loadActiveContext(): any|null { const s = localStorage.getItem(this.ACTIVE_CONTEXT_KEY); return s ? JSON.parse(s) : null; }
  setUserId(id: number) { localStorage.setItem(this.USER_ID_KEY, id.toString()); }
  getUserId(): number|null { const v = localStorage.getItem(this.USER_ID_KEY); return v ? parseInt(v,10) : null; }
}
