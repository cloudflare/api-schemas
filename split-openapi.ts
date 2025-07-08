#!/usr/bin/env bun

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

interface OpenAPISpec {
  openapi?: string;
  info?: any;
  servers?: any[];
  paths?: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
    responses?: Record<string, any>;
    parameters?: Record<string, any>;
    examples?: Record<string, any>;
    requestBodies?: Record<string, any>;
    headers?: Record<string, any>;
    securitySchemes?: Record<string, any>;
    links?: Record<string, any>;
    callbacks?: Record<string, any>;
  };
  security?: any[];
  tags?: any[];
  externalDocs?: any;
}

class SimpleYAMLParser {
  static parse(yamlContent: string): any {
    const lines = yamlContent.split('\n');
    const result: any = {};
    const stack: any[] = [result];
    const indentStack: number[] = [0];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const indent = line.length - line.trimStart().length;
      const current = stack[stack.length - 1];
      
      // Handle indent changes
      while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
        stack.pop();
        indentStack.pop();
      }
      
      if (trimmed.includes(':')) {
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        
        if (value === '' || value === '{}' || value === '[]') {
          // Object or array
          const newObj = value === '[]' ? [] : {};
          current[key] = newObj;
          stack.push(newObj);
          indentStack.push(indent);
        } else {
          // Simple value
          current[key] = this.parseValue(value);
        }
      } else if (trimmed.startsWith('- ')) {
        // Array item
        const value = trimmed.substring(2).trim();
        if (Array.isArray(current)) {
          current.push(this.parseValue(value));
        }
      }
    }
    
    return result;
  }
  
  private static parseValue(value: string): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (/^-?\d+$/.test(value)) return parseInt(value);
    if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
    return value;
  }
  
  static stringify(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj.toString();
    if (typeof obj === 'number') return obj.toString();
    if (typeof obj === 'string') return obj.includes('\n') ? `|\n${obj.split('\n').map(l => spaces + '  ' + l).join('\n')}` : obj;
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => `${spaces}- ${this.stringify(item, indent + 1).replace(/^\s+/, '')}`).join('\n');
    }
    
    if (typeof obj === 'object') {
      if (Object.keys(obj).length === 0) return '{}';
      return Object.entries(obj)
        .map(([key, value]) => `${spaces}${key}: ${this.stringify(value, indent + 1).replace(/^\s+/, '')}`)
        .join('\n');
    }
    
    return String(obj);
  }
}

class OpenAPISplitter {
  private outputDir: string;
  private isYaml: boolean;
  
  constructor(outputDir: string, isYaml: boolean) {
    this.outputDir = outputDir;
    this.isYaml = isYaml;
  }
  
  split(inputFile: string): void {
    console.log(`Splitting ${inputFile}...`);
    
    const content = readFileSync(inputFile, 'utf-8');
    const spec: OpenAPISpec = this.isYaml 
      ? parseYAML(content)
      : JSON.parse(content);
    
    // Create output directory
    if (existsSync(this.outputDir)) {
      console.log(`Output directory ${this.outputDir} already exists, cleaning...`);
    }
    mkdirSync(this.outputDir, { recursive: true });
    
    // Split main sections
    this.writeMainInfo(spec);
    this.splitPaths(spec.paths || {});
    this.splitComponents(spec.components || {});
    this.writeOtherSections(spec);
    
    console.log(`✅ Split complete! Files saved to ${this.outputDir}`);
  }
  
  private writeMainInfo(spec: OpenAPISpec): void {
    const mainInfo: any = {};
    
    if (spec.openapi) mainInfo.openapi = spec.openapi;
    if (spec.info) mainInfo.info = spec.info;
    if (spec.servers) mainInfo.servers = spec.servers;
    if (spec.security) mainInfo.security = spec.security;
    if (spec.tags) mainInfo.tags = spec.tags;
    if (spec.externalDocs) mainInfo.externalDocs = spec.externalDocs;
    
    this.writeFile('main.info', mainInfo);
  }
  
  private splitPaths(paths: Record<string, any>): void {
    for (const [path, pathItem] of Object.entries(paths)) {
      // Create directory structure based on path segments
      const pathSegments = this.createPathSegments(path);
      const pathDir = join(this.outputDir, ...pathSegments);
      mkdirSync(pathDir, { recursive: true });
      
      // Split by HTTP methods
      for (const [method, methodSpec] of Object.entries(pathItem)) {
        if (typeof methodSpec === 'object' && methodSpec !== null) {
          const methodFile = join(...pathSegments, `${method.toLowerCase()}`);
          this.writeFile(methodFile, {
            [path]: {
              [method]: methodSpec
            }
          });
        }
      }
    }
  }
  
