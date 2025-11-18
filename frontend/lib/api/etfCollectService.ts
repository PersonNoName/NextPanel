import BaseService from "./services";

// ETF自选请求接口
export interface EtfCollectRequest {
  cid: string; // ETF类别ID
}
export interface EtfCollectItem {
  collect_id: string; 
  user_id: string; 
  cid: string;
  collect_time: string;
  sector: string | null;
  description: string | null;
  sort_order: number | null;
  item_count: number | null;
}
export interface EtfCollectDeleteResponse {
  message: string;
}
export interface EtfCollectAddResponse {
  message: string;
}
// ETF自选响应接口
export interface EtfCollectResponse {
  collections: EtfCollectItem[];
}



class EtfCollectService extends BaseService { 
  constructor() {
    super('/etf-collect');
  }
  // 获取当前用户的自选ETF类别列表
  async getEtfCollect(): Promise<EtfCollectResponse> {
    return this.get<EtfCollectResponse>('');
  }
  // 添加自选ETF类别
  async addEtfCollect(data: EtfCollectRequest): Promise<EtfCollectAddResponse> {
    return this.post<EtfCollectAddResponse>('', data);
  }

  // 删除自选ETF类别
  async deleteEtfCollect(cid: string): Promise<EtfCollectDeleteResponse> {
    return this.delete<EtfCollectAddResponse>(`/${cid}`);
  }
}

export default new EtfCollectService();