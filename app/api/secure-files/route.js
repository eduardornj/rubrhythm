/**
 * API para servir arquivos organizados de forma segura
 * 
 * Endpoint: /api/secure-files?path=...&type=...
 * Valida permissões e serve arquivos do sistema organizado
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile, access, stat } from 'fs/promises';
import path from 'path';
import { parseFileName, ENTITY_CONFIGS } from '@/lib/secure-id-generator';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/secure-files
 * Serve arquivos organizados com validação de segurança
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const entityType = searchParams.get('type');
    const download = searchParams.get('download') === 'true';

    // Validar parâmetros obrigatórios
    if (!filePath || !entityType) {
      return NextResponse.json(
        { error: 'Parâmetros path e type são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo de entidade
    if (!ENTITY_CONFIGS[entityType]) {
      return NextResponse.json(
        { error: 'Tipo de entidade inválido' },
        { status: 400 }
      );
    }

    // Construir caminho inicial do arquivo
    const baseDir = path.join(process.cwd(), 'private', 'storage');

    let basePathToUse = filePath;
    if ((entityType === 'verification' || entityType === 'profile') && !filePath.startsWith('users/')) {
      basePathToUse = `users/${filePath}`;
    }

    let fullPath = path.join(baseDir, basePathToUse);

    // Extrair informações do nome do arquivo (necessário para reconstruir o caminho com pastas ano/mês)
    const fileName = path.basename(fullPath);
    const parsedFile = parseFileName(fileName);

    // Reconstruir o caminho real se a URL pediu apenas pelo nome do arquivo (sem pasta de ano/mês)
    if (parsedFile && parsedFile.timestamp && !basePathToUse.includes('/202')) {
      let year, month;
      if (parsedFile.timestamp.length === 6) { // MMDDYY
        month = parsedFile.timestamp.substring(0, 2);
        year = '20' + parsedFile.timestamp.substring(4, 6);
      } else if (parsedFile.timestamp.length >= 8) { // YYYYMMDD...
        year = parsedFile.timestamp.substring(0, 4);
        month = parsedFile.timestamp.substring(4, 6);
      }

      if (year && month) {
        const dirPath = path.dirname(basePathToUse); // ex: users/listings ou users/verification
        fullPath = path.join(baseDir, dirPath, year, month, fileName);
      }
    }

    // Validar que o arquivo está dentro do diretório permitido
    const normalizedPath = path.normalize(fullPath);
    const normalizedBase = path.normalize(baseDir);

    if (!normalizedPath.startsWith(normalizedBase)) {
      return NextResponse.json(
        { error: 'Caminho de arquivo inválido' },
        { status: 403 }
      );
    }

    // Verificar se arquivo existe no caminho montado
    let resolvedPath = fullPath;
    try {
      await access(fullPath);
    } catch {
      // Fallback: busca recursiva pelo nome exato do arquivo em toda a storage
      const { readdir: readdirAsync } = await import('fs/promises');

      async function findFileRecursively(name, dir) {
        try {
          const entries = await readdirAsync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const entryPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              const found = await findFileRecursively(name, entryPath);
              if (found) return found;
            } else if (entry.name === name) {
              return entryPath;
            }
          }
        } catch { /* ignore */ }
        return null;
      }

      const found = await findFileRecursively(fileName, baseDir);
      if (!found) {
        return NextResponse.json(
          { error: 'Arquivo não encontrado no storage' },
          { status: 404 }
        );
      }
      resolvedPath = found;
    }

    // The entityId for permission check: for listing files, extract from filename
    // Format: listing_{entityId}_{timestamp}_{seq}.ext  OR  listing-{uuid}-{n}.jpg
    let entityId = parsedFile?.entityId;
    if (!entityId && fileName) {
      // Try to extract ID from hyphen-format: listing-{uuid}-{seq}
      const hyphenMatch = fileName.match(/^listing-([a-z0-9-]+?)-\d+\.\w+$/);
      if (hyphenMatch) entityId = hyphenMatch[1];
      // Fallback: try extracting from underscore format
      const underscoreMatch = fileName.match(/^listing_([a-z0-9]+)_/);
      if (!entityId && underscoreMatch) entityId = underscoreMatch[1];
    }

    // DEBUG LOG
    console.log('[SECURE FILES] Attempting to serve:', fullPath);
    console.log('[SECURE FILES] EntityId extracted:', entityId);

    // Validar permissões baseadas no tipo de entidade
    const hasPermission = await validateFilePermission(
      request,
      entityType,
      entityId,
      parsedFile
    );

    console.log('[SECURE FILES] Permission check:', hasPermission);

    if (!hasPermission.allowed) {
      console.log('[SECURE FILES] ERROR: BLOCKED 403');
      return NextResponse.json(
        { error: hasPermission.reason || 'Acesso negado' },
        { status: 403 }
      );
    }

    // Use resolvedPath (which may differ from fullPath after recursive search)
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeType = getMimeType(extension);

    // Ler arquivo usando o caminho resolvido
    console.log('[SECURE FILES] Reading file at:', resolvedPath);
    const fileBuffer = await readFile(resolvedPath);
    const fileStats = await stat(resolvedPath);

    // Configurar headers de resposta
    const headers = {
      'Content-Type': mimeType,
      'Content-Length': fileStats.size.toString(),
      'Cache-Control': 'public, max-age=86400',
      'Last-Modified': fileStats.mtime.toUTCString(),
    };

    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${fileName}"`;
    } else {
      headers['Content-Disposition'] = 'inline';
    }

    // Retornar arquivo
    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Erro ao servir arquivo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Valida permissões de acesso ao arquivo
 */
async function validateFilePermission(request, entityType, entityId, fileInfo) {
  try {
    const session = await auth();

    switch (entityType) {
      case 'listing':
        return await validateListingPermission(session, entityId);
      case 'profile':
      case 'verification':
        return await validateProfilePermission(session, entityId);
      case 'temp':
        return await validateTempPermission(request, entityId);
      default:
        return { allowed: false, reason: 'Tipo de entidade não suportado' };
    }
  } catch (error) {
    console.error('Erro na validação de permissão:', error);
    return { allowed: false, reason: 'Erro na validação' };
  }
}

async function validateListingPermission(session, listingId) {
  // Listing photos are public - any visitor should be able to see them
  return { allowed: true };
}

async function validateProfilePermission(session, userId) {
  if (session?.user?.id === userId || session?.user?.role === 'admin') {
    return { allowed: true };
  }
  return { allowed: false, reason: 'Acesso negado ao perfil' };
}

async function validateTempPermission(request, entityId) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || request.headers.get('x-temp-token');

  if (!token || token.length < 10) {
    return { allowed: false, reason: 'Token inválido' };
  }

  return { allowed: true };
}

function getMimeType(extension) {
  const mimeTypes = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf'
  };
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}