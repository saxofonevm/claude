import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const FPS = 30, dir = new URL('.', import.meta.url).pathname;
const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null; // preview stills

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', e => console.error('PAGE', e));
const srv = spawn('npx', ['http-server', dir, '-p', '8765', '-s'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1500));
await page.goto('http://127.0.0.1:8765/index.html');
await page.waitForFunction('window.ready === true');
await page.evaluate(() => document.fonts.ready);

if (only) {
  for (const t of only) { await page.evaluate(t => window.renderAt(t), t); await page.screenshot({ path: `${dir}still_${t}.jpg`, type: 'jpeg', quality: 80 }); }
} else {
  const dur = await page.evaluate('window.DURATION');
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', `${dir}silent.mp4`], { stdio: ['pipe', 'ignore', 'inherit'] });
  const total = Math.round(dur * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.renderAt(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close(); srv.kill();
