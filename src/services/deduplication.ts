import prisma from "@/lib/prisma"

export class DeduplicationService {
  // Calculate distance using Haversine formula
  static calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  }

  static async processNewReport(reportId: string, latitude: number, longitude: number) {
    const SEARCH_RADIUS = 20; // 20 meters radius for deduplication

    // Find recent unresolved reports (to prevent full table scan, you might normally use PostGIS, but for this demo we'll fetch recently unresolved and filter in memory)
    const unresolvedReports = await prisma.roadReport.findMany({
      where: {
        id: { not: reportId },
        status: {
          notIn: ['RESOLVED']
        }
      }
    });

    let nearestReport = null;
    let minDistance = Number.MAX_VALUE;

    for (const existing of unresolvedReports) {
      const dist = this.calculateHaversineDistance(latitude, longitude, existing.latitude, existing.longitude);
      if (dist < minDistance && dist <= SEARCH_RADIUS) {
        minDistance = dist;
        nearestReport = existing;
      }
    }

    if (nearestReport) {
      // It's a duplicate. Find or create a DuplicateGroup.
      let groupId = nearestReport.duplicateGroupId;

      if (!groupId) {
        // Create new group using the existing report as primary
        const group = await prisma.duplicateGroup.create({
          data: {
            primaryReportId: nearestReport.id,
            radiusMeters: SEARCH_RADIUS,
            reportCount: 2, // The original + this new one
            crowdUrgency: 'MODERATE'
          }
        });
        
        // Update the primary report to belong to this group
        await prisma.roadReport.update({
          where: { id: nearestReport.id },
          data: { duplicateGroupId: group.id }
        });
        
        groupId = group.id;
      } else {
        // Increment group count
        const group = await prisma.duplicateGroup.findUnique({ where: { id: groupId }});
        if (group) {
          const newCount = group.reportCount + 1;
          const urgency = newCount > 4 ? 'HIGH' : newCount > 2 ? 'MODERATE' : 'LOW';
          
          await prisma.duplicateGroup.update({
            where: { id: groupId },
            data: { 
              reportCount: newCount,
              crowdUrgency: urgency
            }
          });
        }
      }

      // Associate the new report with the group
      await prisma.roadReport.update({
        where: { id: reportId },
        data: { 
          duplicateGroupId: groupId,
          status: 'DEDUPLICATED'
        }
      });
      
      return groupId;
    }

    return null;
  }
}
