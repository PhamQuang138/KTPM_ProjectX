import dotenv from 'dotenv';
dotenv.config();

import {GoogleGenAI} from '@google/genai';
import {z} from 'zod';
import {prisma} from '../config/prisma';
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    console.log('GEMINI_API_KEY =', process.env.GEMINI_API_KEY);
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  return new GoogleGenAI({apiKey});
};
const vehicleIntentSchema = z.object({
  answer: z.string().trim().min(1).max(2000),
  shouldSearch: z.boolean().default(true),
  filters: z.object({
    makes: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
    models: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
    bodyTypes: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
    conditions: z.array(z.string().trim().min(1).max(40)).max(4).default([]),
    fuelTypes: z.array(z.string().trim().min(1).max(40)).max(6).default([]),
    transmissions: z.array(z.string().trim().min(1).max(40)).max(4).default([]),
    minYear: z.number().int().min(1886).max(2100).nullable().default(null),
    maxYear: z.number().int().min(1886).max(2100).nullable().default(null),
    maxPriceVnd: z.number().positive().nullable().default(null),
    location: z.string().trim().max(120).nullable().default(null),
    keywords: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
  }),
  imageAnalysis: z.object({
    make: z.string().trim().max(80).nullable().default(null),
    model: z.string().trim().max(80).nullable().default(null),
    bodyType: z.string().trim().max(80).nullable().default(null),
    estimatedYearFrom: z.number().int().min(1886).max(2100).nullable().default(null),
    estimatedYearTo: z.number().int().min(1886).max(2100).nullable().default(null),
    confidence: z.number().min(0).max(1).nullable().default(null),
  }).nullable().default(null),
});

type VehicleIntent = z.infer<typeof vehicleIntentSchema>;

const responseJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['answer', 'shouldSearch', 'filters', 'imageAnalysis'],
  properties: {
    answer: {type: 'string'},
    shouldSearch: {type: 'boolean'},
    filters: {
      type: 'object',
      additionalProperties: false,
      required: [
        'makes', 'models', 'bodyTypes', 'conditions', 'fuelTypes', 'transmissions',
        'minYear', 'maxYear', 'maxPriceVnd', 'location', 'keywords',
      ],
      properties: {
        makes: {type: 'array', items: {type: 'string'}},
        models: {type: 'array', items: {type: 'string'}},
        bodyTypes: {type: 'array', items: {type: 'string'}},
        conditions: {type: 'array', items: {type: 'string'}},
        fuelTypes: {type: 'array', items: {type: 'string'}},
        transmissions: {type: 'array', items: {type: 'string'}},
        minYear: {anyOf: [{type: 'integer'}, {type: 'null'}]},
        maxYear: {anyOf: [{type: 'integer'}, {type: 'null'}]},
        maxPriceVnd: {anyOf: [{type: 'number'}, {type: 'null'}]},
        location: {anyOf: [{type: 'string'}, {type: 'null'}]},
        keywords: {type: 'array', items: {type: 'string'}},
      },
    },
    imageAnalysis: {
      anyOf: [
        {type: 'null'},
        {
          type: 'object',
          additionalProperties: false,
          required: ['make', 'model', 'bodyType', 'estimatedYearFrom', 'estimatedYearTo', 'confidence'],
          properties: {
            make: {anyOf: [{type: 'string'}, {type: 'null'}]},
            model: {anyOf: [{type: 'string'}, {type: 'null'}]},
            bodyType: {anyOf: [{type: 'string'}, {type: 'null'}]},
            estimatedYearFrom: {anyOf: [{type: 'integer'}, {type: 'null'}]},
            estimatedYearTo: {anyOf: [{type: 'integer'}, {type: 'null'}]},
            confidence: {anyOf: [{type: 'number'}, {type: 'null'}]},
          },
        },
      ],
    },
  },
};

const normalize = (value?: string | null) =>
  value?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() ?? '';

