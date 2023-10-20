exports.getFilterSearchData = (searchData) => {
    const filterData = searchData.replace(/\\/g, '\\\\').replace(/\%/g, '\\%').replace(/\_/g, '\\_');
    return filterData;
}