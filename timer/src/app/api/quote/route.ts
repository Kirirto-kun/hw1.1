import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://zenquotes.io/api/random');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
} 