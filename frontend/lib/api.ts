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

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'inactive';

export interface CustomerItem {
  subscription_id: number;
  status: SubscriptionStatus;
  start_date: string;
  started_at: string | null;
  paused_at: string | null;
  resumed_at: string | null;
  cancelled_at: string | null;
  expires_at: string | null;
  customer_id: number;
  username: string;
  email: string;
  plan_id: number;
  plan_name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
}

export interface CustomerEvent {
  id: number;
  event_type: string;
  metadata: string | null;
  created_at: string;
}

export interface CustomerDetailsResponse {
  customer: {
    id: number;
    username: string;
    email: string;
  };
  subscription: {
    id: number;
    status: SubscriptionStatus;
    start_date: string;
    started_at: string | null;
    paused_at: string | null;
    resumed_at: string | null;
    cancelled_at: string | null;
    expires_at: string | null;
  };
  plan: {
    id: number;
    name: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly';
  };
  events: CustomerEvent[];
}

export interface UserDashboardSummary {
  stats: {
    activeSubscriptions: number;
    monthlySpend: number;
    upcomingPayments: number;
  };
  subscriptionsPreview: Array<{
    id: number;
    plan_name: string;
    business_name: string;
    price: number;
    status: SubscriptionStatus;
    expires_at: string | null;
  }>;
  upcomingPayments: Array<{
    id: number;
    name: string;
    price: number;
    expires_at: string | null;
  }>;
  recentActivity: Array<{
    event_type: string;
    created_at: string;
    plan_name: string;
  }>;
}

export interface UserSubscriptionItem {
  id: number;
  plan_name: string;
  business_name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  status: SubscriptionStatus;
  expires_at: string | null;
  created_at: string;
}

export interface PaginatedUserSubscriptions {
  data: UserSubscriptionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserBillingSummary {
  totalSpent: number;
  thisMonth: number;
  failedPayments: number;
}

export interface UserTransaction {
  id: number;
  plan_name: string;
  business_name: string;
  amount: number;
  status: 'captured' | 'failed' | 'pending';
  created_at: string;
}

export interface AnalyticsData {
  spendTrend: { date: string; value: number }[];
  subscriptionGrowth: { date: string; value: number }[];
  cancellations: { date: string; value: number }[];
}

export interface PaginatedUserTransactions {
  data: UserTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetUserSubscriptionsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserSubscriptionDetailsResponse {
  subscription: {
    id: number;
    status: SubscriptionStatus;
    start_date: string;
    started_at: string | null;
    paused_at: string | null;
    resumed_at: string | null;
    cancelled_at: string | null;
    expires_at: string | null;
    created_at: string;
  };
  plan: {
    id: number;
    name: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly';
    description: string | null;
  };
  business: {
    name: string;
    logo_url: string | null;
    support_email: string | null;
  };
  events: CustomerEvent[];
}

export interface PaginatedCustomers {
  data: CustomerItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetCustomersParams {
  status?: string;
  plan_id?: string;
  search?: string;
  page?: number;
  limit?: number;
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

  // Payments & Subscriptions endpoints
  async createOrder(planId: number, businessId: number) {
    return this.request<{ order_id: string; amount: number; currency: string; plan_name: string }>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, business_id: businessId }),
    });
  }

  async verifyPayment(payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    return this.request<{ message: string }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
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
    console.log("hora hit");
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

  // Customer Management endpoints
  async getCustomers(params: GetCustomersParams = {}, signal?: AbortSignal) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.plan_id) query.append('plan_id', params.plan_id);
    if (params.search) query.append('search', params.search);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';

    return this.request<{ success: boolean; data: CustomerItem[]; pagination: PaginatedCustomers['pagination'] }>(
      `/customers${queryString}`,
      { method: 'GET', signal }
    );
  }

  async getCustomerDetails(id: number) {
    return this.request<{ success: boolean; data: CustomerDetailsResponse }>(
      `/customers/${id}`,
      { method: 'GET' }
    );
  }

  // User Dashboard endpoints
  async getDashboardSummary() {
    return this.request<{ success: boolean; data: UserDashboardSummary }>(
      '/user/dashboard-summary',
      { method: 'GET' }
    );
  }

  async updateSubscriptionStatus(id: number, action: 'pause' | 'resume' | 'cancel') {
    return this.request<{ success: boolean; data: { message: string, subscription_id: number, status: SubscriptionStatus } }>(
      `/subscriptions/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ action })
      }
    );
  }

  async removeCustomer(id: number) {
    return this.request<{ success: boolean; data: { message: string } }>(
      `/customers/${id}`,
      { method: 'DELETE' }
    );
  }

  // --- User Subscriptions API ---

  async getUserSubscriptions(params: GetUserSubscriptionsParams = {}, signal?: AbortSignal) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';

    return this.request<{ success: boolean; data: UserSubscriptionItem[]; pagination: PaginatedUserSubscriptions['pagination'] }>(
      `/user/subscriptions${queryString}`,
      { method: 'GET', signal }
    );
  }

  async getUserSubscriptionDetails(id: number) {
    return this.request<{ success: boolean; data: UserSubscriptionDetailsResponse }>(
      `/user/subscriptions/${id}`,
      { method: 'GET' }
    );
  }

  async updateUserSubscriptionStatus(id: number, action: 'pause' | 'resume' | 'cancel') {
    return this.request<{ success: boolean; data: { message: string, subscription_id: number, status: SubscriptionStatus } }>(
      `/user/subscriptions/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ action })
      }
    );
  }

  async bulkUpdateUserSubscriptions(ids: number[], action: 'pause' | 'cancel') {
    return this.request<{ success: boolean; data: any }>(
      `/user/subscriptions/bulk-action`,
      {
        method: 'POST',
        body: JSON.stringify({ ids, action })
      }
    );
  }

  // --- User Billing API ---
  async getUserBillingSummary(signal?: AbortSignal) {
    return this.request<{ success: boolean; data: UserBillingSummary }>(
      `/user/billing-summary`,
      { method: 'GET', signal }
    );
  }

  async getUserTransactions(params: { page?: number; limit?: number } = {}, signal?: AbortSignal) {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';

    return this.request<{ success: boolean; data: UserTransaction[]; pagination: PaginatedUserTransactions['pagination'] }>(
      `/user/transactions${queryString}`,
      { method: 'GET', signal }
    );
  }

  // --- User Analytics API ---
  async getUserAnalytics(range: "7d" | "30d" | "90d", signal?: AbortSignal) {
    return this.request<{ success: boolean; data: AnalyticsData }>(
      `/user/analytics?range=${range}`,
      { method: 'GET', signal }
    );
  }

  // --- User Settings API ---
  async getUserProfile(signal?: AbortSignal) {
    return this.request<{ success: boolean; data: { username: string; email: string, role: string } }>(
      '/user/profile',
      { method: 'GET', signal }
    );
  }

  async updateUserProfile(data: { username: string; email: string }) {
    return this.request<{ success: boolean; data: { username: string; email: string } }>(
      '/user/profile',
      { method: 'PUT', body: JSON.stringify(data) }
    );
  }

  async exportCustomers(params: GetCustomersParams = {}): Promise<Blob> {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.plan_id) query.append('plan_id', params.plan_id);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const url = `${this.baseUrl}/customers/export${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
