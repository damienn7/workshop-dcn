import { z } from 'zod';

export const BuybackCaseStatus = z.enum([
  'pending',
  'diagnosis_in_progress',
  'accepted',
  'conditional',
  'refused',
  'completed'
]);

export const ArticleType = z.enum(['bike', 'scooter', 'roller', 'child_bike']);

export const CustomerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  email: z.string().optional()
});

export const ItemSchema = z.object({
  articleType: ArticleType,
  category: z.string().optional(),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  frameSize: z.string().optional(),
  serialNumber: z.string().optional(),
  declaredKm: z.number().optional(),
  estimatedBasePrice: z.number().optional()
});

export const PreDiagnosticSchema = z
  .object({
    generalState: z.string(),
    frame: z.string(),
    brakes: z.string(),
    transmission: z.string(),
    wheels: z.string(),
    photos: z.array(z.string()).optional()
  })
  .optional();

export const BuybackCaseSchema = z.object({
  id: z.string(),
  caseNumber: z.string(),
  status: BuybackCaseStatus,
  customer: CustomerSchema,
  item: ItemSchema,
  preDiagnostic: PreDiagnosticSchema.optional(),
  customerScore: z.number().optional(),
  onlineEstimate: z.number().optional(),
  finalOffer: z.number().nullable().optional(),
  diagnosis: z.any().optional(),
  scoring: z.any().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  refusalReasons: z.array(z.string()).optional(),
  refusalAlternatives: z.array(z.string()).optional()
});

export const NewCaseSchema = z.object({
  customer: CustomerSchema,
  item: ItemSchema.pick({
    articleType: true,
    category: true,
    brand: true,
    model: true,
    year: true,
    frameSize: true,
    serialNumber: true,
    estimatedBasePrice: true
  })
});

export type BuybackCase = z.infer<typeof BuybackCaseSchema>;
export type NewCasePayload = z.infer<typeof NewCaseSchema>;
