import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../lib/mongodb';
import User from '../models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { walletAddress, sbtAddress } = await request.json();

    if (!walletAddress || !sbtAddress) {
      return NextResponse.json(
        { message: 'Wallet address and SBT address are required' },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { walletAddress },
      { sbtAddress },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'SBT address updated successfully',
      user: {
        username: user.username,
        walletAddress: user.walletAddress,
        sbtAddress: user.sbtAddress
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error updating SBT address', error: error.message },
      { status: 500 }
    );
  }
} 