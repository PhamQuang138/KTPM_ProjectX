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
      makes: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
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
  value
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
    .trim() ?? '';

const makeAliases = new Map<string, string[]>([
  ['Toyota', ['toyota']],
  ['Honda', ['honda']],
  ['Mazda', ['mazda']],
  ['Mitsubishi', ['mitsubishi']],
  ['Nissan', ['nissan']],
  ['Suzuki', ['suzuki']],
  ['Subaru', ['subaru']],
  ['Lexus', ['lexus']],
  ['Hyundai', ['hyundai']],
  ['Kia', ['kia']],
  ['Genesis', ['genesis']],
  ['Ford', ['ford']],
  ['VinFast', ['vinfast', 'vin fast']],
  ['BMW', ['bmw']],
  ['Mercedes-Benz', ['mercedes-benz', 'mercedes benz', 'mercedes', 'mec']],
  ['Audi', ['audi']],
  ['Volkswagen', ['volkswagen', 'vw']],
  ['Volvo', ['volvo']],
  ['Peugeot', ['peugeot']],
  ['Renault', ['renault']],
  ['Porsche', ['porsche']],
  ['Land Rover', ['land rover', 'range rover']],
  ['Bentley', ['bentley']],
  ['Ferrari', ['ferrari']],
  ['Lamborghini', ['lamborghini', 'lambo']],
  ['McLaren', ['mclaren']],
  ['Aston Martin', ['aston martin', 'aston']],
]);

const extractMakes = (message: string): string[] => {
  const normalized = normalize(message);
  return [...makeAliases.entries()]
    .filter(([, aliases]) => aliases.some((alias) => normalized.includes(alias)))
    .map(([make]) => make);
};

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

const vietnameseNumberWords = new Map<string, number>([
  ['mot', 1],
  ['hai', 2],
  ['ba', 3],
  ['bon', 4],
  ['tu', 4],
  ['nam', 5],
  ['sau', 6],
  ['bay', 7],
  ['tam', 8],
  ['chin', 9],
  ['muoi', 10],
]);

const extractRequestedLimit = (message: string): number | null => {
  const normalized = normalize(message);
  const numericMatch = normalized.match(
    /\b(\d{1,2})\s*(?:mau(?:\s*xe)?|xe|chiec|con|lua chon|ket qua)\b/,
  );
  if (numericMatch) return Math.min(Math.max(Number(numericMatch[1]), 1), 20);

  const wordPattern = [...vietnameseNumberWords.keys()].join('|');
  const wordMatch = normalized.match(
    new RegExp(`\\b(${wordPattern})\\s*(?:mau(?:\\s*xe)?|xe|chiec|con|lua chon|ket qua)\\b`),
  );
  if (wordMatch) return vietnameseNumberWords.get(wordMatch[1]) ?? null;

  return null;
};

const resolveRequestedLimit = (
  message: string,
  history: ConversationMessage[],
): number | null => {
  const currentLimit = extractRequestedLimit(message);
  if (currentLimit !== null) return currentLimit;

  for (const item of [...history].reverse()) {
    if (item.role !== 'user') continue;
    const historicalLimit = extractRequestedLimit(item.content);
    if (historicalLimit !== null) return historicalLimit;
  }
  return null;
};

interface OpenRouterPayload {
  error?: {message?: string};
  choices?: Array<{
    finish_reason?: string | null;
    message?: {
      content?: string | Array<{type?: string; text?: string}> | null;
      refusal?: string | null;
    };
  }>;
}

const extractResponseText = (payload: OpenRouterPayload): string => {
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((item) => item.text ?? '')
      .join('')
      .trim();
  }
  return '';
};

const parseIntentJson = (content: string): VehicleIntent => {
  const normalized = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  return vehicleIntentSchema.parse(JSON.parse(normalized));
};

