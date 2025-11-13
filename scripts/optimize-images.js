import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const assetsDir = './src/assets';
const largeImageThreshold = 500 * 1024; // 500 KB

async function optimizeImage(inputPath, outputPath) {
  const stats = await stat(inputPath);
  const ext = extname(inputPath).toLowerCase();
  
  console.log(`\n🔍 Processando: ${basename(inputPath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  
  // Configurações específicas por tipo
  const config = {
    quality: 85,
    effort: 6,
  };
  
  // Se for slider ou vista-mar PNG grande, converter para WebP
  if (ext === '.png' && stats.size > largeImageThreshold) {
    console.log(`📦 Convertendo para WebP...`);
    
    const metadata = await sharp(inputPath).metadata();
    const targetWidth = Math.min(metadata.width, 1920); // Max 1920px largura
    
    await sharp(inputPath)
      .resize(targetWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp(config)
      .toFile(outputPath.replace('.png', '.webp'));
    
    const newStats = await stat(outputPath.replace('.png', '.webp'));
    const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);
    
    console.log(`✅ WebP criado: ${(newStats.size / 1024 / 1024).toFixed(2)} MB (economia de ${savings}%)`);
  } 
  // Se for JPEG grande, otimizar
  else if ((ext === '.jpeg' || ext === '.jpg') && stats.size > largeImageThreshold) {
    console.log(`🗜️  Otimizando JPEG...`);
    
    await sharp(inputPath)
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);
    
    const newStats = await stat(outputPath);
    const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);
    
    console.log(`✅ JPEG otimizado: ${(newStats.size / 1024 / 1024).toFixed(2)} MB (economia de ${savings}%)`);
  }
}

async function processDirectory(dir) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);
    
    if (fileStat.isDirectory()) {
      await processDirectory(filePath);
    } else if (fileStat.isFile()) {
      const ext = extname(file).toLowerCase();
      
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const outputPath = filePath.replace(ext, '-optimized' + ext);
        await optimizeImage(filePath, outputPath);
      }
    }
  }
}

console.log('🚀 Iniciando otimização de imagens...\n');
await processDirectory(assetsDir);
console.log('\n✨ Otimização concluída!');
