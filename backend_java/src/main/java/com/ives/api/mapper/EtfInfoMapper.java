package com.ives.api.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ives.api.model.entity.EtfInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EtfInfoMapper extends BaseMapper<EtfInfo> {
    EtfInfo findByCode(@Param("thsCode") String thsCode);

    List<EtfInfo> findAll();

    List<EtfInfo> findBySectors(@Param("sectors") List<String> sectors);

    List<EtfInfo> findBySector(@Param("sector") String sector);
}
