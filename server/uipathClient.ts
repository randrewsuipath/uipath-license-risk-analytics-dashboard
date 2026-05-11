import axios, { AxiosInstance } from 'axios';
import { config } from './config';
interface DataServiceQueryRequest {
  filter?: string;
  orderBy?: string;
  top?: number;
  skip?: number;
}
interface DataServiceQueryResponse<T> {
  value: T[];
  '@odata.nextLink'?: string;
}
export class UiPathDataServiceClient {
  private client: AxiosInstance;
  constructor() {
    this.client = axios.create({
      baseURL: config.uipathDataServiceBaseUrl,
      headers: {
        Authorization: `Bearer ${config.uipathAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }
  async query<T>(entityName: string, request: DataServiceQueryRequest = {}): Promise<T[]> {
    const results: T[] = [];
    let url = `/EntityService/${entityName}/query`;
    try {
      let response = await this.client.post<DataServiceQueryResponse<T>>(url, request);
      results.push(...response.data.value);
      while (response.data['@odata.nextLink']) {
        response = await this.client.get<DataServiceQueryResponse<T>>(
          response.data['@odata.nextLink']
        );
        results.push(...response.data.value);
      }
      return results;
    } catch (error: any) {
      console.error(`Error querying ${entityName}:`, error.message);
      throw new Error(`Failed to query ${entityName}: ${error.message}`);
    }
  }
  async read<T>(entityName: string, id: string): Promise<T> {
    try {
      const response = await this.client.get<T>(
        `/EntityService/${entityName}/read/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error reading ${entityName} with id ${id}:`, error.message);
      throw new Error(`Failed to read ${entityName}: ${error.message}`);
    }
  }
}