import { defineConfig } from 'vite';
import { viteObfuscateFile } from 'vite-plugin-obfuscator';

// Obfuscator options (same as before, using the desired settings)
const obfuscatorOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false, // Keep false for safety
    debugProtectionInterval: 0,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false, // Keep false for safety
    rotateStringArray: true,
    selfDefending: true,
    shuffleStringArray: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
};

export default defineConfig({
  base: './', // Use relative paths for assets (needed for GitHub Pages subdirectory)
  plugins: [
    // Use the new Vite plugin
    // Apply it only during build, and potentially only to specific chunks
    viteObfuscateFile({
        // Match all JS files in the output dir (adjust if needed)
        // include: ["**/assets/*.js"],
        // exclude: ["**/node_modules/**"],
        // Pass the options to javascript-obfuscator
        options: obfuscatorOptions,
    })
  ],
  build: {
    outDir: 'docs', // Build directly to docs for GitHub Pages
    // Let the plugin handle obfuscation; Vite's minify might conflict
    // Setting to false explicitly might be needed if issues arise.
    minify: false, // Explicitly disable Vite's minification
  },
}); 