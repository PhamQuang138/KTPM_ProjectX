import {z} from 'zod';
import {prisma} from '../config/prisma';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_OPENROUTER_MODEL = 'nex-agi/nex-n2-pro:free';

const getOpenRouterConfig = () => {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error('OPENROUTER_NOT_CONFIGURED');

  return {
    apiKey,
    model: process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL,
  };
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
      minPriceVnd: z.number().nonnegative().nullable().default(null),
      maxPriceVnd: z.number().positive().nullable().default(null),
      location: z.string().trim().max(120).nullable().default(null),
      keywords: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
      limit: z.number().int().min(1).max(20).nullable().default(null),
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
        'minYear', 'maxYear', 'minPriceVnd', 'maxPriceVnd', 'location', 'keywords', 'limit',
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
        minPriceVnd: {anyOf: [{type: 'number'}, {type: 'null'}]},
        maxPriceVnd: {anyOf: [{type: 'number'}, {type: 'null'}]},
        location: {anyOf: [{type: 'string'}, {type: 'null'}]},
        keywords: {type: 'array', items: {type: 'string'}},
        limit: {anyOf: [{type: 'integer'}, {type: 'null'}]},
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
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return null;
  const number = Number(digits);
  return Number.isFinite(number) ? number : null;
};

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

const loadImageDataUrl = async (imageUrl: string) => {
  if (!imageUrlAllowed(imageUrl)) throw new Error('IMAGE_URL_NOT_ALLOWED');
  const response = await fetch(imageUrl, {signal: AbortSignal.timeout(12_000)});
  if (!response.ok) throw new Error('IMAGE_DOWNLOAD_FAILED');
  const mimeType = response.headers.get('content-type')?.split(';')[0] ?? '';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new Error('IMAGE_TYPE_NOT_SUPPORTED');
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 4 * 1024 * 1024) throw new Error('IMAGE_TOO_LARGE');
  return `data:${mimeType};base64,${bytes.toString('base64')}`;
};

const analyzeRequest = async (
  message: string,
  imageUrl?: string,
  history: ConversationMessage[] = [],
): Promise<VehicleIntent> => {
  const {apiKey, model} = getOpenRouterConfig();
  const userContent: Array<
    {type: 'text'; text: string} |
    {type: 'image_url'; image_url: {url: string}}
  > = [{
    type: 'text',
    text: `Yêu cầu của người dùng: ${message || 'Hãy nhận dạng chiếc xe trong ảnh và tìm xe tương tự.'}`,
  }];
  if (imageUrl) {
    userContent.push({
      type: 'image_url',
      image_url: {url: await loadImageDataUrl(imageUrl)},
    });
  }

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer':
        process.env.OPENROUTER_SITE_URL?.trim() ||
        process.env.PUBLIC_BACKEND_URL?.trim() ||
        'http://localhost:3000',
      'X-Title': process.env.OPENROUTER_APP_NAME?.trim() || 'CarHub Garage',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `Bạn là trợ lý tìm xe của CarHub.
Phân tích câu hỏi tiếng Việt và ảnh đầu vào thành bộ lọc tìm kiếm.
Không bịa listing, giá hay người bán. Listing thật sẽ do backend truy vấn sau.
answer là câu trả lời ngắn bằng tiếng Việt, mô tả điều bạn hiểu và lưu ý độ chắc chắn nếu nhận dạng ảnh.
Giá xe trên CarHub được lưu và hiển thị bằng VND. Luôn nói giá bằng triệu đồng hoặc tỷ đồng, không dùng USD.

Quy tắc ngân sách:
- Điền minPriceVnd và maxPriceVnd bằng số VND nguyên. Ví dụ 500 triệu = 500000000, 1 tỷ = 1000000000.
- "Dưới 700 triệu" => maxPriceVnd=700000000.
- "Từ 600 đến 900 triệu" => minPriceVnd=600000000, maxPriceVnd=900000000.
- Nếu người dùng hỏi xe "giá tốt", "giá hợp lý", "đáng tiền" hoặc yêu cầu gợi ý ngân sách nhưng không nêu con số, dùng khoảng hợp lý mặc định từ 500000000 đến 1000000000 VND và nói rõ đây là khoảng tham khảo.
- Nếu không có ý định về giá thì để cả hai là null.

Quy tắc xuất xứ:
- "Xe Nhật" gồm Toyota, Honda, Mazda, Mitsubishi, Nissan, Suzuki, Subaru và Lexus.
- "Xe Hàn" gồm Hyundai, Kia và Genesis.
- Khi người dùng nói theo xuất xứ, điền các hãng tương ứng vào filters.makes, không chỉ đưa "xe Nhật" hoặc "xe Hàn" vào keywords.

Đây là hội thoại nhiều lượt. Hãy dùng lịch sử gần nhất để hiểu các câu nối tiếp như "còn xe Nhật thì sao", "loại rẻ hơn", "đời mới hơn" hoặc "3 chiếc thôi". Giữ lại tiêu chí trước đó nếu người dùng không yêu cầu thay đổi; tiêu chí mới sẽ bổ sung hoặc thay thế tiêu chí liên quan.
Nếu người dùng yêu cầu số lượng kết quả, ví dụ:
- "tìm 3 xe"
- "cho tôi 5 chiếc"
- "top 10 xe SUV"

thì điền filters.limit bằng số lượng đó.

Nếu không đề cập số lượng thì để null.

Giới hạn tối đa 20 kết quả.
Không tự suy đoán ngân sách của người dùng.
Nếu câu hỏi chỉ hỏi kiến thức ô tô, trả lời hữu ích trong answer và đặt shouldSearch=false.
Nếu có ảnh, hãy nhận dạng thận trọng; model/năm không chắc thì để null hoặc dùng khoảng năm.`,
        },
        ...history.map((item) => ({role: item.role, content: item.content})),
        {role: 'user', content: userContent},
      ],
      temperature: 0.1,
      max_tokens: 800,
      reasoning: {effort: 'low', exclude: true},
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'vehicle_search_intent',
          strict: true,
          schema: responseJsonSchema,
        },
      },
      plugins: [{id: 'response-healing'}],
    }),
    signal: AbortSignal.timeout(75_000),
  });

  const payload = await response.json() as {
    error?: {message?: string};
    choices?: Array<{message?: {content?: string | null}}>;
  };
  if (!response.ok) {
    throw new Error(`OPENROUTER_HTTP_${response.status}:${payload.error?.message ?? response.statusText}`);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('OPENROUTER_EMPTY_RESPONSE');

  return vehicleIntentSchema.parse(JSON.parse(content));
};

