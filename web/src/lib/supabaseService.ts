import { supabase } from './supabase';

// Helper functions to convert between snake_case and camelCase
const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  if (!obj || typeof obj !== 'object') return obj;

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = obj[key];
    return acc;
  }, {} as Record<string, any>);
};

const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  if (!obj || typeof obj !== 'object') return obj;

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = obj[key];
    return acc;
  }, {} as Record<string, any>);
};

// Types
export type QuoteRequest = {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  serviceNeeded: string;
  location: string;
  message: string;
  dateSubmitted: string;
  status: 'Pending' | 'Contacted' | 'Closed';
};

export type Project = {
  id: string;
  title: string;
  location: string;
  serviceType: string;
  completionDate: string;
  status: 'Completed' | 'In Progress' | 'Planning';
  images: string[];
  description: string;
  client: string;
};

export type Testimonial = {
  id: string;
  customerName: string;
  location: string;
  reviewText: string;
  rating: number;
  status: 'Published' | 'Hidden';
  dateAdded: string;
  initials: string;
  avatarColor: string;
};

export type ServiceArea = {
  id: string;
  name: string;
  district: string;
  description: string;
  projectCount: number;
};

export type ContactInfo = {
  id: number;
  businessName: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  whatsapp: string;
  googleMapsEmbed: string;
  facebook: string;
  instagram: string;
  youtube: string;
};

export type HomepageSettings = {
  id: number;
  heroTitle: string;
  heroSubtitle: string;
  yearsExperience: string;
  projectsCompleted: string;
  skilledProfessionals: string;
  customerSatisfaction: string;
  whyChooseUsPoints: { title: string; description: string }[];
  ctaButtonText: string;
  ctaSubButtonText: string;
};

export type AdminProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  lastLogin: string;
};

// QuoteRequest CRUD
export const quoteRequestService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('date_submitted', { ascending: false });

    if (error) throw error;
    return (data || []).map(toCamelCase) as QuoteRequest[];
  },

  create: async (quoteRequest: Omit<QuoteRequest, 'id'>) => {
    const { data, error } = await supabase
      .from('quote_requests')
      .insert([toSnakeCase(quoteRequest)])
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as QuoteRequest;
  },

  update: async (id: string, quoteRequest: Partial<QuoteRequest>) => {
    const { data, error } = await supabase
      .from('quote_requests')
      .update(toSnakeCase(quoteRequest))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as QuoteRequest;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('quote_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Project CRUD (without image upload)
export const projectService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('completion_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(toCamelCase) as Project[];
  },

  create: async (project: Omit<Project, 'id'>) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([toSnakeCase(project)])
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as Project;
  },

  update: async (id: string, project: Partial<Project>) => {
    const { data, error } = await supabase
      .from('projects')
      .update(toSnakeCase(project))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as Project;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Testimonial CRUD
export const testimonialService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('date_added', { ascending: false });

    if (error) throw error;
    return (data || []).map(toCamelCase) as Testimonial[];
  },

  create: async (testimonial: Omit<Testimonial, 'id'>) => {
    const { data, error } = await supabase
      .from('testimonials')
      .insert([toSnakeCase(testimonial)])
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as Testimonial;
  },

  update: async (id: string, testimonial: Partial<Testimonial>) => {
    const { data, error } = await supabase
      .from('testimonials')
      .update(toSnakeCase(testimonial))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as Testimonial;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ServiceArea CRUD
export const serviceAreaService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('service_areas')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(toCamelCase) as ServiceArea[];
  },

  create: async (serviceArea: Omit<ServiceArea, 'id'>) => {
    const { data, error } = await supabase
      .from('service_areas')
      .insert([toSnakeCase(serviceArea)])
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as ServiceArea;
  },

  update: async (id: string, serviceArea: Partial<ServiceArea>) => {
    const { data, error } = await supabase
      .from('service_areas')
      .update(toSnakeCase(serviceArea))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as ServiceArea;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('service_areas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Singleton services (ContactInfo, HomepageSettings, AdminProfile)
// We assume a single row with id=1

export const contactInfoService = {
  get: async () => {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    return toCamelCase(data) as ContactInfo;
  },

  update: async (contactInfo: Partial<ContactInfo>) => {
    const { data, error } = await supabase
      .from('contact_info')
      .upsert({ id: 1, ...toSnakeCase(contactInfo) })
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as ContactInfo;
  }
};

export const homepageSettingsService = {
  get: async () => {
    const { data, error } = await supabase
      .from('homepage_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    return toCamelCase(data) as HomepageSettings;
  },

  update: async (homepageSettings: Partial<HomepageSettings>) => {
    const { data, error } = await supabase
      .from('homepage_settings')
      .upsert({ id: 1, ...toSnakeCase(homepageSettings) })
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as HomepageSettings;
  }
};

export const adminProfileService = {
  get: async () => {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    return toCamelCase(data) as AdminProfile;
  },

  update: async (adminProfile: Partial<AdminProfile>) => {
    const { data, error } = await supabase
      .from('admin_profiles')
      .upsert({ id: 1, ...toSnakeCase(adminProfile) })
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as AdminProfile;
  }
};