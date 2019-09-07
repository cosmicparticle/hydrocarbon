package cn.sowell.datacenter.model.admin.dao;

import cn.sowell.datacenter.model.admin.pojo.AdminUserX;

public interface AdminUserDao {

	AdminUserX getUser(String username);

}
