export class PotholeDetectionService {
  static async detect(imageUrl: string) {
    // Deterministic mock based on URL or random if not provided
    // In a real scenario, this would call a FastAPI / YOLOv8 endpoint
    
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock values
    const confidence = 0.85 + (Math.random() * 0.14); // 0.85 - 0.99
    const imageWidth = 800;
    const imageHeight = 600;
    
    // Random bounding box
    const width = 100 + Math.random() * 200;
    const height = 100 + Math.random() * 200;
    const x = Math.random() * (imageWidth - width);
    const y = Math.random() * (imageHeight - height);
    
    return {
      detected: true,
      model: 'YOLOv8-Mock',
      confidence,
      boundingBox: {
        x,
        y,
        width,
        height
      },
      imageWidth,
      imageHeight
    };
  }
}

export class HazardAssessmentService {
  static calculate(
    confidence: number,
    coverageRatio: number,
    crowdUrgencyCount: number = 1,
    ageInDays: number = 0
  ) {
    // Weights
    const W_COVERAGE = 0.4;
    const W_CONFIDENCE = 0.3;
    const W_URGENCY = 0.2;
    const W_AGE = 0.1;
    
    // Normalize inputs
    const normCoverage = Math.min(coverageRatio * 10, 1.0); // e.g. 10% coverage is max score
    const normUrgency = Math.min(crowdUrgencyCount / 5, 1.0); // 5 reports is max urgency
    const normAge = Math.min(ageInDays / 30, 1.0); // 30 days is max age weight
    
    let score = (normCoverage * W_COVERAGE) + 
                (confidence * W_CONFIDENCE) + 
                (normUrgency * W_URGENCY) + 
                (normAge * W_AGE);
                
    const priorityScore = Math.min(score * 100, 100);
    
    let priorityLevel = 'LOW';
    let severity = 'LOW';
    
    if (priorityScore >= 70) {
      priorityLevel = 'HIGH';
      severity = 'HIGH';
    } else if (priorityScore >= 40) {
      priorityLevel = 'MODERATE';
      severity = 'MODERATE';
    }
    
    return {
      priorityScore,
      priorityLevel,
      severity
    };
  }
}
