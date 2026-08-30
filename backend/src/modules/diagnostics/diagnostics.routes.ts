import express from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import * as svc from './diagnostics.service.js';
import { ApiError } from '../../shared/ApiError.js';

const router = express.Router();

router.post('/:caseNumber/diagnosis/start', asyncHandler(async (req, res) => {
  const c = await svc.startDiagnosis(req.params.caseNumber);
  res.json(c.diagnosis);
}));

router.put('/:caseNumber/diagnosis/identification', asyncHandler(async (req, res) => {
  const result = await svc.saveIdentification(req.params.caseNumber, req.body);
  res.json(result);
}));

router.put('/:caseNumber/diagnosis/frame-fork', asyncHandler(async (req, res) => {
  const result = await svc.saveFrameFork(req.params.caseNumber, req.body);
  res.json(result);
}));

router.put('/:caseNumber/diagnosis/brakes', asyncHandler(async (req, res) => {
  const result = await svc.saveBrakes(req.params.caseNumber, req.body);
  res.json(result);
}));

router.put('/:caseNumber/diagnosis/transmission', asyncHandler(async (req, res) => {
  const result = await svc.saveTransmission(req.params.caseNumber, req.body);
  res.json(result);
}));

router.put('/:caseNumber/diagnosis/wheels-tires', asyncHandler(async (req, res) => {
  const result = await svc.saveWheelsTires(req.params.caseNumber, req.body);
  res.json(result);
}));

router.put('/:caseNumber/diagnosis/finishing', asyncHandler(async (req, res) => {
  const result = await svc.saveFinishing(req.params.caseNumber, req.body);
  res.json(result);
}));

router.get('/:caseNumber/diagnosis', asyncHandler(async (req, res) => {
  const result = await svc.getDiagnosis(req.params.caseNumber);
  res.json(result);
}));

export default router;
