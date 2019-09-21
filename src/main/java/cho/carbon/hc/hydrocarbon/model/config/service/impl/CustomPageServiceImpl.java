package cho.carbon.hc.hydrocarbon.model.config.service.impl;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import cho.carbon.hc.hydrocarbon.model.config.dao.CustomPageDao;
import cho.carbon.hc.hydrocarbon.model.config.pojo.CustomPage;
import cho.carbon.hc.hydrocarbon.model.config.service.CustomPageService;
import cho.carbon.hc.hydrocarbon.model.config.service.SideMenuService;
import cn.sowell.copframe.dao.utils.NormalOperateDao;
import cn.sowell.copframe.utils.CollectionUtils;

@Service
public class CustomPageServiceImpl implements CustomPageService{

	Map<Long, CustomPage> customPageMap = null;
	
	@Resource
	CustomPageDao cDao;
	
	@Resource
	NormalOperateDao nDao;
	
	@Resource
	SideMenuService menuService;
	
	static Logger logger = Logger.getLogger(CustomPageServiceImpl.class);
	
	
	@Override
	public List<CustomPage> getCustomPageList() {
		return new ArrayList<CustomPage>(getCustomPageMap().values());
	}


	private Map<Long, CustomPage> getCustomPageMap() {
		if(customPageMap == null) {
			synchronized (this) {
				if(customPageMap == null) {
					List<CustomPage> customPages = cDao.queryAllCustomPage();
					customPageMap = CollectionUtils.toMap(customPages, CustomPage::getId);
				}
			}
		}
		return customPageMap;
	}

	
	@Override
	public CustomPage getCustomPage(Long customPageId) {
		return getCustomPageMap().get(customPageId);
	}

	
	public void reload(Long customPageId) {
		Map<Long, CustomPage> theCustomPageMap = getCustomPageMap();
		CustomPage customPage = nDao.get(CustomPage.class, customPageId);
		if(customPage == null) {
			customPageMap.remove(customPageId);
		}else {
			theCustomPageMap.put(customPageId, customPage);
			triggerCustomPageReloadEvent(customPage);
		}
	}
	@Override
	public void save(CustomPage customPage) {
		Assert.hasText(customPage.getTitle(), "自定义页面的title不能为空");
		Assert.hasText(customPage.getPath(), "自定义页面的path不能为空");
		Long customPageId;
		if(customPage.getId() != null) {
			CustomPage originCustomPage = getCustomPage(customPage.getId());
			originCustomPage.setTitle(customPage.getTitle());
			originCustomPage.setPath(customPage.getPath());
			originCustomPage.setDescription(customPage.getPath());
			nDao.update(customPage);
			customPageId = customPage.getId();
		}else {
			customPageId = nDao.save(customPage);
		}
		reload(customPageId);
	}


	@Override
	public void remove(Long customPageId) {
		CustomPage customPage = new CustomPage();
		customPage.setId(customPageId);
		nDao.remove(customPage);
		menuService.reloadMenuMap();
		reload(customPageId);
	}
	
	Set<Consumer<CustomPage>> consumers = new LinkedHashSet<Consumer<CustomPage>>();
	
	@Override
	public void bindCustomPageReloadEvent(Consumer<CustomPage> consumer) {
		consumers.add(consumer);
	}
	
	private void triggerCustomPageReloadEvent(CustomPage group) {
		for (Consumer<CustomPage> consumer : consumers) {
			try {
				consumer.accept(group);
			} catch (Exception e) {
				logger.error("", e);
			}
		}
	}

}
