import { z } from 'zod';
import { ArticleType } from '../cases/cases.schemas';

export const IdentificationSchema = z.object({
  articleType: ArticleType,
  category: z.string().optional(),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  frameSize: z.string(),
  serialNumber: z.string(),
  estimatedBasePrice: z.number(),
  firstLookState: z.string().optional()
});

export const FrameForkSchema = z.object({
  generalCondition: z.string(),
  impacts: z.string().optional(),
  shockDeformation: z.string().optional(),
  fork: z.string(),
  wear: z.string().optional()
});

export const BrakesSchema = z.object({
  type: z.string().optional(),
  frontEfficiency: z.string().optional(),
  rearEfficiency: z.string().optional(),
  padsWear: z.string().optional()
});

export const TransmissionSchema = z.object({
  chain: z.string().optional(),
  derailleur: z.string().optional(),
  bottomBracket: z.string().optional()
});

export const WheelsTiresSchema = z.object({
  rims: z.string().optional(),
  tires: z.string().optional(),
  hubs: z.string().optional()
});

export const FinishingSchema = z.object({
  saddle: z.string().optional(),
  handlebarDirection: z.string().optional(),
  cleanliness: z.string().optional(),
  observations: z.string().optional()
});

export type Identification = z.infer<typeof IdentificationSchema>;
export type FrameFork = z.infer<typeof FrameForkSchema>;
export type Brakes = z.infer<typeof BrakesSchema>;
export type Transmission = z.infer<typeof TransmissionSchema>;
export type WheelsTires = z.infer<typeof WheelsTiresSchema>;
export type Finishing = z.infer<typeof FinishingSchema>;
