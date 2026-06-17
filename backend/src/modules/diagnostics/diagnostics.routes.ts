import express from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import * as svc from './diagnostics.service';
import { ApiError } from '../../shared/ApiError';

const router = express.Router();

router.post('/:caseNumber/diagnosis/start', asyncHandler((req, res) => {
  const c = svc.startDiagnosis(req.params.caseNumber);
  res.json(c.diagnosis);
}));

router.put('/:caseNumber/diagnosis/identification', asyncHandler((req, res) => {
  try {
    const result = svc.saveIdentification(req.params.caseNumber, req.body);
    res.json(result);
  } catch (err) {
    throw err;
  }
}));

router.put('/:caseNumber/diagnosis/frame-fork', asyncHandler((req, res) => {
  const result = svc.saveFrameFork(req.params.caseNumber, req.body);
  res.json(result);
}));

router.put('/:caseNumber/diagnosis/brakes', asyncHandler((req, res) => {
  const result = svc.saveBrakes(req.params.caseNumber, req.body);
  res.json(result);
}));

router.put('/:caseNumber/diagnosis/transmission', asyncHandler((req, res) => {
  const result = svc.saveTransmission(req.params.caseNumber, req.body);
  res.json(result);
}));

router.put('/:caseNumber/diagnosis/wheels-tires', asyncHandler((req, res) => {
  const result = svc.saveWheelsTires(req.params.caseNumber, req.body);
  res.json(result);
}));

router.put('/:caseNumber/diagnosis/finishing', asyncHandler((req, res) => {
  const result = svc.saveFinishing(req.params.caseNumber, req.body);
  res.json(result);
}));

router.get('/:caseNumber/diagnosis', asyncHandler((req, res) => {
  const result = svc.getDiagnosis(req.params.caseNumber);
  res.json(result);
}));

export default router;
