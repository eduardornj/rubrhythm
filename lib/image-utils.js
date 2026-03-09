/**
 * Utilitários para processamento de imagens
 */

/**
 * Processa o campo images de um listing para retornar URLs válidas
 * @param {string|Array} images - Campo images do banco de dados
 * @returns {Array} Array de URLs válidas para as imagens
 */
export function processListingImages(images) {
  if (!images) return [];

  let imageArray = [];

  // Se for string, tentar fazer parse do JSON ou separar por vírgula
  if (typeof images === 'string') {
    // Se a string for apenas "[" ou "]" ou vazia, retornar array vazio
    if (images.trim() === '[' || images.trim() === ']' || images.trim() === '') {
      return [];
    }

    // Primeiro tentar JSON parse
    try {
      imageArray = JSON.parse(images);
    } catch (error) {
      // Se falhar, verificar se é uma string separada por vírgulas
      if (images.includes(',') || images.includes('listing_')) {
        // Separar por vírgula e limpar espaços
        imageArray = images.split(',').map(img => img.trim()).filter(img => img.length > 0);
        console.log('Imagens processadas como string separada por vírgula:', imageArray);
      } else {
        console.warn('Erro ao fazer parse das imagens:', error, 'Input:', images);
        return [];
      }
    }
  } else if (Array.isArray(images)) {
    imageArray = images;
  } else if (typeof images === 'object' && images !== null) {
    // Se for um objeto que não é array, tentar converter para array
    if (images.length !== undefined) {
      // Se tem propriedade length, converter para array
      imageArray = Array.from(images);
    } else {
      // Se é um objeto simples, retornar array vazio
      console.warn('Objeto de imagens não reconhecido:', images);
      return [];
    }
  } else {
    return [];
  }

  // Validar se é realmente um array
  if (!Array.isArray(imageArray)) {
    console.warn('Imagens processadas não são um array:', imageArray);
    return [];
  }

  // Filtrar apenas strings válidas e converter para URLs da API secure-files
  return imageArray
    .filter(img => {
      // Accept objects with url property (new Blob format)
      if (typeof img === 'object' && img !== null && img.url) return true;
      const isValid = typeof img === 'string' && img.trim() && img !== '[' && img !== ']';
      return isValid;
    })
    .map(item => {
      // Handle object format from new Blob uploads: { url, sequence, uploadedAt }
      if (typeof item === 'object' && item !== null && item.url) {
        return item.url;
      }

      const filename = typeof item === 'string' ? item : String(item);

      // If already a full URL (blob or external), return as-is
      if (filename.startsWith('http') || filename.startsWith('/api/')) {
        return filename;
      }

      // Legacy: convert plain filename to secure-files API URL
      return `/api/secure-files?path=users/listings/${filename}&type=listing`;
    });
}

/**
 * Retorna a primeira imagem válida de um listing
 * @param {string|Array} images - Campo images do banco de dados
 * @returns {string|null} URL da primeira imagem ou null
 */
export function getFirstListingImage(images) {
  const processedImages = processListingImages(images);
  return processedImages.length > 0 ? processedImages[0] : null;
}

/**
 * Verifica se um listing tem imagens válidas
 * @param {string|Array} images - Campo images do banco de dados
 * @returns {boolean} True se tem imagens válidas
 */
export function hasValidImages(images) {
  return processListingImages(images).length > 0;
}