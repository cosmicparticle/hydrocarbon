package cho.carbon.hc.hydrocarbon.model.config.pojo;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.alibaba.fastjson.annotation.JSONField;;

@Entity
@Table(name="t_sa_config_system")
public class SystemConfig {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@JSONField(serialize = false)
	private Long id;
	
	/**
	 * 如果不为空，说明系统只显示对应的版块
	 */
	@Column(name="def_block_id")
	private Long defaultBlockId;
	
	@Column(name="c_only_show_def_block")
	private Integer onlyShowDefaultBlock;
	
	/**
	 * 为1的时候，无论版块如何，都会在版块栏中显示版块
	 * 反之，当blockId不为空的时候，不会显示版块
	 */
	@Column(name="c_show_blocks_anyway")
	private Integer showBlocksAnyway;
	
	
	@Column(name="c_admin_def_auth")
	private String adminDefaultAuthen;
	
	@Column(name="c_admin_conf_auth")
	private String adminConfigAuthen;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getAdminDefaultAuthen() {
		return adminDefaultAuthen;
	}

	public void setAdminDefaultAuthen(String adminDefaultAuthen) {
		this.adminDefaultAuthen = adminDefaultAuthen;
	}

	public String getAdminConfigAuthen() {
		return adminConfigAuthen;
	}

	public void setAdminConfigAuthen(String adminConfigAuthen) {
		this.adminConfigAuthen = adminConfigAuthen;
	}

	public Integer getShowBlocksAnyway() {
		return showBlocksAnyway;
	}

	public void setShowBlocksAnyway(Integer showBlocksAnyway) {
		this.showBlocksAnyway = showBlocksAnyway;
	}

	public Integer getOnlyShowDefaultBlock() {
		return onlyShowDefaultBlock;
	}

	public void setOnlyShowDefaultBlock(Integer onlyShowDefaultBlock) {
		this.onlyShowDefaultBlock = onlyShowDefaultBlock;
	}

	public Long getDefaultBlockId() {
		return defaultBlockId;
	}

	public void setDefaultBlockId(Long defaultBlockId) {
		this.defaultBlockId = defaultBlockId;
	}
	
}
