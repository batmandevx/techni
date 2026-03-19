'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Handle Date objects
        const revived = reviveDates(parsed);
        setStoredValue(revived);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsInitialized(true);
  }, [key]);

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Helper function to revive Date objects from JSON
function reviveDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
    const date = new Date(obj);
    if (!isNaN(date.getTime())) return date;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = reviveDates(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
}

// Hook for persisting Excel upload data
export interface ExcelUploadData {
  orders: any[];
  customers: any[];
  materials: any[];
  uploadedAt: string;
  fileName?: string;
}

export function useExcelData() {
  const [excelData, setExcelData, clearExcelData] = useLocalStorage<ExcelUploadData | null>('tenchi-excel-data', null);
  
  const hasData = excelData !== null && (excelData.orders.length > 0 || excelData.customers.length > 0);
  
  const addOrders = useCallback((orders: any[], fileName?: string) => {
    setExcelData(prev => {
      const existingOrders = prev?.orders || [];
      // Merge and deduplicate by orderId
      const orderMap = new Map();
      existingOrders.forEach(o => orderMap.set(o.orderId, o));
      orders.forEach(o => orderMap.set(o.orderId, o));
      
      return {
        orders: Array.from(orderMap.values()),
        customers: prev?.customers || [],
        materials: prev?.materials || [],
        uploadedAt: new Date().toISOString(),
        fileName: fileName || prev?.fileName,
      };
    });
  }, [setExcelData]);
  
  const addCustomers = useCallback((customers: any[], fileName?: string) => {
    setExcelData(prev => {
      const existingCustomers = prev?.customers || [];
      // Merge and deduplicate by customerId
      const customerMap = new Map();
      existingCustomers.forEach(c => customerMap.set(c.customerId, c));
      customers.forEach(c => customerMap.set(c.customerId, c));
      
      return {
        orders: prev?.orders || [],
        customers: Array.from(customerMap.values()),
        materials: prev?.materials || [],
        uploadedAt: new Date().toISOString(),
        fileName: fileName || prev?.fileName,
      };
    });
  }, [setExcelData]);
  
  const updateMaterials = useCallback((materials: any[]) => {
    setExcelData(prev => ({
      orders: prev?.orders || [],
      customers: prev?.customers || [],
      materials,
      uploadedAt: prev?.uploadedAt || new Date().toISOString(),
      fileName: prev?.fileName,
    }));
  }, [setExcelData]);
  
  return {
    excelData,
    hasData,
    addOrders,
    addCustomers,
    updateMaterials,
    clearExcelData,
  };
}

// Hook for forecasting settings
export interface ForecastSettings {
  defaultMethod: 'sma' | 'wma' | 'ses' | 'holt' | 'linear' | 'seasonal';
  defaultPeriods: number;
  alpha: number;
  beta: number;
  seasonLength: number;
  safetyStockMultiplier: number;
}

export function useForecastSettings() {
  const defaultSettings: ForecastSettings = {
    defaultMethod: 'holt',
    defaultPeriods: 3,
    alpha: 0.3,
    beta: 0.1,
    seasonLength: 12,
    safetyStockMultiplier: 1.5,
  };
  
  const [settings, setSettings, resetSettings] = useLocalStorage<ForecastSettings>(
    'tenchi-forecast-settings',
    defaultSettings
  );
  
  return {
    settings,
    setSettings,
    resetSettings,
  };
}
