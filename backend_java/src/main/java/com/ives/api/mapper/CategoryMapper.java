package com.ives.api.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ives.api.model.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
    List<Category> findAllActive();

    List<Category> findByNames(@Param("names") List<String> names);

    Category findByName(@Param("name") String name);
}
