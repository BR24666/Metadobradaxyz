import { NextResponse } from 'next/server'
import { learningEngine } from '@/lib/services/LearningEngine'
export const dynamic = 'force-dynamic';
export async function POST() {
  await learningEngine.start()
  return NextResponse.json({ success: true, message: "Motor de Aprendizado Ativo" })
}
