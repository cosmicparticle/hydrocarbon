package cn.sowell.datacenter.model.demo.service.impl;

import java.util.List;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;

import cn.sowell.copframe.dto.page.PageInfo;
import cn.sowell.datacenter.model.demo.criteria.DemoCriteria;
import cn.sowell.datacenter.model.demo.dao.DemoDao;
import cn.sowell.datacenter.model.demo.pojo.PlainDemo;
import cn.sowell.datacenter.model.demo.service.DemoService;

@Service
public class DemoServiceImpl implements DemoService{

	@Resource
	DemoDao demoDao;
	
	@Override
	public List<PlainDemo> queryList(DemoCriteria criteria, PageInfo pageInfo) {
		return demoDao.queryList(criteria, pageInfo);
	}

	@Override
	public void create(PlainDemo demo) {
		demoDao.insert(demo);
	}
	
	@Override
	public PlainDemo getDemo(Long id) {
		return demoDao.get(PlainDemo.class, id);
	}
	
	@Override
	public void update(PlainDemo demo) {
		demoDao.update(demo);
	}
	
	@Override
	public void delete(Long id) {
		PlainDemo demo = new PlainDemo();
		demo.setId(id);
		demoDao.delete(demo);
	}

}
