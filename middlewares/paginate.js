const defaultSize = 10;
const defaultPage = 0;

exports.getPagination = (page, size) => {
  const limit = size ? +size : defaultSize;
  const offset = page ? page * limit : defaultPage;
  return { limit, offset };
};

exports.paginateDate = (data, page, limit) => {
  const { count: totalItems } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, data: data.rows, totalPages, currentPage };
};
