package cn.sowell.datacenter.model.config.dao.impl;

import java.util.List;

import javax.annotation.Resource;

import org.hibernate.Criteria;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

import cn.sowell.datacenter.model.config.dao.CustomPageDao;
import cn.sowell.datacenter.model.config.pojo.CustomPage;

@Repository
public class CustomPageDaoImpl implements CustomPageDao{

	@Resource
	SessionFactory sFactory;
	
	@SuppressWarnings("unchecked")
	@Override
	public List<CustomPage> queryAllCustomPage() {
		Criteria criteria = sFactory.getCurrentSession().createCriteria(CustomPage.class);
		return criteria.list();
	}
}
