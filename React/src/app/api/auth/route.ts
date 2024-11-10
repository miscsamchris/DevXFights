import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../lib/mongodb';
import User from '../models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { username, walletAddress } = await request.json();

    // Allow login with just username
    if (username && !walletAddress) {
      const user = await User.findOne({ username });
      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        message: 'User authenticated successfully',
        user: {
          username: user.username,
          walletAddress: user.walletAddress,
          sbtAddress: user.sbtAddress
        }
      });
    }

    // Login/Register with wallet
    if (!username || !walletAddress) {
      return NextResponse.json(
        { message: 'Username or wallet address is required' },
        { status: 400 }
      );
    }

    // Try to find existing user by wallet
    let user = await User.findOne({ walletAddress });

    if (user) {
      return NextResponse.json({
        message: 'User authenticated successfully',
        user: {
          username: user.username,
          walletAddress: user.walletAddress,
          sbtAddress: user.sbtAddress
        }
      });
    }

    // Create new user if wallet is new
    user = new User({
      username,
      walletAddress
    });

    await user.save();

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        username: user.username,
        walletAddress: user.walletAddress,
        sbtAddress: user.sbtAddress
      }
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Username or wallet address already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Error processing request', error: error.message },
      { status: 500 }
    );
  }
}