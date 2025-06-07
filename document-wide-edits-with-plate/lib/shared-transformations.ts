// Shared transformation functions to ensure identical outputs between OpenAI and Morph routes

export function generateSharedDemoTransformation(document: string, transformation: string): string {
  // Parse the transformation request to determine the type
  const transformationType = transformation.toLowerCase();
  
  if (transformationType.includes('restructure')) {
    return `# Restructured Document

## Executive Overview
${document.split('\n').slice(0, 2).join(' ')}

## Main Content
${document}

## Key Takeaways
- Document has been restructured for better readability
- Content maintains original meaning while improving flow
- Clear hierarchy established for better navigation`;
    
  } else if (transformationType.includes('executive summary')) {
    return `# Executive Summary

## Overview
This document provides a comprehensive analysis of the key points outlined in the original content.

## Key Points
${document.split('\n').slice(0, 3).map(line => `- ${line.trim()}`).filter(line => line.length > 2).join('\n')}

## Summary
${document}

## Recommendations
Based on the content analysis, the document effectively communicates its core message and provides valuable insights.`;
    
  } else if (transformationType.includes('expand details')) {
    return `# Detailed Analysis

${document}

## Additional Context
This section provides expanded details and deeper insights into the content above.

### Background Information
The topics covered in this document are part of a comprehensive approach to understanding the subject matter.

### Detailed Explanation
Each point mentioned requires careful consideration of multiple factors and their interdependencies.

### Implementation Notes
When applying these concepts, it's important to consider the specific context and requirements of your use case.`;
    
  } else if (transformationType.includes('simplify')) {
    return `# Simplified Version

Here's an easy-to-understand version of the content:

${document.split('\n').map(line => line.length > 100 ? line.substring(0, 100) + '...' : line).join('\n')}

## In Simple Terms
This document explains important concepts in a clear and straightforward way.`;
    
  } else if (transformationType.includes('academic')) {
    return `# Academic Analysis

## Abstract
This paper presents a comprehensive examination of the subject matter outlined in the following sections.

## Introduction
${document}

## Methodology
The approach taken in this analysis follows established academic principles and rigorous examination of the source material.

## Conclusion
The findings presented herein contribute to a deeper understanding of the topic and provide a foundation for further research.

## References
[1] Original source material as provided above
[2] Academic standards for document transformation`;
    
  } else if (transformationType.includes('business proposal')) {
    return `# Business Proposal

## Executive Summary
${document.split('\n')[0]}

## Business Opportunity
The following proposal outlines a strategic approach based on the content analysis:

${document}

## Implementation Plan
1. **Phase 1**: Initial assessment and planning
2. **Phase 2**: Implementation of core strategies
3. **Phase 3**: Evaluation and optimization

## Expected Outcomes
- Improved efficiency and effectiveness
- Clear measurable results
- Sustainable long-term benefits

## Next Steps
We recommend moving forward with this proposal to achieve the outlined objectives.`;
    
  } else if (transformationType.includes('tutorial')) {
    return `# Step-by-Step Tutorial

## Getting Started
${document.split('\n')[0]}

## Prerequisites
Before beginning, ensure you have:
- Basic understanding of the concepts
- Access to necessary tools and resources

## Step-by-Step Instructions

### Step 1: Preparation
${document.split('\n').slice(0, 2).join(' ')}

### Step 2: Implementation
${document.split('\n').slice(2, 4).join(' ')}

### Step 3: Verification
Review your work to ensure everything is working correctly.

## Troubleshooting
If you encounter issues, check:
- All prerequisites are met
- Steps are followed in correct order
- Resources are properly configured

## Summary
${document}

Congratulations! You have successfully completed this tutorial.`;
  }

  // Default transformation
  return `# Transformed Document

${document}

## Transformation Applied
The document has been processed according to the request: "${transformation}"

This ensures consistent output across both transformation methods.`;
} 