package com.ives.api.controller;

import com.ives.api.common.api.Result;
import com.ives.api.service.UserCollectionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/etf-collect")
@RequiredArgsConstructor
public class UserCollectionController {

    private final UserCollectionService userCollectionService;

    /**
     * 获取用户收藏列表
     */
    @GetMapping
    public Result<Map<String, Object>> getUserCollections(HttpServletRequest request){
        // 从request中获取userId
        Integer userId = (Integer) request.getAttribute("userId");

        Map<String, Object> result = new HashMap<>();
        result.put("collections", userCollectionService.getUserCollections(userId));

        return Result.success(result, "获取用户收藏列表成功");
    }

    /**
     * 新增收藏
     */
    @PostMapping
    public Result<Void> addCollection(@RequestBody Map<String, Object> requestBody, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        // 2. 处理cid：先获取字符串值 → 判空 → 解析为Integer
        Object cidObj = requestBody.get("cid");
        if (cidObj == null) {
            return Result.error(400,"收藏ID（cid）不能为空");
        }

        Integer cid;
        try {
            // 先转为String（无论传的是数字还是字符串，统一转成String后解析）
            String cidStr = String.valueOf(cidObj);
            // 解析为Integer（处理纯数字字符串）
            cid = Integer.valueOf(cidStr);
        } catch (NumberFormatException e) {
            // 非数字字符串时返回错误提示
            return Result.error(400,"收藏ID（cid）必须是合法的数字");
        }

        userCollectionService.addCollection(userId, cid);
        return Result.success(null, "收藏成功");
    }

    /**
     * 取消收藏
     */
    @DeleteMapping("/{cid}")
    public Result<Void> removeCollection(@PathVariable Integer cid, HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        userCollectionService.removeCollection(userId, cid);
        return Result.success(null, "取消收藏成功");
    }
}
