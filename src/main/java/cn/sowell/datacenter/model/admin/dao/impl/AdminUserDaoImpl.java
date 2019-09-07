package cn.sowell.datacenter.model.admin.dao.impl;

import javax.annotation.Resource;

import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import cn.sowell.datacenter.model.admin.dao.AdminUserDao;
import cn.sowell.datacenter.model.admin.pojo.AdminUserX;

@Repository
public class AdminUserDaoImpl implements AdminUserDao{
	@Resource
	SessionFactory sessionFactory;

	@Override
	public AdminUserX getUser(String username) {
		if(StringUtils.hasText(username)){
			String hql = "from AdminUser u where u.userName = :userName";
			Session session = sessionFactory.getCurrentSession();
			Query query = session.createQuery(hql)
					.setString("userName", username);
			return (AdminUserX) query.uniqueResult();

		}
		return null;
	}
	

}
