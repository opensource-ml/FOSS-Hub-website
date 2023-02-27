/**
 * Files generated using template generator
 */

export interface GridListViewProps {
    gridListView?: IGridListView;
    [k: string]: unknown;
}

interface IGridListView {
  title?: string,
  cardDetails?: ICard[],
  tableDetails?:
    {
      id: string | number,
      tableData: ITable[]
    }
}

interface ICard {
  id: string | number;
  title?: string;
  description?: string;
  link?: string;
  icon?: any;
  tags?: any;
  avatars?: IAvatar[];
  [k: string]: unknown;
}

interface ITable {
  name?: string;
  description?: string;
  link?: string;
  icon?: any;
  tags?: any;
  topics?: any;
  avatars?: IAvatar[];
  [k: string]: unknown;
}

interface IAvatar {
    name?: string;
    src?: any;
    link?: any;
}

export interface GridListViewSchema {
  template: typeof GridListView;
  data: Partial<GridListViewProps>;
  dynamicData: () => Partial<GridListViewProps>;
}