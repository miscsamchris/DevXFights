import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../lib/mongodb';
import User from '../models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Find all users with SBTs
    const users = await User.find({ 
      sbtAddress: { $exists: true, $ne: null } 
    });

    const sbts = users.map(user => ({
      username: user.username,
      sbtAddress: user.sbtAddress,
      walletAddress: user.walletAddress
    }));

    return NextResponse.json({ sbts });

  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching SBTs', error: error.message },
      { status: 500 }
    );
  }
} 