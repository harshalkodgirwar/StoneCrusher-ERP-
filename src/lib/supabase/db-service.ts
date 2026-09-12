import { createClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './client';

export interface DatabaseStatus {
  isConfigured: boolean;
  connected: boolean;
  supabaseUrl: string;
  error?: string;
  tablesStatus?: {
    table: string;
    exists: boolean;
    count?: number;
  }[];
}

const REQUIRED_TABLES = [
  'staff_users',
  'customers',
  'drivers',
  'vehicles',
  'products',
  'raw_materials',
  'suppliers',
  'spare_parts',
  'trips',
  'weighbridge_transactions',
  'gate_passes',
  'raw_material_receipts',
  'whatsapp_messages',
  'audit_logs',
];

/**
 * Tests connection to Supabase and verifies existence of required ERP tables.
 */
export async function testSupabaseConnection(
  customUrl?: string,
  customKey?: string
): Promise<DatabaseStatus> {
  const url = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = customKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return {
      isConfigured: false,
      connected: false,
      supabaseUrl: url || 'Not provided',
      error: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.',
    };
  }

  try {
    const testClient = createClient(url, key, {
      auth: { persistSession: false },
    });

    // Test a basic query against products or staff_users
    const { data, error } = await testClient.from('products').select('count', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist yet, it will return a 42P01 error (table not found)
      if (error.code === '42P01' || error.message.includes('relation "products" does not exist')) {
        return {
          isConfigured: true,
          connected: true,
          supabaseUrl: url,
          error: 'Connected to Supabase, but tables have not been created yet. Please execute supabase/schema.sql in the Supabase SQL Editor.',
          tablesStatus: REQUIRED_TABLES.map((t) => ({ table: t, exists: false })),
        };
      }

      return {
        isConfigured: true,
        connected: false,
        supabaseUrl: url,
        error: `Supabase connection error: ${error.message}`,
      };
    }

    // If products table exists, check each required table
    const tablesStatus = await Promise.all(
      REQUIRED_TABLES.map(async (table) => {
        try {
          const { count, error: tableErr } = await testClient
            .from(table)
            .select('*', { count: 'exact', head: true });

          return {
            table,
            exists: !tableErr,
            count: count || 0,
          };
        } catch {
          return { table, exists: false };
        }
      })
    );

    return {
      isConfigured: true,
      connected: true,
      supabaseUrl: url,
      tablesStatus,
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      connected: false,
      supabaseUrl: url,
      error: err.message || 'Network exception connecting to Supabase host.',
    };
  }
}
