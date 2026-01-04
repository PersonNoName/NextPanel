package com.ives.api.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ives.api.model.entity.EtfNetasset;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EtfNetassetMapper extends BaseMapper<EtfNetasset> {
    EtfNetasset findByCodeAndDate(@Param("thsCode") String thsCode, @Param("date") String date);
    List<EtfNetasset> findByCodesAndDate(@Param("thsCodes") List<String> thsCodes, @Param("date") String date);
    List<EtfNetasset> findByCodesAndDates(@Param("thsCodes") List<String> thsCodes, @Param("dates") List<String> dates);
}