#!/usr/bin/env node

/**
 * Service Worker Generator
 * Generates production-ready service worker from template with environment variables
 * Handles cache versioning and environment-specific optimizations
 * @author NuwaX
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_PATH = path.join(__dirname, '../src/templates/sw.template.js');
const OUTPUT_PATH = path.join(__dirname, '../public/sw.js');
const PKG_PATH = path.join(__dirname, '../package.json');

/**
 * Default configuration values used when environment variables are not available
 */
const DEFAULT_VALUES = {
  APP_NAME: 'nuwault',
  APP_DESCRIPTION: 'Privacy-focused deterministic password generator'
};

/**
 * Generates cryptographically secure build hash for cache versioning
 * @returns {string} 8-character hexadecimal hash
 */
function generateBuildHash() {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return crypto.createHash('sha256')
    .update(timestamp + randomBytes)
    .digest('hex')
    .substring(0, 8);
}

/**
 * Creates cache version string with environment-aware strategies
 * @param {string} appVersion - Application version from environment
 * @returns {string} Formatted cache version string
 */
function generateCacheVersion(appVersion) {
  const buildTimestamp = Date.now();
  const buildHash = generateBuildHash();
  const shortTimestamp = Math.floor(buildTimestamp / 1000).toString(36);
  
  const isDevelopmentBuild = process.env.NODE_ENV === 'development';
  const isProductionRelease = appVersion !== '0.0.0' && appVersion !== '1.0.0';
  
  if (isProductionRelease) {
    return `${appVersion}-${buildHash}`;
  } else {
    return `${appVersion}-${shortTimestamp}-${buildHash}`;
  }
}

/**
 * Loads environment variables from .env files in priority order
 * Processes multiple .env files and merges them into process.env
 */
function loadEnvironmentVariables() {
  const envFiles = [
    '.env.development.local',
    '.env.local',
    '.env.development',
    '.env'
  ];

  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
      console.log(`[SW Generator] 📁 Loading environment from: ${envFile}`);
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            process.env[key] = value;
          }
        }
      });
    }
  }
}

/**
 * Main service worker generation function
 * Processes template file and generates production-ready service worker
 */
async function generateServiceWorker() {
  try {
    console.log('[SW Generator] 🚀 Generating Service Worker...');
    
    loadEnvironmentVariables();
    
    if (!fs.existsSync(TEMPLATE_PATH)) {
      console.error('[SW Generator] ❌ Template file not found:', TEMPLATE_PATH);
      process.exit(1);
    }
    
    let templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    console.log('[SW Generator] 📁 Template loaded:', TEMPLATE_PATH);
    
    const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf-8'));
    const appName = process.env.VITE_APP_NAME || DEFAULT_VALUES.APP_NAME;
    const appVersion = pkg.version;
    const appDescription = process.env.VITE_APP_DESCRIPTION || DEFAULT_VALUES.APP_DESCRIPTION;
    
    const cacheVersion = generateCacheVersion(appVersion);
    
    const replacements = {
      '{{APP_NAME}}': appName,
      '{{APP_VERSION}}': cacheVersion,
      '{{APP_DESCRIPTION}}': appDescription
    };
    
    console.log('[SW Generator] 🔄 Applying replacements:');
    Object.entries(replacements).forEach(([placeholder, value]) => {
      templateContent = templateContent.replace(new RegExp(placeholder, 'g'), value);
      console.log(`[SW Generator]    ${placeholder} → ${value}`);
    });
    
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_PATH, templateContent, 'utf8');
    console.log('[SW Generator] ✅ Service Worker generated:', OUTPUT_PATH);
    
    console.log(`[SW Generator] 📦 App Version: ${appVersion}`);
    console.log(`[SW Generator] 📦 Cache Version: ${cacheVersion}`);
    console.log(`[SW Generator] 📦 Final Cache Name: ${appName}-v${cacheVersion}`);
    
    console.log('[SW Generator] 🎉 Service Worker generation completed!');
    
  } catch (error) {
    console.error('[SW Generator] ❌ Service Worker generation failed:', error);
    process.exit(1);
  }
}

generateServiceWorker(); 