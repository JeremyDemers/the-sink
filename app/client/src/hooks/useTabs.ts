import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { TabItem, TabsList } from '@typedef/table';

function getActiveTab(items: TabsList, params: URLSearchParams): TabItem {
  for (const item of items) {
    if (item.params) {
      const isActive = Object
        .entries(item.params)
        .every(([param, value]) => value === params.get(param));

      if (isActive) {
        return item;
      }
    }
  }

  return items[0];
}

function useTabs(items: TabsList): TabItem {
  const [params] = useSearchParams();

  return useMemo(() => getActiveTab(items, params), [items, params]);
}

export default useTabs;
