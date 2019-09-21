package cho.carbon.hc.hydrocarbon.model.demo.service;

import java.util.List;

import cho.carbon.hc.hydrocarbon.model.demo.criteria.DemoCriteria;
import cho.carbon.hc.hydrocarbon.model.demo.pojo.PlainDemo;
import cn.sowell.copframe.dto.page.PageInfo;

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
