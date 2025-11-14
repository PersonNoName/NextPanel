// middleware/responseTime.js
const responseTime = () => {
  return (req, res, next) => {
    const startTime = process.hrtime();
    
    // 重写res.json方法以捕获响应时间
    const originalJson = res.json;
    res.json = function(data) {
      const diff = process.hrtime(startTime);
      const responseTimeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      
      // 在响应头中添加响应时间
      res.set('X-Response-Time', `${responseTimeMs}ms`);
      
      // 如果响应数据是对象，添加响应时间字段
      if (data && typeof data === 'object') {
        data.response_time_ms = parseFloat(responseTimeMs);
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = responseTime;