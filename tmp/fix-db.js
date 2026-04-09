import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Fix for ESM __dirname
const __dirname = path.resolve();

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function fix() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });

    try {
        console.log('Checking business_profiles table...');
        const [columns] = await connection.query('SHOW COLUMNS FROM business_profiles');
        const hasSlug = columns.some(c => c.Field === 'slug');

        if (!hasSlug) {
            console.log('Adding slug column to business_profiles...');
            await connection.query('ALTER TABLE business_profiles ADD COLUMN slug VARCHAR(255) UNIQUE AFTER business_id');
            console.log('Column added successfully!');
        } else {
            console.log('Slug column already exists.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

fix();
