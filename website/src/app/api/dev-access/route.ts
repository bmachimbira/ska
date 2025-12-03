import { NextRequest, NextResponse } from 'next/server';

const DEV_PASSWORD = process.env.DEV_ACCESS_PASSWORD || 'dev2024';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === DEV_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    );
  }
}
