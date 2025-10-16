-- 参考

CREATE TABLE hobby (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '爱好ID',
    name VARCHAR(50) NOT NULL COMMENT '爱好名称（如：足球、阅读）',
    description TEXT COMMENT '爱好详细描述',
    icon_url VARCHAR(255) COMMENT '爱好图标URL',
    sort_order INT DEFAULT 0 COMMENT '排序序号，用于前端展示顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_name (name)  -- 确保爱好名称唯一
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='爱好字典表';

CREATE TABLE user_hobby (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    user_id INT NOT NULL COMMENT '用户ID，关联用户表',
    hobby_id INT NOT NULL COMMENT '爱好ID，关联爱好表',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- 联合唯一索引，确保一个用户不会重复添加同一个爱好
    UNIQUE KEY uk_user_hobby (user_id, hobby_id),
    -- 外键约束（假设用户表为user，主键为id）
    CONSTRAINT fk_user_hobby_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_hobby_hobby FOREIGN KEY (hobby_id) REFERENCES hobby(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户爱好关联表';