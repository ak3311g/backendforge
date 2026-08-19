// Statically imported (not read via fs.readdir at runtime) so Bun's
// --compile step embeds these JSON files directly into the binary.
// Any dynamically-read file (fs.readFile/fs.readdir) is invisible to
// Bun's static analysis and does NOT get embedded — that's the whole
// reason this file exists instead of loader.ts's old directory walk.

import typescript from '../../registry/languages/typescript.json' with { type: 'json' };
import javascript from '../../registry/languages/javascript.json' with { type: 'json' };
import python from '../../registry/languages/python.json' with { type: 'json' };
import go from '../../registry/languages/go.json' with { type: 'json' };
import java from '../../registry/languages/java.json' with { type: 'json' };

import express from '../../registry/frameworks/express.json' with { type: 'json' };
import fastify from '../../registry/frameworks/fastify.json' with { type: 'json' };
import hono from '../../registry/frameworks/hono.json' with { type: 'json' };
import fastapi from '../../registry/frameworks/fastapi.json' with { type: 'json' };
import gin from '../../registry/frameworks/gin.json' with { type: 'json' };
import springboot from '../../registry/frameworks/springboot.json' with { type: 'json' };

export interface LanguageMetadata {
  id: string;
  name: string;
  hint?: string;
  enabled: boolean;
}

export interface FrameworkMetadata {
  id: string;
  name: string;
  hint?: string;
  languages: string[];
  architecture?: string[];
  enabled: boolean;
}

export const LANGUAGES: LanguageMetadata[] = [typescript, javascript, python, go, java];
export const FRAMEWORKS: FrameworkMetadata[] = [express, fastify, hono, fastapi, gin, springboot];