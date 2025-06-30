const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

/**
 * DATABASE.md dosyasından SQL komutlarını ayıklayan fonksiyon
 * @returns {Array} SQL komut dizisi
 */
async function extractSqlCommands() {
  try {
    const dbFilePath = path.join(__dirname, '..', 'DATABASE.md');
    const content = await fs.readFile(dbFilePath, 'utf8');
    
    // SQL komutlarını ayıklama
    const sqlCommands = [];
    let currentCommand = '';
    
    content.split('\n').forEach(line => {
      // SQL komutu içermeyen satırları atlama
      if (line.trim().startsWith('```') || line.trim() === '') {
        return;
      }
      
      currentCommand += line + ' ';
      
      // SQL komutunun tamamlandığını kontrol etme
      if (line.trim().endsWith(';')) {
        sqlCommands.push(currentCommand.trim());
        currentCommand = '';
      }
    });
    
    return sqlCommands.filter(cmd => cmd.trim() !== '');
  } catch (error) {
    console.error('SQL komutlarını ayıklama xətası:', error);
    throw error;
  }
}

/**
 * Veritabanını oluşturan ve tabloları yaradan fonksiyon
 */
async function initializeDatabase() {
  let connection;
  
  try {
    console.log('Veritabanı başlatma prosesi başladı...');
    
    // MySQL bağlantısı
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    // Veritabanını oluşturma
    const dbName = process.env.DB_NAME || 'craftnet';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`"${dbName}" verilənlər bazası yaradıldı və ya artıq mövcuddur`);
    
    // Oluşturulan veritabanını seçme
    await connection.query(`USE ${dbName}`);
    
    // SQL komutlarını alın ve çalıştırın
    const sqlCommands = await extractSqlCommands();
    
    for (const sql of sqlCommands) {
      try {
        await connection.query(sql);
        console.log('SQL komandası icra edildi');
      } catch (error) {
        console.warn('SQL komandası icra edilə bilmədi:', error.message);
      }
    }
    
    console.log('Verilənlər bazası uğurla hazırlandı');
  } catch (error) {
    console.error('Verilənlər bazasını başlatma xətası:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Verilənlər bazası bağlantısı bağlandı');
    }
  }
}

// Scripti başlat
initializeDatabase(); 