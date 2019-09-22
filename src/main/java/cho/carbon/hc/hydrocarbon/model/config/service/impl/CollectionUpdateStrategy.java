package cho.carbon.hc.hydrocarbon.model.config.service.impl;

import java.util.Collection;
import java.util.Iterator;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;

import cho.carbon.hc.copframe.dao.utils.NormalOperateDao;
import cho.carbon.hc.copframe.utils.CollectionUtils;

public class CollectionUpdateStrategy<T> {
	
	private final Class<T> pojoClass;
	private final Function<T, Long> idGetter;
	private final NormalOperateDao nDao;
	private Consumer<T> beforeCreate = a->{};
	private Consumer<T> afterCreate = a->{};
	private BiConsumer<T, T> beforeUpdate = (x,y)->{};
	private BiConsumer<T, T> afterUpdate = (x,y)->{};

	public CollectionUpdateStrategy(Class<T> pojoClass, NormalOperateDao nDao, Function<T, Long> idGetter) {
		super();
		this.pojoClass = pojoClass;
		this.idGetter = idGetter;
		this.nDao = nDao;
	}
	
	public void doUpdate(Collection<T> origins, Collection<T> targets) {
		for (T target : targets) {
			if(idGetter.apply(target) == null) {
				beforeCreate.accept(target);
				nDao.save(target);
				afterCreate.accept(target);
			}else if(origins != null){
				Iterator<T> originItr = origins.iterator();
				while(originItr.hasNext()) {
					T origin = originItr.next();
					if(idGetter.apply(origin).equals(idGetter.apply(target))) {
						beforeUpdate.accept(origin, target);
						nDao.update(origin);
						afterUpdate.accept(origin, target);
						originItr.remove();
						break;
					}
				}
			}
		}
		Set<Long> toRemove = CollectionUtils.toSet(origins, origin->idGetter.apply(origin));
		nDao.remove(pojoClass, toRemove);
	}

	public void setBeforeCreate(Consumer<T> beforeCreate) {
		this.beforeCreate = beforeCreate;
	}

	public void setAfterCreate(Consumer<T> afterCreate) {
		this.afterCreate = afterCreate;
	}

	public void setBeforeUpdate(BiConsumer<T, T> beforeUpdate) {
		this.beforeUpdate = beforeUpdate;
	}

	public void setAfterUpdate(BiConsumer<T, T> afterUpdate) {
		this.afterUpdate = afterUpdate;
	}
}