const parseVndPrice = (value: string): number | null => {
  const normalized = normalize(value).replace(/,/g, '.');
  const number = Number(normalized.match(/\d+(?:\.\d+)?/)?.[0]);
  if (!Number.isFinite(number)) return null;
  if (normalized.includes('ty')) return number * 1_000_000_000;
  if (normalized.includes('trieu')) return number * 1_000_000;
  if (normalized.includes('vnd') || value.includes('đ')) {
    const digits = Number(value.replace(/\D/g, ''));
    return Number.isFinite(digits) ? digits : null;
  }
  return null;
};

const imageUrlAllowed = (imageUrl: string) => {
  const url = new URL(imageUrl);
  const configuredHost = process.env.PUBLIC_BACKEND_URL
    ? new URL(process.env.PUBLIC_BACKEND_URL).hostname
    : '';
  return (
    ['http:', 'https:'].includes(url.protocol) &&
    (
      ['localhost', '127.0.0.1'].includes(url.hostname) ||
      url.hostname === configuredHost ||
      url.hostname.endsWith('.vercel-storage.com')
    )
  );
};

const loadImagePart = async (imageUrl: string) => {
  if (!imageUrlAllowed(imageUrl)) throw new Error('IMAGE_URL_NOT_ALLOWED');
  const response = await fetch(imageUrl, {signal: AbortSignal.timeout(12_000)});
  if (!response.ok) throw new Error('IMAGE_DOWNLOAD_FAILED');
  const mimeType = response.headers.get('content-type')?.split(';')[0] ?? '';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new Error('IMAGE_TYPE_NOT_SUPPORTED');
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 4 * 1024 * 1024) throw new Error('IMAGE_TOO_LARGE');
  return {inlineData: {mimeType, data: bytes.toString('base64')}};
};

const analyzeRequest = async (message: string, imageUrl?: string): Promise<VehicleIntent> => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_NOT_CONFIGURED');

  const ai = getGeminiClient();
  const parts: Array<{text: string} | {inlineData: {mimeType: string; data: string}}> = [
    {
      text: `Yêu cầu của người dùng: ${message || 'Hãy nhận dạng chiếc xe trong ảnh và tìm xe tương tự.'}`,
    },
  ];
  if (imageUrl) parts.unshift(await loadImagePart(imageUrl));

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
    contents: [{role: 'user', parts}],
    config: {
      temperature: 0.1,
      maxOutputTokens: 1200,
      responseMimeType: 'application/json',
      responseJsonSchema,
      systemInstruction: `Bạn là trợ lý tìm xe của CarHub.
Phân tích câu hỏi tiếng Việt và ảnh đầu vào thành bộ lọc tìm kiếm.
Không bịa listing, giá hay người bán. Listing thật sẽ do backend truy vấn sau.
answer là câu trả lời ngắn bằng tiếng Việt, mô tả điều bạn hiểu và lưu ý độ chắc chắn nếu nhận dạng ảnh.
Chỉ điền maxPriceVnd khi người dùng nêu giá bằng VND, đồng, triệu hoặc tỷ.
Nếu câu hỏi chỉ hỏi kiến thức ô tô, trả lời hữu ích trong answer và đặt shouldSearch=false.
Nếu có ảnh, hãy nhận dạng thận trọng; model/năm không chắc thì để null hoặc dùng khoảng năm.`,
    },
  });

  return vehicleIntentSchema.parse(JSON.parse(response.text || '{}'));
};

const matchesAny = (value: string | null | undefined, expected: string[]) => {
  if (!expected.length) return true;
  const normalizedValue = normalize(value);
  return expected.some((item) => normalizedValue.includes(normalize(item)));
};