  private splitComponents(components: NonNullable<OpenAPISpec['components']>): void {
    const componentsDir = join(this.outputDir, 'components');
    mkdirSync(componentsDir, { recursive: true });
    
    for (const [componentType, componentItems] of Object.entries(components)) {
      if (!componentItems || typeof componentItems !== 'object') continue;
      
      const typeDir = join(componentsDir, componentType);
      mkdirSync(typeDir, { recursive: true });
      
      let currentChunk: Record<string, any> = {};
      let chunkIndex = 1;
      
      for (const [name, item] of Object.entries(componentItems)) {
        currentChunk[name] = item;
        
        if (this.getObjectSize(currentChunk) > MAX_FILE_SIZE) {
          // Remove the last item and save current chunk
          delete currentChunk[name];
          this.writeFile(
            join('components', componentType, `${componentType}-${chunkIndex.toString().padStart(3, '0')}`),
            currentChunk
          );
          
          // Start new chunk with the item that exceeded size
          currentChunk = { [name]: item };
          chunkIndex++;
        }
      }
      
      // Write remaining items
      if (Object.keys(currentChunk).length > 0) {
        this.writeFile(
          join('components', componentType, `${componentType}-${chunkIndex.toString().padStart(3, '0')}`),
          currentChunk
        );
      }
    }
  }
  
  private writeOtherSections(spec: OpenAPISpec): void {
    // Any other top-level sections not handled above
    const handled = new Set(['openapi', 'info', 'servers', 'paths', 'components', 'security', 'tags', 'externalDocs']);
    
    for (const [key, value] of Object.entries(spec)) {
      if (!handled.has(key) && value !== undefined) {
        this.writeFile(`other.${key}`, { [key]: value });
      }
    }
  }
  
  private writeFile(relativePath: string, content: any): void {
    const extension = this.isYaml ? '.yaml' : '.json';
    const fullPath = join(this.outputDir, relativePath + extension);
    
    // Ensure directory exists
    mkdirSync(dirname(fullPath), { recursive: true });
    
    const serialized = this.isYaml 
      ? stringifyYAML(content)
      : JSON.stringify(content, null, 2);
    
    writeFileSync(fullPath, serialized, 'utf-8');
    
    const size = Buffer.byteLength(serialized, 'utf-8');
    console.log(`📄 ${relativePath}${extension} (${this.formatSize(size)})`);
    
    if (size > MAX_FILE_SIZE) {
      console.warn(`⚠️  Warning: ${relativePath}${extension} exceeds 5MB limit (${this.formatSize(size)})`);
    }
  }
  
  private getObjectSize(obj: any): number {
    const serialized = this.isYaml 
      ? stringifyYAML(obj)
      : JSON.stringify(obj, null, 2);
    return Buffer.byteLength(serialized, 'utf-8');
  }
  
  private sanitizeFileName(path: string): string {
    return path.replace(/[^a-zA-Z0-9-_]/g, '_');
  }
  
  private createPathSegments(path: string): string[] {
    // Remove leading slash and split by slash
    const segments = path.replace(/^\//, '').split('/');
    
    // Sanitize each segment for filesystem compatibility
    return segments.map(segment => {
      // Keep path parameters readable but filesystem-safe
      return segment.replace(/[<>:"|?*]/g, '_').replace(/\{([^}]+)\}/g, '{$1}');
    });
  }
  
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
}

function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: bun split-openapi.ts <input-file> [output-dir]');
    console.error('Example: bun split-openapi.ts openapi.yaml ./split-output');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputDir = args[1] || './openapi-split';
  
  if (!existsSync(inputFile)) {
    console.error(`Error: Input file ${inputFile} does not exist`);
    process.exit(1);
  }
  
  const ext = extname(inputFile).toLowerCase();
  const isYaml = ext === '.yaml' || ext === '.yml';
  const isJson = ext === '.json';
  
  if (!isYaml && !isJson) {
    console.error('Error: Input file must be .yaml, .yml, or .json');
    process.exit(1);
  }
  
  const splitter = new OpenAPISplitter(outputDir, isYaml);
  splitter.split(inputFile);
}

if (import.meta.main) {
  main();
}