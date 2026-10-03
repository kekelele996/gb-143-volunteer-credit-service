import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { messages } from '../constants/messages';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      res.status(400).json({
        success: false,
        error: messages.validation.invalidBody,
        details: error.details.map(d => d.message),
      });
      return;
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query);

    if (error) {
      res.status(400).json({
        success: false,
        error: messages.validation.invalidQuery,
        details: error.details.map(d => d.message),
      });
      return;
    }

    req.query = value;
    next();
  };
};

export const serviceRecordSchema = Joi.object({
  volunteer_id: Joi.string().uuid().required(),
  service_type: Joi.string().valid(
    'elderly_care', 'child_care', 'medical_assist', 'education',
    'community_service', 'disaster_relief', 'environmental',
    'cultural_activity', 'other'
  ).required(),
  duration_hours: Joi.number().positive().required(),
  rating: Joi.number().integer().min(1).max(5).default(5),
  is_no_show: Joi.boolean().default(false),
  location: Joi.string().optional(),
  description: Joi.string().optional(),
  recorded_at: Joi.date().optional(),
});

export const batchServiceRecordsSchema = Joi.object({
  records: Joi.array().items(serviceRecordSchema).min(1).required(),
});

export const volunteerCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
  email: Joi.string().email().optional(),
});

export const volunteerUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
  email: Joi.string().email().optional(),
});

export const complaintSchema = Joi.object({
  volunteer_id: Joi.string().uuid().required(),
  complaint_type: Joi.string().valid(
    'no_show', 'poor_attitude', 'violation', 'misconduct', 'other'
  ).required(),
  description: Joi.string().min(5).required(),
  complainant_id: Joi.string().uuid().optional(),
});

export const handleComplaintSchema = Joi.object({
  action: Joi.string().valid('resolve', 'reject').required(),
  resolution: Joi.string().min(5).required(),
  severity: Joi.number().integer().min(1).max(3).default(1),
});

export const adjustPointsSchema = Joi.object({
  volunteer_id: Joi.string().uuid().required(),
  points_change: Joi.number().integer().required(),
  reason: Joi.string().min(5).required(),
});

export const adjustCreditSchema = Joi.object({
  volunteer_id: Joi.string().uuid().required(),
  credit_change: Joi.number().integer().min(-50).max(50).required(),
  reason: Joi.string().min(5).required(),
});

/**
 * 分页 + 过滤查询参数。
 * 这里必须声明路由/服务层实际读取的每一个查询键：Joi 默认拒绝未知键，
 * 漏声明会让带过滤条件的请求直接 400（而不是返回过滤结果）。
 */
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  page_size: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().optional(),
  // GET /api/v1/complaints —— 与服务层 status 过滤、complaints.status CHECK 约束一致
  status: Joi.string().valid('pending', 'resolved', 'rejected').optional(),
  volunteer_id: Joi.string().uuid().optional(),
  // GET /api/v1/admin/audit-logs —— admin_id 对应 VARCHAR(100)，
  // action 对应 VARCHAR(50)（无 CHECK 约束，动作词表开放，故不做枚举）
  admin_id: Joi.string().max(100).optional(),
  action: Joi.string().max(50).optional(),
});

export const trendSchema = Joi.object({
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
});
