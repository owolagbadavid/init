import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseModel } from './base.entity';
import type { WidgetType } from './widget-type.entity';
import type { Desktop } from './desktop.entity';

@Entity({ name: 'widgets' })
export class Widget extends BaseModel {
  @Column({ name: 'x_position', type: 'integer' })
  xPosition: number;

  @Column({ name: 'y_position', type: 'integer' })
  yPosition: number;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @ManyToOne('WidgetType', 'widgets')
  @JoinColumn({ name: 'type_id' })
  type: WidgetType;

  @Column({ name: 'type_id' })
  typeId: string;

  @ManyToOne('Desktop', 'icons', { nullable: false })
  @JoinColumn({ name: 'desktop_id' })
  desktop: Desktop;

  @Column({ name: 'desktop_id' })
  desktopId: string;
}
