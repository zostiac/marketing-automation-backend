export interface QualityCheckResult {
  status: 'APPROVED' | 'NEEDS_REVISION';
  issues: string[];
  warnings: string[];
}

export class QualityController {
  static performQualityCheck(metadata?: Record<string, any>): QualityCheckResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!metadata?.file_size_bytes || metadata.file_size_bytes === 0) {
      issues.push('Invalid file size');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(metadata?.mime_type)) {
      issues.push('Unsupported file format');
    }

    if (metadata?.width && metadata?.height) {
      if (metadata.width < 800 || metadata.height < 600) {
        warnings.push('Design dimensions below recommended minimum');
      }
    }

    return {
      status: issues.length === 0 ? 'APPROVED' : 'NEEDS_REVISION',
      issues,
      warnings,
    };
  }
}