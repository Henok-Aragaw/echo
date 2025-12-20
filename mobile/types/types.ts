export type FragmentType = 'TEXT' | 'IMAGE' | 'LINK' | 'LOCATION';

export interface Fragment {
  id: string;
  type: FragmentType;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  insight?: { content: string };
}

export interface GroupedFragment {
  date: string;
  fragments: Fragment[];
}