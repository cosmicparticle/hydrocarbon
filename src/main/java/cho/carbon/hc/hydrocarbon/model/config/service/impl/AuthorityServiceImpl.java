package cho.carbon.hc.hydrocarbon.model.config.service.impl;

import java.util.Collection;
import java.util.List;
import java.util.Set;

import javax.annotation.Resource;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import com.google.common.collect.Lists;

import cho.carbon.auth.pojo.AuthorityVO;
import cho.carbon.auth.service.ServiceFactory;
import cho.carbon.hc.copframe.dao.utils.UserUtils;
import cho.carbon.hc.copframe.utils.CollectionUtils;
import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.dataserver.model.karuiserv.pojo.KaruiServ;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailField;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroupAction;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateTreeNode;
import cho.carbon.hc.dataserver.model.tmpl.service.DetailTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.RActionTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.TemplateGroupService;
import cho.carbon.hc.dataserver.model.tmpl.service.TreeTemplateService;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.model.admin.pojo.ABCUser;
import cho.carbon.hc.hydrocarbon.model.config.bean.ValidateDetailParamter;
import cho.carbon.hc.hydrocarbon.model.config.bean.ValidateDetailResult;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuBlock;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel1Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.criteria.AuthorityCriteria;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigAuthencationService;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigUserService;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;
import cho.carbon.hc.hydrocarbon.model.config.service.NonAuthorityException;
import cho.carbon.hc.hydrocarbon.model.config.service.SideMenuService;

@Service
public class AuthorityServiceImpl implements AuthorityService {

	@Resource
	RActionTemplateService ratmplService;

	@Resource
	SideMenuService menuService;

	@Resource
	TemplateGroupService tmplGroupService;

	@Resource
	DetailTemplateService dtmplService;

	@Resource
	TreeTemplateService treeService;

	@Resource
	ConfigUserService userService;

	@Resource
	ConfigureService configService;

	@Override
	public SideMenuLevel2Menu validateL2MenuAccessable(Long level2MenuId) throws NonAuthorityException {
		return this.validateUserL2MenuAccessable((UserDetails) UserUtils.getCurrentUser(), level2MenuId);
	}

	@Override
	public SideMenuLevel1Menu validateL1MenuAccessable(Long level1MenuId) throws NonAuthorityException {
		return this.validateUserL1MenuAccessable((UserDetails) UserUtils.getCurrentUser(), level1MenuId);
	}

	@Override
	public SideMenuBlock validateUserBlockAccessable(UserDetails user, Long blockId) throws NonAuthorityException {
		Assert.notNull(blockId, "版块的id不能为空");

		SideMenuBlock block = menuService.getBlock(blockId);

		if (block != null) {
			Set<String> userAuthorities = CollectionUtils.toSet(user.getAuthorities(), GrantedAuthority::getAuthority);
			if (isAdminUser(userAuthorities, null)) {
				return block;
			}
			// 只有当用户至少包含菜单的其中一个权限时，才能验证成功
			if (!block.getAuthoritySet().isEmpty() && !userAuthorities.stream()
					.filter(auth -> block.getAuthoritySet().contains(auth)).findFirst().isPresent()) {
				throw new NonAuthorityException(block.getAuthoritySet(), userAuthorities);
			}
			return block;
		} else {
			throw new NonAuthorityException("根据id[" + blockId + "]获得不到对应版块");
		}
	}

	private boolean isAdminUser(Set<String> userAuthorities, String configAuthen) {
		if (configAuthen == null) {
			configAuthen = configAuthService.getAdminConfigAuthen();
		}
		return userAuthorities.contains(configAuthen);
	}

	@Override
	public SideMenuLevel2Menu validateUserL2MenuAccessable(UserDetails user, Long level2MenuId)
			throws NonAuthorityException {
		Assert.notNull(level2MenuId, "二级菜单的id不能为空");

		SideMenuLevel2Menu l2 = menuService.getLevel2Menu(level2MenuId);
		if (l2 != null) {
			Set<String> userAuthorities = CollectionUtils.toSet(user.getAuthorities(), GrantedAuthority::getAuthority);
			if (isAdminUser(userAuthorities, null)) {
				return l2;
			}
			if (!l2.getAuthoritySet().isEmpty()) {
				// 只有当用户至少包含菜单的其中一个权限时，才能验证成功
				if (!userAuthorities.stream().filter(auth -> l2.getAuthoritySet().contains(auth)).findFirst()
						.isPresent()) {
					throw new NonAuthorityException(l2.getAuthoritySet(), userAuthorities);
				}
			}
			validateUserL1MenuAccessable(user, l2.getSideMenuLevel1Id());
			return l2;
		} else {
			throw new NonAuthorityException("根据id[" + level2MenuId + "]获得不到对应二级菜单");
		}
	}

