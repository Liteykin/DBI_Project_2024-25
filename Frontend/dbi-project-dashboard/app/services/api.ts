interface ApiResponse<T> {
  result: T;
  executionTime?: number;
}

// Domain interfaces
export interface Tier {
  name: string;
  groesse: number;
  gewicht: number;
  anzahl?: number;
  tierFilialen?: TierFiliale[];
}

export interface Filiale {
  id: number;
  name: string;
  adresse: string;
  tierFilialen?: TierFiliale[];
  tiere?: MongoTier[]; // For MongoDB responses
}

export interface TierFiliale {
  filialeId: number;
  tierName: string;
  anzahl: number;
}

export interface MongoTier {
  name: string;
  groesse: number;
  gewicht: number;
  anzahl: number;
}

export interface MongoFiliale {
  id: string;
  name: string;
  adresse: string;
  tiere?: MongoTier[];
}

export interface SeedingRequest {
  tierCount: number;
  filialeCount: number;
  tierFilialeCount: number;
}

export interface MongoSeedingRequest {
  tierProFilialeCount: number;
  filialeCount: number;
}

const API_BASE_URL = "http://localhost:5184";

class ApiService {
  private getBaseUrl(isMongoDb: boolean): string {
    return isMongoDb ? `${API_BASE_URL}/mongo` : API_BASE_URL;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  }

  // Tiere (Animals) endpoints
  async getAllTiere(isMongoDb = false): Promise<ApiResponse<Tier[]>> {
    const response = await fetch(`${this.getBaseUrl(isMongoDb)}/tiere`);
    return this.handleResponse<Tier[]>(response);
  }

  async getTiereByFiliale(
    filialeId: number,
    isMongoDb = false
  ): Promise<ApiResponse<Tier[]>> {
    const response = await fetch(
      `${this.getBaseUrl(isMongoDb)}/tiere/filiale/${filialeId}`
    );
    return this.handleResponse<Tier[]>(response);
  }

  async getTierNamesByFiliale(
    filialeId: number,
    isMongoDb = false
  ): Promise<ApiResponse<string[]>> {
    const response = await fetch(
      `${this.getBaseUrl(isMongoDb)}/tiere/names/filiale/${filialeId}`
    );
    return this.handleResponse<string[]>(response);
  }

  async getTierByName(
    name: string,
    isMongoDb = false
  ): Promise<ApiResponse<Tier>> {
    const response = await fetch(`${this.getBaseUrl(isMongoDb)}/tier/${name}`);
    return this.handleResponse<Tier>(response);
  }

