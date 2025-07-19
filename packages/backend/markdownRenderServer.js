import express from 'express';
import { JSDOM } from 'jsdom';
import { renderByType, htmlToPNG } from './crossPlatformLintBackend.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const router = express.Router();
const IMAGE_DIR = path.resolve('./public/markdown-images');

// Ensure directory exists
await fs.mkdir(IMAGE_DIR, { recursive: true });

router.post('/api/markdown-render', async (req, res) => {
  const { markdown = '', renderer = 'marked', output = 'html' } = req.body;

  if (!markdown.trim()) {
    return res.status(400).json({ error: 'Missing markdown content.' });
  }

  try {
    const html = await renderByType(markdown, renderer);

    if (output === 'html') {
      return res.json({ result: html });
    }

    if (output === 'dom') {
      const dom = new JSDOM(html);
      const serialized = dom.window.document.body.outerHTML;
      return res.json({ result: serialized });
    }

    if (output === 'image') {
      const buffer = await htmlToPNG(html);
      const filename = `render_${crypto.randomUUID()}.png`;
      const filepath = path.join(IMAGE_DIR, filename);
      await fs.writeFile(filepath, buffer);
      const fullUrl = `${req.protocol}://${req.get('host')}/markdown-images/${filename}`;
      return res.json({ result: fullUrl });

    }

    return res.status(400).json({ error: `Unsupported output type: ${output}` });

  } catch (err) {
    console.error('markdown-render error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
