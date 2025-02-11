import React from 'react';
import SearchInputV1 from './SearchInputV1';
import SearchInputV2 from './SearchInputV2';
import { env } from 'configs/EnvironmentConfig';

const SearchInput = (props) => {

  return (
    <>
		{env.IS_NEW_SEARCH_CONFIG_ON ? <SearchInputV2/> : <SearchInputV1/>}
	</>
  );
};

export default SearchInput;