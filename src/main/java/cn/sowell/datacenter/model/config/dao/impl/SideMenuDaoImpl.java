package cn.sowell.datacenter.model.config.dao.impl;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.hibernate.Criteria;
import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Order;
import org.springframework.stereotype.Repository;

import cn.sowell.copframe.dao.deferedQuery.HibernateRefrectResultTransformer;
import cn.sowell.copframe.utils.CollectionUtils;
import cn.sowell.datacenter.model.config.dao.SideMenuDao;
import cn.sowell.datacenter.model.config.pojo.SideMenuBlock;
import cn.sowell.datacenter.model.config.pojo.SideMenuLevel1Menu;
import cn.sowell.datacenter.model.config.pojo.SideMenuLevel2Menu;

@Repository
public class SideMenuDaoImpl implements SideMenuDao {

	@Resource
	SessionFactory sFactory;
	
	@SuppressWarnings("unchecked")
	@Override
	public List<SideMenuLevel1Menu> getSideMenus() {
		String hql = "from SideMenuLevel1Menu m order by m.order asc";
		Query query = sFactory.getCurrentSession().createQuery(hql);
		return query.list();
	}

	@Override
	public SideMenuLevel2Menu getLevel2Menu(Long menuId) {
		String sql = "	SELECT" +
				"		l2.*," +
				"		g.c_title tmplgroup_title," +
				"		g.c_key tmplgroup_key," +
				"		g.c_module tmpl_module," +
				"		m.c_title tmpl_module_title " +
				"	FROM" +
				"		t_sa_config_sidemenu_level2 l2" +
				"		LEFT JOIN t_sa_tmpl_group g ON l2.tmplgroup_id = g.id" +
				"		LEFT JOIN t_sb_config_module m ON g.c_module = m.c_name" +
				"	where l2.id = :level2Id";
		SQLQuery query = sFactory.getCurrentSession().createSQLQuery(sql);
		query.setLong("level2Id", menuId);
		query.setResultTransformer(HibernateRefrectResultTransformer.getInstance(SideMenuLevel2Menu.class));
		return (SideMenuLevel2Menu) query.uniqueResult();
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public Map<Long, List<SideMenuLevel2Menu>> querySideMenuLevel2Map() {
		String hql = "from SideMenuLevel2Menu l2 order by l2.order asc";
		
		Query query = sFactory.getCurrentSession().createQuery(hql);
		List<SideMenuLevel2Menu> groups = query.list();
		return CollectionUtils.toListMap(groups, group->group.getSideMenuLevel1Id());
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<SideMenuBlock> getAllBlocks() {
		Criteria criteria = sFactory.getCurrentSession().createCriteria(SideMenuBlock.class);
		criteria.addOrder(Order.asc("order"));
		return criteria.list();
	}

}
