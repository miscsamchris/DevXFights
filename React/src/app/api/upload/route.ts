import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  console.log('Received upload request');
  const { imageData, jsonData } = await req.json();

  if (!imageData && !jsonData) {
    console.error('No data received');
    return NextResponse.json({ error: 'No data provided' }, { status: 400 });
  }

  try {
    if (imageData) {
      console.log('Uploading image to Cloudinary');
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(imageData, { folder: 'roasts' }, (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful');
            resolve(result);
          }
        });
      });

      console.log('Cloudinary upload result:', result);
      return NextResponse.json({ imageUrl: (result as any).secure_url });
    }

    if (jsonData) {
      console.log('Uploading JSON to Cloudinary');
      const jsonString = JSON.stringify(jsonData);
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          `data:text/json;base64,${Buffer.from(jsonString).toString('base64')}`,
          { 
            folder: 'metadata',
            resource_type: 'raw',
            format: 'json'
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary JSON upload error:', error);
              reject(error);
            } else {
              console.log('Cloudinary JSON upload successful');
              resolve(result);
            }
          }
        );
      });

      console.log('Cloudinary JSON upload result:', result);
      return NextResponse.json({ imageUrl: (result as any).secure_url });
    }

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to upload to Cloudinary' }, { status: 500 });
  }
}