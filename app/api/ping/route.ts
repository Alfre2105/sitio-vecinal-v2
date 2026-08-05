export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { error } = await supabase.from('noticias').select('id').limit(1)
  return NextResponse.json({ ok: !error, ts: new Date().toISOString() })
}
