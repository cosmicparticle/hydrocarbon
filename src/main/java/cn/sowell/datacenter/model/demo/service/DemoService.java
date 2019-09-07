package cn.sowell.datacenter.model.demo.service;

import java.util.List;

import cn.sowell.copframe.dto.page.PageInfo;
import cn.sowell.datacenter.model.demo.criteria.DemoCriteria;
import cn.sowell.datacenter.model.demo.pojo.PlainDemo;

public interface DemoService {

	/**
	 * 根据条件对象查询分页
	 * @param criteria
	 * @param pageInfo
	 * @return
	 */
	List<PlainDemo> queryList(DemoCriteria criteria, PageInfo pageInfo);

	/**
	 * 创建一个demo对象
	 * @param demo
	 */
	void create(PlainDemo demo);

	PlainDemo getDemo(Long id);

	/**
	 * 更新一个demo对象
	 * @param demo
	 */
	void update(PlainDemo demo);

	/**
	 * 从数据库中删除一个demo对象
	 * @param id
	 */
	void delete(Long id);
	
	

}
