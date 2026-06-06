import { getFromStorage, saveToStorage, UserAccount } from '../data/mockData';

export const BASE_URL = "http://localhost:8080/api/v1";

export async function apiCall(endpoint: string, method = "POST", body: any = null) {
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Request failed");
    return data;
  } catch (error: any) {
    // If backend is down, fallback to our mock data stored in localStorage
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn(`[Mock Fallback] Backend is unreachable. Mocking response for ${method} ${endpoint}`);
      return handleMockFallback(endpoint, body);
    }
    throw error;
  }
}

function handleMockFallback(endpoint: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (endpoint === '/auth/login') {
          const users = getFromStorage<UserAccount>('users');
          const matched = users.find(u => u.email.toLowerCase() === body.email.toLowerCase() && u.password === body.password);
          if (matched) {
            resolve({ role: matched.role.toUpperCase(), userName: matched.firstName });
          } else {
            reject(new Error("Invalid email or password. Please try again."));
          }
        } 
        else if (endpoint === '/auth/create') {
          const users = getFromStorage<UserAccount>('users');
          if (users.some(u => u.email.toLowerCase() === body.email.toLowerCase())) {
            reject(new Error("Email already exists."));
          } else {
            const roleInput = body.roles?.[0] || 'PROCUREMENT_OFFICER';
            const role = roleInput.toLowerCase() as 'procurement_officer' | 'vendor' | 'manager' | 'admin';
            
            const newUser: UserAccount = {
              email: body.email.trim(),
              firstName: body.firstName.trim(),
              lastName: body.lastName.trim(),
              role: role,
              status: 'Active',
              lastLogin: 'Never logged in',
              password: body.password
            };
            saveToStorage('users', [...users, newUser]);
            resolve({ success: true, message: "Account created successfully." });
          }
        }
        else if (endpoint === '/auth/verify-user') {
          if (body.code && body.code.length === 6) {
            resolve({ success: true });
          } else {
            reject(new Error("Invalid or expired OTP."));
          }
        }
        else if (endpoint === '/auth/forgot-password') {
          resolve({ success: true, message: "Code sent." });
        }
        else {
          reject(new Error("Mock endpoint not found."));
        }
      } catch (e) {
        reject(e);
      }
    }, 600); // 600ms artificial network delay
  });
}
