// API utility functions for frontend integration

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new ApiError(response.status, errorData.error || 'Request failed')
  }

  return response.json()
}

// User API functions
export const userApi = {
  getUsers: () => apiRequest<any[]>('/users'),
  createUser: (userData: any) => apiRequest<any>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
}

// Inspection API functions
export const inspectionApi = {
  getInspections: (params?: { status?: string; userId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.userId) searchParams.set('userId', params.userId)
    
    const query = searchParams.toString()
    return apiRequest<any[]>(`/inspections${query ? `?${query}` : ''}`)
  },
  
  getInspection: (id: string) => apiRequest<any>(`/inspections/${id}`),
  
  createInspection: (inspectionData: any) => apiRequest<any>('/inspections', {
    method: 'POST',
    body: JSON.stringify(inspectionData),
  }),
  
  updateInspection: (id: string, inspectionData: any) => apiRequest<any>(`/inspections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(inspectionData),
  }),
  
  deleteInspection: (id: string) => apiRequest<any>(`/inspections/${id}`, {
    method: 'DELETE',
  }),
}

// Seizure API functions
export const seizureApi = {
  getSeizures: (params?: { status?: string; userId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.userId) searchParams.set('userId', params.userId)
    
    const query = searchParams.toString()
    return apiRequest<any[]>(`/seizures${query ? `?${query}` : ''}`)
  },
  
  createSeizure: (seizureData: any) => apiRequest<any>('/seizures', {
    method: 'POST',
    body: JSON.stringify(seizureData),
  }),
}

// Lab Sample API functions
export const labSampleApi = {
  getLabSamples: (params?: { status?: string; userId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.userId) searchParams.set('userId', params.userId)
    
    const query = searchParams.toString()
    return apiRequest<any[]>(`/lab-samples${query ? `?${query}` : ''}`)
  },
  
  getLabSample: (id: string) => apiRequest<any>(`/lab-samples/${id}`),
  
  createLabSample: (labSampleData: any) => apiRequest<any>('/lab-samples', {
    method: 'POST',
    body: JSON.stringify(labSampleData),
  }),
  
  updateLabSample: (id: string, labSampleData: any) => apiRequest<any>(`/lab-samples/${id}`, {
    method: 'PUT',
    body: JSON.stringify(labSampleData),
  }),
  
  deleteLabSample: (id: string) => apiRequest<any>(`/lab-samples/${id}`, {
    method: 'DELETE',
  }),
}

// FIR Case API functions
export const firCaseApi = {
  getFIRCases: (params?: { status?: string; userId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.userId) searchParams.set('userId', params.userId)
    
    const query = searchParams.toString()
    return apiRequest<any[]>(`/fir-cases${query ? `?${query}` : ''}`)
  },
  
  createFIRCase: (firCaseData: any) => apiRequest<any>('/fir-cases', {
    method: 'POST',
    body: JSON.stringify(firCaseData),
  }),
}

// Product API functions
export const productApi = {
  getProducts: (params?: { category?: string; company?: string; name?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.company) searchParams.set('company', params.company)
    if (params?.name) searchParams.set('name', params.name)
    
    const query = searchParams.toString()
    return apiRequest<any[]>(`/products${query ? `?${query}` : ''}`)
  },
  
  createProduct: (productData: any) => apiRequest<any>('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
}

// File API functions
export const fileApi = {
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiRequest<any>('/files/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  },
  
  getFiles: () => apiRequest<any[]>('/files/upload'),
}

// Reports API functions
export const reportsApi = {
  getReport: (params: { 
    type: 'dashboard' | 'inspections' | 'seizures' | 'lab-samples' | 'fir-cases'
    startDate?: string
    endDate?: string 
  }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('type', params.type)
    if (params.startDate) searchParams.set('startDate', params.startDate)
    if (params.endDate) searchParams.set('endDate', params.endDate)
    
    return apiRequest<any>(`/reports?${searchParams.toString()}`)
  },
}
