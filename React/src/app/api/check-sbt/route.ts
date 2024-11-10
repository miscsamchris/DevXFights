import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../lib/mongodb';
import User from '../models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { message: 'Username is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      hasSbt: !!user.sbtAddress,
      sbtAddress: user.sbtAddress || null
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error checking SBT status', error: error.message },
      { status: 500 }
    );
  }
} 