import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import {
  Desktop,
  DesktopFile,
  DesktopIcon,
  DesktopIconFile,
  FederatedAuth,
  FileRecord,
  User,
  UserProfile,
  Widget,
  WidgetType,
} from './entities';

export const dataSourceOptions: DataSourceOptions = {
  synchronize: true,
  entities: [
    User,
    UserProfile,
    FederatedAuth,
    Desktop,
    DesktopFile,
    DesktopIconFile,
    DesktopIcon,
    Widget,
    WidgetType,
    FileRecord,
  ],
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT as string) || 5432,
  database: process.env.DATABASE || 'postgres',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl:
    process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
};

const dataSource = new DataSource(dataSourceOptions);

// if (!dataSource.isInitialized) {
//   dataSource
//     .initialize()
//     .then(() => {
//       console.log('Data Source has been initialized!');

//     })
//     .catch((err) => {
//       console.error('Error during Data Source initialization:', err);
//     });
// }
export default dataSource;
