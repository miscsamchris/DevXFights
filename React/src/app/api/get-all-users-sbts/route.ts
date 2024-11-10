import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../lib/mongodb';
import User from '../models/User';

export async function GET() {
  try {
    await connectDB();
    
    const users = await User.find({ 
      sbtAddress: { $exists: true, $ne: null },
      walletAddress: { $exists: true }
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching users with SBTs', error: error.message },
      { status: 500 }
    );
  }
} 