const matchesAny = (value: string | null | undefined, expected: string[]) => {
  if (!expected.length) return true;
  const normalizedValue = normalize(value);
  return expected.some((item) => normalizedValue.includes(normalize(item)));
};

export const aiService = {
  async chat(message: string, imageUrl?: string, history: ConversationMessage[] = []) {
    const intent = await analyzeRequest(message, imageUrl, history);
    const normalizedMessage = normalize(message);
    const regionalMakes = normalizedMessage.includes('xe nhat') || normalizedMessage.includes('nhat ban')
      ? ['Toyota', 'Honda', 'Mazda', 'Mitsubishi', 'Nissan', 'Suzuki', 'Subaru', 'Lexus']
      : normalizedMessage.includes('xe han') || normalizedMessage.includes('han quoc')
        ? ['Hyundai', 'Kia', 'Genesis']
        : [];
    if (regionalMakes.length) {
      intent.filters.makes = [...new Set([...intent.filters.makes, ...regionalMakes])];
    }
    const asksForGoodValue = [
      'gia tot',
      'gia hop ly',
      'dang tien',
      'tam gia nao',
      'muc gia nao',
      'ngan sach hop ly',
    ].some((phrase) => normalizedMessage.includes(phrase));
    if (asksForGoodValue && intent.filters.minPriceVnd === null && intent.filters.maxPriceVnd === null) {
      intent.filters.minPriceVnd = 500_000_000;
      intent.filters.maxPriceVnd = 1_000_000_000;
    }
    if (!intent.shouldSearch) {
      return {answer: intent.answer, filters: intent.filters, imageAnalysis: intent.imageAnalysis, listings: []};
    }

    const imageAnalysis = intent.imageAnalysis;
    const makes = [...intent.filters.makes, ...(imageAnalysis?.make ? [imageAnalysis.make] : [])];
    const models = [...intent.filters.models, ...(imageAnalysis?.model ? [imageAnalysis.model] : [])];
    const bodyTypes = [...intent.filters.bodyTypes, ...(imageAnalysis?.bodyType ? [imageAnalysis.bodyType] : [])];
    const minYear = intent.filters.minYear ?? imageAnalysis?.estimatedYearFrom ?? null;
    const maxYear = intent.filters.maxYear ?? imageAnalysis?.estimatedYearTo ?? null;
    const limit = Math.min(Math.max(intent.filters.limit ?? 6, 1), 20);
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
        if (intent.filters.minPriceVnd && priceVnd && priceVnd >= intent.filters.minPriceVnd) score += 2;
        if (intent.filters.maxPriceVnd && priceVnd && priceVnd <= intent.filters.maxPriceVnd) score += 3;
        if (intent.filters.minPriceVnd && priceVnd && priceVnd < intent.filters.minPriceVnd) score -= 6;
        if (intent.filters.maxPriceVnd && priceVnd && priceVnd > intent.filters.maxPriceVnd) score -= 8;
        return {listing, score};
      })
      .filter(({listing, score}) => {
        const vehicle = listing.vehicle;
        if (makes.length && !matchesAny(vehicle?.make, makes)) return false;
        if (models.length && !matchesAny(vehicle?.model, models)) return false;
        if (bodyTypes.length && !matchesAny(vehicle?.bodyType, bodyTypes)) return false;
        if (intent.filters.conditions.length && !matchesAny(vehicle?.condition, intent.filters.conditions)) return false;
        if (intent.filters.fuelTypes.length && !matchesAny(vehicle?.fuelType, intent.filters.fuelTypes)) return false;
        if (intent.filters.transmissions.length && !matchesAny(vehicle?.transmission, intent.filters.transmissions)) return false;
        if (minYear && vehicle?.year && vehicle.year < minYear) return false;
        if (maxYear && vehicle?.year && vehicle.year > maxYear) return false;
        const priceVnd = parseVndPrice(listing.price);
        if (intent.filters.minPriceVnd && priceVnd && priceVnd < intent.filters.minPriceVnd) return false;
        if (intent.filters.maxPriceVnd && priceVnd && priceVnd > intent.filters.maxPriceVnd) return false;
        return score > 0 || (!keywords.length && !makes.length && !models.length);
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, limit)
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
    const budgetSummary = asksForGoodValue
      ? ' Với nhu cầu tìm xe giá tốt nhưng chưa nêu ngân sách, khoảng 500 triệu đến 1 tỷ đồng là mức tham khảo hợp lý để có nhiều lựa chọn xe phổ thông đời tương đối mới.'
      : '';

    return {
      answer: `${intent.answer}${budgetSummary}${resultSummary}`,
      filters: {
      ...intent.filters,
      makes,
      models,
      bodyTypes,
      minYear,
      maxYear,
      limit,
      },
      imageAnalysis,
      listings: ranked,
    };
  },
};
