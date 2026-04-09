const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030/api';

export type Role = 'business' | 'customer';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  business_id: number;
  description?: string;
  features?: string[];
  discount?: number;
  benefits_available?: string[];
  benefits_not_available?: string[];
}

export interface BusinessWithPlans {
  business: {
    id: number;
    name: string;
  };
  plans: Plan[];
}

import type { PageConfig, BusinessProfile } from './theme';

export interface Subscription {
  id: number;
  status: string;
  plan_name: string;
  plan_price: number;
  business_name: string;
  customer_name?: string;
  customer_email?: string;
}

export interface PublicPageData {
  business: {
    id: number;
    display_name: string;
    logo_url?: string;
    tagline?: string;
    support_email?: string;
  };
  plans: Plan[];
  config: PageConfig;
}

export interface PageConfigResponse {
  profile: BusinessProfile;
  config: {
    theme: any;
    layout: any;
    components: any;
    is_published: boolean;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(username: string, email: string, password: string, role: Role) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.user;
  }

  async getMe() {
    const response = await this.request<{ user: User }>('/auth/me', {
      method: 'GET',
    });
    return response.user;
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'GET',
    });
  }

  // Plans endpoints
  async createPlan(data: Partial<Plan>) {
    return this.request<Plan>('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyPlans() {
    return this.request<Plan[]>('/plans', {
      method: 'GET',
    });
  }

  async getBusinessPlans(businessId: number) {
    return this.request<BusinessWithPlans>(`/plans/${businessId}`, {
      method: 'GET',
    });
  }

  async updatePlan(planId: number, data: Partial<Plan>) {
    return this.request<Plan>(`/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlan(planId: number) {
    return this.request(`/plans/${planId}`, {
      method: 'DELETE',
    });
  }

  // Subscriptions endpoints
  async subscribe(planId: number, businessId: number) {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, business_id: businessId }),
    });
  }

  async getBusinessSubscriptions() {
    return this.request<Subscription[]>('/subscriptions/business', {
      method: 'GET',
    });
  }

  async getMySubscriptions() {
    return this.request<Subscription[]>('/subscriptions/customer', {
      method: 'GET',
    });
  }

  // Public Custom Subscription Page endpoint
  async getPublicSubscribePage(identifier: string) {
    return this.request<PublicPageData>(`/public/subscribe/${identifier}`, {
      method: 'GET',
    });
  }

  // Customization Dashboard endpoints
  async getPageConfig() {
    return this.request<PageConfigResponse>('/business/page-config', {
      method: 'GET',
    });
  }

  async updatePageConfig(config: PageConfig) {
    return this.request('/business/page-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async updateProfile(data: Partial<BusinessProfile>) {
    return this.request('/business/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async publishPageConfig() {
    return this.request('/business/page-config/publish', {
      method: 'POST',
    });
  }

  async unpublishPageConfig() {
    return this.request('/business/page-config/unpublish', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