const fallbackIntent = (message: string, history: ConversationMessage[]): VehicleIntent => {
  const previousUserMessages = history.filter((item) => item.role === 'user');
  const conversation = normalize([...previousUserMessages.map((item) => item.content), message].join(' '));
  const current = normalize(message);
  const currentMakes = extractMakes(message);
  const inheritedMakes = [...previousUserMessages]
    .reverse()
    .map((item) => extractMakes(item.content))
    .find((items) => items.length) ?? [];
  const makes = currentMakes.length ? currentMakes : inheritedMakes;
  if (current.includes('xe nhat') || current.includes('nhat ban')) {
    makes.push('Toyota', 'Honda', 'Mazda', 'Mitsubishi', 'Nissan', 'Suzuki', 'Subaru', 'Lexus');
  }
  if (current.includes('xe han') || current.includes('han quoc')) {
    makes.push('Hyundai', 'Kia', 'Genesis');
  }
  if (current.includes('xe chau au') || current.includes('chau au') || current.includes('xe duc')) {
    makes.push(
      'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Volvo', 'Peugeot', 'Renault',
      'Porsche', 'Land Rover', 'Bentley', 'Ferrari', 'Lamborghini', 'McLaren', 'Aston Martin',
    );
  }

  const bodyTypes = [
    ['SUV', ['suv']],
    ['Sedan', ['sedan']],
    ['Crossover', ['crossover']],
    ['Hatchback', ['hatchback']],
    ['Pickup', ['ban tai', 'pickup']],
    ['MPV', ['mpv', '7 cho']],
  ].filter(([, aliases]) => (aliases as string[]).some((alias) => conversation.includes(alias)))
    .map(([bodyType]) => bodyType as string);
  const underMillions = current.match(/(?:duoi|toi da|khong qua)\s*(\d{2,4})\s*trieu/);
  const rangeMillions = current.match(/(?:tu|khoang)\s*(\d{2,4})\s*(?:den|-)\s*(\d{2,4})\s*trieu/);
  const billionDecimal = current.match(/(\d+)\s*(?:ty|ti)\s*(\d{1,2})?/);
  const aroundBillion = /(?:tren duoi|khoang|tam|xap xi)/.test(current) && billionDecimal
    ? (Number(billionDecimal[1]) + Number(`0.${billionDecimal[2] ?? 0}`)) * 1_000_000_000
    : null;
  const asksForGoodValue = ['gia tot', 'gia hop ly', 'dang tien'].some((phrase) => current.includes(phrase));
  const regionLabel = current.includes('chau au')
    ? ' châu Âu'
    : current.includes('xe nhat') || current.includes('nhat ban')
      ? ' Nhật'
      : current.includes('xe han') || current.includes('han quoc')
        ? ' Hàn Quốc'
        : '';
  const requestedCount = resolveRequestedLimit(message, history);
  const wantsHighestPrice = ['dat nhat', 'gia cao nhat', 'cao gia nhat', 'mac nhat']
    .some((phrase) => current.includes(phrase));
  const wantsLowestPrice = ['re nhat', 'gia thap nhat', 'thap gia nhat']
    .some((phrase) => current.includes(phrase));
  const budgetLabel = aroundBillion
    ? ` trong khoảng ${(aroundBillion * 0.8 / 1_000_000_000).toLocaleString('vi-VN')} đến ${(aroundBillion * 1.2 / 1_000_000_000).toLocaleString('vi-VN')} tỷ đồng`
    : '';
  const makeLabel = makes.length === 1 ? ` ${makes[0]}` : regionLabel;
  const orderingLabel = wantsHighestPrice
    ? ' và xếp theo giá từ cao xuống thấp'
    : wantsLowestPrice
      ? ' và xếp theo giá từ thấp lên cao'
      : '';

  return vehicleIntentSchema.parse({
    answer: `Mình sẽ lọc ${requestedCount ? `đúng ${requestedCount} ` : ''}mẫu xe${makeLabel}${budgetLabel}${orderingLabel}.`,
    shouldSearch: true,
    filters: {
      makes: [...new Set(makes)],
      models: [],
      bodyTypes,
      conditions: [],
      fuelTypes: [],
      transmissions: [],
      minYear: null,
      maxYear: null,
      minPriceVnd: rangeMillions
        ? Number(rangeMillions[1]) * 1_000_000
        : aroundBillion
          ? Math.round(aroundBillion * 0.8)
          : asksForGoodValue
            ? 500_000_000
            : null,
      maxPriceVnd: rangeMillions
        ? Number(rangeMillions[2]) * 1_000_000
        : underMillions
          ? Number(underMillions[1]) * 1_000_000
          : aroundBillion
            ? Math.round(aroundBillion * 1.2)
          : asksForGoodValue
            ? 1_000_000_000
            : null,
      location: null,
      keywords: [],
      limit: requestedCount,
    },
    imageAnalysis: null,
  });
};

