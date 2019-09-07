package cn.sowell.datacenter.model.demo.dao;

import java.util.List;

import cn.sowell.copframe.dto.page.PageInfo;
import cn.sowell.datacenter.model.demo.criteria.DemoCriteria;
import cn.sowell.datacenter.model.demo.pojo.PlainDemo;

public interface DemoDao {
	/**
	 * 从数据库中根据条件分页查询demo列表
	 * @param criteria
	 * @param pageInfo
	 * @return
	 */
	List<PlainDemo> queryList(DemoCriteria criteria, PageInfo pageInfo);

	/**
	 * 对象插入到数据表中
	 * @param demo
	 */
	void insert(Object demo);

	/**
	 * 从数据库中查找对应的pajo对象
	 * @param clazz
	 * @param id
	 * @return
	 */
	<T> T get(Class<T> clazz, Long id);

	/**
	 * 更新一个pojo对象
	 * @param demo
	 */
	void update(Object demo);

	/**
	 * 从数据库中删除一个对象
	 * @param pojo
	 */
	void delete(Object pojo);


}
