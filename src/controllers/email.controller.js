import { generateEmailTemplate } from "../services/groq.service.js";

export async function generateEmail(req, res, next) {
  try {
    const { purpose, recipient_name, tone } = req.body;

    if (!purpose || typeof purpose !== "string" || !purpose.trim()) {
      return res.status(400).json({
        success: false,
        error: "purpose is required and must be a non-empty string"
      });
    }

    if (!recipient_name || typeof recipient_name !== "string" || !recipient_name.trim()) {
      return res.status(400).json({
        success: false,
        error: "recipient_name is required and must be a non-empty string"
      });
    }

    if (!tone || typeof tone !== "string" || !tone.trim()) {
      return res.status(400).json({
        success: false,
        error: "tone is required and must be a non-empty string"
      });
    }

    const result = await generateEmailTemplate({
      purpose: purpose.trim(),
      recipientName: recipient_name.trim(),
      tone: tone.trim()
    });

    return res.status(200).json({
      success: true,
      data: {
        purpose: purpose.trim(),
        recipient_name: recipient_name.trim(),
        tone: tone.trim(),
        subject: result.subject,
        body: result.body,
        model: result.model,
        response_time_ms: result.responseTimeMs
      }
    });
  } catch (error) {
    next(error);
  }
}