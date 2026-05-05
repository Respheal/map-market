export interface ApiResponse {
  results?: MapData[];
  status?: number;
}

export interface MapData {
  itemId: number;
  nq: {
    minListing: {
      world?: { price: number };
      dc?: { price: number; worldId: number };
      region?: { price: number; worldId: number };
    };
    recentPurchase: {
      world?: { price: number; timestamp: number };
      dc?: { price: number; timestamp: number; worldId: number };
      region?: { price: number; timestamp: number; worldId: number };
    };
    averageSalePrice: {
      world?: { price: number };
      dc?: { price: number };
      region?: { price: number };
    };
    dailySaleVelocity: {
      world?: { quantity: number };
      dc?: { quantity: number };
      region?: { quantity: number };
    };
  };
  worldUploadTimes: { worldId: number; timestamp: number }[];
}

export interface Data {
  id: number;
  name: string;
  exp: string;
  cheapest: number;
  recent: number;
  recentTimestamp: number;
  average: number;
  velocity: number;
}
