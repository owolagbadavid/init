import { Column, Entity, OneToMany, Unique } from 'typeorm';

import { BaseModel } from './base.entity';
import type { Widget } from './widget.entity';

@Entity({ name: 'widget_types' })
@Unique(['code'])
export class WidgetType extends BaseModel {
  @Column({ type: 'text' })
  code: string;

  @OneToMany('Widget', 'type')
  widgets: Widget[];
}
