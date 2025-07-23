import { FinnhubQuote, CompanyProfile } from '../types/portfolio';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'd1vqjs1r01qmbi8pkds0d1vqjs1r01qmbi8pkdsg';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

class FinnhubAPI {
  private rateLimitTracker = {
    requests: 0,
    resetTime: Date.now() + 60000, // Reset every minute
  };

  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if a minute has passed
    if (now >= this.rateLimitTracker.resetTime) {
      this.rateLimitTracker.requests = 0;
      this.rateLimitTracker.resetTime = now + 60000;
    }
    
    // Check if we've exceeded the rate limit (60 requests per minute)
    if (this.rateLimitTracker.requests >= 60) {
      return false;
    }
    
    this.rateLimitTracker.requests++;
    return true;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.checkRateLimit()) {
      const waitTime = this.rateLimitTracker.resetTime - Date.now();
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    const url = `${FINNHUB_BASE_URL}${endpoint}&token=${FINNHUB_API_KEY}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if API returned an error
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching data');
    }
  }

  async getQuote(symbol: string): Promise<FinnhubQuote> {
    const data = await this.makeRequest(`/quote?symbol=${symbol.toUpperCase()}`);
    
    // Validate the response structure
    if (typeof data.c !== 'number' || data.c <= 0) {
      throw new Error(`Invalid or missing data for symbol ${symbol}`);
    }
    
    return data;
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const data = await this.makeRequest(`/stock/profile2?symbol=${symbol.toUpperCase()}`);
    
    if (!data.name) {
      throw new Error(`Company profile not found for symbol ${symbol}`);
    }
    
    return data;
  }

  async searchSymbol(query: string): Promise<any> {
    return this.makeRequest(`/search?q=${encodeURIComponent(query)}`);
  }

  getRemainingRequests(): number {
    const now = Date.now();
    if (now >= this.rateLimitTracker.resetTime) {
      return 60;
    }
    return Math.max(0, 60 - this.rateLimitTracker.requests);
  }

  getTimeUntilReset(): number {
    return Math.max(0, this.rateLimitTracker.resetTime - Date.now());
  }
}

export const finnhubApi = new FinnhubAPI();