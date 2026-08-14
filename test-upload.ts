import { uploadImageToCloudinary } from './src/lib/upload';
import * as fs from 'fs';

async function test() {
  const buffer = fs.readFileSync('public/favicon.ico');
  const file = new File([buffer], 'favicon.ico', { type: 'image/x-icon' });
  const url = await uploadImageToCloudinary(file);
  console.log("URL IS:", url);
}
test();