	@Override
	public void validateUserAccessable(UserDetails user, String validateSign) {
		if (validateSign.matches("\\d+")) {
			validateUserL2MenuAccessable(user, Long.valueOf(validateSign));
		} else if ("user".equals(validateSign)) {

		} else {
			throw new NonAuthorityException("无法识别vaidateSign[" + validateSign + "]");
		}

	}

	@Override
	public SideMenuLevel1Menu validateUserL1MenuAccessable(UserDetails user, Long level1MenuId)
			throws NonAuthorityException {
		Assert.notNull(level1MenuId, "一级菜单的id不能为空");

		SideMenuLevel1Menu l1 = menuService.getLevel1Menu(level1MenuId);
		if (l1 != null) {
			Set<String> userAuthorities = CollectionUtils.toSet(user.getAuthorities(), GrantedAuthority::getAuthority);
			if (isAdminUser(userAuthorities, null)) {
				return l1;
			}
			// 只有当用户至少包含菜单的其中一个权限时，才能验证成功
			if (!userAuthorities.stream().filter(auth -> l1.getAuthoritySet().contains(auth)).findFirst().isPresent()) {
				throw new NonAuthorityException(l1.getAuthoritySet(), userAuthorities);
			}
			return l1;
		} else {
			throw new NonAuthorityException("根据id[" + level1MenuId + "]获得不到对应一级菜单");
		}
	}

	public AuthorityVO getAuthority(String authCode) {
		ABCUser user = (ABCUser) UserUtils.getCurrentUser();
		return ServiceFactory.getRoleAuthorityService().getFunctionAuth(user.getUserInfo()).stream()
				.filter(auth -> authCode.equals(auth.getCode())).findFirst().orElse(null);
	}

	@Override
	public List<AuthorityVO> queryAuthorities(AuthorityCriteria criteria) {
		Assert.notNull(criteria.getUser(), "必须传入当前用户对象");
		return Lists.newArrayList(ServiceFactory.getRoleAuthorityService().getFunctionAuth(criteria.getUser()));
	}

	@Override
	public void validateGroupAction(TemplateGroupAction groupAction, TemplateGroup tmplGroup, String codes) {
		if (!groupAction.getGroupId().equals(tmplGroup.getId())) {
			throw new NonAuthorityException("模板组合[id=" + tmplGroup.getId() + "]与操作[id=" + groupAction.getId()
					+ "]对应的模板组合[id=" + groupAction.getGroupId() + "]不一致");
		}
		if (codes != null) {
			Set<String> codeSet = TextUtils.split(codes, ",");
			if (!codeSet.isEmpty()) {
				if (codeSet.size() > 1) {
					if (TemplateGroupAction.ACTION_MULTIPLE_SINGLE.equals(groupAction.getMultiple())
							|| TemplateGroupAction.ACTION_FACE_DETAIL.equals(groupAction.getFace())) {
						// 操作要单选，那么不能处理多个code
						throw new RuntimeException("该操作只能处理一个编码");
					}
				}
				return;
			}
		}
	}
	@Override
	/**
	 * 此方法存在严重的安全漏洞，会导致用户通过任意二级菜单权限访问所有的页面
	 * 由于时间关系后面要统一完善
	 */
	public TemplateDetailFieldGroup validateSelectionAuth(String validateSign, Long fieldGroupId, ApiUser user) {
		if (validateSign.matches("\\d+")) {
			Long menuId = Long.valueOf(validateSign);
			// 根据menuId获取详情模板
			SideMenuLevel2Menu menu = validateUserL2MenuAccessable(user, menuId);
			return dtmplService.getFieldGroup(fieldGroupId);
		} else {
			TemplateDetailFieldGroup fieldGroup = dtmplService.getFieldGroup(fieldGroupId);
			TemplateDetailTemplate dtmpl = dtmplService.getTemplate(fieldGroup.getTmplId());
			userService.validateUserAuthentication(dtmpl.getModule());
			return fieldGroup;
		}
	}
	

	//这个方法后面要完善，因为之前的实现存在严重的安全漏洞
//	@Override
//	public TemplateDetailFieldGroup validateSelectionAuth(String validateSign, Long fieldGroupId, ApiUser user) {
//		if (validateSign.matches("\\d+")) {
//			Long menuId = Long.valueOf(validateSign);
//			// 根据menuId获取详情模板
//			SideMenuLevel2Menu menu = validateUserL2MenuAccessable(user, menuId);
//			TemplateGroup group = tmplGroupService.getTemplate(menu.getTemplateGroupId());
//			TemplateDetailTemplate dtmpl = dtmplService.getTemplate(group.getDetailTemplateId());
//			TemplateDetailFieldGroup tdGroup = null;
//			if (dtmpl.getGroups() != null) {
//				for (TemplateDetailFieldGroup dgroup : dtmpl.getGroups()) {
//					if (fieldGroupId.equals(dgroup.getId())) {
//						tdGroup = dgroup;
//						break;
//					}
//				}
//			}
//			return tdGroup;
//		} else {
//			TemplateDetailFieldGroup fieldGroup = dtmplService.getFieldGroup(fieldGroupId);
//			TemplateDetailTemplate dtmpl = dtmplService.getTemplate(fieldGroup.getTmplId());
//			userService.validateUserAuthentication(dtmpl.getModule());
//			return fieldGroup;
//		}
//	}

