import {config} from 'dotenv';
import path from 'path';

config({path: path.resolve(process.cwd(), '.env')});
config({
  path: path.resolve(process.cwd(), '..', '.vercel', '.env.production.local'),
  override: false,
});