  async createTier(tier: Tier, isMongoDb = false): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.getBaseUrl(isMongoDb)}/tier`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tier),
    });
    return this.handleResponse<void>(response);
  }

  async updateTier(tier: Tier, isMongoDb = false): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.getBaseUrl(isMongoDb)}/tier`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tier),
    });
    return this.handleResponse<void>(response);
  }

  async deleteTier(
    name: string,
    isMongoDb = false
  ): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.getBaseUrl(isMongoDb)}/tier/${name}`, {
      method: "DELETE",
    });
    return this.handleResponse<void>(response);
  }

  // Filialen (Branches) endpoints
  async getAllFilialen(isMongoDb = false): Promise<ApiResponse<Filiale[]>> {
    const response = await fetch(`${this.getBaseUrl(isMongoDb)}/filialen`);
    return this.handleResponse<Filiale[]>(response);
  }

  async getFilialeById(
    id: number,
    isMongoDb = false
  ): Promise<ApiResponse<Filiale>> {
    const response = await fetch(`${this.getBaseUrl(isMongoDb)}/filiale/${id}`);
    return this.handleResponse<Filiale>(response);
  }

  async getFilialeByTier(
    tierName: string,
    isMongoDb = false
  ): Promise<ApiResponse<Filiale[]>> {
    const response = await fetch(
      `${this.getBaseUrl(isMongoDb)}/filialen/tier/${tierName}`
    );
    return this.handleResponse<Filiale[]>(response);
  }

  async getFilialeNamesByTier(
    tierName: string,
    isMongoDb = false
  ): Promise<ApiResponse<string[]>> {
    const response = await fetch(
      `${this.getBaseUrl(isMongoDb)}/filialen/names/tier/${tierName}`
    );
    return this.handleResponse<string[]>(response);
  }

  async createFiliale(
    filiale: Filiale | MongoFiliale,
    isMongoDb = false
  ): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.getBaseUrl(isMongoDb)}/filiale`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filiale),
    });
    return this.handleResponse<void>(response);
  }

  async updateFiliale(
    filiale: Filiale | MongoFiliale,
    isMongoDb = false
  ): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.getBaseUrl(isMongoDb)}/filiale`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filiale),
    });
    return this.handleResponse<void>(response);
  }

  async deleteFiliale(
    id: number,
    isMongoDb = false
  ): Promise<ApiResponse<void>> {
    const response = await fetch(
      `${this.getBaseUrl(isMongoDb)}/filiale/${id}`,
      {
        method: "DELETE",
      }
    );
    return this.handleResponse<void>(response);
  }

  // TierFiliale (Animal-Branch) endpoints - Only for relational DB
  async getAllTierFilialen(): Promise<ApiResponse<TierFiliale[]>> {
    const response = await fetch(`${this.getBaseUrl(false)}/tierfilialen`);
    return this.handleResponse<TierFiliale[]>(response);
  }

  async getTierFilialeByTier(
    tierName: string
  ): Promise<ApiResponse<TierFiliale[]>> {
    const response = await fetch(
      `${this.getBaseUrl(false)}/tierfilialen/tier/${tierName}`
    );
    return this.handleResponse<TierFiliale[]>(response);
  }

  async getTierFilialeByFiliale(
    filialeId: number
  ): Promise<ApiResponse<TierFiliale[]>> {
    const response = await fetch(
      `${this.getBaseUrl(false)}/tierfilialen/filiale/${filialeId}`
    );
    return this.handleResponse<TierFiliale[]>(response);
  }

  async createTierFiliale(
    tierFiliale: TierFiliale
  ): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.getBaseUrl(false)}/tierfiliale`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tierFiliale),
    });
    return this.handleResponse<void>(response);
  }

  async updateTierFiliale(
    tierFiliale: TierFiliale
  ): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.getBaseUrl(false)}/tierfiliale`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tierFiliale),
    });
    return this.handleResponse<void>(response);
  }

  async deleteTierFiliale(
    filialeId: number,
    tierName: string
  ): Promise<ApiResponse<void>> {
    const response = await fetch(
      `${this.getBaseUrl(false)}/tierfiliale/${filialeId}/${tierName}`,
      {
        method: "DELETE",
      }
    );
    return this.handleResponse<void>(response);
  }

  // Seeding endpoints
  async startSeed(
    request: SeedingRequest | MongoSeedingRequest,
    isMongoDb = false
  ): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.getBaseUrl(isMongoDb)}/startseed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return this.handleResponse<void>(response);
  }

  // MongoDB specific endpoints
  async createMongoTierInFiliale(
    filialeId: number,
    tier: MongoTier
  ): Promise<ApiResponse<void>> {
    const response = await fetch(
      `${this.getBaseUrl(true)}/tier/filiale/${filialeId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tier),
      }
    );
    return this.handleResponse<void>(response);
  }

  async updateMongoTierInFiliale(
    filialeId: number,
    tier: MongoTier
  ): Promise<ApiResponse<void>> {
    const response = await fetch(
      `${this.getBaseUrl(true)}/tier/filiale/${filialeId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tier),
      }
    );
    return this.handleResponse<void>(response);
  }

  async deleteMongoTierFromFiliale(
    filialeId: number,
    tierName: string
  ): Promise<ApiResponse<void>> {
    const response = await fetch(
      `${this.getBaseUrl(true)}/tier/filiale/${filialeId}/${tierName}`,
      {
        method: "DELETE",
      }
    );
    return this.handleResponse<void>(response);
  }
}

export const apiService = new ApiService();