	@Override
	public TemplateDetailField validateSelectionAuth4RField(String validateSign, Long fieldId, ApiUser user) {
		if (validateSign.matches("\\d+")) {
			Long menuId = Long.valueOf(validateSign);
			// 根据menuId获取详情模板
			SideMenuLevel2Menu menu = validateUserL2MenuAccessable(user, menuId);
			TemplateGroup group = tmplGroupService.getTemplate(menu.getTemplateGroupId());
			TemplateDetailTemplate dtmpl = dtmplService.getTemplate(group.getDetailTemplateId());
			TemplateDetailField td = null;
			if (dtmpl.getGroups() != null) {
				for (TemplateDetailFieldGroup dgroup : dtmpl.getGroups()) {
					td = dgroup.getFieldMap().get(fieldId);
					if (td != null) {
						break;
					}
				}
			}
			return td;
		} else {

			return null;
		}
	}

	@Override
	public ValidateDetailResult validateDetailAuth(ValidateDetailParamter param) {
		ValidateDetailResult result = new ValidateDetailResult();
		if (param.getValidateSign().matches("\\d+")) {
			Long menuId = Long.valueOf(param.getValidateSign());
			SideMenuLevel2Menu menu = validateUserL2MenuAccessable(param.getUser(), menuId);
			TemplateGroup tmplGroup = null;
			if (param.getRatmplId() != null) {
				tmplGroup = tmplGroupService.getTemplate(ratmplService.getTemplate(param.getRatmplId()).getGroupId());
			} else if (param.getNodeId() != null) {
				TemplateTreeNode nodeTmpl = treeService.getNodeTemplate(menu.getTemplateModule(), param.getNodeId());
				tmplGroup = tmplGroupService.getTemplate(nodeTmpl.getTemplateGroupId());
			} else if (param.getFieldGroupId() != null) {
				TemplateDetailFieldGroup fieldGroup = dtmplService.getFieldGroup(param.getFieldGroupId());
				tmplGroup = tmplGroupService.getTemplate(fieldGroup.getRabcTemplateGroupId());
			} else if(param.getRfieldId()!=null){
				TemplateDetailField detailField = validateSelectionAuth4RField(param.getValidateSign(),param.getRfieldId(),param.getUser());
				if(detailField!=null) {
					tmplGroup = tmplGroupService.getTemplate(detailField.getRefGroupId());
				}
			} else {
				tmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());
			}
			result.setTmplGroup(tmplGroup);
			result.setDetailTemplate(dtmplService.getTemplate(tmplGroup.getDetailTemplateId()));
			result.setMenu(menu);
			result.setEntityCode(param.getCode());
		} else {
			TemplateDetailTemplate dtmpl = null;
			if ("user".equals(param.getValidateSign())) {
				if (param.getUser() instanceof ABCUser) {
					ABCUser user = (ABCUser) param.getUser();
					dtmpl = userService.getUserDetailTemplate(param.getDetailTemplateId());
					result.setEntityCode(user.getCode());
				}
			} else {
				throw new RuntimeException("validateSign[" + param.getValidateSign() + "]无法识别");
			}
			result.setDetailTemplate(dtmpl);
		}
		return result;
	}

	@Resource
	ConfigAuthencationService configAuthService;

	@Override
	public void validateAdminAuth(UserDetails user) {
		String configAuth = configAuthService.getAdminConfigAuthen();
		Collection<? extends GrantedAuthority> auths = user.getAuthorities();
		for (GrantedAuthority auth : auths) {
			if (auth.getAuthority().equals(configAuth)) {
				return;
			}
		}
		throw new NonAuthorityException("当前用户没有管理员权限，拒绝访问");
	}

	@Override
	public void validateKsAccess(KaruiServ ks, ApiUser user) {
		Assert.notNull(ks, "传入的ks参数不能为空");
		Assert.notNull(user, "传入的user参数不能为空");
		Collection<? extends GrantedAuthority> auths = user.getAuthorities();
		if (auths != null && !auths.isEmpty()) {
			String authority = ks.getAuthority();
			if (authority != null) {
				Set<String> ksAuths = TextUtils.split(authority, ";");
				boolean matched = auths.stream().anyMatch(auth -> ksAuths.contains(auth.getAuthority()));
				if (!matched) {
					throw new NonAuthorityException(
							"Current user has not any authority matched the authroties of Karui Service.");
				}
			} else {
				throw new NonAuthorityException("Karui Service has not configured any authorities");
			}
		} else {
			throw new NonAuthorityException("Current user has not any authorities");
		}

	}

}
