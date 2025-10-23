import BaseService from './services';

// ETF收益率查询请求接口
export interface EtfReturnRateByCodesRequest {
  thsCodeList: string[];
  start_date: string;
  end_date: string;
}

// ETF收益率查询响应接口
export interface EtfReturnRateByCodesResponse {
  total: number;
  success_count: number;
  fail_count: number;
  results: Array<{
    ths_code: string;
    chinese_name: string;
    sector: string;
    start_date: string;
    end_date: string;
    start_adjusted_nav: number;
    end_adjusted_nav: number;
    return_rate: number;
    return_rate_percent: string;
    error?: string;
    status?: number;
  }>;
}

// 类别收益率查询请求接口
export interface ReturnRateBySectorsRequest {
  sectorList?: string[];
  start_date: string;
  end_date: string;
  includeDetails?: boolean;
}

// 类别收益率查询响应接口
export interface ReturnRateBySectorsResponse {
  total_sectors: number;
  total_etfs: number;
  valid_etfs: number;
  sector_results: Array<{
    sector: string;
    category_name: string;
    count: number;
    valid_count: number;
    avg_return_rate: number;
    avg_return_rate_percent: string;
  }>;
  details?: Array<{
    ths_code: string;
    chinese_name: string;
    sector: string;
    start_date: string;
    end_date: string;
    start_adjusted_nav: number;
    end_adjusted_nav: number;
    return_rate: number;
    return_rate_percent: string;
    error?: string;
    status?: number;
  }>;
}

// 可用类别响应接口
export interface AvailableSectorsResponse {
  total: number;
  sectors: Array<{
    sector: string;
    description: string;
    sort_order: number;
    etf_count: number;
  }>;
}

// ETF服务类
class EtfService extends BaseService {
  constructor() {
    super('/etf'); // 假设基础路径为 /etf
  }

  /**
   * 按股票代码列表计算收益率
   */
  async getEtfReturnRateByCodes(data: EtfReturnRateByCodesRequest): Promise<EtfReturnRateByCodesResponse> {
    return this.post<EtfReturnRateByCodesResponse>('/etf-return-rate', data);
  }

  /**
   * 按类别计算平均收益率
   */
  async getReturnRateBySectors(data: ReturnRateBySectorsRequest): Promise<ReturnRateBySectorsResponse> {
    return this.post<ReturnRateBySectorsResponse>('/sector-return-rate', data);
  }

  /**
   * 获取所有可用类别
   */
  async getAvailableSectors(): Promise<AvailableSectorsResponse> {
    return this.get<AvailableSectorsResponse>('/available-sectors');
  }

  /**
   * 获取所有类别的平均收益率（简化方法）
   */
  async getAllSectorsReturnRate(start_date: string, end_date: string, includeDetails = false): Promise<ReturnRateBySectorsResponse> {
    const requestData: ReturnRateBySectorsRequest = {
      start_date,
      end_date,
      includeDetails
      // 不传 sectorList 表示查询所有类别
    };
    return this.getReturnRateBySectors(requestData);
  }
}

// 导出单例
export default new EtfService();