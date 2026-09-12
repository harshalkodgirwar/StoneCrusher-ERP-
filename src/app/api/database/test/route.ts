import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '../../../../lib/supabase/db-service';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const status = await testSupabaseConnection();
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supabaseUrl, supabaseAnonKey, saveToEnv } = body;

    const status = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);

    // If requested and valid, save to .env.local
    if (saveToEnv && supabaseUrl && supabaseAnonKey) {
      const envPath = path.join(process.cwd(), '.env.local');
      let currentContent = '';
      if (fs.existsSync(envPath)) {
        currentContent = fs.readFileSync(envPath, 'utf-8');
      }

      const newContent = [
        `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl.trim()}`,
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey.trim()}`,
      ].join('\n');

      fs.writeFileSync(envPath, newContent + '\n', 'utf-8');
    }

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { isConfigured: false, connected: false, error: error.message },
      { status: 500 }
    );
  }
}
