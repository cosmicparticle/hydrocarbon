package cho.carbon.hc.hydrocarbon.model.config.dao.impl;

import java.util.List;

import javax.annotation.Resource;

import org.hibernate.Criteria;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

import cho.carbon.hc.hydrocarbon.model.config.dao.CustomPageDao;
import cho.carbon.hc.hydrocarbon.model.config.pojo.CustomPage;

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