const shouldUseLocalSearch = (message: string): boolean => {
  const normalizedMessage = normalize(message);
  const rawMessage = message.toLowerCase();
  const hasSearchIntent =
    ['tim', 'goi y', 'cho toi', 'can mua', 'dat nhat', 're nhat', 'cao nhat', 'thap nhat']
      .some((word) => normalizedMessage.includes(word)) ||
    ['tìm', 'gợi ý', 'cho tôi', 'cần mua'].some((word) => rawMessage.includes(word));
  const hasStructuredFilter = [
    'xe chau au', 'chau au', 'xe nhat', 'xe han', 'suv', 'sedan', 'ban tai',
    'trieu', 'ty', 'ti', 'gia', 'duoi', 'khoang', 'tren duoi', 'dat nhat', 're nhat',
  ].some((word) => normalizedMessage.includes(word)) ||
    ['châu âu', 'xe nhật', 'xe hàn', 'triệu', 'tỷ', 'tỉ', 'giá', 'dưới', 'khoảng', 'trên dưới']
      .some((word) => rawMessage.includes(word));
  return hasSearchIntent && (hasStructuredFilter || extractMakes(message).length > 0);
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
  // if (!imageUrl && shouldUseLocalSearch(message)) {
  //   return fallbackIntent(message, history);
  // }

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

  const messages = [
        {
          role: 'system',
          content: `Bạn là CarHub AI Premium, chuyên gia tư vấn ô tô tại Việt Nam.

Mục tiêu của bạn gồm hai nhiệm vụ:

1. Tư vấn và trò chuyện với người dùng như một chuyên gia ô tô thực thụ.
2. Trích xuất chính xác bộ lọc tìm kiếm để backend tìm listing phù hợp.

========================
NGUYÊN TẮC HOẠT ĐỘNG
====================

* Luôn trả lời bằng tiếng Việt tự nhiên.
* Luôn ưu tiên giúp người dùng đưa ra quyết định mua xe.
* Có thể phân tích, so sánh, đánh giá và đưa ra nhận định chuyên môn.
* Không bịa thông tin về listing, người bán hoặc dữ liệu không có.
* Không bịa giá xe cụ thể nếu không chắc chắn.
* Nếu thiếu dữ liệu, hãy nói rõ đó chỉ là nhận định chung.
* Nếu câu hỏi mơ hồ, hãy suy luận hợp lý từ ngữ cảnh hội thoại gần nhất.
* Trả lời thân thiện, chuyên nghiệp và thực tế.

========================
KIẾN THỨC CHUYÊN MÔN
====================

Bạn có kiến thức sâu về:

* Xe mới
* Xe cũ
* Xe dịch vụ
* Xe gia đình
* Xe doanh nhân
* Xe điện
* Xe hybrid
* SUV
* Sedan
* MPV
* Pickup
* Hatchback
* Crossover

Bạn hiểu:

* Độ bền
* Khả năng giữ giá
* Chi phí bảo dưỡng
* Chi phí sử dụng
* Mức tiêu hao nhiên liệu
* Độ an toàn
* Độ tin cậy
* Giá trị sử dụng lâu dài

========================
KHI NGƯỜI DÙNG MUỐN TƯ VẤN XE
=============================

Ví dụ:

* Xe nào đáng mua dưới 1 tỷ?
* CX5 hay Tucson?
* CRV hay Everest?
* Xe cho gia đình 5 người?
* Xe chạy dịch vụ?
* Xe tiết kiệm xăng?
* Xe giữ giá tốt?

=> shouldSearch = true

answer phải:

* phân tích nhu cầu người dùng
* giải thích lý do
* đưa ra ưu điểm
* đưa ra nhược điểm
* đưa ra lời khuyên thực tế
* kết luận rõ ràng

Ví dụ:

"Với ngân sách khoảng 1 tỷ đồng, Mazda CX-5, Hyundai Tucson và Honda CR-V đều là những lựa chọn đáng cân nhắc. Nếu ưu tiên độ bền, giữ giá và chi phí sử dụng thấp thì CX-5 nổi bật hơn. Nếu thích nhiều công nghệ và trang bị tiện nghi thì Tucson hấp dẫn hơn. Nếu cần không gian rộng và giá trị bán lại tốt thì CR-V là lựa chọn đáng xem xét."

Không trả lời quá ngắn.

========================
KHI NGƯỜI DÙNG HỎI KIẾN THỨC Ô TÔ
=================================

Ví dụ:

* Turbo là gì?
* Xe hybrid hoạt động thế nào?
* Hộp số CVT có bền không?
* Bao lâu nên thay dầu hộp số?

=> shouldSearch = false

answer phải giải thích đầy đủ như một chuyên gia.

========================
KHI NGƯỜI DÙNG MUỐN TÌM XE
==========================

Luôn suy luận các bộ lọc:

* hãng xe
* dòng xe
* kiểu thân xe
* đời xe
* ngân sách
* nhiên liệu
* hộp số
* khu vực
* từ khóa liên quan

Ví dụ:

"Tìm SUV Nhật dưới 1 tỷ"

=> hiểu:

bodyType = SUV

makes =
Toyota
Honda
Mazda
Mitsubishi
Nissan
Suzuki
Subaru
Lexus

maxPriceVnd = 1000000000

========================
QUY TẮC XE NHẬT - HÀN - CHÂU ÂU
===============================

Xe Nhật:

Toyota
Honda
Mazda
Mitsubishi
Nissan
Suzuki
Subaru
Lexus

Xe Hàn:

Hyundai
Kia
Genesis

Xe châu Âu:

BMW
Mercedes-Benz
Audi
Volkswagen
Volvo
Porsche
Land Rover
Peugeot
Renault
Bentley
Ferrari
Lamborghini
McLaren
Aston Martin

Khi người dùng nói xe Nhật, xe Hàn hoặc xe châu Âu thì phải tự động chuyển thành danh sách hãng tương ứng trong filters.makes.

========================
HỘI THOẠI NHIỀU LƯỢT
====================

Luôn ghi nhớ ngữ cảnh trước đó.

Ví dụ:

User:
"Tìm SUV dưới 1 tỷ"

User:
"Còn xe Nhật?"

=> vẫn giữ:
SUV
dưới 1 tỷ

User:
"3 chiếc thôi"

=> vẫn giữ:
SUV
dưới 1 tỷ
xe Nhật
limit = 3

Tiêu chí mới sẽ bổ sung hoặc thay thế tiêu chí liên quan.
Không được quên các tiêu chí cũ.

========================
NHẬN DẠNG HÌNH ẢNH
==================

Nếu có ảnh:

* Ước lượng hãng xe
* Ước lượng model
* Ước lượng đời xe
* Ước lượng kiểu thân xe

Nếu không chắc chắn thì để null.

Không được bịa.

========================
OUTPUT
======

Luôn trả về JSON đúng schema được cung cấp.

answer phải hữu ích, tự nhiên, có giá trị tư vấn thực tế.

Nếu người dùng đang cân nhắc mua xe, hãy hành xử như một chuyên gia tư vấn ô tô giàu kinh nghiệm chứ không phải một bộ máy trích xuất filter đơn thuần.
`,
        },
        ...history.map((item) => ({role: item.role, content: item.content})),
        {role: 'user', content: userContent},
      ];

  let lastEmptyReason = 'unknown';
  for (let attempt = 0; attempt < 2; attempt += 1) {
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
        messages,
        temperature: 0.8,
        max_tokens: attempt === 0 ? 1400 : 1800,
        reasoning: {max_tokens: attempt === 0 ? 160 : 96, exclude: true},
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

    const payload = await response.json() as OpenRouterPayload;
    if (!response.ok) {
      throw new Error(`OPENROUTER_HTTP_${response.status}:${payload.error?.message ?? response.statusText}`);
    }

    const content = extractResponseText(payload);
    if (content) {
      try {
        return parseIntentJson(content);
      } catch (error) {
        lastEmptyReason = 'invalid_structured_content';
        console.warn(`OPENROUTER INVALID RESPONSE attempt=${attempt + 1}`, error);
        continue;
      }
    }

    const choice = payload.choices?.[0];
    lastEmptyReason = choice?.message?.refusal || choice?.finish_reason || 'missing_content';
    console.warn(`OPENROUTER EMPTY RESPONSE attempt=${attempt + 1} reason=${lastEmptyReason}`);
  }

  console.warn(`OPENROUTER fallback intent used reason=${lastEmptyReason}`);
  return fallbackIntent(message, history);
};

