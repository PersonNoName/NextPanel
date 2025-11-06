import BaseService from './services';

export interface TradingDayResponse {
  startDate: string;
  endDate: string;
  tradingDaysCount: number;
  originalInput:{
    date: string;
    n: number;
  }
}

// 交易日服务类
class DateService extends BaseService {
  constructor() {
    super('/trading-days');
  }
    /**
   * 获取交易日信息
   */
  async getTradingDays(date: string, n: number): Promise<TradingDayResponse> {
    return this.get<TradingDayResponse>('/previous', { date, n });
  }
}

// 导出单例
export default new DateService();