export const aiService = {
  async chat(message: string, imageUrl?: string) {
    const intent = await analyzeRequest(message, imageUrl);
    if (!intent.shouldSearch) {
      return {answer: intent.answer, filters: intent.filters, imageAnalysis: intent.imageAnalysis, listings: []};
    }

    const imageAnalysis = intent.imageAnalysis;
    const makes = [...intent.filters.makes, ...(imageAnalysis?.make ? [imageAnalysis.make] : [])];
    const models = [...intent.filters.models, ...(imageAnalysis?.model ? [imageAnalysis.model] : [])];
    const bodyTypes = [...intent.filters.bodyTypes, ...(imageAnalysis?.bodyType ? [imageAnalysis.bodyType] : [])];
    const minYear = intent.filters.minYear ?? imageAnalysis?.estimatedYearFrom ?? null;
    const maxYear = intent.filters.maxYear ?? imageAnalysis?.estimatedYearTo ?? null;

    const candidates = await prisma.vehicleListing.findMany({
      where: {status: {not: 'Hidden'}},
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            isVerifiedProfessional: true,
          },
        },
        vehicle: true,
        _count: {select: {favorites: true, comments: true}},
      },
      orderBy: {createdAt: 'desc'},
      take: 120,
    });

    const keywords = [
      ...intent.filters.keywords,
      ...makes,
      ...models,
      ...bodyTypes,
    ].map(normalize).filter(Boolean);

    const ranked = candidates
      .map((listing) => {
        const vehicle = listing.vehicle;
        const searchable = normalize([
          listing.title,
          listing.description,
          listing.location,
          listing.category,
          vehicle?.make,
          vehicle?.model,
          vehicle?.bodyType,
          vehicle?.fuelType,
          vehicle?.transmission,
          ...(vehicle?.specs ?? []),
        ].filter(Boolean).join(' '));
        let score = listing._count.favorites * 0.2 + listing._count.comments * 0.15;
        score += keywords.filter((keyword) => searchable.includes(keyword)).length * 3;
        if (matchesAny(vehicle?.make, makes)) score += makes.length ? 5 : 0;
        if (matchesAny(vehicle?.model, models)) score += models.length ? 5 : 0;
        if (matchesAny(vehicle?.bodyType, bodyTypes)) score += bodyTypes.length ? 3 : 0;
        if (matchesAny(vehicle?.condition, intent.filters.conditions)) score += intent.filters.conditions.length ? 2 : 0;
        if (matchesAny(vehicle?.fuelType, intent.filters.fuelTypes)) score += intent.filters.fuelTypes.length ? 2 : 0;
        if (matchesAny(vehicle?.transmission, intent.filters.transmissions)) score += intent.filters.transmissions.length ? 2 : 0;
        if (intent.filters.location && normalize(listing.location).includes(normalize(intent.filters.location))) score += 3;
        if (minYear && vehicle?.year && vehicle.year >= minYear) score += 2;
        if (maxYear && vehicle?.year && vehicle.year <= maxYear) score += 2;

        const priceVnd = parseVndPrice(listing.price);
        if (intent.filters.maxPriceVnd && priceVnd && priceVnd <= intent.filters.maxPriceVnd) score += 3;
        if (intent.filters.maxPriceVnd && priceVnd && priceVnd > intent.filters.maxPriceVnd) score -= 8;

        return {listing, score};
      })
      .filter(({listing, score}) => {
        const vehicle = listing.vehicle;
        if (makes.length && !matchesAny(vehicle?.make, makes) && score < 3) return false;
        if (models.length && !matchesAny(vehicle?.model, models) && score < 3) return false;
        if (minYear && vehicle?.year && vehicle.year < minYear) return false;
        if (maxYear && vehicle?.year && vehicle.year > maxYear) return false;
        return score > 0 || (!keywords.length && !makes.length && !models.length);
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 6)
      .map(({listing, score}) => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        image: listing.vehicle?.image ?? '',
        make: listing.vehicle?.make,
        model: listing.vehicle?.model,
        year: listing.vehicle?.year,
        condition: listing.vehicle?.condition,
        score: Number(score.toFixed(2)),
        seller: listing.seller,
      }));

    const resultSummary = ranked.length
      ? ` Tôi tìm thấy ${ranked.length} tin phù hợp nhất trong chợ xe.`
      : ' Hiện chưa có tin xe nào khớp đủ gần với yêu cầu này.';

    return {
      answer: `${intent.answer}${resultSummary}`,
      filters: {...intent.filters, makes, models, bodyTypes, minYear, maxYear},
      imageAnalysis,
      listings: ranked,
    };
  },
};