const matchesAny = (value: string | null | undefined, expected: string[]) => {
  if (!expected.length) return true;
  const normalizedValue = normalize(value);
  return expected.some((item) => normalizedValue.includes(normalize(item)));
};

export const aiService = {
  async chat(message: string, imageUrl?: string, history: ConversationMessage[] = []) {
    const localResolution = !imageUrl && shouldUseLocalSearch(message);
    const intent = localResolution
      ? fallbackIntent(message, history)
      : await analyzeRequest(message, imageUrl, history);
    const normalizedMessage = normalize(message);
    const regionalMakes = normalizedMessage.includes('xe nhat') || normalizedMessage.includes('nhat ban')
      ? ['Toyota', 'Honda', 'Mazda', 'Mitsubishi', 'Nissan', 'Suzuki', 'Subaru', 'Lexus']
      : normalizedMessage.includes('xe han') || normalizedMessage.includes('han quoc')
        ? ['Hyundai', 'Kia', 'Genesis']
        : normalizedMessage.includes('xe chau au') || normalizedMessage.includes('chau au')
          ? [
            'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Volvo', 'Peugeot', 'Renault',
            'Porsche', 'Land Rover', 'Bentley', 'Ferrari', 'Lamborghini', 'McLaren', 'Aston Martin',
          ]
        : [];
    if (regionalMakes.length) {
      intent.filters.makes = [...new Set([...intent.filters.makes, ...regionalMakes])];
    }
    const explicitMakes = extractMakes(message);
    if (explicitMakes.length) {
      intent.filters.makes = explicitMakes;
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
    const requestedLimit = resolveRequestedLimit(message, history);
    if (requestedLimit !== null) {
      intent.filters.limit = requestedLimit;
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
    const wantsHighestPrice = [
      'dat nhat',
      'gia cao nhat',
      'cao gia nhat',
      'mac nhat',
    ].some((phrase) => normalizedMessage.includes(phrase));
    const wantsLowestPrice = [
      're nhat',
      'gia thap nhat',
      'thap gia nhat',
    ].some((phrase) => normalizedMessage.includes(phrase));
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
      take: 300,
    });

    const keywords = [
      ...intent.filters.keywords,
      ...makes,
      ...models,
      ...bodyTypes,
    ].map(normalize).filter(Boolean);
    const requireDistinctModels = /\bmau\b/.test(normalizedMessage);
    const seenModels = new Set<string>();

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
      .sort((left, right) => {
        const leftPrice = parseVndPrice(left.listing.price) ?? 0;
        const rightPrice = parseVndPrice(right.listing.price) ?? 0;
        if (wantsHighestPrice) return rightPrice - leftPrice;
        if (wantsLowestPrice) return leftPrice - rightPrice;
        return right.score - left.score;
      })
      .filter(({listing}) => {
        if (!requireDistinctModels) return true;
        const key = normalize(`${listing.vehicle?.make} ${listing.vehicle?.model}`);
        if (!key || seenModels.has(key)) return false;
        seenModels.add(key);
        return true;
      })
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
      ? wantsHighestPrice
        ? ` Đây là ${ranked.length} mẫu có giá cao nhất đang có trong chợ xe.`
        : wantsLowestPrice
          ? ` Đây là ${ranked.length} mẫu có giá thấp nhất đang có trong chợ xe.`
          : ` Tôi tìm thấy ${ranked.length} tin phù hợp nhất trong chợ xe.`
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
      resolution: localResolution ? 'local' : 'ai',
    };
  },
};
