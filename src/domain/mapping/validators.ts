/**
 * SEO Validators
 * 
 * Validates product data for SEO compliance across different platforms and markets.
 * Checks length limits, forbidden terms, and required attributes.
 */

import { PlatformType } from '../../types/product'

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface ValidationRule {
  type: 'length' | 'forbidden' | 'required' | 'format' | 'custom'
  field: string
  operator: 'max' | 'min' | 'equals' | 'contains' | 'matches' | 'not_contains'
  value?: any
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface PlatformValidationConfig {
  channel: PlatformType
  market: string
  rules: ValidationRule[]
  categorySpecific?: Record<string, ValidationRule[]>
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  metadata: {
    platform: PlatformType
    market: string
    checkedAt: Date
  }
}

export interface ValidationIssue {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
  rule: string
  value?: any
  suggestedValue?: any
}

// =============================================================================
// PLATFORM-SPECIFIC VALIDATION RULES
// =============================================================================

const VALIDATION_CONFIGS: PlatformValidationConfig[] = [
  // SHOPEE VALIDATION RULES
  {
    channel: 'shopee',
    market: 'ID',
    rules: [
      {
        type: 'length',
        field: 'title',
        operator: 'max',
        value: 120,
        message: 'Title cannot exceed 120 characters for Shopee',
        severity: 'error'
      },
      {
        type: 'length',
        field: 'description',
        operator: 'max',
        value: 3000,
        message: 'Description cannot exceed 3000 characters for Shopee',
        severity: 'error'
      },
      {
        type: 'required',
        field: 'brand',
        operator: 'equals',
        message: 'Brand is required for Shopee',
        severity: 'error'
      },
      {
        type: 'forbidden',
        field: 'title',
        operator: 'not_contains',
        value: ['spam', 'clickbait', 'free money', 'guaranteed'],
        message: 'Title contains forbidden terms',
        severity: 'error'
      },
      {
        type: 'required',
        field: 'images',
        operator: 'min',
        value: 1,
        message: 'At least 1 image is required for Shopee',
        severity: 'error'
      },
      {
        type: 'format',
        field: 'price',
        operator: 'matches',
        value: /^\d+(\.\d{1,2})?$/,
        message: 'Price must be a valid number with up to 2 decimal places',
        severity: 'error'
      }
    ],
    categorySpecific: {
      'electronics': [
        {
          type: 'required',
          field: 'attributes.warranty',
          operator: 'equals',
          message: 'Warranty information is required for electronics',
          severity: 'error'
        }
      ],
      'fashion': [
        {
          type: 'required',
          field: 'attributes.size',
          operator: 'equals',
          message: 'Size information is required for fashion items',
          severity: 'error'
        }
      ]
    }
  },
  {
    channel: 'shopee',
    market: 'SG',
    rules: [
      {
        type: 'length',
        field: 'title',
        operator: 'max',
        value: 120,
        message: 'Title cannot exceed 120 characters for Shopee Singapore',
        severity: 'error'
      },
      {
        type: 'required',
        field: 'brand',
        operator: 'equals',
        message: 'Brand is required for Shopee Singapore',
        severity: 'error'
      }
    ]
  },

  // TIKTOK SHOP VALIDATION RULES
  {
    channel: 'tiktok',
    market: 'ID',
    rules: [
      {
        type: 'length',
        field: 'title',
        operator: 'max',
        value: 100,
        message: 'Title cannot exceed 100 characters for TikTok Shop',
        severity: 'error'
      },
      {
        type: 'length',
        field: 'description',
        operator: 'max',
        value: 2000,
        message: 'Description cannot exceed 2000 characters for TikTok Shop',
        severity: 'error'
      },
      {
        type: 'forbidden',
        field: 'description',
        operator: 'not_contains',
        value: ['政治', '宗教', '暴力', '成人'],
        message: 'Description contains forbidden content for TikTok Shop',
        severity: 'error'
      },
      {
        type: 'required',
        field: 'images',
        operator: 'min',
        value: 1,
        message: 'At least 1 image is required for TikTok Shop',
        severity: 'error'
      }
    ]
  },

  // TOKOPEDIA VALIDATION RULES
  {
    channel: 'tokopedia',
    market: 'ID',
    rules: [
      {
        type: 'length',
        field: 'title',
        operator: 'max',
        value: 150,
        message: 'Title cannot exceed 150 characters for Tokopedia',
        severity: 'error'
      },
      {
        type: 'length',
        field: 'description',
        operator: 'max',
        value: 5000,
        message: 'Description cannot exceed 5000 characters for Tokopedia',
        severity: 'error'
      },
      {
        type: 'required',
        field: 'brand',
        operator: 'equals',
        message: 'Brand is required for Tokopedia',
        severity: 'error'
      },
      {
        type: 'required',
        field: 'category',
        operator: 'equals',
        message: 'Category is required for Tokopedia',
        severity: 'error'
      }
    ]
  },

  // LAZADA VALIDATION RULES
  {
    channel: 'lazada',
    market: 'ID',
    rules: [
      {
        type: 'length',
        field: 'title',
        operator: 'max',
        value: 120,
        message: 'Title cannot exceed 120 characters for Lazada',
        severity: 'error'
      },
      {
        type: 'length',
        field: 'description',
        operator: 'max',
        value: 3000,
        message: 'Description cannot exceed 3000 characters for Lazada',
        severity: 'error'
      },
      {
        type: 'required',
        field: 'brand',
        operator: 'equals',
        message: 'Brand is required for Lazada',
        severity: 'error'
      }
    ]
  }
]

// =============================================================================
// VALIDATION ENGINE
// =============================================================================

export class SEOValidator {
  private configs: Map<string, PlatformValidationConfig> = new Map()

  constructor() {
    this.initializeConfigs()
  }

  /**
   * Initialize validation configurations
   */
  private initializeConfigs(): void {
    VALIDATION_CONFIGS.forEach(config => {
      const key = this.getConfigKey(config.channel, config.market)
      this.configs.set(key, config)
    })
  }

  /**
   * Get configuration key
   */
  private getConfigKey(channel: PlatformType, market: string): string {
    return `${channel}_${market}`.toLowerCase()
  }

  /**
   * Validate product data for specific platform
   */
  validate(
    product: any,
    channel: PlatformType,
    market: string,
    category?: string
  ): ValidationResult {
    const config = this.getConfig(channel, market)
    if (!config) {
      return {
        valid: false,
        errors: [{
          field: 'platform',
          message: `No validation rules found for ${channel}/${market}`,
          severity: 'error',
          rule: 'platform_config'
        }],
        warnings: [],
        metadata: {
          platform: channel,
          market,
          checkedAt: new Date()
        }
      }
    }

    const errors: ValidationIssue[] = []
    const warnings: ValidationIssue[] = []

    // Apply general rules
    config.rules.forEach(rule => {
      const issue = this.validateRule(product, rule)
      if (issue) {
        if (issue.severity === 'error') {
          errors.push(issue)
        } else {
          warnings.push(issue)
        }
      }
    })

    // Apply category-specific rules if category is provided
    if (category && config.categorySpecific && config.categorySpecific[category]) {
      config.categorySpecific[category].forEach(rule => {
        const issue = this.validateRule(product, rule)
        if (issue) {
          if (issue.severity === 'error') {
            errors.push(issue)
          } else {
            warnings.push(issue)
          }
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        platform: channel,
        market,
        checkedAt: new Date()
      }
    }
  }

  /**
   * Validate single rule
   */
  private validateRule(product: any, rule: ValidationRule): ValidationIssue | null {
    const value = this.getFieldValue(product, rule.field)

    switch (rule.operator) {
      case 'max':
        if (typeof value === 'string' && value.length > rule.value) {
          return {
            field: rule.field,
            message: rule.message,
            severity: rule.severity,
            rule: rule.type,
            value: value.length,
            suggestedValue: value.substring(0, rule.value)
          }
        }
        break

      case 'min':
        if (rule.type === 'required' && (value === undefined || value === null || value === '')) {
          return {
            field: rule.field,
            message: rule.message,
            severity: rule.severity,
            rule: rule.type,
            suggestedValue: 'Please provide a value'
          }
        } else if (Array.isArray(value) && value.length < rule.value) {
          return {
            field: rule.field,
            message: rule.message,
            severity: rule.severity,
            rule: rule.type,
            value: value.length,
            suggestedValue: `At least ${rule.value} items required`
          }
        }
        break

      case 'equals':
        if (rule.type === 'required' && (value === undefined || value === null || value === '')) {
          return {
            field: rule.field,
            message: rule.message,
            severity: rule.severity,
            rule: rule.type,
            suggestedValue: 'Value is required'
          }
        }
        break

      case 'not_contains':
        if (rule.type === 'forbidden' && typeof value === 'string') {
          const forbiddenTerms = Array.isArray(rule.value) ? rule.value : [rule.value]
          const foundTerms = forbiddenTerms.filter(term => 
            value.toLowerCase().includes(String(term).toLowerCase())
          )
          if (foundTerms.length > 0) {
            return {
              field: rule.field,
              message: `${rule.message}: ${foundTerms.join(', ')}`,
              severity: rule.severity,
              rule: rule.type,
              value: foundTerms,
              suggestedValue: value.replace(new RegExp(foundTerms.join('|'), 'gi'), '[REMOVED]')
            }
          }
        }
        break

      case 'matches':
        if (rule.type === 'format' && typeof value === 'string') {
          const regex = new RegExp(rule.value)
          if (!regex.test(value)) {
            return {
              field: rule.field,
              message: rule.message,
              severity: rule.severity,
              rule: rule.type,
              value,
              suggestedValue: 'Please fix the format'
            }
          }
        }
        break
    }

    return null
  }

  /**
   * Get value from nested object using dot notation
   */
  private getFieldValue(obj: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Get validation config for platform
   */
  private getConfig(channel: PlatformType, market: string): PlatformValidationConfig | null {
    // Try exact match first
    let key = this.getConfigKey(channel, market)
    if (this.configs.has(key)) {
      return this.configs.get(key)!
    }

    // Try with default market
    const defaultMarket = this.getDefaultMarket(channel)
    key = this.getConfigKey(channel, defaultMarket)
    if (this.configs.has(key)) {
      return this.configs.get(key)!
    }

    return null
  }

  /**
   * Get default market for channel
   */
  private getDefaultMarket(channel: PlatformType): string {
    const defaults: Record<PlatformType, string> = {
      'shopee': 'ID',
      'tiktok': 'ID',
      'tokopedia': 'ID',
      'lazada': 'ID'
    }
    return defaults[channel] || 'ID'
  }

  /**
   * Validate multiple platforms
   */
  validateForPlatforms(
    product: any,
    channels: { channel: PlatformType; market: string; category?: string }[]
  ): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}

    channels.forEach(({ channel, market, category }) => {
      const key = `${channel}_${market}`
      results[key] = this.validate(product, channel, market, category)
    })

    return results
  }

  /**
   * Get validation summary
   */
  getValidationSummary(results: Record<string, ValidationResult>): {
    overallValid: boolean
    totalErrors: number
    totalWarnings: number
    platformBreakdown: Array<{
      platform: string
      valid: boolean
      errors: number
      warnings: number
    }>
  } {
    let totalErrors = 0
    let totalWarnings = 0
    let overallValid = true
    const platformBreakdown: Array<{
      platform: string
      valid: boolean
      errors: number
      warnings: number
    }> = []

    Object.entries(results).forEach(([platform, result]) => {
      totalErrors += result.errors.length
      totalWarnings += result.warnings.length
      if (!result.valid) overallValid = false

      platformBreakdown.push({
        platform,
        valid: result.valid,
        errors: result.errors.length,
        warnings: result.warnings.length
      })
    })

    return {
      overallValid,
      totalErrors,
      totalWarnings,
      platformBreakdown
    }
  }

  /**
   * Add custom validation rule
   */
  addCustomRule(channel: PlatformType, market: string, rule: ValidationRule): void {
    const key = this.getConfigKey(channel, market)
    let config = this.configs.get(key)
    
    if (!config) {
      config = {
        channel,
        market,
        rules: []
      }
      this.configs.set(key, config)
    }

    config.rules.push(rule)
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const seoValidator = new SEOValidator()

export default SEOValidator